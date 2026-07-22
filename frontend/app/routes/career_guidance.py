from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..services.ai_service import generate_career_roadmap
from ..postgres_db import get_db, CareerRoadmap
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class CareerRoadmapRequest(BaseModel):
    domain: str
    current_level: str
    target_role: str
    years_experience: Optional[str] = "1-2"
    target_company: Optional[str] = None

@router.post("/generate")
async def generate_career_guidance_endpoint(
    payload: CareerRoadmapRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = generate_career_roadmap(
        domain=payload.domain,
        current_level=payload.current_level,
        target_role=payload.target_role,
        years_experience=payload.years_experience,
        target_company=payload.target_company
    )
    
    if db:
        try:
            db_roadmap = CareerRoadmap(
                user_id=current_user["id"],
                domain=payload.domain,
                current_level=payload.current_level,
                target_role=payload.target_role,
                roadmap_data=roadmap,
                created_at=datetime.utcnow()
            )
            db.add(db_roadmap)
            db.commit()
        except Exception as e:
            pass  # Don't fail the request if DB save fails
            
    return {"career_roadmap": roadmap}

@router.get("/latest")
async def get_latest_career_guidance(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not db:
        return {"career_roadmap": None}
        
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.user_id == current_user["id"]
    ).order_by(CareerRoadmap.created_at.desc()).first()
    
    if not roadmap:
        return {"career_roadmap": None}
        
    return {
        "career_roadmap": roadmap.roadmap_data,
        "domain": roadmap.domain,
        "current_level": roadmap.current_level,
        "target_role": roadmap.target_role,
        "created_at": roadmap.created_at.isoformat() if roadmap.created_at else None
    }
