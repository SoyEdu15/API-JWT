import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const AUTH_ENDPOINTS = ['/users/login', '/users/register', '/users/refresh', '/users/logout']

// El backend deja la sesion en cookies httpOnly; no hay token que guardar
// ni que mandar a mano.
export const api = axios.create({ baseURL, withCredentials: true })

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Patron double-submit CSRF: el backend valida que este header coincida
// con el cookie csrf_token, algo que un sitio atacante no puede falsificar.
api.interceptors.request.use((config) => {
  if (MUTATING_METHODS.has((config.method || '').toLowerCase())) {
    const csrfToken = readCookie('csrf_token')
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
  }
  return config
})

let refreshing = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path))

    if (response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true
      try {
        refreshing = refreshing || api.post('/users/refresh').finally(() => {
          refreshing = null
        })
        await refreshing
        return api(config)
      } catch {
        // Sin sesion valida (ni siquiera via refresh). Si la llamada pedia
        // silencio (ej. el chequeo inicial de sesion) no forzamos redirect.
        if (!config.silentAuth && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export const getErrorMessage = (error) =>
  error?.response?.data?.msg || 'Ocurrio un error inesperado. Intenta de nuevo.'
