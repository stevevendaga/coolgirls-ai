
# import os
# import glob
# import warnings
# import tiktoken
# import numpy as np
# from langchain_openai import OpenAIEmbeddings
# from langchain_chroma import Chroma
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_community.document_loaders import DirectoryLoader, TextLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from sklearn.manifold import TSNE
# import plotly.graph_objects as go
# from pathlib import Path
# from dotenv import load_dotenv
# from langchain_openai import ChatOpenAI

# from itertools import cycle

# DB_NAME = "../coolgirls_vector_db"
# load_dotenv(override=True)

# # file input and output paths to convert and output in markdown format
# input_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# # OpenAI API key
# openai_api_key = os.getenv('OPENAI_API_KEY')
# if openai_api_key:
#     print(f"OpenAI API Key exists and begins {openai_api_key[:8]}")
# else:
#     print("OpenAI API Key not set")

# # Load in everything in the knowledgebase using LangChain's loaders

# folders = glob.glob(input_dir + "/*")

# documents = []
# for folder in folders:
#     doc_type = os.path.basename(folder)
#     loader = DirectoryLoader(folder, glob="**/*.md", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
#     folder_docs = loader.load()
#     for doc in folder_docs:
#         doc.metadata["doc_type"] = doc_type
#         documents.append(doc)

# print(f"Loaded {len(documents)} documents")

# # Divide into chunks using the RecursiveCharacterTextSplitter

# text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# chunks = text_splitter.split_documents(documents)

# print(f"Divided into {len(chunks)} chunks")
# print(f"First chunk:\n\n{chunks[0]}")

# # Embeddings

# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# #embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# if os.path.exists(DB_NAME):
#     Chroma(persist_directory=DB_NAME, embedding_function=embeddings).delete_collection()

# vectorstore = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=DB_NAME)
# print(f"Vectorstore created with {vectorstore._collection.count()} documents")

# # Let's investigate the vectors

# collection = vectorstore._collection
# count = collection.count()

# sample_embedding = collection.get(limit=1, include=["embeddings"])["embeddings"][0]
# dimensions = len(sample_embedding)
# print(f"There are {count:,} vectors with {dimensions:,} dimensions in the vector store")

# # Visualizing  - Prework

# result = collection.get(include=['embeddings', 'documents', 'metadatas'])
# vectors = np.array(result['embeddings'])
# documents = result['documents']
# metadatas = result['metadatas']
# doc_types = [metadata['doc_type'] for metadata in metadatas]
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