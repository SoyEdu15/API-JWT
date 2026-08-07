import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import { ROLES, ROLE_LABELS } from '../constants/roles'

export default function Admin() {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [busyUid, setBusyUid] = useState(null)

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data.msg)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleRole = async (user) => {
    setBusyUid(user.uid)
    setError('')
    try {
      const endpoint =
        user.role_id === ROLES.USER
          ? `/users/update-role-vet/${user.uid}`
          : `/users/update-role-user/${user.uid}`
      await api.put(endpoint)
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyUid(null)
    }
  }

  if (!users) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Panel de Administración</h1>
      <p className="text-sm text-slate-500 mb-6">Gestiona los roles de clientes y veterinarios.</p>

      <Alert>{error}</Alert>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) => u.role_id !== ROLES.ADMIN)
              .map((user) => (
                <tr key={user.uid} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{user.username}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                      {ROLE_LABELS[user.role_id]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleRole(user)}
                      disabled={busyUid === user.uid}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {user.role_id === ROLES.USER ? 'Promover a Veterinario' : 'Degradar a Cliente'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {users.filter((u) => u.role_id !== ROLES.ADMIN).length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No hay usuarios registrados todavía.</p>
        )}
      </div>
    </div>
  )
}
