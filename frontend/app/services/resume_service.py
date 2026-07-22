from typing import List
from PyPDF2 import PdfReader
from .ai_service import generate_questions


def extract_resume_text(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text.append(page_text)
    return "\n\n".join(text)


def parse_resume_text(raw_text: str) -> dict:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    skills = []
    projects = []
    education = []
    certifications = []
    for line in lines:
        lower = line.lower()
        if any(term in lower for term in ["python", "java", "react", "machine learning", "data science", "mongodb", "fastapi"]):
            if line not in skills and len(skills) < 12:
                skills.append(line)
        if any(term in lower for term in ["project", "developed", "designed", "built"]):
            if line not in projects and len(projects) < 8:
                projects.append(line)
        if any(term in lower for term in ["bachelor", "msc", "master", "degree", "university", "college"]):
            if line not in education and len(education) < 5:
                education.append(line)
        if any(term in lower for term in ["certificate", "certified", "certification", "completed"]):
            if line not in certifications and len(certifications) < 5:
                certifications.append(line)
    return {
        "skills": skills,
        "projects": projects,
        "education": education,
        "certifications": certifications,
    }


def build_resume_insights(raw_text: str, domain: str):
    parsed = parse_resume_text(raw_text)
    q_prompt = (
        f"Based on this resume, suggest 5 interview questions for {domain}. "
        "Return only a JSON array of questions."
    )
    questions = generate_questions(domain, "Medium", count=5)
    recommended = [item["question"] for item in questions]
    parsed["recommended_questions"] = recommended
    return parsed
