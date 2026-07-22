from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from ..auth import get_current_user
from ..database import interviews_collection, questions_collection
from ..services.evaluation_service import evaluate_interview_flow
from ..utils import serialize_doc, get_db_id
from ..postgres_db import get_db, InterviewSession, InterviewQuestion, GeneratedQuestion
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/evaluate")
async def evaluate_interview(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    domain = payload.get("domain")
    difficulty = payload.get("difficulty")
    answers = payload.get("answers", [])
    questions = []
    for answer in answers:
        question_text = answer.get("question")
        question_id = answer.get("question_id")
        if question_id:
            query_id = get_db_id(question_id)
            if db:
                question = db.query(GeneratedQuestion).filter(GeneratedQuestion.id == str(query_id)).first()
                if question:
                    questions.append({
                        "question": question.question,
                        "answer": question.answer
                    })
                    continue
            # Fallback
            question = await questions_collection.find_one({"_id": query_id})
            if question:
                questions.append(question)
                continue
        if question_text:
            questions.append({"question": question_text, "answer": ""})
    if not questions:
        raise HTTPException(status_code=400, detail="No valid questions provided")
    eval_results = evaluate_interview_flow(questions, answers, domain)
    
    if db:
        new_session = InterviewSession(
            user_id=current_user["id"],
            domain=domain,
            difficulty=difficulty,
            score=eval_results["average_score"],
            evaluation=eval_results,
            created_at=datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        for item in eval_results["summary"]:
            q = InterviewQuestion(
                session_id=new_session.id,
                question=item["question"],
                answer=item["given_answer"],
                ideal_answer=item["evaluation"].get("ideal_answer")
            )
            db.add(q)
        db.commit()
        eval_results["session_id"] = new_session.id
    else:
        interview_record = {
            "user_id": current_user["id"],
            "domain": domain,
            "difficulty": difficulty,
            "answers": answers,
            "score": eval_results["average_score"],
            "evaluation": eval_results,
            "created_at": datetime.utcnow(),
        }
        await interviews_collection.insert_one(interview_record)

    return eval_results


@router.get("/history")
async def interview_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user["id"]).order_by(InterviewSession.created_at.desc()).all()
        history = []
        for s in sessions:
            history.append({
                "id": str(s.id),
                "user_id": s.user_id,
                "domain": s.domain,
                "difficulty": s.difficulty,
                "score": s.score,
                "created_at": str(s.created_at),
            })
        return {"history": history}
    else:
        cursor = interviews_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
        history = []
        async for doc in cursor:
            history.append(serialize_doc(doc))
        return {"history": history}


@router.get("/history/{session_id}")
async def get_interview_session(session_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": str(session.id),
        "user_id": session.user_id,
        "domain": session.domain,
        "difficulty": session.difficulty,
        "score": session.score,
        "evaluation": session.evaluation,
        "created_at": str(session.created_at),
    }


@router.delete("/history/{session_id}")
async def delete_interview_session(session_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user["id"]
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}
