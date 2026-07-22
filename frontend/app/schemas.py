from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: Optional[str]
    name: str
    email: EmailStr
    created_at: Optional[datetime]

    class Config:
        orm_mode = True


class QuestionCreate(BaseModel):
    domain: str
    difficulty: str
    question: str
    answer: Optional[str]
    user_id: str
    source: str = "generated"
    created_at: Optional[datetime]


class QuestionGenerateRequest(BaseModel):
    domain: str
    difficulty: str
    count: Optional[int] = 5


class QuestionResponse(QuestionCreate):
    id: str


class CompanyQuestionRequest(BaseModel):
    company: str
    domain: str
    difficulty: str
    count: Optional[int] = 5


class CompanyQuestionResponse(BaseModel):
    id: str
    domain: str
    difficulty: str
    question: str
    answer: Optional[str]
    company: str
    source: str
    created_at: Optional[datetime]


class InterviewAnswer(BaseModel):
    question_id: str
    answer: str


class InterviewCreate(BaseModel):
    user_id: str
    domain: str
    difficulty: str
    answers: List[InterviewAnswer]


class EvaluationResult(BaseModel):
    score: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    ideal_answer: str


class ResumeUploadResponse(BaseModel):
    skills: List[str]
    projects: List[str]
    education: List[str]
    certifications: List[str]
    recommended_questions: List[str]


class StudyPlanRequest(BaseModel):
    domain: str
    current_level: str
    target_role: Optional[str] = None
    weak_topics: Optional[List[str]] = []
    daily_study_hours: Optional[int] = 2
    target_company: Optional[str] = None
    plan_duration: Optional[str] = "8"  # "8", "12", or "24"


class StudyPlanResponse(BaseModel):
    headline: str
    weekly_plan: list
    learning_resources: dict


class CodingChallengeCreate(BaseModel):
    domain: str
    difficulty: str
    count: Optional[int] = 1


class CodingChallengeResponse(BaseModel):
    id: str
    domain: str
    difficulty: str
    prompt: str
    sample_input: str
    sample_output: str
    user_id: str
    created_at: Optional[datetime]


class CodingEvaluationRequest(BaseModel):
    challenge_id: str
    solution: str
    language: str


class DashboardStats(BaseModel):
    total_interviews: int
    average_score: float
    best_domain: Optional[str]
    weak_topics: List[str]
    interview_history: List[dict]


class VoiceInterviewRequest(BaseModel):
    domain: str
    difficulty: str
    question_count: int = 3
    duration_minutes: int = 30


class VoiceInterviewResponse(BaseModel):
    interview_id: str
    domain: str
    difficulty: str
    questions: List[dict]
    session_token: str


class VoiceAnswerSubmit(BaseModel):
    interview_id: str
    question_index: int
    answer_text: str
    duration_seconds: int


class CompanyPerformanceData(BaseModel):
    company: str
    average_score: float
    question_attempts: int


class QuestionHistoryResponse(BaseModel):
    id: str
    domain: str
    difficulty: str
    question: str
    answer: Optional[str]
    source: str
    created_at: datetime
