import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // El JWT vive en un cookie httpOnly (el frontend no puede leerlo), asi
  // que al cargar la app preguntamos al backend si hay sesion activa.
  useEffect(() => {
    api
      .get('/users/profile', { silentAuth: true })
      .then(({ data }) => setUser(data.msg))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const { data } = await api.post('/users/login', { email, password })
    setUser(data.msg)
    return data.msg
  }

  const register = async ({ username, email, password }) => {
    const { data } = await api.post('/users/register', { username, email, password })
    setUser(data.msg)
    return data.msg
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } finally {
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      roleId: user?.role_id,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
