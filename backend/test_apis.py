import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def print_result(name, res):
    if res.status_code >= 400:
        print(f"[FAIL] {name} FAILED: {res.status_code} - {res.text}")
    else:
        print(f"[PASS] {name} PASSED: {res.status_code}")

def run_tests():
    print("Testing APIs...")
    # 1. Login
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "demo@interviewpilot.ai", "password": "demo1234"})
    print_result("Login", res)
    if res.status_code != 200:
        return
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Profile
    res = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    print_result("Profile", res)

    # 3. Dashboard
    res = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    print_result("Dashboard Stats", res)

    res = requests.get(f"{BASE_URL}/dashboard/company-performance", headers=headers)
    print_result("Dashboard Company Perf", res)

    res = requests.get(f"{BASE_URL}/dashboard/progress", headers=headers)
    print_result("Dashboard Progress", res)

    # 4. Mock Interview Generate
    # The endpoint might be /questions/generate or /interviews/evaluate
    res = requests.post(f"{BASE_URL}/questions/generate", json={"domain": "Python", "difficulty": "Medium"}, headers=headers)
    print_result("Mock Interview Questions", res)
    
    # 5. Study Plan
    res = requests.post(f"{BASE_URL}/study-plan/generate", json={"domain": "Python", "current_level": "Beginner"}, headers=headers)
    print_result("Study Plan Generate", res)

    res = requests.get(f"{BASE_URL}/study-plan/latest", headers=headers)
    print_result("Study Plan Latest", res)

    # 6. Career Guidance
    res = requests.post(f"{BASE_URL}/career-guidance/generate", json={"domain": "Python", "current_level": "Beginner", "target_role": "Backend Developer"}, headers=headers)
    print_result("Career Guidance Generate", res)

    res = requests.get(f"{BASE_URL}/career-guidance/latest", headers=headers)
    print_result("Career Guidance Latest", res)

    # 7. Aptitude
    res = requests.post(f"{BASE_URL}/aptitude/start", json={"domain": "General"}, headers=headers)
    print_result("Aptitude Start", res)

    # 8. Coding Challenge
    res = requests.post(f"{BASE_URL}/coding-challenges/generate", json={"domain": "Python", "difficulty": "Medium"}, headers=headers)
    print_result("Coding Generate", res)

    # 9. Question History
    res = requests.get(f"{BASE_URL}/questions/history", headers=headers)
    print_result("Question History", res)

    # 10. Voice Interview
    res = requests.post(f"{BASE_URL}/voice-interviews/start", json={"domain": "Python", "difficulty": "Medium"}, headers=headers)
    print_result("Voice Interview Start", res)
    
    # 11. Resume (Mock)
    # Just check if route exists
    print("Tests complete.")

if __name__ == "__main__":
    run_tests()
