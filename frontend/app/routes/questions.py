from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..schemas import QuestionGenerateRequest, CompanyQuestionRequest
from ..services.ai_service import generate_questions, generate_company_questions
from ..postgres_db import get_db, QuestionBank, GeneratedQuestion
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import uuid

router = APIRouter()


@router.post("/generate")
async def generate_questions_endpoint(payload: QuestionGenerateRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    question_items = generate_questions(payload.domain, payload.difficulty, count=payload.count)
    saved = []
    
    if db:
        for item in question_items:
            q_id = str(uuid.uuid4())
            q_record = GeneratedQuestion(
                id=q_id,
                domain=payload.domain,
                difficulty=payload.difficulty,
                question=item["question"],
                answer=item["answer"],
                user_id=current_user["id"],
                source="generated",
                created_at=datetime.utcnow()
            )
            db.add(q_record)
            saved.append({
                "id": q_id,
                "domain": payload.domain,
                "difficulty": payload.difficulty,
                "question": item["question"],
                "answer": item["answer"],
                "user_id": current_user["id"],
                "source": "generated",
                "created_at": q_record.created_at.isoformat()
            })
        db.commit()
    else:
        from ..database import questions_collection
        from ..utils import serialize_doc
        for item in question_items:
            question_record = {
                "domain": payload.domain,
                "difficulty": payload.difficulty,
                "question": item["question"],
                "answer": item["answer"],
                "user_id": current_user["id"],
                "source": "generated",
                "created_at": datetime.utcnow(),
            }
            result = await questions_collection.insert_one(question_record)
            question_record["_id"] = result.inserted_id
            saved.append(serialize_doc(question_record))
            
    return {"questions": saved}


@router.get("/history")
async def get_questions_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        questions = db.query(GeneratedQuestion).filter(GeneratedQuestion.user_id == current_user["id"]).order_by(GeneratedQuestion.created_at.desc()).all()
        return {"questions": [
            {
                "id": q.id,
                "domain": q.domain,
                "difficulty": q.difficulty,
                "question": q.question,
                "answer": q.answer,
                "user_id": q.user_id,
                "source": q.source,
                "company": q.company,
                "created_at": q.created_at.isoformat() if q.created_at else None
            } for q in questions
        ]}
    else:
        from ..database import questions_collection
        from ..utils import serialize_doc
        cursor = questions_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
        questions = []
        async for doc in cursor:
            questions.append(serialize_doc(doc))
        return {"questions": questions}


@router.get("/domains")
async def list_domains():
    return {"domains": [
        "Python", "Java", "JavaScript", "React", "Node.js",
        "SQL", "DSA", "OOPs", "DBMS", "Operating Systems",
        "Computer Networks", "System Design"
    ]}


@router.get("/companies")
async def list_companies():
    return {"companies": ["Google", "Amazon", "Microsoft", "Meta", "Tesla", "Apple", "Oracle"]}


@router.post("/company-generate")
async def generate_company_questions_endpoint(payload: CompanyQuestionRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    question_items = generate_company_questions(payload.company, payload.domain, payload.difficulty, count=payload.count)
    saved = []
    
    if db:
        for item in question_items:
            q_id = str(uuid.uuid4())
            q_record = GeneratedQuestion(
                id=q_id,
                domain=payload.domain,
                difficulty=payload.difficulty,
                question=item["question"],
                answer=item["answer"],
                user_id=current_user["id"],
                source="company",
                company=payload.company,
                created_at=datetime.utcnow()
            )
            db.add(q_record)
            saved.append({
                "id": q_id,
                "domain": payload.domain,
                "difficulty": payload.difficulty,
                "question": item["question"],
                "answer": item["answer"],
                "user_id": current_user["id"],
                "source": "company",
                "company": payload.company,
                "created_at": q_record.created_at.isoformat()
            })
        db.commit()
    else:
        from ..database import questions_collection
        from ..utils import serialize_doc
        for item in question_items:
            question_record = {
                "domain": payload.domain,
                "difficulty": payload.difficulty,
                "question": item["question"],
                "answer": item["answer"],
                "user_id": current_user["id"],
                "company": payload.company,
                "source": "company",
                "created_at": datetime.utcnow(),
            }
            result = await questions_collection.insert_one(question_record)
            question_record["_id"] = result.inserted_id
            saved.append(serialize_doc(question_record))
            
    return {"questions": saved}


@router.get("/")
async def get_all_questions(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    questions = db.query(QuestionBank).offset(offset).limit(limit).all()
    return {"questions": questions}


@router.get("/domain/{domain}")
async def get_questions_by_domain(domain: str, limit: int = 50, db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    questions = db.query(QuestionBank).filter(func.lower(QuestionBank.domain) == domain.lower()).limit(limit).all()
    return {"questions": questions}


@router.get("/difficulty/{level}")
async def get_questions_by_difficulty(level: str, limit: int = 50, db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    questions = db.query(QuestionBank).filter(func.lower(QuestionBank.difficulty) == level.lower()).limit(limit).all()
    return {"questions": questions}


@router.get("/random")
async def get_random_questions(count: int = 10, db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    questions = db.query(QuestionBank).order_by(func.random()).limit(count).all()
    return {"questions": questions}


from ..services.ai_service import generate_dynamic_interview_questions


@router.post("/generate-ai")
async def generate_ai_dynamic(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    generated = generate_dynamic_interview_questions(payload)
    
    # Save to PostgreSQL
    saved_questions = []
    for item in generated:
        q = QuestionBank(
            domain=payload.get("domain", "General"),
            subtopic=item.get("subtopic", "General"),
            difficulty=payload.get("difficulty", "Medium"),
            question=item.get("question", ""),
            expected_answer=item.get("expected_answer", ""),
            keywords=item.get("keywords", []),
            score_weight=1.5
        )
        db.add(q)
        saved_questions.append(q)
    
    db.commit()
    for q in saved_questions:
        db.refresh(q)
        
    return {"questions": saved_questions}
