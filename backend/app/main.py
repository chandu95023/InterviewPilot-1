from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, questions, interviews, resume, dashboard, study_plan, challenges, voice_interview, company, company_prep, coding, aptitude, analytics, career_guidance, assistant
from .exceptions import api_exception_handler, validation_exception_handler, generic_exception_handler, APIException
from .logging_config import get_logger
from fastapi.exceptions import RequestValidationError
from .database import users_collection
from .auth import get_password_hash

app = FastAPI(
    title="AI Interview Preparation Platform API",
    description="API for user authentication, AI question generation, mock interview evaluation, and dashboard analytics.",
    version="1.0.0",
)

logger = get_logger(__name__)

origins = [
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
    "http://localhost:5176", "http://localhost:5177", "http://localhost:5178",
    "http://localhost:5179", "http://localhost:5180", 
    "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(voice_interview.router, prefix="/api/voice-interviews", tags=["Voice Interviews"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(study_plan.router, prefix="/api/study-plan", tags=["Study Plan"])
app.include_router(challenges.router, prefix="/api/coding-challenges", tags=["Coding Challenges"])
app.include_router(company.router, prefix="/api/company", tags=["Company"])
app.include_router(company_prep.router, prefix="/api/company-prep", tags=["Company Prep"])
app.include_router(coding.router, prefix="/api/coding", tags=["Coding"])
app.include_router(aptitude.router, prefix="/api/aptitude", tags=["Aptitude"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(career_guidance.router, prefix="/api/career-guidance", tags=["Career Guidance"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Assistant"])


from . import postgres_db
from .postgres_db import init_db

@app.on_event("startup")
async def startup_event():
    """Initialize DB and seed a demo user."""
    init_db()
    
    # Seed in PostgreSQL
    db = postgres_db.SessionLocal()
    try:
        pg_user = db.query(postgres_db.User).filter(postgres_db.User.email == "demo@interviewpilot.ai").first()
        if not pg_user:
            demo_user = postgres_db.User(
                id="demo-user-id",
                name="Demo User",
                email="demo@interviewpilot.ai",
                hashed_password=get_password_hash("demo1234"),
                created_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo user seeded in PostgreSQL/SQLite.")
    except Exception as e:
        logger.error(f"Error seeding demo user in relational DB: {e}")
    finally:
        db.close()

    existing = await users_collection.find_one({"email": "demo@interviewpilot.ai"})
    if not existing:
        await users_collection.insert_one({
            "name": "Demo User",
            "email": "demo@interviewpilot.ai",
            "hashed_password": get_password_hash("demo1234"),
            "_id": "demo-user-id"
        })
        logger.info("Demo user seeded in fallback users_collection: demo@interviewpilot.ai / demo1234")

from .services.ai_service import GEMINI_AVAILABLE, call_gemini
import sqlalchemy

@app.get("/health")
@app.get("/api/health")
async def health_check():
    db_status = "disconnected"
    try:
        db = postgres_db.SessionLocal()
        if db:
            db.execute(sqlalchemy.text("SELECT 1"))
            db_status = "connected"
            db.close()
    except Exception as e:
        logger.error(f"Health check database connection failed: {e}")
        db_status = "disconnected"
    
    gemini_status = "disconnected"
    try:
        if GEMINI_AVAILABLE:
            call_gemini("say OK")
            gemini_status = "connected"
    except Exception as e:
        logger.error(f"Health check Gemini connection failed: {e}")
        gemini_status = "disconnected"
        
    return {
        "status": "healthy",
        "database": db_status,
        "gemini": gemini_status
    }

@app.get("/")
async def root():
    return {"message": "AI Interview Preparation Platform API is running"}

