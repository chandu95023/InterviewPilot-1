from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..database import questions_collection
from ..services.ai_service import generate_coding_challenge
from ..utils import serialize_doc

router = APIRouter()

@router.post('/generate')
async def generate_coding_challenge_endpoint(payload: dict, current_user: dict = Depends(get_current_user)):
    domain = payload.get('domain')
    difficulty = payload.get('difficulty', 'Medium')
    if not domain:
        raise HTTPException(status_code=400, detail='Domain is required')
    challenge = generate_coding_challenge(domain, difficulty)
    record = {
        'domain': domain,
        'difficulty': difficulty,
        'prompt': challenge.get('prompt', ''),
        'sample_input': challenge.get('sample_input', ''),
        'sample_output': challenge.get('sample_output', ''),
        'user_id': current_user['id'],
        'created_at': datetime.utcnow(),
    }
    result = await questions_collection.insert_one(record)
    record['_id'] = result.inserted_id
    return {'challenge': serialize_doc(record)}

@router.post('/submit')
async def submit_coding_solution(payload: dict, current_user: dict = Depends(get_current_user)):
    return {
        'status': 'submitted',
        'result': 'Pending execution (demo)',
        'details': 'Code execution integration is available in the next milestone.',
    }
