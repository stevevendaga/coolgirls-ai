from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
from typing import Dict, Any
import openai

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

router = APIRouter(prefix="/api", tags=["Widget"])
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Use OpenAI API to generate response
        # You would need to set up OpenAI API key in your environment
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant called CoolGirls AI. Respond concisely."},
                {"role": "user", "content": request.message}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        return ChatResponse(response=response.choices[0].message.content.strip())
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")