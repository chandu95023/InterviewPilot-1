from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from ..auth import get_current_user
from ..schemas import CodingChallengeCreate, CodingEvaluationRequest
from ..database import coding_challenges_collection
from ..services.ai_service import generate_coding_challenge, evaluate_coding_solution
from ..utils import serialize_doc

router = APIRouter()


@router.post("/generate")
async def generate_coding_challenges(payload: CodingChallengeCreate, current_user: dict = Depends(get_current_user)):
    challenges = []
    for _ in range(payload.count):
        challenge = generate_coding_challenge(payload.domain, payload.difficulty)
        record = {
            "domain": payload.domain,
            "difficulty": payload.difficulty,
            "prompt": challenge.get("prompt", ""),
            "sample_input": challenge.get("sample_input", ""),
            "sample_output": challenge.get("sample_output", ""),
            "user_id": current_user["id"],
            "created_at": datetime.utcnow(),
        }
        result = await coding_challenges_collection.insert_one(record)
        record["_id"] = result.inserted_id
        challenges.append(serialize_doc(record))
    return {"coding_challenges": challenges}


@router.post("/evaluate")
async def evaluate_coding_challenge(payload: CodingEvaluationRequest, current_user: dict = Depends(get_current_user)):
    try:
        challenge = await coding_challenges_collection.find_one({"_id": ObjectId(payload.challenge_id), "user_id": current_user["id"]})
    except Exception:
        challenge = None
    if not challenge:
        raise HTTPException(status_code=404, detail="Coding challenge not found")
    evaluation = evaluate_coding_solution(challenge.get("prompt", ""), payload.solution, payload.language)
    return {"evaluation": evaluation}


@router.get("/history")
async def coding_challenge_history(current_user: dict = Depends(get_current_user)):
    cursor = coding_challenges_collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
    challenges = []
    async for doc in cursor:
        challenges.append(serialize_doc(doc))
    return {"coding_challenges": challenges}
