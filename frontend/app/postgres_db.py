import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Support both POSTGRESQL_URI and DATABASE_URL env vars, with sqlite fallback
sqlite_path = "/tmp/interview_prep.db" if os.getenv("VERCEL") else "./interview_prep.db"
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRESQL_URI", f"sqlite:///{sqlite_path}")

try:
    connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"Error connecting to relational database: {e}")
    engine = None
    SessionLocal = None
    Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    difficulty = Column(String)
    score = Column(Float, nullable=True)
    evaluation = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewQuestion(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    question = Column(Text)
    answer = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)

class QuestionBank(Base):
    __tablename__ = "question_bank"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True)
    subtopic = Column(String)
    difficulty = Column(String, index=True)
    question = Column(Text)
    expected_answer = Column(Text)
    keywords = Column(JSON, nullable=True)
    score_weight = Column(Float, default=1.0)

class GeneratedQuestion(Base):
    __tablename__ = "question_history"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    difficulty = Column(String)
    question = Column(Text)
    answer = Column(Text, nullable=True)
    source = Column(String) # "generated", "company", "voice"
    company = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VoiceSession(Base):
    __tablename__ = "voice_transcripts"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    difficulty = Column(String)
    score = Column(Float, nullable=True)
    transcript = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeReport(Base):
    __tablename__ = "resume_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    ats_score = Column(Float)
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON)
    projects = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    recommended_questions = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True) # missing keywords etc.
    created_at = Column(DateTime, default=datetime.utcnow)

class StudyPlan(Base):
    __tablename__ = "study_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    current_level = Column(String)
    target_role = Column(String)
    weak_topics = Column(JSON, nullable=True)
    daily_study_hours = Column(Integer, default=2)
    target_company = Column(String, nullable=True)
    plan_data = Column(JSON) # headline, weekly_plan, learning_resources
    created_at = Column(DateTime, default=datetime.utcnow)

class CareerRoadmap(Base):
    __tablename__ = "career_guidance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    current_level = Column(String)
    target_role = Column(String)
    roadmap_data = Column(JSON) # headline, weekly_plan, learning_resources
    created_at = Column(DateTime, default=datetime.utcnow)

class CodingChallenge(Base):
    __tablename__ = "coding_challenges"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    domain = Column(String)
    difficulty = Column(String)
    prompt = Column(Text)
    sample_input = Column(Text)
    sample_output = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    challenge_id = Column(String)
    code = Column(Text)
    language = Column(String)
    score = Column(Float)
    status = Column(String)
    evaluation = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CompanyPrep(Base):
    __tablename__ = "company_prep"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    company = Column(String)
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    total_interviews = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    weak_areas = Column(JSON)
    best_domain = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class AptitudeResult(Base):
    __tablename__ = "aptitude_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    score = Column(Float)
    total_questions = Column(Integer)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    question_id = Column(String, index=True)
    answer_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    category = Column(String)  # "interview", "aptitude", "coding"
    score_value = Column(Float)
    total_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class AssistantChat(Base):
    __tablename__ = "assistant_chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    global engine, SessionLocal
    from sqlalchemy import text
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            logger.info("Successfully connected to primary relational database.")
        except Exception as e:
            logger.warning(f"Primary database connection failed: {e}. Falling back to local SQLite database...")
            try:
                sqlite_path = "/tmp/interview_prep.db" if os.getenv("VERCEL") else "./interview_prep.db"
                engine = create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})
                SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                Base.metadata.create_all(bind=engine)
                logger.info("Successfully initialized SQLite fallback database.")
            except Exception as e2:
                logger.error(f"Failed to initialize SQLite fallback: {e2}")
                engine = None
                SessionLocal = None
                return
        
        if SessionLocal:
            from .seed import seed_database
            db = SessionLocal()
            try:
                seed_database(db)
            except Exception as seed_err:
                logger.error(f"Error seeding database: {seed_err}")
            finally:
                db.close()

def get_db():
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
