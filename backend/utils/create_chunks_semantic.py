import os
import glob
from litellm import completion
import numpy as np
from chromadb import PersistentClient
from sklearn.manifold import TSNE
import plotly.graph_objects as go
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from openai import OpenAI
from itertools import cycle

MODEL = "gpt-4.1-nano"

# Get the absolute path to the backend root directory
BACKEND_ROOT = Path(__file__).parent.parent.absolute()
DB_NAME = os.path.join(BACKEND_ROOT, "coolgirls_vector_db")

collection_name = "docs"
embedding_model = "text-embedding-3-large"
AVERAGE_CHUNK_SIZE = 500

load_dotenv(override=True)

openai = OpenAI()

# OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    print(f"OpenAI API Key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API Key not set")



class Result(BaseModel):
    page_content: str
    metadata: dict


# A class to perfectly represent a chunk
class Chunk(BaseModel):
    headline: str = Field(
        description="A brief heading for this chunk, typically a few words, that is most likely to be surfaced in a query"
    )
    summary: str = Field(
        description="A few sentences summarizing the content of this chunk to answer common questions"
    )
    original_text: str = Field(
        description="The original text of this chunk from the provided document, exactly as is, not changed in any way"
    )

    def as_result(self, document):
        metadata = {
            "source": document["source"],
            "type": document["type"],
        }
        return Result(
            page_content=self.headline
            + "\n\n"
            + self.summary
            + "\n\n"
            + self.original_text,
            metadata=metadata,
        )


class Chunks(BaseModel):
    chunks: list[Chunk]


def process_markdown_file(file_path: str | Path):
    """
    End-to-end processing for a single markdown file:
    - load document
    - chunk with LLM
    - create embeddings
    - store in Chroma
    - return all useful variables for further actions
    """

    # ----------------------------
    # Resolve and validate file
    # ----------------------------
    file_path = Path(file_path).resolve()

    if not file_path.exists():
        raise FileNotFoundError(f"File does not exist: {file_path}")

    if file_path.suffix.lower() != ".md":
        raise ValueError("Only markdown (.md) files are supported")

    # ----------------------------
    # Load document
    # ----------------------------
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    document = {
        "type": file_path.parent.name,
        "source": file_path.as_posix(),
        "text": text,
    }

    documents = [document]

    print(f"Loaded document: {file_path}")

    # ----------------------------
    # Create chunks via LLM
    # ----------------------------
    all_chunks = []

    for doc in documents:
        print("Making prompt for document")

        how_many = (len(doc["text"]) // AVERAGE_CHUNK_SIZE) + 1

        prompt = f"""
You take a document and you split the document into overlapping chunks for a KnowledgeBase.

The document is from the shared drive of a company called Insurellm.
The document is of type: {doc["type"]}
The document has been retrieved from: {doc["source"]}

A chatbot will use these chunks to answer questions about the company.
You should divide up the document as you see fit, being sure that the entire document is returned in the chunks - don't leave anything out.
This document should probably be split into {how_many} chunks, but you can have more or less as appropriate.
There should be overlap between the chunks as appropriate; typically about 25% overlap or about 50 words.

For each chunk, you should provide a headline, a summary, and the original text of the chunk.
Together your chunks should represent the entire document with overlap.

Here is the document:

{doc["text"]}

Respond with the chunks.
"""

        messages = [{"role": "user", "content": prompt}]

        response = completion(
            model=MODEL,
            messages=messages,
            response_format=Chunks,
        )

        reply = response.choices[0].message.content
        parsed_chunks = Chunks.model_validate_json(reply).chunks

        for chunk in parsed_chunks:
            metadata = {
                "source": doc["source"],
                "type": doc["type"],
            }

            result = Result(
                page_content=(
                    chunk.headline
                    + "\n\n"
                    + chunk.summary
                    + "\n\n"
                    + chunk.original_text
                ),
                metadata=metadata,
            )

            all_chunks.append(result)

    print(f"Generated {len(all_chunks)} chunks")

    # ----------------------------
    # Create embeddings
    # ----------------------------
    chroma = PersistentClient(path=DB_NAME)
    collection = chroma.get_or_create_collection(collection_name)

    texts = [chunk.page_content for chunk in all_chunks]
    metadatas = [chunk.metadata for chunk in all_chunks]
    ids = [str(i) for i in range(len(all_chunks))]

    embedding_response = openai.embeddings.create(
        model=embedding_model,
        input=texts,
    )

    vectors = [e.embedding for e in embedding_response.data]

    collection.add(
        ids=ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas,
    )

    print(f"Vectorstore now contains {collection.count()} documents")

    # ----------------------------
    # Return EVERYTHING useful
    # ----------------------------
    return {
        "file_path": file_path,
        "document": document,
        "documents": documents,
        "chunks": all_chunks,
        "texts": texts,
        "metadatas": metadatas,
        "embeddings": vectors,
        "collection": collection,
        "chroma_client": chroma,
    }
