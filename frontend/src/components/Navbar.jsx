import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES, ROLE_LABELS } from '../constants/roles'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export function Navbar() {
  const { isAuthenticated, roleId, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="font-bold text-lg text-indigo-600">
          🐾 API-JWT Clinic
        </NavLink>

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <NavLink to="/pets" className={linkClass}>
              Mascotas
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink to="/profile" className={linkClass}>
              Perfil
            </NavLink>
          )}

          {isAuthenticated && roleId === ROLES.ADMIN && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200">
              <span className="text-sm text-slate-500 hidden sm:inline">
                {user?.username} · {ROLE_LABELS[roleId]}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
