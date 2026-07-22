from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..postgres_db import get_db, AssistantChat
from ..services.ai_service import call_gemini, GEMINI_AVAILABLE

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/chat")
async def ask_assistant_endpoint(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not GEMINI_AVAILABLE:
        answer = "I'm in offline mode right now since the Gemini API key is missing or not configured. Please connect your API key to enable live conversations!"
    else:
        try:
            # We construct a system prompt context so Gemini knows it is an Interview Coach
            system_prompt = (
                "You are an expert AI Interview Coach and career mentor. "
                "Provide professional, structured, and insightful answers to the candidate's question. "
                "Keep your responses concise, action-oriented, and tailored for career success. "
                "When explaining technical concepts, use simple terms first, then show short examples. "
                f"Candidate's Question: {question}"
            )
            answer = call_gemini(system_prompt)
        except Exception as e:
            answer = f"Error processing request via Gemini: {str(e)}"

    # Save conversation details to database
    if db:
        try:
            chat_record = AssistantChat(
                user_id=current_user["id"],
                question=question,
                answer=answer,
                created_at=datetime.utcnow()
            )
            db.add(chat_record)
            db.commit()
            db.refresh(chat_record)
            chat_id = chat_record.id
        except Exception as db_err:
            chat_id = None
    else:
        from ..database import assistant_collection
        from ..utils import serialize_doc
        chat_doc = {
            "user_id": current_user["id"],
            "question": question,
            "answer": answer,
            "created_at": datetime.utcnow()
        }
        res = await assistant_collection.insert_one(chat_doc)
        chat_id = str(res.inserted_id)

    return {
        "id": chat_id,
        "question": question,
        "answer": answer,
        "created_at": datetime.utcnow().isoformat()
    }

@router.get("/history")
async def get_assistant_history_endpoint(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["id"]
    
    if db:
        chats = db.query(AssistantChat).filter(
            AssistantChat.user_id == user_id
        ).order_by(AssistantChat.created_at.asc()).all()
        
        return {
            "history": [
                {
                    "id": c.id,
                    "question": c.question,
                    "answer": c.answer,
                    "created_at": c.created_at.isoformat() if c.created_at else None
                }
                for c in chats
            ]
        }
    else:
        from ..database import assistant_collection
        from ..utils import serialize_doc
        
        cursor = assistant_collection.find({"user_id": user_id})
        chats = []
        async for doc in cursor:
            chats.append(serialize_doc(doc))
            
        # Sort in memory since fallback has simple sorting
        chats.sort(key=lambda x: x.get("created_at") or "")
        
        return {
            "history": [
                {
                    "id": c.get("_id"),
                    "question": c.get("question"),
                    "answer": c.get("answer"),
                    "created_at": c.get("created_at")
                }
                for c in chats
            ]
        }
