from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from ..auth import get_current_user
from ..database import resume_collection
from ..services.resume_service import extract_resume_text, build_resume_insights
from ..utils import serialize_doc
import tempfile

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are accepted")
    tmp_path = tempfile.mktemp(suffix=".pdf")
    contents = await file.read()
    with open(tmp_path, "wb") as buffer:
        buffer.write(contents)
    raw_text = extract_resume_text(tmp_path)
    parsed = build_resume_insights(raw_text, domain="Full Stack Development")
    record = {
        "user_id": current_user["id"],
        "raw_text": raw_text,
        "skills": parsed["skills"],
        "projects": parsed["projects"],
        "education": parsed["education"],
        "certifications": parsed["certifications"],
        "recommended_questions": parsed["recommended_questions"],
        "created_at": datetime.utcnow(),
    }
    result = await resume_collection.insert_one(record)
    record["_id"] = result.inserted_id
    return {"resume": serialize_doc(record)}


@router.get("/history")
async def resume_history(current_user: dict = Depends(get_current_user)):
    cursor = resume_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    resumes = []
    async for doc in cursor:
        resumes.append(serialize_doc(doc))
    return {"resumes": resumes}
