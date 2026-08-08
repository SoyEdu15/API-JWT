import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import { Alert } from '../components/Alert'
import { PasswordInput } from '../components/PasswordInput'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/profile')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-slate-500 mb-6">Regístrate como cliente de la clínica.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de usuario</label>
            <input
              type="text"
              name="username"
              required
              minLength={3}
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="eduard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="tu@correo.com"
            />
          </div>

          <PasswordInput
            label="Contraseña"
            name="password"
            required
            minLength={8}
            pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
            title="Mínimo 8 caracteres, con al menos una letra y un número"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres, con letra y número"
          />

          <Alert>{error}</Alert>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-600 font-medium">
            Ingresa
          </Link>
        </p>
      </div>
    </div>
  )
}
