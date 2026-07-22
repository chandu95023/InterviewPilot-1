from datetime import datetime
from typing import List, Optional


class UserModel:
    def __init__(self, name: str, email: str, hashed_password: str):
        self.name = name
        self.email = email
        self.hashed_password = hashed_password
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


class QuestionModel:
    def __init__(self, domain: str, difficulty: str, question: str, answer: str, user_id: str):
        self.domain = domain
        self.difficulty = difficulty
        self.question = question
        self.answer = answer
        self.user_id = user_id
        self.source = "generated"
        self.created_at = datetime.utcnow()


class InterviewModel:
    def __init__(self, user_id: str, domain: str, difficulty: str, answers: List[dict], score: float, evaluation: dict):
        self.user_id = user_id
        self.domain = domain
        self.difficulty = difficulty
        self.answers = answers
        self.score = score
        self.evaluation = evaluation
        self.created_at = datetime.utcnow()


class ResumeModel:
    def __init__(self, user_id: str, raw_text: str, skills: List[str], projects: List[str], education: List[str], certifications: List[str]):
        self.user_id = user_id
        self.raw_text = raw_text
        self.skills = skills
        self.projects = projects
        self.education = education
        self.certifications = certifications
        self.created_at = datetime.utcnow()


class FeedbackModel:
    def __init__(self, interview_id: str, feedback: dict):
        self.interview_id = interview_id
        self.feedback = feedback
        self.created_at = datetime.utcnow()
