from typing import List
import json
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

try:
    import openai
    openai.api_key = settings.openai_api_key
    OPENAI_AVAILABLE = bool(settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {str(e)}")
    OPENAI_AVAILABLE = False

# Mock data for fallback when OpenAI is not available
MOCK_QUESTIONS = {
    "easy": [
        {"question": "What is a variable in programming?", "ideal_answer": "A variable is a named storage location that holds a value which can change during program execution. It has a name, type, and value."},
        {"question": "Explain the difference between == and is in Python", "ideal_answer": "== checks for value equality, while 'is' checks if two references point to the same object in memory."},
        {"question": "What is an array?", "ideal_answer": "An array is a collection of elements of the same type stored in contiguous memory locations, accessed by index."},
    ],
    "medium": [
        {"question": "Explain the concept of inheritance in OOP", "ideal_answer": "Inheritance allows a class to inherit properties and methods from another class, promoting code reuse and establishing a hierarchy."},
        {"question": "What is the difference between interface and abstract class?", "ideal_answer": "An interface defines a contract with only abstract methods, while an abstract class can have both abstract and concrete methods."},
        {"question": "Explain database normalization", "ideal_answer": "Database normalization is the process of organizing data to eliminate redundancy and improve data integrity by structuring data into related tables."},
    ],
    "hard": [
        {"question": "Explain the CAP theorem", "ideal_answer": "CAP theorem states that a distributed system can achieve at most two of three properties: Consistency, Availability, and Partition tolerance."},
        {"question": "What is eventual consistency?", "ideal_answer": "Eventual consistency is a model where a distributed system guarantees that all updates will eventually reach a consistent state, but not immediately."},
        {"question": "Explain microservices architecture challenges", "ideal_answer": "Challenges include distributed tracing, service discovery, eventual consistency, increased complexity, and the need for sophisticated monitoring and deployment strategies."},
    ]
}

MOCK_EVALUATIONS = {
    "good": {"score": 8.5, "strengths": ["Clear explanation", "Good examples provided"], "weaknesses": ["Could add more depth"], "suggestions": ["Consider edge cases"], "ideal_answer": "Your answer was quite comprehensive. Consider adding more specific examples."},
    "average": {"score": 6.5, "strengths": ["Basic understanding shown"], "weaknesses": ["Missing important details", "Lacks depth"], "suggestions": ["Study more on this topic"], "ideal_answer": "A better answer would include more technical details and real-world examples."},
    "poor": {"score": 4.0, "strengths": ["Attempted to answer"], "weaknesses": ["Incorrect information", "Incomplete explanation"], "suggestions": ["Review fundamental concepts"], "ideal_answer": "Please review the basics of this concept and try again."}
}


def generate_questions(domain: str, difficulty: str, count: int = 5) -> List[dict]:
    """Generate interview questions for a given domain and difficulty level."""
    if not OPENAI_AVAILABLE:
        logger.warning(f"OpenAI not available, using mock data for {domain} {difficulty}")
        difficulty_key = difficulty.lower() if difficulty.lower() in MOCK_QUESTIONS else "medium"
        available_questions = MOCK_QUESTIONS.get(difficulty_key, MOCK_QUESTIONS["medium"])
        return available_questions[:count] if count <= len(available_questions) else available_questions + available_questions[:count-len(available_questions)]
    
    try:
        prompt = (
            f"Generate {count} {difficulty} level technical interview questions for {domain}. "
            "Return each question with a short ideal answer in JSON format with keys question and ideal_answer."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a helpful interview question generator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.85,
        )
        content = response.choices[0].message.content
        try:
            items = json.loads(content)
            if isinstance(items, dict):
                items = [items]
        except Exception:
            try:
                items = eval(content)
                if isinstance(items, dict):
                    items = [items]
            except Exception:
                items = []
        
        results = []
        for item in items:
            if "question" in item and "ideal_answer" in item:
                results.append({
                    "question": item["question"],
                    "answer": item["ideal_answer"],
                })
        return results or MOCK_QUESTIONS.get(difficulty.lower(), MOCK_QUESTIONS["medium"])[:count]
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return MOCK_QUESTIONS.get(difficulty.lower(), MOCK_QUESTIONS["medium"])[:count]


def evaluate_answer(question: str, answer: str, domain: str) -> dict:
    """Evaluate a user's answer to an interview question."""
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI not available, using mock evaluation")
        # Simple heuristic for mock evaluation
        answer_length = len(answer.split())
        if answer_length > 50:
            return MOCK_EVALUATIONS["good"]
        elif answer_length > 20:
            return MOCK_EVALUATIONS["average"]
        else:
            return MOCK_EVALUATIONS["poor"]
    
    try:
        prompt = (
            f"Evaluate the user's answer for the interview question in {domain}.\n"
            f"Question: {question}\n"
            f"Answer: {answer}\n"
            "Rate the answer out of 10 and provide strengths, weaknesses, suggestions, and an ideal answer. "
            "Return valid JSON with keys score, strengths, weaknesses, suggestions, ideal_answer."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are an objective interview evaluator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = eval(content)
            except Exception:
                parsed = {"score": 6, "strengths": ["Clear structure"], "weaknesses": ["Missing depth"], "suggestions": ["Add more details"], "ideal_answer": "A strong response should cover..."}
        return parsed
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        return {"score": 5, "strengths": ["Attempted answer"], "weaknesses": ["Could not evaluate properly"], "suggestions": ["Try again"], "ideal_answer": "Please provide more details"}


def generate_company_questions(company: str, domain: str, difficulty: str, count: int = 5) -> List[dict]:
    """Generate company-specific interview questions."""
    if not OPENAI_AVAILABLE:
        logger.warning(f"OpenAI not available, using mock data for {company}")
        return generate_questions(domain, difficulty, count)
    
    try:
        prompt = (
            f"Generate {count} {difficulty} interview questions for {company} in the domain of {domain}. "
            "Include the question and a concise ideal answer in JSON format with fields question and ideal_answer."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a company-specific interview question generator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=900,
            temperature=0.85,
        )
        content = response.choices[0].message.content
        try:
            items = json.loads(content)
            if isinstance(items, dict):
                items = [items]
        except Exception:
            try:
                items = eval(content)
                if isinstance(items, dict):
                    items = [items]
            except Exception:
                items = []
        
        results = []
        for item in items:
            if "question" in item and "ideal_answer" in item:
                results.append({"question": item["question"], "answer": item["ideal_answer"]})
        return results or generate_questions(domain, difficulty, count)
    except Exception as e:
        logger.error(f"Error generating company questions: {str(e)}")
        return generate_questions(domain, difficulty, count)


def generate_study_plan(domain: str, current_level: str, target_role: str = "Interview readiness", weak_topics: List[str] = None) -> dict:
    """Generate a personalized study plan."""
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI not available, using mock study plan")
        return {
            "headline": f"4-Week {domain} Interview Preparation Plan",
            "weekly_plan": [
                f"Week 1: Master {domain} fundamentals and core concepts",
                f"Week 2: Deep dive into {domain} design patterns and best practices",
                f"Week 3: Practice {domain} coding problems and algorithms",
                f"Week 4: Mock interviews and final review"
            ],
            "learning_resources": [
                "Official documentation and tutorials",
                "LeetCode and HackerRank problems",
                "YouTube technical channels",
                "GitHub repositories with examples"
            ]
        }
    
    try:
        weaknesses = ", ".join(weak_topics or [])
        prompt = (
            f"Create a 4-week study plan for a {current_level} candidate preparing for {target_role} in {domain}. "
            f"Include weekly goals, key topics, and learning resources. Weak topics: {weaknesses}. "
            "Return valid JSON with headline, weekly_plan, and learning_resources."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a structured study planner."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=750,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = eval(content)
            except Exception:
                parsed = {"headline": "Interview Study Plan", "weekly_plan": ["Focus on fundamentals", "Practice with questions"], "learning_resources": ["Official docs", "Practice projects"]}
        return parsed
    except Exception as e:
        logger.error(f"Error generating study plan: {str(e)}")
        return {"headline": "Interview Study Plan", "weekly_plan": ["Focus on fundamentals"], "learning_resources": ["Documentation"]}


def generate_coding_challenge(domain: str, difficulty: str) -> dict:
    """Generate a coding challenge."""
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI not available, using mock coding challenge")
        return {
            "prompt": f"Implement a solution for a {difficulty} level {domain} problem.",
            "sample_input": "[1, 2, 3, 4, 5]",
            "sample_output": "15"
        }
    
    try:
        prompt = (
            f"Create a coding challenge suitable for a {difficulty} candidate preparing for a {domain} technical interview. "
            "Include a problem statement, sample input, and sample output in JSON format with keys prompt, sample_input, sample_output."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a coding challenge generator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=700,
            temperature=0.8,
        )
        content = response.choices[0].message.content
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = eval(content)
            except Exception:
                parsed = {"prompt": "Implement a direct algorithm.", "sample_input": "[]", "sample_output": ""}
        return parsed
    except Exception as e:
        logger.error(f"Error generating coding challenge: {str(e)}")
        return {"prompt": f"Solve a {difficulty} {domain} problem", "sample_input": "input", "sample_output": "output"}


def evaluate_coding_solution(challenge_text: str, solution: str, language: str) -> dict:
    """Evaluate a coding solution."""
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI not available, using mock evaluation")
        solution_length = len(solution.split())
        if solution_length > 100:
            return {"score": 8, "feedback": ["Good implementation"], "improvements": ["Consider edge cases"]}
        elif solution_length > 30:
            return {"score": 6, "feedback": ["Basic solution"], "improvements": ["Optimize for performance"]}
        else:
            return {"score": 4, "feedback": ["Incomplete solution"], "improvements": ["Add more logic"]}
    
    try:
        prompt = (
            f"Evaluate the following {language} solution for this coding challenge:\n{challenge_text}\n"
            f"Solution:\n{solution}\n"
            "Return a JSON with keys score, feedback, improvements."
        )
        response = openai.ChatCompletion.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a coding solution evaluator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = eval(content)
            except Exception:
                parsed = {"score": 7, "feedback": ["The logic is sound."], "improvements": ["Add edge-case checks."]}
        return parsed
    except Exception as e:
        logger.error(f"Error evaluating coding solution: {str(e)}")
        return {"score": 5, "feedback": ["Could not evaluate"], "improvements": ["Review your logic"]}
