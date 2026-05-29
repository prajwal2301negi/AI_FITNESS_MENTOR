// lib/api.js
import api from './axios'

// ─── AUTH ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  logoutAll: () => api.post('/api/auth/logout-all'),
  refresh: () => api.post('/api/auth/refresh'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
}

// ─── USERS ────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data) => api.patch('/api/users/me', data),
  deleteMe: () => api.delete('/api/users/me'),
}

// ─── PROFILE ─────────────────────────────────────────────────
export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data),
  getMetrics: () => api.get('/api/profile/metrics'),
  logMetrics: (data) => api.post('/api/profile/metrics', data),
}

// ─── NUTRITION ────────────────────────────────────────────────
export const nutritionAPI = {
  logMeal: (data) => api.post('/api/nutrition/meals', data),
  getDailyLog: (date) => api.get(`/api/nutrition/meals/daily${date ? `/${date}` : ''}`),
  updateMeal: (id, data) => api.patch(`/api/nutrition/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/api/nutrition/meals/${id}`),
  getHistory: (params) => api.get('/api/nutrition/meals/history', { params }),
  searchFood: (q, limit = 20) => api.get('/api/nutrition/foods/search', { params: { q, limit } }),
  createMealPlan: (data) => api.post('/api/nutrition/plans', data),
  getMealPlans: () => api.get('/api/nutrition/plans'),
  getActiveMealPlan: () => api.get('/api/nutrition/plans/active'),
  deleteMealPlan: (id) => api.delete(`/api/nutrition/plans/${id}`),
}

// ─── WORKOUTS ────────────────────────────────────────────────
export const workoutAPI = {
  createSession: (data) => api.post('/api/workouts/sessions', data),
  getSessions: (params) => api.get('/api/workouts/sessions', { params }),
  getSession: (id) => api.get(`/api/workouts/sessions/${id}`),
  startWorkout: (id) => api.post(`/api/workouts/sessions/${id}/start`),
  logSet: (id, data) => api.post(`/api/workouts/sessions/${id}/sets`, data),
  completeWorkout: (id, data) => api.post(`/api/workouts/sessions/${id}/complete`, data),
  getStats: () => api.get('/api/workouts/sessions/stats'),
  getPublicPlans: (params) => api.get('/api/workouts/plans', { params }),
  getPlanDetails: (id) => api.get(`/api/workouts/plans/${id}`),
  createPlan: (data) => api.post('/api/workouts/plans', data),
  updateSession: (id, data) => api.patch(`/api/workouts/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/api/workouts/sessions/${id}`),
  getMyPlans: () => api.get('/api/workouts/plans/mine'),
}

// ─── AI ──────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
  getConversations: () => api.get('/api/ai/conversations'),
  getConversation: (id) => api.get(`/api/ai/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/api/ai/conversations/${id}`),
  analyzeBody: (data) => api.post('/api/ai/analyze/body', data),
  generateMealPlan: (data) => api.post('/api/ai/generate/meal-plan', data),
  generateWorkoutPlan: (data) => api.post('/api/ai/generate/workout-plan', data),
  getMotivation: (data) => api.post('/api/ai/motivation', data),
  getModels: () => api.get('/api/ai/models'),
}

// ─── TRACKING ────────────────────────────────────────────────
export const trackingAPI = {
  logProgress: (data) => api.post('/api/tracking', data),
  getDashboard: () => api.get('/api/tracking/dashboard'),
  getStreak: () => api.get('/api/tracking/streak'),
  getWeeklyReport: () => api.get('/api/tracking/weekly'),
  getAchievements: () => api.get('/api/tracking/achievements'),
  getProgressRange: (params) => api.get('/api/tracking/range', { params }),
  getProgressByDate: (date) => api.get(`/api/tracking/${date}`),
}

// ─── HEALTH ──────────────────────────────────────────────────
export const healthAPI = {
  checkAll: () => api.get('/health/all'),
}
