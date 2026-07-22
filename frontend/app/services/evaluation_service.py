from typing import List
from .ai_service import evaluate_answer


def evaluate_interview_flow(questions: List[dict], answers: List[dict], domain: str) -> dict:
    total_score = 0.0
    summary = []
    for question, answer in zip(questions, answers):
        result = evaluate_answer(question["question"], answer["answer"], domain)
        score = float(result.get("score", 0))
        total_score += score
        summary.append({
            "question_id": answer.get("question_id"),
            "question": question["question"],
            "given_answer": answer["answer"],
            "score": score,
            "evaluation": result,
        })
    average_score = round(total_score / max(len(answers), 1), 2)
    weak_topics = []
    strengths = set()
    weaknesses = set()
    suggestions = set()
    
    for item in summary:
        if item["score"] < 7:
            weak_topics.append(item["question"])
        eval_data = item["evaluation"]
        if "strengths" in eval_data:
            strengths.update(eval_data["strengths"])
        if "weaknesses" in eval_data:
            weaknesses.update(eval_data["weaknesses"])
        if "suggestions" in eval_data:
            suggestions.update(eval_data["suggestions"])

    return {
        "average_score": average_score,
        "score": average_score,
        "summary": summary,
        "weak_topics": weak_topics,
        "strengths": list(strengths)[:5],
        "weaknesses": list(weaknesses)[:5],
        "suggestions": list(suggestions)[:5],
    }
