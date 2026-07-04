from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..database import interviews_collection, resume_collection, questions_collection
from ..utils import serialize_doc, get_db_id
from ..postgres_db import get_db, InterviewSession, GeneratedQuestion
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]

    if db:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).order_by(InterviewSession.created_at.desc()).all()
        total_interviews = len(sessions)
        total_score = sum(s.score for s in sessions if s.score is not None)
        average_score = round(total_score / total_interviews, 2) if total_interviews > 0 else 0.0

        # Compute best domain from session history
        domain_scores: dict = {}
        weak_topics = []
        interview_history = []
        for s in sessions:
            if s.domain:
                domain_scores.setdefault(s.domain, []).append(s.score or 0)
            interview_history.append({
                "id": str(s.id),
                "user_id": s.user_id,
                "domain": s.domain,
                "difficulty": s.difficulty,
                "score": s.score,
                "created_at": str(s.created_at),
            })
            if s.evaluation and "weak_topics" in s.evaluation:
                weak_topics.extend(s.evaluation["weak_topics"])

        best_domain = None
        if domain_scores:
            best_domain = max(domain_scores, key=lambda d: sum(domain_scores[d]) / len(domain_scores[d]))

        # Build simple progress data for charts
        domain_breakdown = [
            {"name": d, "value": len(scores)} for d, scores in domain_scores.items()
        ]

        return {
            "total_interviews": total_interviews,
            "average_score": average_score,
            "best_domain": best_domain,
            "weak_topics": list(set(weak_topics))[:5],
            "interview_history": interview_history,
            "domain_breakdown": domain_breakdown,
        }
    else:
        total_interviews = await interviews_collection.count_documents({"user_id": user_id})
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "average": {"$avg": "$score"}}},
        ]
        aggregation = await interviews_collection.aggregate(pipeline).to_list(length=1)
        average_score = round(aggregation[0]["average"], 2) if aggregation else 0.0
        history_cursor = interviews_collection.find({"user_id": user_id}).sort("created_at", -1)
        interview_history = []
        weak_topics = []
        domain_counts: dict = {}
        async for doc in history_cursor:
            interview_history.append(serialize_doc(doc))
            weak_topics.extend(doc.get("evaluation", {}).get("weak_topics", []))
            if doc.get("domain"):
                domain_counts[doc["domain"]] = domain_counts.get(doc["domain"], 0) + 1

        best_domain = max(domain_counts, key=domain_counts.get) if domain_counts else None
        domain_breakdown = [{"name": d, "value": c} for d, c in domain_counts.items()]

        return {
            "total_interviews": total_interviews,
            "average_score": average_score,
            "best_domain": best_domain,
            "weak_topics": list(set(weak_topics))[:5],
            "interview_history": interview_history,
            "domain_breakdown": domain_breakdown,
        }


@router.get("/company-performance")
async def get_company_performance(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    company_stats = {}
    
    if db:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()
        for s in sessions:
            if s.evaluation and "summary" in s.evaluation:
                for item in s.evaluation["summary"]:
                    question_id = item.get("question_id")
                    if not question_id:
                        continue
                    q_obj = get_db_id(question_id)
                    question_doc = db.query(GeneratedQuestion).filter(GeneratedQuestion.id == str(q_obj)).first()
                    if not question_doc or not question_doc.company:
                        continue
                    company = question_doc.company
                    stats = company_stats.setdefault(company, {"score_total": 0.0, "count": 0})
                    stats["score_total"] += item.get("score", 0)
                    stats["count"] += 1
    else:
        history_cursor = interviews_collection.find({"user_id": user_id})
        async for interview in history_cursor:
            for item in interview.get("evaluation", {}).get("summary", []):
                question_id = item.get("question_id")
                if not question_id:
                    continue
                q_obj = get_db_id(question_id)
                question_doc = await questions_collection.find_one({"_id": q_obj, "user_id": user_id})
                if not question_doc or not question_doc.get("company"):
                    continue
                company = question_doc["company"]
                stats = company_stats.setdefault(company, {"score_total": 0.0, "count": 0})
                stats["score_total"] += item.get("score", 0)
                stats["count"] += 1
                
    performance = [
        {
            "company": company,
            "average_score": round(data["score_total"] / data["count"], 2) if data["count"] else 0,
            "question_attempts": data["count"],
        }
        for company, data in company_stats.items()
    ]
    return {"company_performance": performance}


@router.get("/progress")
async def get_progress(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = await get_dashboard_stats(current_user, db)
    return {"progress": stats}

