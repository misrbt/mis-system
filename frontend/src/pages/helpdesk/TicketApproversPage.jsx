import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Power,
  Search,
  Check,
  X,
  Mail,
  Building2,
  Globe2,
} from 'lucide-react'
import Modal from '../../components/Modal'
import {
  fetchTicketApprovers,
  createTicketApprover,
  updateTicketApprover,
  deleteTicketApprover,
  toggleTicketApproverActive,
  fetchApproverManagers,
} from '../../services/ticketApproverService'
import { fetchBranchesRequest } from '../../services/branchService'

const EMPTY_FORM = {
  employee_id: '',
  name: '',
  email: '',
  branch_id: '',
  obo_id: '',
  is_global: false,
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

function TicketApproversPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: approversRaw, isLoading } = useQuery({
    queryKey: ['ticket-approvers', 'admin', showInactive],
    queryFn: async () =>
      (await fetchTicketApprovers(showInactive ? { all: 1 } : {})).data,
  })

  const { data: managersRaw } = useQuery({
    queryKey: ['ticket-approvers', 'managers'],
    queryFn: async () => (await fetchApproverManagers()).data,
  })

  const { data: branchesRaw } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn: async () => (await fetchBranchesRequest()).data,
  })

  const approvers = useMemo(() => normalizeList(approversRaw), [approversRaw])
  const managers = useMemo(() => normalizeList(managersRaw), [managersRaw])
  const branches = useMemo(() => normalizeList(branchesRaw), [branchesRaw])

  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === String(form.branch_id)),
    [branches, form.branch_id]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return approvers
    const q = search.toLowerCase()
    return approvers.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.branch?.branch_name?.toLowerCase().includes(q) ||
        a.obo?.name?.toLowerCase().includes(q)
    )
  }, [approvers, search])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket-approvers'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload) => createTicketApprover(payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Approver created', timer: 1600, showConfirmButton: false })
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
    mutationFn: ({ id, payload }) => updateTicketApprover(id, payload),
    onSuccess: () => {
      invalidate()
      closeModal()
      Swal.fire({ icon: 'success', title: 'Approver updated', timer: 1600, showConfirmButton: false })
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
    mutationFn: (id) => deleteTicketApprover(id),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Approver removed', timer: 1500, showConfirmButton: false })
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
    mutationFn: (id) => toggleTicketApproverActive(id),
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

  const openEdit = (approver) => {
    setEditing(approver)
    setForm({
      employee_id: approver.employee_id ?? '',
      name: approver.name || '',
      email: approver.email || '',
      branch_id: approver.branch_id ?? '',
      obo_id: approver.obo_id ?? '',
      is_global: Boolean(approver.is_global),
      is_active: Boolean(approver.is_active),
      sort_order: approver.sort_order ?? '',
    })
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  // When the admin picks a manager from the dropdown, auto-fill name,
  // branch, and OBO from that employee's record. Email must still be
  // typed in because employees don't store email addresses.
  const handleManagerSelect = (employeeId) => {
    if (!employeeId) {
      setForm((f) => ({ ...f, employee_id: '' }))
      return
    }
    const mgr = managers.find((m) => String(m.id) === String(employeeId))
    if (!mgr) {
      setForm((f) => ({ ...f, employee_id: employeeId }))
      return
    }
    setForm((f) => ({
      ...f,
      employee_id: employeeId,
      name: mgr.fullname || f.name,
      branch_id: mgr.branch_id ?? f.branch_id,
      obo_id: mgr.obo_id ?? '',
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing fields', text: 'Name and email are required.' })
      return
    }
    if (!form.is_global && !form.branch_id) {
      Swal.fire({ icon: 'error', title: 'Missing branch', text: 'Select a branch, or toggle "Global approver" to skip.' })
      return
    }
    const payload = {
      employee_id: form.employee_id ? Number(form.employee_id) : null,
      name: form.name.trim(),
      email: form.email.trim(),
      is_global: Boolean(form.is_global),
      branch_id: form.is_global ? null : Number(form.branch_id),
      obo_id: form.is_global || !form.obo_id ? null : Number(form.obo_id),
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

  const confirmDelete = async (approver) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `Remove ${approver.name}?`,
      text: 'High/Urgent tickets from this branch will be blocked until a replacement approver is configured.',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      confirmButtonColor: '#dc2626',
    })
    if (!result.isConfirmed) return
    deleteMutation.mutate(approver.id)
  }

  const confirmToggle = async (approver) => {
    const verb = approver.is_active ? 'Deactivate' : 'Activate'
    const result = await Swal.fire({
      icon: 'question',
      title: `${verb} ${approver.name}?`,
      text: approver.is_active
        ? 'This approver will no longer receive High/Urgent approval emails from this scope.'
        : 'This approver will resume receiving High/Urgent approval emails from this scope.',
      showCancelButton: true,
      confirmButtonText: `Yes, ${verb.toLowerCase()}`,
      confirmButtonColor: approver.is_active ? '#dc2626' : '#059669',
    })
    if (!result.isConfirmed) return
    toggleMutation.mutate(approver.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ticket Approvers</h1>
          <p className="text-sm text-slate-600">
            Route High/Urgent ticket approval emails to the right officer per branch (and optionally per OBO).
            Sub-branches fall back to their parent branch's approver automatically.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Approver
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
                placeholder="Search by name, email, branch, or OBO..."
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
            Show inactive approvers
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs uppercase text-slate-500">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Branch</th>
                <th className="px-4 py-2 text-left">OBO</th>
                <th className="px-4 py-2 text-center">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                    No approvers configured yet. Click "New Approver" to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={`hover:bg-slate-50 ${!a.is_active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{a.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {a.is_global ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Globe2 className="w-3 h-3" />
                          Global — all branches
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{a.branch?.branch_name || '—'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {a.is_global ? (
                        <span className="italic text-slate-400">—</span>
                      ) : (
                        a.obo?.name || <span className="italic text-slate-400">Branch-level</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {a.is_active ? (
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
                          onClick={() => confirmToggle(a)}
                          title={a.is_active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(a)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(a)}
                          title="Remove"
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
        title={editing ? `Edit ${editing.name}` : 'New Approver'}
        size="lg"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Global approver toggle — top of form since it changes what
              fields are required below. */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_global}
                onChange={(e) => setForm((f) => ({ ...f, is_global: e.target.checked }))}
                className="w-4 h-4 mt-0.5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-semibold text-amber-900">Global approver</span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Receives the email for <strong>every</strong> High/Urgent ticket, regardless of branch.
                  Use this for senior officers (President, CEO, VP) who should be CC'd on all approval requests.
                </p>
              </div>
            </label>
          </div>

          {/* Manager picker — only relevant for branch-scoped approvers */}
          {!form.is_global && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pick a manager <span className="text-slate-400 font-normal">(optional — auto-fills name, branch, OBO)</span>
              </label>
              <select
                value={form.employee_id || ''}
                onChange={(e) => handleManagerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">— Select a manager —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullname}
                    {m.branch?.branch_name ? ` · ${m.branch.branch_name}` : ''}
                    {m.obo?.name ? ` · ${m.obo.name}` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Pulled from employees whose position title contains "Manager". You can also fill the form manually.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                maxLength={150}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                maxLength={190}
                placeholder="e.g. juan@rbtbank.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {!form.is_global && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.branch_id || ''}
                  onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value, obo_id: '' }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">— Select a branch —</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  OBO <span className="text-slate-400 font-normal">(optional — leave empty for branch-level rule)</span>
                </label>
                <select
                  value={form.obo_id || ''}
                  onChange={(e) => setForm((f) => ({ ...f, obo_id: e.target.value }))}
                  disabled={!selectedBranch || !(selectedBranch?.obos?.length)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">— Branch-level (all OBOs) —</option>
                  {(selectedBranch?.obos || []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <p className="text-[11px] text-slate-400 mt-1">Display order in the admin list only. Doesn't affect routing.</p>
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
                <span className="text-sm text-slate-700">Active (receives approval emails)</span>
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
                  : 'Create approver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TicketApproversPage
