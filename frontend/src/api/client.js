import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (raw) {
    const { token } = JSON.parse(raw)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getErrorMessage = (error) =>
  error?.response?.data?.msg || 'Ocurrio un error inesperado. Intenta de nuevo.'
