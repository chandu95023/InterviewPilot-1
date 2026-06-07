from datetime import datetime
from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..database import questions_collection
from ..services.ai_service import generate_company_questions
from ..utils import serialize_doc

router = APIRouter()

@router.get('/companies')
async def get_company_list():
    companies = [
        'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini', 'HCL',
        'Deloitte', 'Tech Mahindra', 'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Netflix'
    ]
    return {'companies': companies}

@router.post('/prepare')
async def prepare_company_interview(payload: dict, current_user: dict = Depends(get_current_user)):
    company = payload.get('company')
    domain = payload.get('domain')
    difficulty = payload.get('difficulty', 'Medium')
    count = payload.get('count', 5)
    question_items = generate_company_questions(company, domain, difficulty, count=count)
    saved = []
    for item in question_items:
        question_record = {
            'company': company,
            'domain': domain,
            'difficulty': difficulty,
            'question': item['question'],
            'answer': item['answer'],
            'user_id': current_user['id'],
            'source': 'company',
            'created_at': datetime.utcnow(),
        }
        result = await questions_collection.insert_one(question_record)
        question_record['_id'] = result.inserted_id
        saved.append(serialize_doc(question_record))
    return {'questions': saved}
