from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, questions, interviews, resume, dashboard, study_plan, challenges, voice_interview, company, coding, aptitude, analytics
from .exceptions import api_exception_handler, validation_exception_handler, generic_exception_handler, APIException
from .logging_config import get_logger
from fastapi.exceptions import RequestValidationError

app = FastAPI(
    title="AI Interview Preparation Platform API",
    description="API for user authentication, AI question generation, mock interview evaluation, and dashboard analytics.",
    version="1.0.0",
)

logger = get_logger(__name__)

origins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:3000"]

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
app.include_router(coding.router, prefix="/api/coding", tags=["Coding"])
app.include_router(aptitude.router, prefix="/api/aptitude", tags=["Aptitude"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "AI Interview Preparation Platform API is running"}
