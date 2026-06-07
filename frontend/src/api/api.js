import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

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
export const generateQuestions = (payload) => api.post('/questions/generate', payload)
export const getQuestionsHistory = () => api.get('/questions/history')
export const evaluateInterview = (payload) => api.post('/interviews/evaluate', payload)
export const getInterviewHistory = () => api.get('/interviews/history')
export const uploadResume = (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getCompanyPerformance = () => api.get('/dashboard/company-performance')
export const getDomains = () => api.get('/questions/domains')
export const getCompanies = () => api.get('/questions/companies')
export const generateCompanyQuestions = (payload) => api.post('/questions/company-generate', payload)
export const generateStudyPlan = (payload) => api.post('/study-plan/generate', payload)
export const generateCodingChallenge = (payload) => api.post('/coding-challenges/generate', payload)
export const evaluateCodingChallenge = (payload) => api.post('/coding-challenges/evaluate', payload)
export const getCodingChallengeHistory = () => api.get('/coding-challenges/history')

// Voice interviews
export const startVoiceInterview = (payload) => api.post('/voice-interviews/start', payload)
export const submitVoiceAnswer = (payload) => api.post('/voice-interviews/submit-answer', payload)
export const completeVoiceInterview = (interviewId) => api.post(`/voice-interviews/complete/${interviewId}`)
export const getVoiceInterviewHistory = () => api.get('/voice-interviews/history')
export const getVoiceInterview = (interviewId) => api.get(`/voice-interviews/${interviewId}`)

// Aptitude test
export const startAptitudeTest = (payload) => api.post('/aptitude/start', payload)
export const submitAptitudeAnswers = (payload) => api.post('/aptitude/submit', payload)

export default api

