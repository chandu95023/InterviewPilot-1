from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from ..auth import get_current_user
from ..database import interviews_collection, questions_collection
from ..services.evaluation_service import evaluate_interview_flow
from ..utils import serialize_doc

router = APIRouter()


@router.post("/evaluate")
async def evaluate_interview(payload: dict, current_user: dict = Depends(get_current_user)):
    domain = payload.get("domain")
    difficulty = payload.get("difficulty")
    answers = payload.get("answers", [])
    questions = []
    for answer in answers:
        question_text = answer.get("question")
        question_id = answer.get("question_id")
        if question_id:
            try:
                query_id = ObjectId(question_id)
            except Exception:
                query_id = None
            if query_id:
                question = await questions_collection.find_one({"_id": query_id})
                if question:
                    questions.append(question)
                    continue
        if question_text:
            questions.append({"question": question_text, "answer": ""})
    if not questions:
        raise HTTPException(status_code=400, detail="No valid questions provided")
    eval_results = evaluate_interview_flow(questions, answers, domain)
    interview_record = {
        "user_id": current_user["id"],
        "domain": domain,
        "difficulty": difficulty,
        "answers": answers,
        "score": eval_results["average_score"],
        "evaluation": eval_results,
        "created_at": datetime.utcnow(),
    }
    result = await interviews_collection.insert_one(interview_record)
    interview_record["_id"] = result.inserted_id
    return serialize_doc(interview_record)


@router.get("/history")
async def interview_history(current_user: dict = Depends(get_current_user)):
    cursor = interviews_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    history = []
    async for doc in cursor:
        history.append(serialize_doc(doc))
    return {"history": history}
