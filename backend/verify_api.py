# -*- coding: utf-8 -*-
"""
Quick end-to-end API verification for Mock Interview Assessment flow.
Run with: python verify_api.py
"""
import requests
import json
import sys
import os
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = "http://127.0.0.1:8000"

def section(title):
    print("\n" + "=" * 55)
    print("  " + title)
    print("=" * 55)

def ok(msg):  print("  [PASS] " + str(msg))
def fail(msg): print("  [FAIL] " + str(msg))
def info(msg): print("  [INFO] " + str(msg))

errors_found = 0

# -- 1. Root health --
section("1. Backend Health Check")
try:
    r = requests.get(BASE + "/", timeout=10)
    data = r.json()
    ok("Backend running: " + str(data.get('message', 'OK')))
    ok("Status code: " + str(r.status_code))
except Exception as e:
    fail("Backend unreachable: " + str(e))
    errors_found += 1
    sys.exit(1)

# -- 2. Domains endpoint --
section("2. Domains Endpoint")
try:
    r = requests.get(BASE + "/api/questions/domains", timeout=10)
    domains = r.json().get("domains", [])
    expected = {"Python","Java","JavaScript","React","Node.js","SQL","DSA","OOPs","DBMS","Operating Systems","Computer Networks","System Design"}
    got = set(domains)
    if expected.issubset(got):
        ok("All 12 required domains present")
        for d in sorted(domains):
            info("  - " + d)
    else:
        missing = expected - got
        fail("Missing domains: " + str(missing))
        errors_found += 1
except Exception as e:
    fail("Domains endpoint error: " + str(e))
    errors_found += 1

# -- 3. Login --
section("3. Authentication (Demo User)")
token = None
try:
    r = requests.post(
        BASE + "/api/auth/login",
        data={"username": "demo@interviewpilot.ai", "password": "demo1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10
    )
    resp = r.json()
    token = resp.get("access_token")
    if token:
        ok("Login successful. Token: " + token[:30] + "...")
    else:
        fail("No token returned. Response: " + str(resp))
        errors_found += 1
except Exception as e:
    fail("Login error: " + str(e))
    errors_found += 1

if not token:
    fail("Cannot continue without auth token.")
    sys.exit(1)

HEADERS = {"Authorization": "Bearer " + token}

# -- 4. Question generation (Test 1: Python / Medium / 5) --
section("4. Question Generation (Python / Medium / 5 questions)")
questions = []
try:
    r = requests.post(
        BASE + "/api/questions/generate",
        json={"domain": "Python", "difficulty": "Medium", "count": 5},
        headers=HEADERS,
        timeout=30
    )
    data = r.json()
    questions = data.get("questions", [])
    if questions:
        ok("Questions generated: " + str(len(questions)))
        for i, q in enumerate(questions):
            info("Q" + str(i+1) + ": " + str(q.get('question',''))[:80] + "...")
    else:
        fail("No questions returned. Response: " + str(data))
        errors_found += 1
except Exception as e:
    fail("Question generation error: " + str(e))
    errors_found += 1

# -- 5. Evaluate interview (Test 2 & 3) --
section("5. Evaluation (Submit Answers & Get Feedback)")
if questions:
    answers = []
    for i, q in enumerate(questions):
        text = (
            "Python uses dynamic typing with garbage collection. Key data structures include "
            "lists, dicts, sets and tuples. OOP is supported via classes and inheritance. "
            "Python features comprehensions and generators for efficient data processing. "
            "The GIL limits true multithreading but multiprocessing works well for CPU tasks."
        )
        answers.append({
            "question_id": q.get("id"),
            "question": q.get("question"),
            "answer": text if i % 2 == 0 else "I am not sure about this topic."
        })

    try:
        r = requests.post(
            BASE + "/api/interviews/evaluate",
            json={"domain": "Python", "difficulty": "Medium", "answers": answers},
            headers=HEADERS,
            timeout=60
        )
        result = r.json()
        
        ok("Evaluation HTTP status: " + str(r.status_code))
        
        avg = result.get("average_score") or result.get("score")
        strengths = result.get("strengths", [])
        weaknesses = result.get("weaknesses", [])
        suggestions = result.get("suggestions", [])
        summary = result.get("summary", [])
        session_id = result.get("session_id")

        if avg is not None:
            ok("Average score: " + str(avg) + "/10")
        else:
            fail("No average_score in response")
            errors_found += 1

        readiness = min(100, round(float(avg or 0) * 10))
        ok("Readiness score: " + str(readiness) + "%")

        if strengths:
            ok("Strengths: " + str(strengths))
        else:
            fail("No strengths returned")
            errors_found += 1

        if weaknesses:
            ok("Weaknesses: " + str(weaknesses))
        else:
            fail("No weaknesses returned")
            errors_found += 1

        if suggestions:
            ok("Suggestions: " + str(suggestions))
        else:
            fail("No suggestions returned")
            errors_found += 1

        if summary:
            ok("Per-question summary: " + str(len(summary)) + " entries")
            for item in summary:
                info("  Q: " + str(item.get('question',''))[:50] + "... | Score: " + str(item.get('score')))
        else:
            fail("No per-question summary returned")
            errors_found += 1

        if session_id:
            ok("Session saved with id: " + str(session_id))
        else:
            info("No session_id returned (expected for in-memory db)")

    except Exception as e:
        fail("Evaluation error: " + str(e))
        errors_found += 1
        try:
            info("Response body: " + r.text[:500])
        except:
            pass
else:
    fail("Skipping evaluation -- no questions available.")
    errors_found += 1

# -- 6. Database check --
section("6. Database Status")
db_path = os.path.join(os.path.dirname(__file__), "interview_prep.db")
if os.path.exists(db_path):
    size = os.path.getsize(db_path)
    ok("SQLite database file exists: " + db_path)
    ok("File size: " + str(size) + " bytes")
    try:
        import sqlite3
        conn = sqlite3.connect(db_path)
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        ok("Tables: " + str([t[0] for t in tables]))
        try:
            sessions = conn.execute("SELECT COUNT(*) FROM interview_sessions").fetchone()[0]
            ok("Interview sessions saved: " + str(sessions))
        except:
            info("No interview_sessions table yet")
        conn.close()
    except Exception as e:
        fail("DB query error: " + str(e))
else:
    info("SQLite DB not created yet (in-memory fallback active)")

# -- 7. Gemini status --
section("7. Gemini AI Status")
gemini_key = os.getenv("GEMINI_API_KEY", "")
if not gemini_key:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("GEMINI_API_KEY="):
                gemini_key = line.split("=", 1)[1].strip()
                break

if gemini_key:
    ok("Gemini API key configured (length: " + str(len(gemini_key)) + " chars)")
    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + gemini_key
        payload = {"contents": [{"parts": [{"text": "Say GEMINI_OK in one word"}]}]}
        gr = requests.post(url, json=payload, timeout=10)
        text = gr.json()["candidates"][0]["content"]["parts"][0]["text"]
        ok("Gemini API live response: " + text.strip())
    except Exception as e:
        fail("Gemini API call failed: " + str(e))
        errors_found += 1
else:
    info("GEMINI_API_KEY is empty -- using mock/fallback data (expected for local dev)")
    info("To enable Gemini AI: add API key to backend/.env as GEMINI_API_KEY=your_key")

# -- Summary --
section("VERIFICATION SUMMARY")
print("""
  Frontend URL  : http://localhost:5174/mock-interview
  Backend URL   : http://localhost:8000
  API Docs      : http://localhost:8000/docs
  Database      : SQLite (./interview_prep.db) -- PostgreSQL ready
  Gemini        : Requires API key in .env to use AI generation
  Fallback      : Mock questions + heuristic evaluation always available
""")

if errors_found == 0:
    print("  *** ALL TESTS PASSED ***")
else:
    print("  *** " + str(errors_found) + " ISSUE(S) FOUND ***")

sys.exit(0 if errors_found == 0 else 1)
