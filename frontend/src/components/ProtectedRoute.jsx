import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './Spinner'

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, roleId, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
