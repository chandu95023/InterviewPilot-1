from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..schemas import StudyPlanRequest
from ..services.ai_service import generate_study_plan

router = APIRouter()


@router.post("/generate")
async def generate_study_plan_endpoint(payload: StudyPlanRequest, current_user: dict = Depends(get_current_user)):
    plan = generate_study_plan(payload.domain, payload.current_level, payload.target_role or "Interview readiness", payload.weak_topics)
    return {"study_plan": plan}
