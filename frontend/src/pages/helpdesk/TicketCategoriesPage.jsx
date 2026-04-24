import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Power,
  Search,
  Check,
  X,
} from 'lucide-react'
import Modal from '../../components/Modal'
import {
  fetchTicketCategories,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
  toggleTicketCategoryActive,
} from '../../services/ticketCategoryService'

const EMPTY_FORM = {
  name: '',
  description: '',
  is_active: true,
  sort_order: '',
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

function TicketCategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = create mode
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: raw, isLoading } = useQuery({
    queryKey: ['ticket-categories', 'admin', showInactive],
    queryFn: async () =>
      (await fetchTicketCategories(showInactive ? { all: 1 } : {})).data,
  })

  const categories = useMemo(() => normalizeList(raw), [raw])

  const filtered = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    )
  }, [categories, search])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket-categories'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload) => createTicketCategory(payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Category created', timer: 1600, showConfirmButton: false })
    },
    onError: (e) => {
      const first = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0]?.[0]
        : null
      Swal.fire({
        icon: 'error',
        title: 'Failed to create',
        text: first || e.response?.data?.message || e.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTicketCategory(id, payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Category updated', timer: 1600, showConfirmButton: false })
    },
    onError: (e) => {
      const first = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0]?.[0]
        : null
      Swal.fire({
        icon: 'error',
        title: 'Failed to update',
        text: first || e.response?.data?.message || e.message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTicketCategory(id),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Category deleted', timer: 1500, showConfirmButton: false })
    },
    onError: (e) => {
      Swal.fire({
        icon: 'error',
        title: 'Cannot delete',
        text: e.response?.data?.message || e.message,
      })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleTicketCategoryActive(id),
    onSuccess: () => invalidate(),
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Failed to toggle',
        text: e.response?.data?.message || e.message,
      }),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setIsOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      is_active: Boolean(cat.is_active),
      sort_order: cat.sort_order ?? '',
    })
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      is_active: Boolean(form.is_active),
    }
    if (form.sort_order !== '' && form.sort_order !== null) {
      payload.sort_order = Number(form.sort_order)
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const confirmDelete = async (cat) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `Delete "${cat.name}"?`,
      text: 'Categories used by existing tickets cannot be deleted — deactivate them instead.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#dc2626',
    })
    if (!result.isConfirmed) return
    deleteMutation.mutate(cat.id)
  }

  const confirmToggle = async (cat) => {
    const verb = cat.is_active ? 'Deactivate' : 'Activate'
    const result = await Swal.fire({
      icon: 'question',
      title: `${verb} "${cat.name}"?`,
      text: cat.is_active
        ? 'End users will no longer see this category on the submit form. Existing tickets keep their category.'
        : 'End users will see this category again on the submit form.',
      showCancelButton: true,
      confirmButtonText: `Yes, ${verb.toLowerCase()}`,
      confirmButtonColor: cat.is_active ? '#dc2626' : '#059669',
    })
    if (!result.isConfirmed) return
    toggleMutation.mutate(cat.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ticket Categories</h1>
          <p className="text-sm text-slate-600">
            Configure the categories end users pick from when submitting a ticket.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-semibold text-slate-600">Search</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description..."
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none pb-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            Show inactive categories
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs uppercase text-slate-500">
                <th className="px-4 py-2 text-left w-16">Order</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-center">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-slate-50 ${!cat.is_active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{cat.sort_order}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-600 max-w-md">
                      <p className="truncate" title={cat.description}>
                        {cat.description || <span className="italic text-slate-400">No description</span>}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {cat.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <X className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => confirmToggle(cat)}
                          title={cat.is_active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(cat)}
                          title="Delete (only if unused)"
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={editing ? `Edit "${editing.name}"` : 'New Category'}
        size="md"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              maxLength={100}
              placeholder="e.g. Printer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={1000}
              placeholder="Short description the end user sees when picking this category."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort order</label>
              <input
                type="number"
                min="0"
                max="65535"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                placeholder="Auto"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Lower = appears higher in the dropdown.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <label className="inline-flex items-center gap-2 h-[38px]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Active (visible on submit form)</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editing
                  ? 'Save changes'
                  : 'Create category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TicketCategoriesPage
