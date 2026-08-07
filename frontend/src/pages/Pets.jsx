import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/roles'

const emptyForm = { name: '', species: '', breed: '', age: '', owner_name: '', image_url: '' }

export default function Pets() {
  const { isAuthenticated, roleId } = useAuth()
  const canManage = isAuthenticated && (roleId === ROLES.VET || roleId === ROLES.ADMIN)

  const [pets, setPets] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const loadPets = async (targetPage = page) => {
    try {
      const { data } = await api.get('/pets', { params: { page: targetPage, limit: 6 } })
      setPets(data.msg)
      setPagination(data.pagination)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadPets(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : null }
      if (editingId) {
        await api.put(`/pets/${editingId}`, payload)
      } else {
        await api.post('/pets', payload)
      }
      resetForm()
      loadPets(page)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleEdit = (pet) => {
    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      age: pet.age ?? '',
      owner_name: pet.owner_name || '',
      image_url: pet.image_url || '',
    })
    setEditingId(pet.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta mascota?')) return
    setError('')
    try {
      await api.delete(`/pets/${id}`)
      loadPets(page)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (!pets) return <Spinner />

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mascotas</h1>
          <p className="text-sm text-slate-500">
            {pagination?.count ?? 0} mascotas registradas en la clínica
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            {showForm ? 'Cancelar' : '+ Nueva mascota'}
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      {canManage && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            name="name"
            required
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="species"
            required
            placeholder="Especie (Perro, Gato...)"
            value={form.species}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="breed"
            placeholder="Raza"
            value={form.breed}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="age"
            type="number"
            min="0"
            placeholder="Edad"
            value={form.age}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="owner_name"
            placeholder="Dueño"
            value={form.owner_name}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="image_url"
            placeholder="URL de imagen (opcional)"
            value={form.image_url}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
            >
              {editingId ? 'Guardar cambios' : 'Crear mascota'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              {pet.image_url ? (
                <img src={pet.image_url} alt={pet.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl">🐾</span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-slate-900">{pet.name}</h3>
              <p className="text-sm text-slate-500">
                {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
              </p>
              <p className="text-sm text-slate-500">Edad: {pet.age ?? '—'}</p>
              {pet.owner_name && (
                <p className="text-sm text-slate-500">Dueño: {pet.owner_name}</p>
              )}

              {canManage && (
                <div className="mt-auto pt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="flex-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="flex-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pets.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-10">No hay mascotas registradas.</p>
      )}

      {pagination && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={!pagination.prevPage}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.nextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
