# AI Interview Preparation Platform - Backend API Documentation

## Overview
Complete FastAPI backend for the AI Interview Preparation Platform with authentication, AI-powered question generation, mock interviews, and comprehensive analytics.

## Base URL
```
http://localhost:8000
```

## API Documentation (Interactive)
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Authentication

### Login
**POST** `/api/auth/login`
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Register
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Get Profile
**GET** `/api/auth/profile`
- Requires: Bearer token in Authorization header

### Update Profile
**PUT** `/api/auth/profile`
```json
{
  "name": "Updated Name",
  "email": "email@example.com"
}
```

### Logout
**POST** `/api/auth/logout`

---

## Questions Management

### Generate Questions
**POST** `/api/questions/generate`
```json
{
  "domain": "Python",
  "difficulty": "Medium",
  "count": 5
}
```

### Get Question History
**GET** `/api/questions/history`

### Get Available Domains
**GET** `/api/questions/domains`
```json
{
  "domains": ["Java", "Python", "Full Stack Development", "Data Science", "AI/ML"]
}
```

### Get Available Companies
**GET** `/api/questions/companies`
```json
{
  "companies": ["Google", "Amazon", "Microsoft", "Meta", "Tesla", "Apple", "Oracle"]
}
```

### Generate Company-Specific Questions
**POST** `/api/questions/company-generate`
```json
{
  "company": "Google",
  "domain": "Full Stack Development",
  "difficulty": "Hard",
  "count": 3
}
```

---

## Mock Interviews

### Evaluate Interview (Text-based)
**POST** `/api/interviews/evaluate`
```json
{
  "domain": "Python",
  "difficulty": "Medium",
  "answers": [
    {
      "question_id": "optional_id",
      "question": "What is inheritance in OOP?",
      "answer": "Inheritance is a mechanism where a class inherits properties and methods from another class..."
    }
  ]
}
```

### Get Interview History
**GET** `/api/interviews/history`

---

## Voice Interviews

### Start Voice Interview
**POST** `/api/voice-interviews/start`
```json
{
  "domain": "Python",
  "difficulty": "Medium",
  "question_count": 3,
  "duration_minutes": 30
}
```
**Response:**
```json
{
  "interview_id": "interview_uuid",
  "domain": "Python",
  "difficulty": "Medium",
  "questions": [
    {
      "question": "Question text",
      "answer": "Ideal answer"
    }
  ],
  "session_token": "session_token_uuid"
}
```

### Submit Voice Answer
**POST** `/api/voice-interviews/submit-answer`
```json
{
  "interview_id": "interview_uuid",
  "question_index": 0,
  "answer_text": "User's spoken answer transcribed...",
  "duration_seconds": 120
}
```

### Complete Voice Interview
**POST** `/api/voice-interviews/complete/{interview_id}`
**Response:**
```json
{
  "interview_id": "interview_uuid",
  "status": "completed",
  "average_score": 7.5,
  "total_questions": 3,
  "total_answers": 3,
  "weak_topics": ["topic1", "topic2"]
}
```

### Get Voice Interview History
**GET** `/api/voice-interviews/history`

### Get Specific Voice Interview
**GET** `/api/voice-interviews/{interview_id}`

---

## Resume Management

### Upload Resume
**POST** `/api/resume/upload`
- Content-Type: multipart/form-data
- File: PDF file

**Response:**
```json
{
  "resume": {
    "id": "resume_id",
    "skills": ["Python", "React", "MongoDB"],
    "projects": ["Project 1", "Project 2"],
    "education": ["BS Computer Science"],
    "certifications": ["AWS Certified"],
    "recommended_questions": ["Question 1", "Question 2"]
  }
}
```

### Get Resume History
**GET** `/api/resume/history`

---

## Dashboard & Analytics

### Get Dashboard Stats
**GET** `/api/dashboard/stats`
```json
{
  "total_interviews": 15,
  "average_score": 7.2,
  "best_domain": "Python",
  "weak_topics": ["Design Patterns", "Concurrency"],
  "interview_history": [...]
}
```

### Get Company Performance
**GET** `/api/dashboard/company-performance`
```json
{
  "company_performance": [
    {
      "company": "Google",
      "average_score": 7.8,
      "question_attempts": 5
    },
    {
      "company": "Amazon",
      "average_score": 6.9,
      "question_attempts": 3
    }
  ]
}
```

### Get Progress
**GET** `/api/dashboard/progress`

---

## Study Plans

### Generate Study Plan
**POST** `/api/study-plan/generate`
```json
{
  "domain": "Full Stack Development",
  "current_level": "Intermediate",
  "target_role": "Senior Engineer",
  "weak_topics": ["System Design", "Advanced Algorithms"]
}
```

**Response:**
```json
{
  "study_plan": {
    "headline": "4-Week Full Stack Development Study Plan",
    "weekly_plan": [
      "Week 1: Master fundamentals...",
      "Week 2: Deep dive into design patterns...",
      "Week 3: Practice coding problems...",
      "Week 4: Mock interviews"
    ],
    "learning_resources": [
      "Official documentation",
      "LeetCode",
      "YouTube channels"
    ]
  }
}
```

---

## Coding Challenges

### Generate Coding Challenge
**POST** `/api/coding-challenges/generate`
```json
{
  "domain": "Python",
  "difficulty": "Medium",
  "count": 1
}
```

### Evaluate Coding Solution
**POST** `/api/coding-challenges/evaluate`
```json
{
  "challenge_id": "challenge_uuid",
  "solution": "def solve(arr): return sum(arr)",
  "language": "Python"
}
```

**Response:**
```json
{
  "evaluation": {
    "score": 8.5,
    "feedback": ["Good implementation", "Efficient solution"],
    "improvements": ["Add input validation", "Consider edge cases"]
  }
}
```

### Get Coding Challenge History
**GET** `/api/coding-challenges/history`

---

## Features Included

✅ **User Authentication** - JWT-based secure authentication
✅ **Question Generation** - AI-powered interview questions (with OpenAI or mock fallback)
✅ **Text-based Interviews** - Evaluate answers to interview questions
✅ **Voice Interviews** - Support for voice-based mock interviews
✅ **Company-Specific Prep** - Generate questions for target companies
✅ **Resume Analysis** - Upload and analyze resume for skill recommendations
✅ **Study Plans** - Generate personalized 4-week study plans
✅ **Coding Challenges** - Generate and evaluate coding problems
✅ **Dashboard Analytics** - Track performance and progress
✅ **Company Performance** - See performance by company
✅ **Error Handling** - Comprehensive error handling with informative messages
✅ **Logging** - Detailed logging for debugging and monitoring
✅ **Fallback Data** - Mock data when OpenAI is not configured
✅ **CORS Support** - Configured for frontend integration

---

## Database Collections

- `users` - User profiles and authentication data
- `questions` - Generated interview questions
- `interviews` - Interview sessions and evaluations
- `resume_data` - Uploaded resume information
- `coding_challenges` - Coding challenge data
- `study_plans` - Generated study plans (optional)
- `feedback` - User feedback (optional)

---

## Error Handling

All errors follow a consistent format:
```json
{
  "error": "Error message",
  "status_code": 400,
  "path": "/api/endpoint",
  "timestamp": "2024-06-02T12:34:56.789Z",
  "details": { "additional": "info" }
}
```

---

## Configuration

See `.env` file for configuration:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_interview_prep
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o
DEBUG=true
ENVIRONMENT=development
```

---

## Development

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### Access API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Support
For issues or questions about the backend API, please refer to the main project README.
