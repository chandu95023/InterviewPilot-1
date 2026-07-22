from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..auth import get_current_user
from ..schemas import VoiceInterviewRequest, VoiceAnswerSubmit, VoiceInterviewResponse
from ..services.ai_service import generate_questions, evaluate_answer, transcribe_audio_with_gemini
from ..postgres_db import get_db, VoiceSession
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
import uuid

router = APIRouter()


@router.post("/start", response_model=VoiceInterviewResponse)
async def start_voice_interview(payload: VoiceInterviewRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
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
        interview_id = str(uuid.uuid4())
        
        if db:
            new_session = VoiceSession(
                id=interview_id,
                user_id=current_user["id"],
                domain=payload.domain,
                difficulty=payload.difficulty,
                score=None,
                transcript={
                    "questions": questions_data,
                    "answers": [],
                    "session_token": session_token,
                    "status": "in_progress",
                    "created_at": datetime.utcnow().isoformat()
                },
                created_at=datetime.utcnow()
            )
            db.add(new_session)
            db.commit()
            
            return {
                "interview_id": interview_id,
                "domain": payload.domain,
                "difficulty": payload.difficulty,
                "questions": questions_data,
                "session_token": session_token,
            }
        else:
            # Fallback legacy
            from ..database import interviews_collection
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
async def submit_voice_answer(payload: VoiceAnswerSubmit, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Submit an answer for a specific question in the voice interview.
    """
    try:
        if db:
            session = db.query(VoiceSession).filter(VoiceSession.id == payload.interview_id, VoiceSession.user_id == current_user["id"]).first()
            if not session:
                raise HTTPException(status_code=404, detail="Interview not found")
                
            transcript = dict(session.transcript) if session.transcript else {}
            if transcript.get("status") != "in_progress":
                raise HTTPException(status_code=400, detail="Interview is not in progress")
                
            questions = transcript.get("questions", [])
            if payload.question_index >= len(questions):
                raise HTTPException(status_code=400, detail="Invalid question index")
                
            question = questions[payload.question_index]
            
            # Evaluate the answer
            evaluation = evaluate_answer(question["question"], payload.answer_text, session.domain)
            
            # Add answer to interview
            answer_record = {
                "question_index": payload.question_index,
                "question": question["question"],
                "answer": payload.answer_text,
                "duration_seconds": payload.duration_seconds,
                "evaluation": evaluation,
                "submitted_at": datetime.utcnow().isoformat(),
            }
            
            if "answers" not in transcript:
                transcript["answers"] = []
            transcript["answers"].append(answer_record)
            session.transcript = transcript
            flag_modified(session, "transcript")
            db.commit()
            
            return {
                "status": "submitted",
                "question_index": payload.question_index,
                "evaluation": evaluation,
            }
        else:
            from ..database import interviews_collection
            # Find the interview
            interview = await interviews_collection.find_one({
                "_id": uuid.UUID(payload.interview_id) if isinstance(payload.interview_id, uuid.UUID) else payload.interview_id,
                "user_id": current_user["id"]
            })
            if not interview:
                raise HTTPException(status_code=404, detail="Interview not found")
            
            questions = interview.get("questions", [])
            question = questions[payload.question_index]
            evaluation = evaluate_answer(question["question"], payload.answer_text, interview["domain"])
            
            answer_record = {
                "question_index": payload.question_index,
                "question": question["question"],
                "answer": payload.answer_text,
                "duration_seconds": payload.duration_seconds,
                "evaluation": evaluation,
                "submitted_at": datetime.utcnow(),
            }
            from ..utils import get_db_id
            await interviews_collection.update_one(
                {"_id": get_db_id(payload.interview_id)},
                {"$push": {"answers": answer_record}}
            )
            return {
                "status": "submitted",
                "question_index": payload.question_index,
                "evaluation": evaluation,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

@router.post("/transcribe", summary="Transcribe audio file using Gemini")
async def transcribe_voice_interview(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Accept an audio file (e.g., mp3, wav) and return its transcription using Gemini.
    """
    try:
        content = await file.read()
        mime_type = file.content_type or "audio/mpeg"
        transcript = transcribe_audio_with_gemini(content, mime_type)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
@router.post("/complete/{interview_id}")
async def complete_voice_interview(interview_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Complete the voice interview and calculate final score.
    """
    try:
        if db:
            session = db.query(VoiceSession).filter(VoiceSession.id == interview_id, VoiceSession.user_id == current_user["id"]).first()
            if not session:
                raise HTTPException(status_code=404, detail="Interview not found")
                
            transcript = dict(session.transcript) if session.transcript else {}
            answers = transcript.get("answers", [])
            if not answers:
                raise HTTPException(status_code=400, detail="No answers submitted")
                
            total_score = 0
            for answer in answers:
                score = float(answer.get("evaluation", {}).get("score", 0))
                total_score += score
            
            # Average score is scaled from out of 10 to a percentage (out of 100)
            avg_score_out_of_10 = total_score / len(answers)
            average_score_pct = round(avg_score_out_of_10 * 10, 1)
            
            # Identify weak topics
            weak_topics = []
            for answer in answers:
                if float(answer.get("evaluation", {}).get("score", 10)) < 7.0:
                    weak_topics.append(answer.get("question", ""))
                    
            transcript["status"] = "completed"
            transcript["score"] = average_score_pct
            transcript["weak_topics"] = weak_topics
            transcript["completed_at"] = datetime.utcnow().isoformat()
            
            session.transcript = transcript
            session.score = average_score_pct
            flag_modified(session, "transcript")
            db.commit()
            
            return {
                "interview_id": interview_id,
                "status": "completed",
                "average_score": average_score_pct,
                "total_questions": len(transcript.get("questions", [])),
                "total_answers": len(answers),
                "weak_topics": weak_topics,
            }
        else:
            from ..database import interviews_collection
            from ..utils import get_db_id
            interview = await interviews_collection.find_one({
                "_id": get_db_id(interview_id),
                "user_id": current_user["id"]
            })
            if not interview:
                raise HTTPException(status_code=404, detail="Interview not found")
            
            answers = interview.get("answers", [])
            total_score = 0
            for answer in answers:
                score = float(answer.get("evaluation", {}).get("score", 0))
                total_score += score
            
            average_score = round((total_score / len(answers)) * 10, 1) if answers else 0
            weak_topics = []
            for answer in answers:
                if float(answer.get("evaluation", {}).get("score", 10)) < 7:
                    weak_topics.append(answer.get("question", ""))
                    
            await interviews_collection.update_one(
                {"_id": get_db_id(interview_id)},
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
async def voice_interview_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get history of all voice interviews for the current user.
    """
    try:
        if db:
            sessions = db.query(VoiceSession).filter(VoiceSession.user_id == current_user["id"]).order_by(VoiceSession.created_at.desc()).all()
            history = []
            for s in sessions:
                history.append({
                    "id": s.id,
                    "domain": s.domain,
                    "difficulty": s.difficulty,
                    "score": s.score or 0,
                    "created_at": s.created_at.isoformat() if s.created_at else None
                })
            return {"voice_interviews": history}
        else:
            from ..database import interviews_collection
            from ..utils import serialize_doc
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
async def get_voice_interview(interview_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get details of a specific voice interview.
    """
    try:
        if db:
            session = db.query(VoiceSession).filter(VoiceSession.id == interview_id, VoiceSession.user_id == current_user["id"]).first()
            if not session:
                raise HTTPException(status_code=404, detail="Voice interview not found")
                
            return {
                "id": session.id,
                "user_id": session.user_id,
                "domain": session.domain,
                "difficulty": session.difficulty,
                "score": session.score,
                "transcript": session.transcript,
                "created_at": session.created_at.isoformat() if session.created_at else None
            }
        else:
            from ..database import interviews_collection
            from ..utils import get_db_id, serialize_doc
            interview = await interviews_collection.find_one({
                "_id": get_db_id(interview_id),
                "user_id": current_user["id"],
                "type": "voice"
            })
            if not interview:
                raise HTTPException(status_code=404, detail="Voice interview not found")
            return serialize_doc(interview)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interview: {str(e)}")
