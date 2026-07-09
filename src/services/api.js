// src/services/api.js
import axios from 'axios'


const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('budgetcam_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('budgetcam_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  register:           (data) => api.post('/auth/register', data),
  login:              (data) => api.post('/auth/login', data),
  getMe:              ()     => api.get('/auth/me'),
  updatePreferences:  (data) => api.put('/auth/preferences', data),
}

export const categorieApi = {
  getAll:       ()        => api.get('/categories'),
  getParType:   (type)    => api.get(`/categories/type/${type}`),
  create:       (data)    => api.post('/categories', data),
  delete:       (id)      => api.delete(`/categories/${id}`),
}

export const transactionApi = {
  getAll:   (page = 0, size = 20) => api.get('/transactions', { params: { page, size } }),
  create:   (data)                => api.post('/transactions', data),
  delete:   (id)                  => api.delete(`/transactions/${id}`),
}

export const budgetApi = {
  getAll:   (mois, annee)  => api.get('/budgets', { params: { mois, annee } }),
  create:   (data)         => api.post('/budgets', data),
  delete:   (id)           => api.delete(`/budgets/${id}`),
}

export const dashboardApi = {
  getStats: (mois, annee) => api.get('/dashboard/stats', { params: { mois, annee } }),
}
