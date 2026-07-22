from datetime import datetime
from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..postgres_db import get_db, QuestionBank, AptitudeResult
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

router = APIRouter()

APTITUDE_DOMAINS = {
    "Quantitative": "Aptitude",
    "Logical Reasoning": "Aptitude",
    "Verbal Ability": "Aptitude",
    "Quantitative Aptitude": "Aptitude",
}

@router.post('/start')
async def start_aptitude_test(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    category = payload.get('category', 'Quantitative')
    difficulty = payload.get('difficulty', 'Easy')
    count = payload.get('count', 10)
    
    if db:
        questions = db.query(QuestionBank).filter(
            QuestionBank.domain == "Aptitude",
            QuestionBank.subtopic.ilike(f"%{category}%"),
            func.lower(QuestionBank.difficulty) == difficulty.lower()
        ).order_by(func.random()).limit(count).all()
        
        # fallback: fetch any Aptitude questions if exact category not found
        if not questions:
            questions = db.query(QuestionBank).filter(
                QuestionBank.domain == "Aptitude"
            ).order_by(func.random()).limit(count).all()
        
        quiz = [
            {
                'id': q.id,
                'category': category,
                'difficulty': q.difficulty,
                'question': q.question,
                'expected_answer': q.expected_answer,
                'keywords': q.keywords or [],
            }
            for q in questions
        ]
        return {'quiz': quiz, 'total': len(quiz)}
    else:
        from ..services.ai_service import generate_questions
        questions = generate_questions(category, difficulty, count=count)
        quiz = [{'category': category, 'difficulty': difficulty, 'question': q['question'], 'expected_answer': q.get('answer', '')} for q in questions]
        return {'quiz': quiz, 'total': len(quiz)}


@router.post('/submit')
async def submit_aptitude_answers(payload: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    answers = payload.get('answers', [])
    score = sum(1 for answer in answers if answer.get('is_correct'))
    total = len(answers)
    percentage = round((score / total) * 100, 1) if total > 0 else 0.0
    
    # Save result to DB
    if db:
        result = AptitudeResult(
            user_id=current_user["id"],
            score=percentage,
            total_questions=total,
            details=answers,
        )
        db.add(result)
        db.commit()
    
    return {
        'score': score,
        'total': total,
        'percentage': percentage,
        'passed': percentage >= 60,
        'message': f'You scored {score}/{total} ({percentage}%)',
    }


@router.get('/history')
async def aptitude_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if db:
        results = db.query(AptitudeResult).filter(AptitudeResult.user_id == current_user["id"]).order_by(AptitudeResult.created_at.desc()).all()
        return {'results': [{'id': r.id, 'score': r.score, 'total_questions': r.total_questions, 'created_at': r.created_at} for r in results]}
    return {'results': []}

