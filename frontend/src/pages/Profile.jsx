import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import { ROLE_LABELS } from '../constants/roles'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/users/profile')
      .then(({ data }) => setProfile(data.msg))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10 px-4">
        <Alert>{error}</Alert>
      </div>
    )
  }

  if (!profile) return <Spinner />

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
            {profile.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile.username}</h1>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
              {ROLE_LABELS[profile.role_id]}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-y-3 text-sm">
          <dt className="text-slate-500">Correo</dt>
          <dd className="col-span-2 text-slate-900">{profile.email}</dd>

          <dt className="text-slate-500">Usuario ID</dt>
          <dd className="col-span-2 text-slate-900">{profile.uid}</dd>

          <dt className="text-slate-500">Miembro desde</dt>
          <dd className="col-span-2 text-slate-900">
            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
          </dd>
        </dl>
      </div>
    </div>
  )
}
