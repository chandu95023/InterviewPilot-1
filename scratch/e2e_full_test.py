import json, requests, sys
base = 'http://127.0.0.1:8000'
results = []
# 1. Home page
resp = requests.get(f'{base}/')
results.append({'module':'Home','endpoint':'GET /','status':resp.status_code,'response':resp.text[:200]})
# 2. Health
resp = requests.get(f'{base}/api/health')
results.append({'module':'Health','endpoint':'GET /api/health','status':resp.status_code,'response':resp.text})
# 3. Docs (just check reachable)
resp = requests.get(f'{base}/docs')
results.append({'module':'Docs','endpoint':'GET /docs','status':resp.status_code,'response':resp.text[:200]})
# 4. Register
reg = {'name':'E2E User','email':'e2e_user@example.com','password':'Pass123'}
resp = requests.post(f'{base}/api/auth/register', json=reg)
results.append({'module':'Register','endpoint':'POST /api/auth/register','status':resp.status_code,'response':resp.text})
# 5. Login
login = {'username':'e2e_user@example.com','password':'Pass123'}
resp = requests.post(f'{base}/api/auth/login', data=login)
login_status = resp.status_code
token = resp.json().get('access_token') if login_status==200 else None
results.append({'module':'Login','endpoint':'POST /api/auth/login','status':login_status,'response':resp.text})
headers = {'Authorization':f'Bearer {token}'} if token else {}
# 6. Mock interview generate
mock = {'domain':'Python','difficulty':'Easy','count':2}
resp = requests.post(f'{base}/api/questions/generate', json=mock, headers=headers)
results.append({'module':'MockGen','endpoint':'POST /api/questions/generate','status':resp.status_code,'response':resp.text})
questions = resp.json().get('questions', []) if resp.status_code==200 else []
# 7. Mock interview evaluate
if questions:
    answers = [{'question_id':q.get('id'),'answer':'Sample answer'} for q in questions]
    eval_payload = {'domain':'Python','difficulty':'Easy','answers':answers}
    resp = requests.post(f'{base}/api/interviews/evaluate', json=eval_payload, headers=headers)
    results.append({'module':'MockEval','endpoint':'POST /api/interviews/evaluate','status':resp.status_code,'response':resp.text})
# 8. Voice start
voice = {'domain':'Python','difficulty':'Easy','question_count':2}
resp = requests.post(f'{base}/api/voice-interviews/start', json=voice, headers=headers)
results.append({'module':'VoiceStart','endpoint':'POST /api/voice-interviews/start','status':resp.status_code,'response':resp.text})
# 9. Voice transcribe (dummy)
files = {'file':('dummy.wav', b'RIFF....', 'audio/wav')}
resp = requests.post(f'{base}/api/voice-interviews/transcribe', files=files, headers=headers)
results.append({'module':'VoiceTranscribe','endpoint':'POST /api/voice-interviews/transcribe','status':resp.status_code,'response':resp.text})
# 10. Study plan
study = {'domain':'Python','current_level':'Beginner'}
resp = requests.post(f'{base}/api/study-plan/generate', json=study, headers=headers)
results.append({'module':'StudyPlan','endpoint':'POST /api/study-plan/generate','status':resp.status_code,'response':resp.text})
# 11. Career guidance
career = {'domain':'Python','current_level':'Junior','target_role':'Software Engineer'}
resp = requests.post(f'{base}/api/career-guidance/generate', json=career, headers=headers)
results.append({'module':'Career','endpoint':'POST /api/career-guidance/generate','status':resp.status_code,'response':resp.text})
# 12. Dashboard
resp = requests.get(f'{base}/api/dashboard/stats', headers=headers)
results.append({'module':'Dashboard','endpoint':'GET /api/dashboard/stats','status':resp.status_code,'response':resp.text})
# 13. Question history
resp = requests.get(f'{base}/api/questions/history', headers=headers)
results.append({'module':'History','endpoint':'GET /api/questions/history','status':resp.status_code,'response':resp.text})
print(json.dumps(results, indent=2))
