import { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  const persist = (data) => {
    localStorage.setItem('auth', JSON.stringify(data))
    setAuth(data)
  }

  const login = async ({ email, password }) => {
    const { data } = await api.post('/users/login', { email, password })
    persist(data.msg)
    return data.msg
  }

  const register = async ({ username, email, password }) => {
    const { data } = await api.post('/users/register', { username, email, password })
    persist(data.msg)
    return data.msg
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setAuth(null)
  }

  const value = useMemo(
    () => ({
      user: auth,
      isAuthenticated: Boolean(auth?.token),
      roleId: auth?.role_id,
      login,
      register,
      logout,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
