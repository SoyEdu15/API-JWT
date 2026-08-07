import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-24 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
      <p className="text-slate-500 mb-6">La página que buscas no existe.</p>
      <Link to="/" className="text-indigo-600 font-medium">
        Volver al inicio
      </Link>
    </div>
  )
}
