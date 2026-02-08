
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
KNOWLEDGE_BASE_PATH = BACKEND_ROOT/"uploads"
AVERAGE_CHUNK_SIZE = 500


load_dotenv(override=True)

# file input and output paths to convert and output in markdown format
input_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

openai = OpenAI()
# OpenAI API key
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key:
    print(f"OpenAI API Key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API Key not set")


# Inspired by LangChain's Document
class Result(BaseModel):
    page_content: str
    metadata: dict

# A class to perfectly represent a chunk

class Chunk(BaseModel):
    headline: str = Field(description="A brief heading for this chunk, typically a few words, that is most likely to be surfaced in a query")
    summary: str = Field(description="A few sentences summarizing the content of this chunk to answer common questions")
    original_text: str = Field(description="The original text of this chunk from the provided document, exactly as is, not changed in any way")

    def as_result(self, document):
        metadata = {"source": document["source"], "type": document["type"]}
        return Result(page_content=self.headline + "\n\n" + self.summary + "\n\n" + self.original_text,metadata=metadata)


class Chunks(BaseModel):
    chunks: list[Chunk]

def fetch_documents():
    """A homemade version of the LangChain DirectoryLoader"""
    #Load in everything in the knowledgebase

    documents = []

    for folder in KNOWLEDGE_BASE_PATH.iterdir():
        doc_type = folder.name
        for file in folder.rglob("*.md"):
            with open(file, "r", encoding="utf-8") as f:
                documents.append({"type": doc_type, "source": file.as_posix(), "text": f.read()})

    print(f"Loaded {len(documents)} documents")
    return documents

# documents = fetch_documents()

def make_prompt(document):
    how_many = (len(document["text"]) // AVERAGE_CHUNK_SIZE) + 1
    return f"""
You take a document and you split the document into overlapping chunks for a KnowledgeBase.

The document is from the shared drive of a company called Insurellm.
The document is of type: {document["type"]}
The document has been retrieved from: {document["source"]}

A chatbot will use these chunks to answer questions about the company.
You should divide up the document as you see fit, being sure that the entire document is returned in the chunks - don't leave anything out.
This document should probably be split into {how_many} chunks, but you can have more or less as appropriate.
There should be overlap between the chunks as appropriate; typically about 25% overlap or about 50 words, so you have the same text in multiple chunks for best retrieval results.

For each chunk, you should provide a headline, a summary, and the original text of the chunk.
Together your chunks should represent the entire document with overlap.

Here is the document:

{document["text"]}

Respond with the chunks.
"""

# print(make_prompt(documents[0]))

def make_messages(document):
    return [
        {"role": "user", "content": make_prompt(document)},
    ]

# print(make_messages(documents[0]))

def process_document(document):
    messages = make_messages(document)
    response = completion(model=MODEL, messages=messages, response_format=Chunks)
    reply = response.choices[0].message.content
    doc_as_chunks = Chunks.model_validate_json(reply).chunks
    return [chunk.as_result(document) for chunk in doc_as_chunks]

# print(process_document(documents[0]))

def create_chunks(documents):
    chunks = []
    for doc in documents:
        chunks.extend(process_document(doc))
    return chunks

# chunks = create_chunks(documents)

# print(f"Chunk lenght: {len(chunks)}")

# Embeddings
def create_embeddings(chunks):
    chroma = PersistentClient(path=DB_NAME)
    # if collection_name in [c.name for c in chroma.list_collections()]:
    #     chroma.delete_collection(collection_name)

    texts = [chunk.page_content for chunk in chunks]
    emb = openai.embeddings.create(model=embedding_model, input=texts).data
    vectors = [e.embedding for e in emb]

    collection = chroma.get_or_create_collection(collection_name)

    ids = [str(i) for i in range(len(chunks))]
    metas = [chunk.metadata for chunk in chunks]

    collection.add(ids=ids, embeddings=vectors, documents=texts, metadatas=metas)
    print(f"Vectorstore created with {collection.count()} documents")

# create_embeddings(chunks)



# # Let's investigate the vectors
# chroma = PersistentClient(path=DB_NAME)
# collection = chroma._collection
# count = collection.count()

# sample_embedding = collection.get(limit=1, include=["embeddings"])["embeddings"][0]
# dimensions = len(sample_embedding)
# print(f"There are {count:,} vectors with {dimensions:,} dimensions in the vector store")

# Visualizing  - Prework

# chroma = PersistentClient(path=DB_NAME)
# collection = chroma.get_or_create_collection(collection_name)
# result = collection.get(include=['embeddings', 'documents', 'metadatas'])
# vectors = np.array(result['embeddings'])
# documents = result['documents']
# metadatas = result['metadatas']
# doc_types = [metadata['type'] for metadata in metadatas]
# # Get unique document types from the uploads directory
# unique_doc_types = list(set(doc_types))

# # Define a color palette
# color_palette = [
#     'blue', 'green', 'red', 'orange', 'darkblue', 'purple', 'brown', 
#     'pink', 'gray', 'olive', 'cyan', 'magenta', 'yellow', 'black'
# ]

# # Create a cycling color map for dynamic assignment
# color_cycle = cycle(color_palette)
# color_map = {doc_type: next(color_cycle) for doc_type in unique_doc_types}

# # Apply the dynamic color mapping
# colors = [color_map[t] for t in doc_types]

# print("Generating 2D/3D visualization...")
# # Visualizing in 2D
# # Reduce the dimensionality of the vectors to 2D using t-SNE
# # (t-distributed stochastic neighbor embedding)

# # Calculate appropriate perplexity based on the number of samples
# n_samples = len(vectors)
# perplexity = min(30, max(1, n_samples - 1))  # Ensure perplexity < n_samples

# # tsne = TSNE(n_components=2, random_state=42, perplexity=perplexity)
# # reduced_vectors = tsne.fit_transform(vectors)

# # # Create the 2D scatter plot
# # fig = go.Figure(data=[go.Scatter(
# #     x=reduced_vectors[:, 0],
# #     y=reduced_vectors[:, 1],
# #     mode='markers',
# #     marker=dict(size=5, color=colors, opacity=0.8),
# #     text=[f"Type: {t}<br>Text: {d[:100]}..." for t, d in zip(doc_types, documents)],
# #     hoverinfo='text'
# # )])

# # fig.update_layout(title='2D Chroma Vector Store Visualization',
# #     xaxis_title='x',
# #     yaxis_title='y',
# #     width=800,
# #     height=600,
# #     margin=dict(r=20, b=10, l=10, t=40)
# # )

# # fig.show()

# # Visualzing in 3D!

# tsne = TSNE(n_components=3, random_state=42, perplexity=perplexity)
# reduced_vectors = tsne.fit_transform(vectors)

# # Create the 3D scatter plot
# fig = go.Figure(data=[go.Scatter3d(
#     x=reduced_vectors[:, 0],
#     y=reduced_vectors[:, 1],
#     z=reduced_vectors[:, 2],
#     mode='markers',
#     marker=dict(size=5, color=colors, opacity=0.8),
#     text=[f"Type: {t}<br>Text: {d[:100]}..." for t, d in zip(doc_types, documents)],
#     hoverinfo='text'
# )])

# fig.update_layout(
#     title='3D Chroma Vector Store Visualization',
#     scene=dict(xaxis_title='x', yaxis_title='y', zaxis_title='z'),
#     width=900,
#     height=700,
#     margin=dict(r=10, b=10, l=10, t=40)
# )

# fig.show()

def main():
    documents = fetch_documents()
    chunks = create_chunks(documents)
    create_embeddings(chunks)

if __name__ == "__main__":
    main()