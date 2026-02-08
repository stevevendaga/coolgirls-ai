import sys
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import Optional, List, Dict
import json
import uuid
from datetime import datetime
from pathlib import Path
from core.prompt import system_prompt
from langchain_huggingface import HuggingFaceEmbeddings
from core import safety
from litellm import completion


sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.rag import fetch_context, make_rag_messages, rewrite_query

# Load environment variables
load_dotenv(override=True)

router = APIRouter(prefix="/api", tags=["chat"])

MODEL = "gpt-4.1-nano"

# Initialize OpenAI client
client = OpenAI()

# Memory directory
MEMORY_DIR = Path("../memory")
MEMORY_DIR.mkdir(exist_ok=True)

# Memory functions
def load_conversation(session_id: str) -> List[Dict]:
    """Load conversation history from file"""
    file_path = MEMORY_DIR / f"{session_id}.json"
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_conversation(session_id: str, messages: List[Dict]):
    """Save conversation history to file"""
    file_path = MEMORY_DIR / f"{session_id}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


@router.get("/")
async def root():
    return {"message": "AI Digital Twin API with Memory"}


@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/answer", response_model=ChatResponse)
def answer_question(request: ChatRequest):
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Load conversation history
        conversation = load_conversation(session_id)
        
        # Use RAG to get context and generate response
        query = rewrite_query(request.message, conversation)
        print(f"Rewritten query: {query}")
        
        chunks = fetch_context(query)
        print(f"Just Chunks: {chunks}")
        messages = make_rag_messages(request.message, conversation, chunks)
        print(f"RAG messages: {messages}")

        
        # Call the LLM
        response = completion(model=MODEL, messages=messages)
        assistant_response = response.choices[0].message.content
        
        # Update conversation history
        conversation.append({"role": "user", "content": request.message})
        conversation.append({"role": "assistant", "content": assistant_response})
        
        # Save updated conversation
        save_conversation(session_id, conversation)
        
        return ChatResponse(
            response=assistant_response,
            session_id=session_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

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


@router.get("/sessions")
async def list_sessions():
    """List all conversation sessions"""
    sessions = []
    for file_path in MEMORY_DIR.glob("*.json"):
        session_id = file_path.stem
        with open(file_path, "r", encoding="utf-8") as f:
            conversation = json.load(f)
            sessions.append({
                "session_id": session_id,
                "message_count": len(conversation),
                "last_message": conversation[-1]["content"] if conversation else None
            })
    return {"sessions": sessions}