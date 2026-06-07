from datetime import datetime
from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..services.ai_service import generate_questions
from ..database import questions_collection
from ..utils import serialize_doc

router = APIRouter()

@router.post('/start')
async def start_aptitude_test(payload: dict, current_user: dict = Depends(get_current_user)):
    category = payload.get('category', 'Quantitative Aptitude')
    difficulty = payload.get('difficulty', 'Easy')
    questions = generate_questions(category, difficulty, count=5)
    quiz = []
    for item in questions:
        quiz_item = {
            'category': category,
            'difficulty': difficulty,
            'question': item['question'],
            'answer': item.get('answer', ''),
            'user_id': current_user['id'],
            'created_at': datetime.utcnow(),
        }
        result = await questions_collection.insert_one(quiz_item)
        quiz_item['_id'] = result.inserted_id
        quiz.append(serialize_doc(quiz_item))
    return {'quiz': quiz}

@router.post('/submit')
async def submit_aptitude_answers(payload: dict, current_user: dict = Depends(get_current_user)):
    answers = payload.get('answers', [])
    score = sum(1 for answer in answers if answer.get('is_correct'))
    return {
        'score': score,
        'total': len(answers),
        'message': 'Aptitude results calculated in demo mode',
    }
