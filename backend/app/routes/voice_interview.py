from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from ..auth import get_current_user
from ..schemas import VoiceInterviewRequest, VoiceAnswerSubmit, VoiceInterviewResponse
from ..database import interviews_collection, questions_collection
from ..services.ai_service import generate_questions, evaluate_answer
from ..utils import serialize_doc
import uuid

router = APIRouter()


@router.post("/start", response_model=VoiceInterviewResponse)
async def start_voice_interview(payload: VoiceInterviewRequest, current_user: dict = Depends(get_current_user)):
    """
    Start a voice-based mock interview session.
    Generates questions based on domain and difficulty level.
    """
    try:
        # Generate questions for the interview
        questions_data = generate_questions(payload.domain, payload.difficulty, count=payload.question_count)
        
        if not questions_data:
            raise HTTPException(status_code=500, detail="Failed to generate interview questions")
        
        # Create session token
        session_token = str(uuid.uuid4())
        
        # Create interview session record
        interview_record = {
            "user_id": current_user["id"],
            "domain": payload.domain,
            "difficulty": payload.difficulty,
            "type": "voice",
            "questions": questions_data,
            "answers": [],
            "session_token": session_token,
            "status": "in_progress",
            "created_at": datetime.utcnow(),
        }
        
        result = await interviews_collection.insert_one(interview_record)
        
        return {
            "interview_id": str(result.inserted_id),
            "domain": payload.domain,
            "difficulty": payload.difficulty,
            "questions": questions_data,
            "session_token": session_token,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start voice interview: {str(e)}")


@router.post("/submit-answer")
async def submit_voice_answer(payload: VoiceAnswerSubmit, current_user: dict = Depends(get_current_user)):
    """
    Submit an answer for a specific question in the voice interview.
    """
    try:
        # Find the interview
        interview = await interviews_collection.find_one({
            "_id": ObjectId(payload.interview_id),
            "user_id": current_user["id"]
        })
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview["status"] != "in_progress":
            raise HTTPException(status_code=400, detail="Interview is not in progress")
        
        # Get the question
        questions = interview.get("questions", [])
        if payload.question_index >= len(questions):
            raise HTTPException(status_code=400, detail="Invalid question index")
        
        question = questions[payload.question_index]
        
        # Evaluate the answer
        evaluation = evaluate_answer(question["question"], payload.answer_text, interview["domain"])
        
        # Add answer to interview
        answer_record = {
            "question_index": payload.question_index,
            "question": question["question"],
            "answer": payload.answer_text,
            "duration_seconds": payload.duration_seconds,
            "evaluation": evaluation,
            "submitted_at": datetime.utcnow(),
        }
        
        await interviews_collection.update_one(
            {"_id": ObjectId(payload.interview_id)},
            {"$push": {"answers": answer_record}}
        )
        
        return {
            "status": "submitted",
            "question_index": payload.question_index,
            "evaluation": evaluation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")


@router.post("/complete/{interview_id}")
async def complete_voice_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    """
    Complete the voice interview and calculate final score.
    """
    try:
        interview = await interviews_collection.find_one({
            "_id": ObjectId(interview_id),
            "user_id": current_user["id"]
        })
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Calculate average score
        answers = interview.get("answers", [])
        if not answers:
            raise HTTPException(status_code=400, detail="No answers submitted")
        
        total_score = 0
        for answer in answers:
            score = float(answer.get("evaluation", {}).get("score", 0))
            total_score += score
        
        average_score = round(total_score / len(answers), 2)
        
        # Identify weak topics
        weak_topics = []
        for answer in answers:
            if float(answer.get("evaluation", {}).get("score", 10)) < 7:
                weak_topics.append(answer.get("question", ""))
        
        # Update interview with completion data
        await interviews_collection.update_one(
            {"_id": ObjectId(interview_id)},
            {
                "$set": {
                    "status": "completed",
                    "score": average_score,
                    "weak_topics": weak_topics,
                    "completed_at": datetime.utcnow(),
                }
            }
        )
        
        return {
            "interview_id": interview_id,
            "status": "completed",
            "average_score": average_score,
            "total_questions": len(interview.get("questions", [])),
            "total_answers": len(answers),
            "weak_topics": weak_topics,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete interview: {str(e)}")


@router.get("/history")
async def voice_interview_history(current_user: dict = Depends(get_current_user)):
    """
    Get history of all voice interviews for the current user.
    """
    try:
        cursor = interviews_collection.find({
            "user_id": current_user["id"],
            "type": "voice"
        }).sort("created_at", -1)
        
        history = []
        async for doc in cursor:
            history.append(serialize_doc(doc))
        
        return {"voice_interviews": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@router.get("/{interview_id}")
async def get_voice_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get details of a specific voice interview.
    """
    try:
        interview = await interviews_collection.find_one({
            "_id": ObjectId(interview_id),
            "user_id": current_user["id"],
            "type": "voice"
        })
        
        if not interview:
            raise HTTPException(status_code=404, detail="Voice interview not found")
        
        return serialize_doc(interview)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interview: {str(e)}")
