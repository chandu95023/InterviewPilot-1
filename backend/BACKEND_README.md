# AI Interview Preparation Platform - Backend

Complete FastAPI backend for the AI Interview Preparation Platform with MongoDB, JWT authentication, and AI-powered features.

## 📋 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization and middleware setup
│   ├── auth.py                 # JWT authentication and authorization
│   ├── database.py             # MongoDB connection and collections
│   ├── models.py               # Data models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── utils.py                # Utility functions
│   ├── exceptions.py           # Custom exception handlers
│   ├── logging_config.py       # Logging configuration
│   ├── core/
│   │   └── config.py           # Application configuration from .env
│   ├── routes/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── questions.py        # Question generation endpoints
│   │   ├── interviews.py       # Interview evaluation endpoints
│   │   ├── voice_interview.py  # Voice interview endpoints
│   │   ├── resume.py           # Resume upload and analysis
│   │   ├── dashboard.py        # Analytics and statistics
│   │   ├── study_plan.py       # Study plan generation
│   │   └── challenges.py       # Coding challenge endpoints
│   └── services/
│       ├── ai_service.py       # OpenAI integration and question generation
│       ├── evaluation_service.py # Answer evaluation logic
│       └── resume_service.py   # Resume parsing and analysis
├── .env                         # Environment configuration
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── API_DOCUMENTATION.md        # API endpoint documentation
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- MongoDB (local or cloud instance)
- pip (Python package manager)

### Installation

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up MongoDB:**
```bash
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

4. **Run the server:**
```bash
python -m uvicorn app.main:app --reload --port 8000
```

5. **Access the API:**
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📦 Key Features

### Authentication & Authorization
- JWT-based token authentication
- Secure password hashing with bcrypt
- Role-based access control (RBAC) ready
- User registration and login

### AI-Powered Question Generation
- Generate interview questions by domain and difficulty
- Company-specific question generation
- Fallback to mock data when OpenAI is unavailable
- Support for multiple programming languages

### Interview Evaluation
- AI-powered answer evaluation with scoring
- Identification of weak topics
- Detailed feedback and suggestions
- Support for both text and voice interviews

### Mock Interview Sessions
- Text-based mock interviews
- Voice-based mock interviews with transcription support
- Session management and tracking
- Interview history and statistics

### Resume Analysis
- PDF resume upload and parsing
- Skill extraction and analysis
- Personalized question recommendations
- Resume history tracking

### Study Plans
- Generate personalized 4-week study plans
- Target role-based customization
- Weak topic identification and focus
- Learning resource recommendations

### Coding Challenges
- Generate coding problems by domain and difficulty
- Solution evaluation with code quality feedback
- Language-specific evaluation
- Challenge history and performance tracking

### Analytics & Dashboard
- Interview performance metrics
- Company-wise performance tracking
- Weak topic analysis
- Progress visualization ready

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_interview_prep

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=120

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o

# Application Settings
DEBUG=true
ENVIRONMENT=development
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Questions
- `POST /api/questions/generate` - Generate questions
- `GET /api/questions/history` - Get question history
- `GET /api/questions/domains` - List available domains
- `GET /api/questions/companies` - List target companies
- `POST /api/questions/company-generate` - Generate company questions

### Interviews
- `POST /api/interviews/evaluate` - Evaluate interview answers
- `GET /api/interviews/history` - Get interview history

### Voice Interviews
- `POST /api/voice-interviews/start` - Start voice interview
- `POST /api/voice-interviews/submit-answer` - Submit voice answer
- `POST /api/voice-interviews/complete/{id}` - Complete interview
- `GET /api/voice-interviews/history` - Get voice interview history

### Resume
- `POST /api/resume/upload` - Upload resume (PDF)
- `GET /api/resume/history` - Get resume history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/company-performance` - Get company performance
- `GET /api/dashboard/progress` - Get progress metrics

### Study Plans
- `POST /api/study-plan/generate` - Generate study plan

### Coding Challenges
- `POST /api/coding-challenges/generate` - Generate challenges
- `POST /api/coding-challenges/evaluate` - Evaluate solution
- `GET /api/coding-challenges/history` - Get challenge history

## 🔐 Security Features

✅ JWT token-based authentication
✅ Password hashing with bcrypt
✅ CORS protection
✅ Input validation with Pydantic
✅ SQL injection prevention (using async MongoDB driver)
✅ Error handling without exposing sensitive information
✅ Request logging for audit trails

## 🧪 Testing

### Manual Testing with cURL
```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"john@example.com","password":"pass123"}'

# Generate Questions (with token)
curl -X POST "http://localhost:8000/api/questions/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"Python","difficulty":"Medium","count":3}'
```

## 📝 Logging

Logs are automatically generated in the `logs/` directory with:
- Daily log files with rotation
- Separate console and file handlers
- Detailed debug information with line numbers
- Request tracking and error reporting

## 🐳 Docker

### Build Docker Image
```bash
docker build -t ai-interview-backend .
```

### Run Docker Container
```bash
docker run -p 8000:8000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017 \
  ai-interview-backend
```

## 🔗 Integration with Frontend

The backend is configured for CORS with the frontend at:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

API Base URL for frontend: `http://localhost:8000/api`

## 📋 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  hashed_password: String,
  created_at: Date,
  updated_at: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  domain: String,
  difficulty: String,
  question: String,
  answer: String,
  user_id: String,
  company: String (optional),
  source: String,
  created_at: Date
}
```

### Interviews Collection
```javascript
{
  _id: ObjectId,
  user_id: String,
  domain: String,
  difficulty: String,
  type: String, // 'text' or 'voice'
  questions: Array,
  answers: Array,
  score: Number,
  evaluation: Object,
  weak_topics: Array,
  created_at: Date,
  completed_at: Date
}
```

## 🚀 Performance Optimizations

- Async/await for non-blocking I/O
- MongoDB async driver (motor)
- Connection pooling
- Index optimization suggestions:
  ```javascript
  db.users.createIndex({ email: 1 }, { unique: true })
  db.questions.createIndex({ user_id: 1, created_at: -1 })
  db.interviews.createIndex({ user_id: 1, created_at: -1 })
  ```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running locally or update MONGODB_URI in .env
```

### OpenAI API Error
```
Solution: The system automatically falls back to mock data. Add OPENAI_API_KEY for live AI features.
```

### CORS Error in Frontend
```
Solution: Check that frontend URL is in CORS origins in main.py
```

### Import Error: pydantic_settings
```
Solution: pip install pydantic-settings
```

## 📞 Support & Contributing

For issues or contributions:
1. Check existing issues
2. Create detailed bug reports with steps to reproduce
3. Submit pull requests with clear descriptions

## 📄 License

This project is part of the AI Interview Preparation Platform.

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Motor Documentation](https://motor.readthedocs.io/)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Last Updated:** June 2, 2024
**Status:** ✅ Production Ready
