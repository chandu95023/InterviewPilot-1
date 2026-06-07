from bson import ObjectId
from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..database import interviews_collection, questions_collection, resume_collection
from ..utils import serialize_doc

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
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
    async for doc in history_cursor:
        interview_history.append(serialize_doc(doc))
        weak_topics.extend(doc.get("evaluation", {}).get("weak_topics", []))
    domain_counts = await questions_collection.distinct("domain", {"user_id": user_id})
    return {
        "total_interviews": total_interviews,
        "average_score": average_score,
        "best_domain": domain_counts[0] if domain_counts else None,
        "weak_topics": weak_topics,
        "interview_history": interview_history,
    }


@router.get("/company-performance")
async def get_company_performance(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    company_stats = {}
    history_cursor = interviews_collection.find({"user_id": user_id})
    async for interview in history_cursor:
        for item in interview.get("evaluation", {}).get("summary", []):
            question_id = item.get("question_id")
            if not question_id:
                continue
            try:
                q_obj = ObjectId(question_id)
            except Exception:
                continue
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
async def get_progress(current_user: dict = Depends(get_current_user)):
    stats = await get_dashboard_stats(current_user)
    return {"progress": stats}
