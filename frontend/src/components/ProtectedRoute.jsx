import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, roleId } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
