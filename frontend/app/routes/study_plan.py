from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..schemas import StudyPlanRequest
from ..services.ai_service import generate_study_plan
from ..postgres_db import get_db, StudyPlan
from sqlalchemy.orm import Session
from datetime import datetime

router = APIRouter()


@router.post("/generate")
async def generate_study_plan_endpoint(
    payload: StudyPlanRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = generate_study_plan(
        domain=payload.domain,
        current_level=payload.current_level,
        target_role=payload.target_role or "Interview readiness",
        weak_topics=payload.weak_topics,
        daily_study_hours=payload.daily_study_hours or 2,
        target_company=payload.target_company,
        plan_duration=payload.plan_duration or "8"
    )

    if db:
        try:
            db_plan = StudyPlan(
                user_id=current_user["id"],
                domain=payload.domain,
                current_level=payload.current_level,
                target_role=payload.target_role or "Interview readiness",
                weak_topics=payload.weak_topics,
                daily_study_hours=payload.daily_study_hours or 2,
                target_company=payload.target_company,
                plan_data=plan,
                created_at=datetime.utcnow()
            )
            db.add(db_plan)
            db.commit()
        except Exception as e:
            pass  # Don't fail the request if DB save fails

    return {"study_plan": plan}


@router.get("/latest")
async def get_latest_study_plan(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not db:
        return {"study_plan": None}

    plan = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user["id"]
    ).order_by(StudyPlan.created_at.desc()).first()

    if not plan:
        return {"study_plan": None}

    return {
        "study_plan": plan.plan_data,
        "domain": plan.domain,
        "current_level": plan.current_level,
        "target_role": plan.target_role,
        "created_at": plan.created_at.isoformat() if plan.created_at else None
    }


@router.get("/history")
async def get_study_plan_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not db:
        return {"plans": []}

    plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user["id"]
    ).order_by(StudyPlan.created_at.desc()).limit(10).all()

    return {
        "plans": [
            {
                "id": p.id,
                "domain": p.domain,
                "current_level": p.current_level,
                "target_role": p.target_role,
                "target_company": p.target_company,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in plans
        ]
    }
