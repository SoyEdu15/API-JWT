import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="max-w-3xl mx-auto mt-16 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        🐾 Clínica Veterinaria <span className="text-indigo-600">API-JWT</span>
      </h1>
      <p className="text-slate-500 mb-8">
        Proyecto full-stack de autenticación y autorización con JWT: backend en Node.js/Express/PostgreSQL
        y frontend en React, con roles de administrador, veterinario y cliente.
      </p>

      <div className="flex justify-center gap-3">
        <Link
          to="/pets"
          className="bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-indigo-700"
        >
          Ver mascotas
        </Link>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="border border-slate-300 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Crear cuenta
          </Link>
        )}
      </div>
    </div>
  )
}
