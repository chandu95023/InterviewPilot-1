import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL || ''
const API_BASE_URL = rawBaseUrl.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

// Auth
export const registerUser = (payload) => api.post('/api/auth/register', payload)
export const loginUser = (payload) => {
  const body = new URLSearchParams()
  body.append('username', payload.username)
  body.append('password', payload.password)
  return api.post('/api/auth/login', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
export const getProfile = () => api.get('/api/auth/profile')
export const updateProfile = (payload) => api.put('/api/auth/profile', payload)
export const forgotPassword = (payload) => api.post('/api/auth/forgot-password', payload)
export const resetPassword = (payload) => api.post('/api/auth/reset-password', payload)

// Questions (MongoDB-backed legacy)
export const generateQuestions = (payload) => api.post('/api/questions/generate', payload)
export const getQuestionsHistory = () => api.get('/api/questions/history')

// Question Bank (PostgreSQL-backed)
export const getAllQuestions = (limit = 50, offset = 0) => api.get(`/api/questions/?limit=${limit}&offset=${offset}`)
export const getQuestionsByDomain = (domain, limit = 50) => api.get(`/api/questions/domain/${encodeURIComponent(domain)}?limit=${limit}`)
export const getQuestionsByDifficulty = (level, limit = 50) => api.get(`/api/questions/difficulty/${level}?limit=${limit}`)
export const getRandomQuestions = (count = 10) => api.get(`/api/questions/random?count=${count}`)
export const generateAIQuestions = (payload) => api.post('/api/questions/generate-ai', payload)
export const generateCompanyQuestions = (payload) => api.post('/api/questions/company-generate', payload)
export const getDomains = () => api.get('/api/questions/domains')
export const getCompanies = () => api.get('/api/company-prep/companies')

// Mock Interview
export const evaluateInterview = (payload) => api.post('/api/interviews/evaluate', payload)
export const getInterviewHistory = () => api.get('/api/interviews/history')
export const getInterviewSession = (id) => api.get(`/api/interviews/history/${id}`)
export const deleteInterviewSession = (id) => api.delete(`/api/interviews/history/${id}`)

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats')
export const getCompanyPerformance = () => api.get('/api/dashboard/company-performance')
export const getProgress = () => api.get('/api/dashboard/progress')

// Voice Interview
export const startVoiceInterview = (payload) => api.post('/api/voice-interviews/start', payload)
export const submitVoiceAnswer = (payload) => api.post('/api/voice-interviews/submit-answer', payload)
export const completeVoiceInterview = (interviewId) => api.post(`/api/voice-interviews/complete/${interviewId}`)
export const getVoiceInterviewHistory = () => api.get('/api/voice-interviews/history')
export const getVoiceInterview = (interviewId) => api.get(`/api/voice-interviews/${interviewId}`)

// Resume
export const uploadResume = (formData) => api.post('/api/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getResumeHistory = () => api.get('/api/resume/history')

// Aptitude Test
export const startAptitudeTest = (payload) => api.post('/api/aptitude/start', payload)
export const submitAptitudeAnswers = (payload) => api.post('/api/aptitude/submit', payload)
export const getAptitudeHistory = () => api.get('/api/aptitude/history')

// Coding Challenges
export const generateCodingChallenge = (payload) => api.post('/api/coding-challenges/generate', payload)
export const evaluateCodingChallenge = (payload) => api.post('/api/coding-challenges/evaluate', payload)
export const getCodingChallengeHistory = () => api.get('/api/coding-challenges/history')

// Study Plan
export const generateStudyPlan = (payload) => api.post('/api/study-plan/generate', payload)
export const getLatestStudyPlan = () => api.get('/api/study-plan/latest')

// Career Guidance
export const generateCareerGuidance = (payload) => api.post('/api/career-guidance/generate', payload)
export const getLatestCareerGuidance = () => api.get('/api/career-guidance/latest')

// Voice Interview Transcription
export const transcribeAudio = (formData) => api.post('/api/voice-interviews/transcribe', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

// Health Check
export const getHealthStatus = () => api.get('/api/health')

// AI Assistant
export const askAssistant = (payload) => api.post('/api/assistant/chat', payload)
export const getAssistantHistory = () => api.get('/api/assistant/history')

export default api
