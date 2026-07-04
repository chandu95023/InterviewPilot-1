import json
import os
import random
from sqlalchemy.orm import Session
from .postgres_db import QuestionBank

# The 20 Domains and their Subtopics
DOMAINS = {
    "Python": ["Basics", "OOP", "File Handling", "Exception Handling", "Modules", "Advanced Python", "Multithreading", "APIs"],
    "Java": ["Core Java", "Collections", "JDBC", "Exception Handling", "Multithreading", "Spring Boot", "Hibernate"],
    "C Programming": ["Basics", "Pointers", "Structures", "Memory Management"],
    "C++": ["OOP", "STL", "Templates", "Polymorphism"],
    "JavaScript": ["ES6", "DOM", "Async/Await", "Promises", "Closures"],
    "React": ["Components", "Hooks", "State Management", "Redux", "Routing"],
    "Node.js": ["Express", "Middleware", "Authentication", "REST APIs"],
    "Full Stack Development": ["MERN Stack", "Authentication", "Deployment", "Security"],
    "SQL": ["Joins", "Normalization", "Indexing", "Stored Procedures", "Transactions"],
    "MongoDB": ["CRUD", "Aggregation", "Indexing"],
    "Data Structures & Algorithms": ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
    "System Design": ["Scalability", "Load Balancing", "Microservices", "Caching"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions"],
    "Cloud Computing": ["AWS", "Azure", "GCP"],
    "Data Science": ["Statistics", "Pandas", "NumPy", "Visualization"],
    "Machine Learning": ["Regression", "Classification", "Clustering", "Neural Networks"],
    "Cyber Security": ["OWASP", "Authentication", "Network Security"],
    "HR Interview": ["Tell me about yourself", "Strengths", "Weaknesses", "Leadership", "Teamwork", "Conflict Resolution"],
    "Behavioral Interview": ["STAR Method", "Project Challenges", "Communication Skills"],
    "Aptitude": ["Quantitative", "Logical Reasoning", "Verbal Ability"]
}

DIFFICULTIES = ["Easy", "Medium", "Hard"]

def generate_question_templates(domain, subtopic, difficulty):
    """Generates synthetic but realistic-looking questions based on domain, subtopic and difficulty."""
    if domain in ["HR Interview", "Behavioral Interview"]:
        return [
            f"Can you give an example of {subtopic} from your past experience?",
            f"How do you approach {subtopic} in a professional setting?",
            f"Describe a situation where your skills in {subtopic} were put to the test.",
            f"What does {subtopic} mean to you in the context of our company?",
            f"Explain a time you failed at {subtopic} and what you learned."
        ]
    elif domain == "Aptitude":
        return [
            f"Solve a typical problem involving {subtopic}.",
            f"What is the foundational concept behind {subtopic}?",
            f"Walk me through your thought process when solving a {subtopic} scenario.",
            f"How do you optimize your time when facing a complex {subtopic} question?",
            f"Analyze the following {subtopic} pattern."
        ]
    else:
        if difficulty == "Easy":
            return [
                f"What is {subtopic} in {domain}?",
                f"Explain the basics of {subtopic}.",
                f"How do you define {subtopic} in the context of {domain}?",
                f"Can you give a simple example of {subtopic}?",
                f"What are the main characteristics of {subtopic}?"
            ]
        elif difficulty == "Medium":
            return [
                f"How do you implement {subtopic} in a real-world {domain} application?",
                f"What are the pros and cons of using {subtopic}?",
                f"Explain the difference between {subtopic} and other similar concepts in {domain}.",
                f"Describe a common pitfall when working with {subtopic}.",
                f"How does {subtopic} interact with other features of {domain}?"
            ]
        else:
            return [
                f"How would you optimize {subtopic} for high performance in {domain}?",
                f"Explain the internal workings of {subtopic} under the hood.",
                f"Describe a complex architecture relying heavily on {subtopic} in {domain}.",
                f"How do you debug an elusive issue related to {subtopic}?",
                f"What are the security implications of {subtopic}?"
            ]

def seed_database(db: Session):
    # Check if table already has data
    if db.query(QuestionBank).first() is not None:
        return

    print("Seeding database with 1000+ questions...")
    
    questions_to_insert = []
    
    for domain, subtopics in DOMAINS.items():
        for subtopic in subtopics:
            for difficulty in DIFFICULTIES:
                templates = generate_question_templates(domain, subtopic, difficulty)
                # Generate 5 questions per combination
                for i, q_text in enumerate(templates):
                    questions_to_insert.append(QuestionBank(
                        domain=domain,
                        subtopic=subtopic,
                        difficulty=difficulty,
                        question=q_text,
                        expected_answer=f"An ideal {difficulty} level answer for {subtopic} in {domain} discussing its definition, use-cases, and trade-offs.",
                        keywords=[domain.lower(), subtopic.lower().replace(" ", "_"), difficulty.lower()],
                        score_weight=1.0 if difficulty == "Easy" else (1.5 if difficulty == "Medium" else 2.0)
                    ))

    # Bulk insert
    db.bulk_save_objects(questions_to_insert)
    db.commit()
    print(f"Successfully seeded {len(questions_to_insert)} questions.")
