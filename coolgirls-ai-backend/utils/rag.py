import sys
from pydantic import BaseModel, Field
from litellm import completion
from openai import OpenAI
from dotenv import load_dotenv
from chromadb import PersistentClient
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from pathlib import Path

# Get the absolute path to the backend root directory
BACKEND_ROOT = Path(__file__).parent.parent.absolute()
DB_NAME = os.path.join(BACKEND_ROOT, "coolgirls_vector_db")

from core.prompt import system_prompt
from core.safety import SENSITIVE_KEYWORDS

openai = OpenAI()
load_dotenv()
language = "en"
MODEL = "gpt-4.1-nano"
embedding_model = "text-embedding-3-large"
collection_name = "docs"
chroma = PersistentClient(path=DB_NAME)
collection = chroma.get_or_create_collection(collection_name)

print(collection)

class Result(BaseModel):
    page_content: str
    metadata: dict

class RankOrder(BaseModel):
    order: list[int] = Field(
        description="The order of relevance of chunks, from most relevant to least relevant, by chunk id number"
    )

def rerank(question, chunks):
    system_prompt = """
You are a document re-ranker.
You are provided with a question and a list of relevant chunks of text from a query of a knowledge base.
The chunks are provided in the order they were retrieved; this should be approximately ordered by relevance, but you may be able to improve on that.
You must rank order the provided chunks by relevance to the question, with the most relevant chunk first.
Reply only with the list of ranked chunk ids, nothing else. Include all the chunk ids you are provided with, reranked.
"""
    user_prompt = f"The user has asked the following question:\n\n{question}\n\nOrder all the chunks of text by relevance to the question, from most relevant to least relevant. Include all the chunk ids you are provided with, reranked.\n\n"
    user_prompt += "Here are the chunks:\n\n"
    for index, chunk in enumerate(chunks):
        user_prompt += f"# CHUNK ID: {index + 1}:\n\n{chunk.page_content}\n\n"
    user_prompt += "Reply only with the list of ranked chunk ids, nothing else."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = completion(model=MODEL, messages=messages, response_format=RankOrder)
    reply = response.choices[0].message.content
    order = RankOrder.model_validate_json(reply).order
    print(order)
    return [chunks[i - 1] for i in order]
    # return [chunks[i - 1] for i in order]

RETRIEVAL_K = 5

def fetch_context_unranked(question):
    
    # Create vector embedding for question
    query = openai.embeddings.create(model=embedding_model, input=[question]).data[0].embedding
    
    # Check collection stats first
    count = collection.count()
    print(f"Total documents in collection: {count}")

    results = collection.query(query_embeddings=[query], n_results=RETRIEVAL_K)
    chunks = []
    for result in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append(Result(page_content=result[0], metadata=result[1]))
    return chunks

# print("running...")

# # Testing unranked
# question = "What are Ukor Mvendaga's state of origin"
# print(question)
# chunks = fetch_context_unranked(question)
# print(len(chunks))

# for chunk in chunks:
#     print(chunk.page_content[:15]+"...")

# # Testing reranked
# reranked = rerank(question, chunks)

# for chunk in reranked:
#     print(chunk.page_content[:15]+"...")

def fetch_context(question):
   
    chunks = fetch_context_unranked(question)
    print(f"From rag after chunks: {chunks}")
    return rerank(question, chunks)

# print(fetch_context("What are Ukor Mvendaga's state of origin"))

SYSTEM_PROMPT = """
You are a knowledgeable, friendly assistant for Cool Girls, a CIHP initiatve.

Your answer will be evaluated for accuracy, relevance and completeness, so make sure it only answers the question and fully answers it.
If you don't know the answer, say so.
For context, here are specific extracts from the Knowledge Base that might be directly relevant to the user's question:
{context}

With this context, please answer the user's question. Be accurate, relevant and complete.

Rules:
1. Use respectful, age-appropriate language.
2. Never provide explicit sexual content.
3. Don't give answers outside of the context and knowledge base
4. If the topic {SENSITIVE_KEYWORDS} or nlike {SENSITIVE_KEYWORDS}, respond with a warning message and suggest reaching out to a Cool Girl Mentor mother for help.
5. If the topic is risky, suggest reaching out to a Cool Girl Mentor mother for help.
6. If ask about general world topic, say who you are and do not provide those information.
7. Remember you are not an assistant to be used for research or do anything illegal.

Respond ONLY in {language}.
Respond in markdown.

"""


# In the context, include the source of the chunk

def make_rag_messages(question, history, chunks):
    context = "\n\n".join(f"Extract from {chunk.metadata['source']}:\n{chunk.page_content}" for chunk in chunks)
    print(f"Make rag context: {context}")

    system_prompt_formated = SYSTEM_PROMPT.format(context=context, SENSITIVE_KEYWORDS =SENSITIVE_KEYWORDS, language =language)
    print(f"Make rag system prompt: {system_prompt_formated}")
    return [{"role": "system", "content": system_prompt_formated}] + history + [{"role": "user", "content": question}]

def rewrite_query(question, history=[]):
    """Rewrite the user's question to be a more specific question that is more likely to surface relevant content in the Knowledge Base."""
    message = f"""
You are in a conversation with a user, answering questions about the company CIHP.
You are about to look up information in a Knowledge Base to answer the user's question.

This is the history of your conversation so far with the user:
{history}

And this is the user's current question:
{question}

Respond only with a single, refined question that you will use to search the Knowledge Base.
It should be a VERY short specific question most likely to surface content. Focus on the question details.
Don't mention the company name unless it's a general question about the company.
IMPORTANT: Respond ONLY with the knowledgebase query, nothing else.
"""
    response = completion(model=MODEL, messages=[{"role": "system", "content": message}])
    return response.choices[0].message.content


# print(answer_question("What are Ukor Mvendaga's work experience?", []))