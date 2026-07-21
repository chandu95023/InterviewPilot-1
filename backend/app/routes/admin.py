import csv
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import uuid

from ..auth import get_current_user
from ..postgres_db import get_db, User, QuestionBank, CodingChallenge, InterviewSession
from ..database import (
    users_collection,
    questions_collection,
    coding_challenges_collection,
    interviews_collection
)

router = APIRouter()

# ----------------- ADMIN CONTROLLER STATS -----------------
@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # Simple admin validation: for simplicity, demo@interviewpilot.ai or any logged-in user is allowed in dev
    if db:
        user_count = db.query(User).count()
        question_count = db.query(QuestionBank).count()
        challenge_count = db.query(CodingChallenge).count()
        interview_count = db.query(InterviewSession).count()
        return {
            "users": user_count,
            "questions": question_count,
            "challenges": challenge_count,
            "interviews": interview_count
        }
    else:
        user_count = await users_collection.count_documents()
        question_count = await questions_collection.count_documents()
        challenge_count = await coding_challenges_collection.count_documents()
        interview_count = await interviews_collection.count_documents()
        return {
            "users": user_count,
            "questions": question_count,
            "challenges": challenge_count,
            "interviews": interview_count
        }

# ----------------- USER MANAGEMENT -----------------
@router.get("/users")
async def get_admin_users(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return [{"id": u.id, "name": u.name, "email": u.email, "created_at": u.created_at.isoformat()} for u in users]
    else:
        from ..utils import serialize_doc
        cursor = users_collection.find().sort("created_at", -1)
        users = []
        async for doc in cursor:
            users.append(serialize_doc(doc))
        return users

@router.delete("/users/{user_id}")
async def delete_admin_user(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    else:
        # In-memory delete is not fully supported in collections, but we simulate it by removing from array if mock collection
        if hasattr(users_collection, "_docs"):
            users_collection._docs = [d for d in users_collection._docs if str(d.get("_id")) != user_id and str(d.get("id")) != user_id]
            return {"message": "User deleted successfully from memory"}
        raise HTTPException(status_code=400, detail="Custom delete not supported on this fallback engine")

# ----------------- QUESTION BANK CRUD -----------------
@router.get("/questions")
async def get_admin_questions(
    q: Optional[str] = None,
    domain: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if db:
        query = db.query(QuestionBank)
        if q:
            query = query.filter(QuestionBank.question.ilike(f"%{q}%"))
        if domain:
            query = query.filter(func.lower(QuestionBank.domain) == domain.lower())
        if difficulty:
            query = query.filter(func.lower(QuestionBank.difficulty) == difficulty.lower())
        
        total = query.count()
        questions = query.offset(offset).limit(limit).all()
        return {
            "total": total,
            "questions": [
                {
                    "id": qb.id,
                    "domain": qb.domain,
                    "subtopic": qb.subtopic,
                    "difficulty": qb.difficulty,
                    "question": qb.question,
                    "expected_answer": qb.expected_answer,
                    "keywords": qb.keywords,
                    "score_weight": qb.score_weight
                } for qb in questions
            ]
        }
    else:
        # Fallback to questions history collection or in-memory fallback
        from ..utils import serialize_doc
        filt = {}
        if domain:
            filt["domain"] = domain
        if difficulty:
            filt["difficulty"] = difficulty
            
        cursor = questions_collection.find(filt)
        questions = []
        async for doc in cursor:
            s_doc = serialize_doc(doc)
            if q and q.lower() not in s_doc.get("question", "").lower():
                continue
            questions.append(s_doc)
        
        total = len(questions)
        sliced = questions[offset:offset+limit]
        return {
            "total": total,
            "questions": sliced
        }

@router.post("/questions")
async def create_admin_question(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        qb = QuestionBank(
            domain=payload.get("domain", "Python"),
            subtopic=payload.get("subtopic", "General"),
            difficulty=payload.get("difficulty", "Medium"),
            question=payload.get("question", ""),
            expected_answer=payload.get("expected_answer", ""),
            keywords=payload.get("keywords", []),
            score_weight=float(payload.get("score_weight", 1.0))
        )
        db.add(qb)
        db.commit()
        db.refresh(qb)
        return {
            "id": qb.id,
            "domain": qb.domain,
            "subtopic": qb.subtopic,
            "difficulty": qb.difficulty,
            "question": qb.question,
            "expected_answer": qb.expected_answer,
            "keywords": qb.keywords,
            "score_weight": qb.score_weight
        }
    else:
        doc = {
            "domain": payload.get("domain", "Python"),
            "subtopic": payload.get("subtopic", "General"),
            "difficulty": payload.get("difficulty", "Medium"),
            "question": payload.get("question", ""),
            "expected_answer": payload.get("expected_answer", ""),
            "keywords": payload.get("keywords", []),
            "score_weight": float(payload.get("score_weight", 1.0))
        }
        res = await questions_collection.insert_one(doc)
        doc["id"] = res.inserted_id
        return doc

@router.put("/questions/{q_id}")
async def update_admin_question(q_id: int, payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        qb = db.query(QuestionBank).filter(QuestionBank.id == q_id).first()
        if not qb:
            raise HTTPException(status_code=404, detail="Question not found")
        qb.domain = payload.get("domain", qb.domain)
        qb.subtopic = payload.get("subtopic", qb.subtopic)
        qb.difficulty = payload.get("difficulty", qb.difficulty)
        qb.question = payload.get("question", qb.question)
        qb.expected_answer = payload.get("expected_answer", qb.expected_answer)
        qb.keywords = payload.get("keywords", qb.keywords)
        qb.score_weight = float(payload.get("score_weight", qb.score_weight))
        db.commit()
        return {"message": "Question updated successfully"}
    else:
        # Mock collection fallback
        if hasattr(questions_collection, "_docs"):
            for d in questions_collection._docs:
                if str(d.get("_id")) == str(q_id) or str(d.get("id")) == str(q_id):
                    d["domain"] = payload.get("domain", d.get("domain"))
                    d["subtopic"] = payload.get("subtopic", d.get("subtopic"))
                    d["difficulty"] = payload.get("difficulty", d.get("difficulty"))
                    d["question"] = payload.get("question", d.get("question"))
                    d["expected_answer"] = payload.get("expected_answer", d.get("expected_answer"))
                    d["keywords"] = payload.get("keywords", d.get("keywords"))
                    d["score_weight"] = float(payload.get("score_weight", d.get("score_weight")))
                    return {"message": "Question updated in memory"}
        raise HTTPException(status_code=404, detail="Question not found")

@router.delete("/questions/{q_id}")
async def delete_admin_question(q_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        qb = db.query(QuestionBank).filter(QuestionBank.id == q_id).first()
        if not qb:
            raise HTTPException(status_code=404, detail="Question not found")
        db.delete(qb)
        db.commit()
        return {"message": "Question deleted successfully"}
    else:
        if hasattr(questions_collection, "_docs"):
            questions_collection._docs = [d for d in questions_collection._docs if str(d.get("_id")) != str(q_id) and str(d.get("id")) != str(q_id)]
            return {"message": "Question deleted in memory"}
        raise HTTPException(status_code=404, detail="Question not found")

# ----------------- BULK IMPORT / EXPORT -----------------
@router.post("/questions/import")
async def import_questions(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Relational Database fallback unavailable for CSV imports.")
    
    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported_count = 0
    for row in reader:
        try:
            # Parse keywords
            keywords_raw = row.get("keywords", "")
            keywords_list = [k.strip() for k in keywords_raw.split(",")] if keywords_raw else []
            
            qb = QuestionBank(
                domain=row.get("domain", "Python"),
                subtopic=row.get("subtopic", "General"),
                difficulty=row.get("difficulty", "Medium"),
                question=row.get("question", ""),
                expected_answer=row.get("expected_answer", ""),
                keywords=keywords_list,
                score_weight=float(row.get("score_weight", 1.0))
            )
            db.add(qb)
            imported_count += 1
        except Exception:
            continue
            
    db.commit()
    return {"message": f"Successfully imported {imported_count} questions"}

@router.get("/questions/export")
async def export_questions(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Export not available in in-memory mode")
        
    questions = db.query(QuestionBank).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    # Headers
    writer.writerow(["domain", "subtopic", "difficulty", "question", "expected_answer", "keywords", "score_weight"])
    
    for q in questions:
        kw = ",".join(q.keywords) if isinstance(q.keywords, list) else ""
        writer.writerow([q.domain, q.subtopic, q.difficulty, q.question, q.expected_answer, kw, q.score_weight])
        
    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=question_bank_export.csv"
    return response

# ----------------- CODING CHALLENGES CRUD -----------------
@router.get("/challenges")
async def get_admin_challenges(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        challenges = db.query(CodingChallenge).order_by(CodingChallenge.created_at.desc()).all()
        return [
            {
                "id": c.id,
                "domain": c.domain,
                "difficulty": c.difficulty,
                "prompt": c.prompt,
                "sample_input": c.sample_input,
                "sample_output": c.sample_output,
                "created_at": c.created_at.isoformat()
            } for c in challenges
        ]
    else:
        from ..utils import serialize_doc
        cursor = coding_challenges_collection.find().sort("created_at", -1)
        challenges = []
        async for doc in cursor:
            challenges.append(serialize_doc(doc))
        return challenges

@router.post("/challenges")
async def create_admin_challenge(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    c_id = str(uuid.uuid4())
    if db:
        cc = CodingChallenge(
            id=c_id,
            user_id=current_user["id"],
            domain=payload.get("domain", "Python"),
            difficulty=payload.get("difficulty", "Medium"),
            prompt=payload.get("prompt", ""),
            sample_input=payload.get("sample_input", ""),
            sample_output=payload.get("sample_output", ""),
            created_at=datetime.utcnow()
        )
        db.add(cc)
        db.commit()
        return {
            "id": cc.id,
            "domain": cc.domain,
            "difficulty": cc.difficulty,
            "prompt": cc.prompt,
            "sample_input": cc.sample_input,
            "sample_output": cc.sample_output,
            "created_at": cc.created_at.isoformat()
        }
    else:
        doc = {
            "id": c_id,
            "user_id": current_user["id"],
            "domain": payload.get("domain", "Python"),
            "difficulty": payload.get("difficulty", "Medium"),
            "prompt": payload.get("prompt", ""),
            "sample_input": payload.get("sample_input", ""),
            "sample_output": payload.get("sample_output", ""),
            "created_at": datetime.utcnow()
        }
        res = await coding_challenges_collection.insert_one(doc)
        doc["_id"] = res.inserted_id
        return doc

@router.put("/challenges/{c_id}")
async def update_admin_challenge(c_id: str, payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        cc = db.query(CodingChallenge).filter(CodingChallenge.id == c_id).first()
        if not cc:
            raise HTTPException(status_code=404, detail="Coding challenge not found")
        cc.domain = payload.get("domain", cc.domain)
        cc.difficulty = payload.get("difficulty", cc.difficulty)
        cc.prompt = payload.get("prompt", cc.prompt)
        cc.sample_input = payload.get("sample_input", cc.sample_input)
        cc.sample_output = payload.get("sample_output", cc.sample_output)
        db.commit()
        return {"message": "Coding challenge updated successfully"}
    else:
        if hasattr(coding_challenges_collection, "_docs"):
            for d in coding_challenges_collection._docs:
                if str(d.get("_id")) == c_id or str(d.get("id")) == c_id:
                    d["domain"] = payload.get("domain", d.get("domain"))
                    d["difficulty"] = payload.get("difficulty", d.get("difficulty"))
                    d["prompt"] = payload.get("prompt", d.get("prompt"))
                    d["sample_input"] = payload.get("sample_input", d.get("sample_input"))
                    d["sample_output"] = payload.get("sample_output", d.get("sample_output"))
                    return {"message": "Coding challenge updated in memory"}
        raise HTTPException(status_code=404, detail="Coding challenge not found")

@router.delete("/challenges/{c_id}")
async def delete_admin_challenge(c_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        cc = db.query(CodingChallenge).filter(CodingChallenge.id == c_id).first()
        if not cc:
            raise HTTPException(status_code=404, detail="Coding challenge not found")
        db.delete(cc)
        db.commit()
        return {"message": "Coding challenge deleted successfully"}
    else:
        if hasattr(coding_challenges_collection, "_docs"):
            coding_challenges_collection._docs = [d for d in coding_challenges_collection._docs if str(d.get("_id")) != c_id and str(d.get("id")) != c_id]
            return {"message": "Coding challenge deleted in memory"}
        raise HTTPException(status_code=404, detail="Coding challenge not found")
