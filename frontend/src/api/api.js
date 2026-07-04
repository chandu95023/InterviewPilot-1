import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

// Auth
export const registerUser = (payload) => api.post('/auth/register', payload)
export const loginUser = (payload) => {
  const body = new URLSearchParams()
  body.append('username', payload.username)
  body.append('password', payload.password)
  return api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
export const getProfile = () => api.get('/auth/profile')
export const updateProfile = (payload) => api.put('/auth/profile', payload)
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload)
export const resetPassword = (payload) => api.post('/auth/reset-password', payload)

// Questions (MongoDB-backed legacy)
export const generateQuestions = (payload) => api.post('/questions/generate', payload)
export const getQuestionsHistory = () => api.get('/questions/history')

// Question Bank (PostgreSQL-backed)
export const getAllQuestions = (limit = 50, offset = 0) => api.get(`/questions/?limit=${limit}&offset=${offset}`)
export const getQuestionsByDomain = (domain, limit = 50) => api.get(`/questions/domain/${encodeURIComponent(domain)}?limit=${limit}`)
export const getQuestionsByDifficulty = (level, limit = 50) => api.get(`/questions/difficulty/${level}?limit=${limit}`)
export const getRandomQuestions = (count = 10) => api.get(`/questions/random?count=${count}`)
export const generateAIQuestions = (payload) => api.post('/questions/generate-ai', payload)
export const generateCompanyQuestions = (payload) => api.post('/questions/company-generate', payload)
export const getDomains = () => api.get('/questions/domains')
export const getCompanies = () => api.get('/company-prep/companies')

// Mock Interview
export const evaluateInterview = (payload) => api.post('/interviews/evaluate', payload)
export const getInterviewHistory = () => api.get('/interviews/history')
export const getInterviewSession = (id) => api.get(`/interviews/history/${id}`)
export const deleteInterviewSession = (id) => api.delete(`/interviews/history/${id}`)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getCompanyPerformance = () => api.get('/dashboard/company-performance')
export const getProgress = () => api.get('/dashboard/progress')

// Voice Interview
export const startVoiceInterview = (payload) => api.post('/voice-interviews/start', payload)
export const submitVoiceAnswer = (payload) => api.post('/voice-interviews/submit-answer', payload)
export const completeVoiceInterview = (interviewId) => api.post(`/voice-interviews/complete/${interviewId}`)
export const getVoiceInterviewHistory = () => api.get('/voice-interviews/history')
export const getVoiceInterview = (interviewId) => api.get(`/voice-interviews/${interviewId}`)

// Resume
export const uploadResume = (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getResumeHistory = () => api.get('/resume/history')

// Aptitude Test
export const startAptitudeTest = (payload) => api.post('/aptitude/start', payload)
export const submitAptitudeAnswers = (payload) => api.post('/aptitude/submit', payload)
export const getAptitudeHistory = () => api.get('/aptitude/history')

// Coding Challenges
export const generateCodingChallenge = (payload) => api.post('/coding-challenges/generate', payload)
export const evaluateCodingChallenge = (payload) => api.post('/coding-challenges/evaluate', payload)
export const getCodingChallengeHistory = () => api.get('/coding-challenges/history')

// Study Plan
export const generateStudyPlan = (payload) => api.post('/study-plan/generate', payload)
export const getLatestStudyPlan = () => api.get('/study-plan/latest')

// Career Guidance
export const generateCareerGuidance = (payload) => api.post('/career-guidance/generate', payload)
export const getLatestCareerGuidance = () => api.get('/career-guidance/latest')

// Voice Interview Transcription
export const transcribeAudio = (formData) => api.post('/voice-interviews/transcribe', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

// Health Check
export const getHealthStatus = () => api.get('/health')

// AI Assistant
export const askAssistant = (payload) => api.post('/assistant/chat', payload)
export const getAssistantHistory = () => api.get('/assistant/history')

export default api

