from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..schemas import QuestionGenerateRequest, CompanyQuestionRequest
from ..database import questions_collection
from ..services.ai_service import generate_questions, generate_company_questions
from ..utils import serialize_doc

router = APIRouter()


@router.post("/generate")
async def generate_questions_endpoint(payload: QuestionGenerateRequest, current_user: dict = Depends(get_current_user)):
    question_items = generate_questions(payload.domain, payload.difficulty, count=payload.count)
    saved = []
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
async def get_questions_history(current_user: dict = Depends(get_current_user)):
    cursor = questions_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    questions = []
    async for doc in cursor:
        questions.append(serialize_doc(doc))
    return {"questions": questions}


@router.get("/domains")
async def list_domains():
    return {"domains": ["Java", "Python", "Full Stack Development", "Data Science", "AI/ML"]}


@router.get("/companies")
async def list_companies():
    return {"companies": ["Google", "Amazon", "Microsoft", "Meta", "Tesla", "Apple", "Oracle"]}


@router.post("/company-generate")
async def generate_company_questions_endpoint(payload: CompanyQuestionRequest, current_user: dict = Depends(get_current_user)):
    question_items = generate_company_questions(payload.company, payload.domain, payload.difficulty, count=payload.count)
    saved = []
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
