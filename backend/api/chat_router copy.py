# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from openai import OpenAI
# import os
# from dotenv import load_dotenv
# from typing import Optional, List, Dict
# import json
# import uuid
# from datetime import datetime
# from pathlib import Path
# from core.prompt import system_prompt
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_chroma import Chroma
# from langchain_openai import ChatOpenAI
# from langchain_core.messages import SystemMessage, HumanMessage
# from core import safety

# # Load environment variables
# load_dotenv(override=True)

# router = APIRouter(prefix="/api", tags=["chat"])

# MODEL = "gpt-4.1-nano"
# DB_NAME = "coolgirls_vector_db"

# # Initialize OpenAI client
# client = OpenAI()

# # Memory directory
# MEMORY_DIR = Path("../memory")
# MEMORY_DIR.mkdir(exist_ok=True)

# # Load system prompt

# system_prompt = system_prompt("en")

# # Memory functions
# def load_conversation(session_id: str) -> List[Dict]:
#     """Load conversation history from file"""
#     file_path = MEMORY_DIR / f"{session_id}.json"
#     if file_path.exists():
#         with open(file_path, "r", encoding="utf-8") as f:
#             return json.load(f)
#     return []


# def save_conversation(session_id: str, messages: List[Dict]):
#     """Save conversation history to file"""
#     file_path = MEMORY_DIR / f"{session_id}.json"
#     with open(file_path, "w", encoding="utf-8") as f:
#         json.dump(messages, f, indent=2, ensure_ascii=False)


# # Request/Response models
# class ChatRequest(BaseModel):
#     message: str
#     session_id: Optional[str] = None


# class ChatResponse(BaseModel):
#     response: str
#     session_id: str


# @router.get("/")
# async def root():
#     return {"message": "AI Digital Twin API with Memory"}


# @router.get("/health")
# async def health_check():
#     return {"status": "healthy"}


# # Connect to Chroma; use Hugging Face all-MiniLM-L6-v2 or OpenAIEmbeddings(model="text-embedding-3-large")

# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# vectorstore = Chroma(persist_directory=DB_NAME, embedding_function=embeddings)

# # Seting up the 2 key LangChain objects: retriever and llm
# # Also, the temperature
# retriever = vectorstore.as_retriever()
# llm = ChatOpenAI(temperature=0, model_name=MODEL)

# SYSTEM_PROMPT_TEMPLATE = """{system_prompt} Context: {context} """
# @router.post("/answer", response_model=ChatResponse)
# def answer_question(request: ChatRequest):
#     try:
#         # Generate session ID if not provided
#         session_id = request.session_id or str(uuid.uuid4())
        
#         # Load conversation history
#         conversation = load_conversation(session_id)
        
#         # Retrieve relevant documents
#         docs = retriever.invoke(request.message)
#         context = "\n\n".join(doc.page_content for doc in docs)
        
#         # Format the system prompt with context
#         formatted_system_prompt = SYSTEM_PROMPT_TEMPLATE.format(system_prompt=system_prompt, context=context)
        
#         # Build messages with history
#         messages = [{"role": "system", "content": formatted_system_prompt}]
        
#         # Add conversation history
#         for msg in conversation:
#             messages.append(msg)
        
#         # Add current message
#         messages.append({"role": "user", "content": request.message})
        
#         # Prepare LangChain messages
#         lc_messages = []
#         for msg in messages:
#             if msg["role"] == "system":
#                 lc_messages.append(SystemMessage(content=msg["content"]))
#             elif msg["role"] == "user":
#                 lc_messages.append(HumanMessage(content=msg["content"]))
#             elif msg["role"] == "assistant":
#                 lc_messages.append(SystemMessage(content=msg["content"]))  # Note: LangChain uses SystemMessage/HumanMessage/AIMessage
        
#         # Call the LLM
#         response = llm.invoke(lc_messages)
        
#         # Extract the response content
#         assistant_response = response.content
        
#         # Update conversation history
#         conversation.append({"role": "user", "content": request.message})
#         conversation.append({"role": "assistant", "content": assistant_response})
        
#         # Save updated conversation
#         save_conversation(session_id, conversation)
        
#         return ChatResponse(
#             response=assistant_response,
#             session_id=session_id
#         )
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# @router.post("/chat", response_model=ChatResponse)
# async def chat(request: ChatRequest):
#     try:
#         # Generate session ID if not provided
#         session_id = request.session_id or str(uuid.uuid4())
        
#         # Load conversation history
#         conversation = load_conversation(session_id)
        
#         # Build messages with history
#         messages = [{"role": "system", "content": system_prompt}]
        
#         # Add conversation history
#         for msg in conversation:
#             messages.append(msg)
        
#         # Add current message
#         messages.append({"role": "user", "content": request.message})
        
#         # Call OpenAI API
#         response = client.chat.completions.create(
#             model=MODEL,
#             messages=messages
#         )
        
#         assistant_response = response.choices[0].message.content
    
        
#         # Update conversation history
#         conversation.append({"role": "user", "content": request.message})
#         conversation.append({"role": "assistant", "content": assistant_response})
        
#         # Save updated conversation
#         save_conversation(session_id, conversation)
        
#         return ChatResponse(
#             response=assistant_response,
#             session_id=session_id
#         )
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/sessions")
# async def list_sessions():
#     """List all conversation sessions"""
#     sessions = []
#     for file_path in MEMORY_DIR.glob("*.json"):
#         session_id = file_path.stem
#         with open(file_path, "r", encoding="utf-8") as f:
#             conversation = json.load(f)
#             sessions.append({
#                 "session_id": session_id,
#                 "message_count": len(conversation),
#                 "last_message": conversation[-1]["content"] if conversation else None
#             })
#     return {"sessions": sessions}