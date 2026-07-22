from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..database import interviews_collection, questions_collection
from ..utils import serialize_doc
from ..postgres_db import get_db, InterviewSession, GeneratedQuestion
from sqlalchemy.orm import Session

router = APIRouter()

@router.get('/performance')
async def get_performance_metrics(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user['id']

    if db:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).order_by(InterviewSession.created_at.desc()).all()
        total_interviews = len(sessions)
        total_questions = db.query(GeneratedQuestion).filter(GeneratedQuestion.user_id == user_id).count()

        scores = [s.score for s in sessions if s.score is not None]
        average_score = round(sum(scores) / len(scores), 2) if scores else 0.0

        domain_map: dict = {}
        for s in sessions:
            if s.domain:
                domain_map.setdefault(s.domain, []).append(s.score or 0)

        domain_breakdown = [
            {"name": d, "avg_score": round(sum(vals) / len(vals), 2), "count": len(vals)}
            for d, vals in domain_map.items()
        ]

        # Recent 6-session trend
        recent_trend = [
            {"session": i + 1, "score": round(s.score, 2) if s.score else 0}
            for i, s in enumerate(reversed(sessions[:6]))
        ]

        return {
            'total_questions': total_questions,
            'total_interviews': total_interviews,
            'average_score': average_score,
            'domain_breakdown': domain_breakdown,
            'recent_trend': recent_trend,
            'coverage': 'Full analytics from database',
        }
    else:
        total_questions = await questions_collection.count_documents({'user_id': user_id})
        total_interviews = await interviews_collection.count_documents({'user_id': user_id})
        return {
            'total_questions': total_questions,
            'total_interviews': total_interviews,
            'average_score': 0.0,
            'domain_breakdown': [],
            'recent_trend': [],
            'coverage': 'Basic analytics available',
        }

@router.get('/skill-progress')
async def get_skill_progress(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user['id']

    if db:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()
        domain_map: dict = {}
        for s in sessions:
            if s.domain:
                domain_map.setdefault(s.domain, []).append(s.score or 0)

        skill_progress = [
            {
                "domain": domain,
                "sessions": len(scores),
                "avg_score": round(sum(scores) / len(scores), 2) if scores else 0,
                "trend": "improving" if len(scores) > 1 and scores[-1] >= scores[0] else "needs_work"
            }
            for domain, scores in domain_map.items()
        ]
        return {'skill_progress': skill_progress}

    return {'skill_progress': []}
