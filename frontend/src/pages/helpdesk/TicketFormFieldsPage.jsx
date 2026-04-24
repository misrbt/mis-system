import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Check,
  X,
  Type,
  AlignLeft,
  Hash,
  CalendarDays,
  ListChecks,
  ToggleLeft,
  Lock,
  User,
  Tag as TagIcon,
  Paperclip,
  Phone,
  Monitor,
  AlertTriangle,
} from 'lucide-react'
import Modal from '../../components/Modal'
import {
  fetchTicketFormFields,
  createTicketFormField,
  updateTicketFormField,
  deleteTicketFormField,
  toggleTicketFormFieldActive,
} from '../../services/ticketFormFieldService'
import { fetchTicketCategories } from '../../services/ticketCategoryService'

const FIELD_TYPES = [
  { value: 'text', label: 'Short text', icon: Type },
  { value: 'textarea', label: 'Long text', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: CalendarDays },
  { value: 'select', label: 'Dropdown', icon: ListChecks },
  { value: 'checkbox', label: 'Checkbox', icon: ToggleLeft },
]

/**
 * The set of fields baked into the public submit form. These always appear
 * regardless of what an admin configures — shown here so MIS doesn't add
 * duplicates as custom fields.
 */
const BUILT_IN_FIELDS = [
  { label: 'Requester (Employee)', type: 'Employee picker', required: true, icon: User },
  { label: 'Title', type: 'Short text', required: true, icon: Type },
  { label: 'Description', type: 'Long text', required: true, icon: AlignLeft },
  { label: 'Category', type: 'Dropdown', required: true, icon: TagIcon },
  { label: 'Priority', type: 'Dropdown (Low / Medium / High / Urgent)', required: true, icon: AlertTriangle },
  { label: 'Contact number', type: 'Short text', required: false, icon: Phone },
  { label: 'AnyDesk number', type: 'Short text', required: false, icon: Monitor },
  { label: 'Attachments', type: 'File upload (1–3 files, 5 MB each)', required: true, icon: Paperclip },
]

const EMPTY_FORM = {
  label: '',
  field_key: '',
  field_type: 'text',
  is_required: false,
  is_active: true,
  placeholder: '',
  help_text: '',
  sort_order: '',
  category_id: '',
  options: [{ value: '', label: '' }],
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .slice(0, 60)
}

function FieldTypeBadge({ type }) {
  const meta = FIELD_TYPES.find((t) => t.value === type) || FIELD_TYPES[0]
  const Icon = meta.icon
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  )
}

function TicketFormFieldsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [keyTouched, setKeyTouched] = useState(false)

  const { data: raw, isLoading } = useQuery({
    queryKey: ['ticket-form-fields', 'admin', showInactive],
    queryFn: async () =>
      (await fetchTicketFormFields(showInactive ? { all: 1 } : {})).data,
  })

  const { data: catsRaw } = useQuery({
    queryKey: ['ticket-categories', 'admin-all'],
    queryFn: async () => (await fetchTicketCategories({ all: 1 })).data,
    staleTime: 5 * 60 * 1000,
  })

  const fields = useMemo(() => normalizeList(raw), [raw])
  const categories = useMemo(() => normalizeList(catsRaw), [catsRaw])

  const filtered = useMemo(() => {
    if (!search.trim()) return fields
    const q = search.toLowerCase()
    return fields.filter(
      (f) =>
        f.label?.toLowerCase().includes(q) ||
        f.field_key?.toLowerCase().includes(q)
    )
  }, [fields, search])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket-form-fields'] })
  }

  const errorOf = (e) => {
    const first = e.response?.data?.errors
      ? Object.values(e.response.data.errors)[0]?.[0]
      : null
    return first || e.response?.data?.message || e.message
  }

  const createMutation = useMutation({
    mutationFn: (payload) => createTicketFormField(payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Field created', timer: 1600, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({ icon: 'error', title: 'Failed to create', text: errorOf(e) }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTicketFormField(id, payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Field updated', timer: 1600, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({ icon: 'error', title: 'Failed to update', text: errorOf(e) }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTicketFormField(id),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Field deleted', timer: 1500, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({ icon: 'error', title: 'Failed to delete', text: errorOf(e) }),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleTicketFormFieldActive(id),
    onSuccess: () => invalidate(),
    onError: (e) =>
      Swal.fire({ icon: 'error', title: 'Failed to toggle', text: errorOf(e) }),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setKeyTouched(false)
    setIsOpen(true)
  }

  const openEdit = (fld) => {
    setEditing(fld)
    setForm({
      label: fld.label || '',
      field_key: fld.field_key || '',
      field_type: fld.field_type || 'text',
      is_required: Boolean(fld.is_required),
      is_active: Boolean(fld.is_active),
      placeholder: fld.placeholder || '',
      help_text: fld.help_text || '',
      sort_order: fld.sort_order ?? '',
      category_id: fld.category_id ?? '',
      options:
        Array.isArray(fld.options) && fld.options.length > 0
          ? fld.options.map((o) => ({ value: o.value || '', label: o.label || '' }))
          : [{ value: '', label: '' }],
    })
    setKeyTouched(true) // don't auto-rewrite key when editing
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setKeyTouched(false)
  }

  const handleLabelChange = (val) => {
    setForm((f) => ({
      ...f,
      label: val,
      field_key: keyTouched ? f.field_key : slugify(val),
    }))
  }

  const handleTypeChange = (val) => {
    setForm((f) => ({
      ...f,
      field_type: val,
      options:
        val === 'select' && (!f.options || f.options.length === 0)
          ? [{ value: '', label: '' }]
          : f.options,
    }))
  }

  const updateOption = (idx, patch) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    }))
  }
  const addOption = () => {
    setForm((f) => ({ ...f, options: [...f.options, { value: '', label: '' }] }))
  }
  const removeOption = (idx) => {
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      label: form.label.trim(),
      field_key: form.field_key?.trim() || null,
      field_type: form.field_type,
      is_required: Boolean(form.is_required),
      is_active: Boolean(form.is_active),
      placeholder: form.placeholder?.trim() || null,
      help_text: form.help_text?.trim() || null,
      category_id: form.category_id === '' ? null : Number(form.category_id),
    }
    if (form.sort_order !== '' && form.sort_order !== null) {
      payload.sort_order = Number(form.sort_order)
    }
    if (form.field_type === 'select') {
      payload.options = form.options
        .filter((o) => o.value?.trim() && o.label?.trim())
        .map((o) => ({ value: o.value.trim(), label: o.label.trim() }))
      if (payload.options.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Dropdown needs options',
          text: 'Add at least one option with both value and label.',
        })
        return
      }
    } else {
      payload.options = null
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const confirmDelete = async (fld) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `Delete "${fld.label}"?`,
      text: 'Historical tickets keep any values they already stored under this field. Deactivate instead if you want to hide it without removing data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#dc2626',
    })
    if (!result.isConfirmed) return
    deleteMutation.mutate(fld.id)
  }

  const confirmToggle = async (fld) => {
    const verb = fld.is_active ? 'Deactivate' : 'Activate'
    const result = await Swal.fire({
      icon: 'question',
      title: `${verb} "${fld.label}"?`,
      text: fld.is_active
        ? 'End users will no longer see this field on the submit form.'
        : 'End users will see this field again on the submit form.',
      showCancelButton: true,
      confirmButtonText: `Yes, ${verb.toLowerCase()}`,
      confirmButtonColor: fld.is_active ? '#dc2626' : '#059669',
    })
    if (!result.isConfirmed) return
    toggleMutation.mutate(fld.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Fields</h1>
          <p className="text-sm text-slate-600">
            Configurable questions the end user answers on the ticket submit form.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Field
        </button>
      </div>

      {/* Built-in fields — read-only reference for MIS. */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-2 mb-3">
          <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Built-in fields</h2>
            <p className="text-xs text-slate-500">
              These fields are always on the submit form. You don't need to re-create them below —
              use custom fields only for extra, category-specific questions.
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {BUILT_IN_FIELDS.map((f) => {
            const Icon = f.icon
            return (
              <li
                key={f.label}
                className="flex items-start gap-2 p-2.5 bg-white border border-slate-200 rounded-lg"
              >
                <Icon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-800 truncate">{f.label}</span>
                    {f.required ? (
                      <span className="text-red-500 text-xs font-bold">*</span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{f.type}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

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
                placeholder="Search by label or key..."
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
            Show inactive fields
          </label>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs uppercase text-slate-500">
                <th className="px-4 py-2 text-left w-16">Order</th>
                <th className="px-4 py-2 text-left">Label</th>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-center">Required</th>
                <th className="px-4 py-2 text-center">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 italic">No form fields defined yet.</td></tr>
              ) : (
                filtered.map((fld) => (
                  <tr
                    key={fld.id}
                    className={`hover:bg-slate-50 ${!fld.is_active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{fld.sort_order}</td>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-slate-900">{fld.label}</div>
                      {fld.help_text ? (
                        <div className="text-[11px] text-slate-500 max-w-sm truncate" title={fld.help_text}>
                          {fld.help_text}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">{fld.field_key}</td>
                    <td className="px-4 py-2"><FieldTypeBadge type={fld.field_type} /></td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {fld.category?.name || <span className="italic text-slate-400">All categories</span>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fld.is_required ? (
                        <span className="text-red-600 font-bold">*</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fld.is_active ? (
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
                        <button onClick={() => confirmToggle(fld)} title={fld.is_active ? 'Deactivate' : 'Activate'} className="p-1.5 rounded hover:bg-amber-50 text-amber-600">
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(fld)} title="Edit" className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(fld)} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-600">
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

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={editing ? `Edit "${editing.label}"` : 'New Field'}
        size="lg"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                required
                maxLength={120}
                placeholder="e.g. Printer model"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field key
              </label>
              <input
                type="text"
                value={form.field_key}
                onChange={(e) => {
                  setKeyTouched(true)
                  setForm((f) => ({ ...f, field_key: e.target.value.toLowerCase() }))
                }}
                maxLength={64}
                placeholder="auto_from_label"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lower snake-case. Stable identifier stored on each ticket.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.field_type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category scope
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All categories (global)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Pick a category to show this field only when that category is selected.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={form.placeholder}
              onChange={(e) => setForm((f) => ({ ...f, placeholder: e.target.value }))}
              maxLength={200}
              placeholder="e.g. HP LaserJet Pro M404dn"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Help text
            </label>
            <textarea
              rows={2}
              value={form.help_text}
              onChange={(e) => setForm((f) => ({ ...f, help_text: e.target.value }))}
              maxLength={1000}
              placeholder="Shown beneath the field to guide the end user."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {form.field_type === 'select' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Dropdown options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {form.options.map((o, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={o.value}
                      onChange={(e) => updateOption(idx, { value: e.target.value })}
                      placeholder="value (stored)"
                      maxLength={60}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={o.label}
                      onChange={(e) => updateOption(idx, { label: e.target.value })}
                      placeholder="label (shown to user)"
                      maxLength={120}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={form.options.length === 1}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-30"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
              >
                <Plus className="w-3 h-3" />
                Add option
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            </div>
            <label className="inline-flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.is_required}
                onChange={(e) => setForm((f) => ({ ...f, is_required: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Required</span>
            </label>
            <label className="inline-flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Active (visible on submit form)</span>
            </label>
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
                  : 'Create field'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TicketFormFieldsPage
