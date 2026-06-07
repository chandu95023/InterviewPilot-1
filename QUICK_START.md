# AI Interview Preparation Platform - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Start Both Servers
Both servers should already be running in the terminals, but if not:

**Backend (Terminal 1):**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### Step 2: Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Step 3: First User Walkthrough

#### 1. Register an Account
```
URL: http://localhost:5173/register
- Name: Your Name
- Email: your.email@example.com
- Password: secure_password
```

#### 2. Login
```
URL: http://localhost:5173/login
- Email: your.email@example.com
- Password: secure_password
```

#### 3. Try Each Feature

**📚 Generate Interview Questions**
```
Path: Dashboard → "Start Mock Interview" or "Generate Questions"
- Select Domain: Python, Java, Full Stack, etc.
- Select Difficulty: Easy, Medium, Hard
- Click Generate
```

**🎤 Voice Interview**
```
Path: Dashboard → "Voice Interview"
- Select domain and difficulty
- Answer questions via text or speech recognition
- Get AI-powered evaluation
```

**📄 Upload Resume**
```
Path: Dashboard → "Upload Resume"
- Select PDF file
- View extracted skills, projects, education
- Get personalized question recommendations
```

**📊 Mock Interview Evaluation**
```
Path: Dashboard → "Mock Interview"
- Select questions or domains
- Submit your answers
- Get detailed evaluation with score and feedback
```

**📈 View Dashboard Analytics**
```
Path: Dashboard → "Dashboard"
- Total interviews taken
- Average score
- Performance by company
- Weak topics identification
```

**🎯 Generate Study Plan**
```
Path: Dashboard → "Study Plan"
- Select domain and current level
- Get 4-week personalized study plan
- Focus on weak areas
```

**💻 Coding Challenges**
```
Path: Dashboard → "Coding Challenges"
- Generate coding problems
- Submit solutions in your preferred language
- Get evaluation and improvement suggestions
```

---

## 📚 API Quick Reference

### Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "password123"
  }'
```

### Generate Questions
```bash
curl -X POST http://localhost:8000/api/questions/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "Python",
    "difficulty": "Medium",
    "count": 5
  }'
```

### Start Voice Interview
```bash
curl -X POST http://localhost:8000/api/voice-interviews/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "Python",
    "difficulty": "Medium",
    "question_count": 3,
    "duration_minutes": 30
  }'
```

---

## 🎯 Key Features

### ✅ Text-Based Mock Interviews
- Generate interview questions
- Submit answers
- Get AI-powered evaluation with scoring

### ✅ Voice Interviews
- Answer questions with voice recognition
- Get evaluation based on content and presentation

### ✅ Company-Specific Preparation
- Generate questions for specific companies (Google, Amazon, Microsoft, etc.)
- Track company-specific performance

### ✅ Resume Analysis
- Upload PDF resume
- Extract skills, projects, education, certifications
- Get personalized question recommendations

### ✅ Study Plans
- Generate 4-week customized study plans
- Focus on weak areas
- Get learning resources

### ✅ Coding Challenges
- Generate coding problems
- Evaluate solutions
- Get feedback on code quality

### ✅ Performance Analytics
- View interview history
- Track average scores
- Identify weak topics
- See company-wise performance

---

## 🔧 Troubleshooting

### Issue: Frontend can't connect to Backend
```
Solution:
1. Ensure backend is running on port 8000
2. Check CORS configuration in backend/app/main.py
3. Verify no firewall is blocking localhost:8000
```

### Issue: OpenAI API errors
```
Solution:
1. If OPENAI_API_KEY is not set, the system uses mock data
2. To use real AI features, add your API key to .env
3. Check your OpenAI account has available credits
```

### Issue: MongoDB connection error
```
Solution:
1. Ensure MongoDB is running locally
2. If using MongoDB Atlas, update MONGODB_URI in .env
3. Check database user credentials
```

### Issue: Port already in use
```
Solution:
# Change backend port:
python -m uvicorn app.main:app --port 8001

# Change frontend port (in frontend directory):
# Edit vite.config.js or run: npm run dev -- --port 5174
```

---

## 📊 Expected Usage Flow

1. **User Registration/Login** → Create account or sign in
2. **Choose Feature** → Select from available options
3. **Take Assessment** → Answer questions or upload resume
4. **Get Evaluation** → Receive AI-powered feedback
5. **View Analytics** → Track progress and improvement areas
6. **Plan Study** → Generate personalized study plans
7. **Repeat** → Continue practicing and improving

---

## 🎓 Learning Path Recommendation

**Beginner:**
1. Start with Easy difficulty questions
2. Take a text-based mock interview
3. Upload resume for skill analysis
4. View dashboard analytics

**Intermediate:**
1. Try Medium difficulty questions
2. Company-specific question practice
3. Take voice interviews
4. Generate study plans for weak areas

**Advanced:**
1. Hard difficulty questions
2. Coding challenges
3. Company-specific deep dives
4. Use analytics to identify improvement areas

---

## 🚀 Performance Tips

1. **Faster Load Times:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Use incognito/private mode

2. **Better Question Quality:**
   - Set OPENAI_API_KEY in .env for real AI questions
   - Provide detailed answers for better evaluation

3. **Tracking Progress:**
   - Complete multiple interviews in same domain
   - Check dashboard regularly
   - Use study plans to focus on weak areas

---

## 📱 Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 💡 Tips for Success

✅ **Regular Practice:** Take interviews 2-3 times per week
✅ **Focus on Weak Areas:** Use identified weak topics to guide study
✅ **Review Feedback:** Read detailed evaluation feedback carefully
✅ **Vary Difficulty:** Progress from easy to hard gradually
✅ **Company Focus:** Practice company-specific questions before interviews
✅ **Voice Practice:** Use voice interviews to improve communication

---

## 🆘 Getting Help

1. **Check API Documentation:** http://localhost:8000/docs
2. **Read README Files:** [BACKEND_README.md](backend/BACKEND_README.md)
3. **Check Logs:** Look in `backend/logs/` directory
4. **Common Issues:** See Troubleshooting section above

---

## 📝 System Information

- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite
- **Database:** MongoDB
- **AI Integration:** OpenAI API (optional)
- **Authentication:** JWT tokens
- **Port (Backend):** 8000
- **Port (Frontend):** 5173

---

**Ready to start? Visit http://localhost:5173 now! 🎉**
