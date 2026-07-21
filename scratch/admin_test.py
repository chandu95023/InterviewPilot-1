import json
import requests
import sys

base = 'http://127.0.0.1:8000'
results = []

# 1. Login to get token
login = {'username': 'demo@interviewpilot.ai', 'password': 'demo1234'}
resp = requests.post(f'{base}/api/auth/login', data=login)
if resp.status_code != 200:
    print(f"Error logging in: {resp.text}")
    sys.exit(1)

token = resp.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}
print(f"Logged in successfully. Token: {token[:20]}...")

# 2. Get stats
resp = requests.get(f'{base}/api/admin/stats', headers=headers)
results.append({'module':'AdminStats','endpoint':'GET /api/admin/stats','status':resp.status_code,'response':resp.json()})

# 3. Get users
resp = requests.get(f'{base}/api/admin/users', headers=headers)
results.append({'module':'AdminUsers','endpoint':'GET /api/admin/users','status':resp.status_code,'response':resp.json()[:3] if resp.status_code == 200 else resp.text})

# 4. Get questions
resp = requests.get(f'{base}/api/admin/questions', headers=headers)
results.append({'module':'AdminQuestionsList','endpoint':'GET /api/admin/questions','status':resp.status_code,'response':resp.json().get('total', 0) if resp.status_code == 200 else resp.text})

# 5. Create a new question
new_q = {
    "domain": "Python",
    "subtopic": "OOPs",
    "difficulty": "Easy",
    "question": "What is polymorphism?",
    "expected_answer": "Polymorphism means many forms. It allows entities to execute different behavior based on context.",
    "keywords": ["oop", "polymorphism"],
    "score_weight": 1.0
}
resp = requests.post(f'{base}/api/admin/questions', json=new_q, headers=headers)
q_id = resp.json().get('id') if resp.status_code == 200 else None
results.append({'module':'AdminQuestionCreate','endpoint':'POST /api/admin/questions','status':resp.status_code,'response':resp.json()})

# 6. Update the question
if q_id:
    up_q = {
        "domain": "Python",
        "subtopic": "OOPs",
        "difficulty": "Easy",
        "question": "What is polymorphism in Python?",
        "expected_answer": "Polymorphism allows different classes to have methods with the same name.",
        "keywords": ["oop", "polymorphism", "python"],
        "score_weight": 1.2
    }
    resp = requests.put(f'{base}/api/admin/questions/{q_id}', json=up_q, headers=headers)
    results.append({'module':'AdminQuestionUpdate','endpoint':'PUT /api/admin/questions/{id}','status':resp.status_code,'response':resp.json()})

# 7. Delete the question
if q_id:
    resp = requests.delete(f'{base}/api/admin/questions/{q_id}', headers=headers)
    results.append({'module':'AdminQuestionDelete','endpoint':'DELETE /api/admin/questions/{id}','status':resp.status_code,'response':resp.json()})

# 8. Get challenges
resp = requests.get(f'{base}/api/admin/challenges', headers=headers)
results.append({'module':'AdminChallengesList','endpoint':'GET /api/admin/challenges','status':resp.status_code,'response':len(resp.json()) if resp.status_code == 200 else resp.text})

# 9. Create challenge
new_c = {
    "domain": "Python",
    "difficulty": "Easy",
    "prompt": "Write a function that returns the length of a string.",
    "sample_input": "'hello'",
    "sample_output": "5"
}
resp = requests.post(f'{base}/api/admin/challenges', json=new_c, headers=headers)
c_id = resp.json().get('id') if resp.status_code == 200 else None
results.append({'module':'AdminChallengeCreate','endpoint':'POST /api/admin/challenges','status':resp.status_code,'response':resp.json()})

# 10. Delete challenge
if c_id:
    resp = requests.delete(f'{base}/api/admin/challenges/{c_id}', headers=headers)
    results.append({'module':'AdminChallengeDelete','endpoint':'DELETE /api/admin/challenges/{id}','status':resp.status_code,'response':resp.json()})

print(json.dumps(results, indent=2))
