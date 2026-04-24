import { useMemo, useRef, useState } from 'react'
import { Paperclip, X, Building2, Users, Briefcase, MapPin, Phone, Monitor } from 'lucide-react'
import { TICKET_STATUSES, TICKET_PRIORITIES } from './ticketConstants'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function TicketForm({
  formData,
  employees = [],
  assignees = [],
  categories = [],
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  mode = 'create',
  attachments,
  onAttachmentsChange,
}) {
  const fileInputRef = useRef(null)
  const [employeeSearch, setEmployeeSearch] = useState('')

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return employees.slice(0, 200)
    return employees
      .filter(
        (e) =>
          e.fullname?.toLowerCase().includes(q) ||
          e.branch?.branch_name?.toLowerCase().includes(q) ||
          e.department?.name?.toLowerCase().includes(q) ||
          e.position?.title?.toLowerCase().includes(q)
      )
      .slice(0, 200)
  }, [employees, employeeSearch])

  const selectedEmployee = useMemo(() => {
    if (!formData.requester_employee_id) return null
    return (
      employees.find((e) => String(e.id) === String(formData.requester_employee_id)) || null
    )
  }, [employees, formData.requester_employee_id])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    onAttachmentsChange?.([...(attachments || []), ...files])
    // Reset so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (index) => {
    const next = [...(attachments || [])]
    next.splice(index, 1)
    onAttachmentsChange?.(next)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          maxLength={255}
          placeholder="Short summary of the issue"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          required
          rows={4}
          placeholder="Describe the concern in detail"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Contact Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number || ''}
              onChange={onChange}
              maxLength={50}
              placeholder="e.g. +63 917 123 4567 or local 1234"
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            AnyDesk Number
          </label>
          <div className="relative">
            <Monitor className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="anydesk_number"
              value={formData.anydesk_number || ''}
              onChange={onChange}
              maxLength={50}
              placeholder="e.g. 123 456 789"
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            value={formData.category_id || ''}
            onChange={onChange}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={onChange}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Requester (Employee) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Search by name, branch, section, or position..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            name="requester_employee_id"
            value={formData.requester_employee_id}
            onChange={onChange}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select employee</option>
            {filteredEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullname}
                {e.branch?.branch_name ? ` — ${e.branch.branch_name}` : ''}
              </option>
            ))}
          </select>

          {selectedEmployee && (
            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-900">
                <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold">Branch:</span>
                <span className="truncate">
                  {selectedEmployee.branch?.branch_name || '—'}
                </span>
              </div>
              {selectedEmployee.obo?.name && (
                <div className="flex items-center gap-2 text-indigo-900">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-semibold">OBO:</span>
                  <span className="truncate">{selectedEmployee.obo.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-indigo-900">
                <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold">Section:</span>
                <span className="truncate">
                  {selectedEmployee.department?.name || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-indigo-900">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold">Position:</span>
                <span className="truncate">
                  {selectedEmployee.position?.title || '—'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To (MIS Staff)</label>
          <select
            name="assigned_to_user_id"
            value={formData.assigned_to_user_id}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Unassigned</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date || ''}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {mode === 'create' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                Add files
              </button>
              <span className="text-xs text-slate-500">
                {(attachments || []).length} file
                {(attachments || []).length === 1 ? '' : 's'} selected
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
              />
            </div>
          </div>
        )}
      </div>

      {mode === 'create' && (attachments || []).length > 0 && (
        <ul className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
          {(attachments || []).map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate text-slate-700">{file.name}</span>
                <span className="text-xs text-slate-500 shrink-0">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="p-1 text-slate-500 hover:text-red-600"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Resolution Summary</label>
        <textarea
          name="resolution_summary"
          value={formData.resolution_summary || ''}
          onChange={onChange}
          rows={2}
          placeholder="Fill when resolving or closing the ticket"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Ticket' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default TicketForm
