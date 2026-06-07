from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..database import interviews_collection, questions_collection
from ..utils import serialize_doc

router = APIRouter()

@router.get('/performance')
async def get_performance_metrics(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    total_questions = await questions_collection.count_documents({'user_id': user_id})
    total_interviews = await interviews_collection.count_documents({'user_id': user_id})
    return {
        'total_questions': total_questions,
        'total_interviews': total_interviews,
        'coverage': 'Basic analytics available',
    }

@router.get('/skill-progress')
async def get_skill_progress(current_user: dict = Depends(get_current_user)):
    return {'progress': 'Demo progress metrics available'}
