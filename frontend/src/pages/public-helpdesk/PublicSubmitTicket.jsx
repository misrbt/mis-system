import { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Paperclip,
  X,
  Building2,
  Users,
  Briefcase,
  MapPin,
  ArrowLeft,
  Send,
  Search,
  User,
  Check,
  Edit2,
  Phone,
  Monitor,
  CheckCircle2,
  Clock,
  Copy,
  ClipboardCheck,
  Plus,
} from 'lucide-react'
import { TICKET_PRIORITIES } from '../../components/helpdesk/ticketConstants'
import {
  fetchPublicEmployees,
  fetchPublicCategories,
  submitPublicTicket,
} from '../../services/publicTicketService'
import { fetchPublicFormFields } from '../../services/ticketFormFieldService'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

const INITIAL_FORM = {
  requester_employee_id: '',
  title: '',
  description: '',
  contact_number: '',
  anydesk_number: '',
  category_id: '',
  priority: 'Medium',
  priority_justification: '',
}

const APPROVAL_PRIORITIES = ['High', 'Urgent']

function PublicSubmitTicket() {
  const fileInputRef = useRef(null)
  const searchInputRef = useRef(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [attachments, setAttachments] = useState([])
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const [submittedTicket, setSubmittedTicket] = useState(null)
  const [copied, setCopied] = useState(false)

  const { data: employeesRaw, isLoading: loadingEmployees } = useQuery({
    queryKey: ['public-helpdesk-employees'],
    queryFn: async () => (await fetchPublicEmployees()).data,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categoriesRaw } = useQuery({
    queryKey: ['public-helpdesk-categories'],
    queryFn: async () => (await fetchPublicCategories()).data,
    staleTime: 10 * 60 * 1000,
  })

  const employees = useMemo(() => normalizeList(employeesRaw), [employeesRaw])
  const categories = useMemo(() => normalizeList(categoriesRaw), [categoriesRaw])

  const suggestions = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (q.length < 2) return []
    return employees
      .filter(
        (e) =>
          e.fullname?.toLowerCase().includes(q) ||
          e.branch?.branch_name?.toLowerCase().includes(q) ||
          e.department?.name?.toLowerCase().includes(q) ||
          e.position?.title?.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [employees, employeeSearch])

  const selectedEmployee = useMemo(() => {
    if (!form.requester_employee_id) return null
    return employees.find((e) => String(e.id) === String(form.requester_employee_id)) || null
  }, [employees, form.requester_employee_id])

  const selectedCategory = useMemo(() => {
    if (!form.category_id) return null
    return categories.find((c) => String(c.id) === String(form.category_id)) || null
  }, [categories, form.category_id])

  // --- Configurable custom fields ----------------------------------------
  const { data: formFieldsRaw = [] } = useQuery({
    queryKey: ['public-form-fields', form.category_id || null],
    queryFn: async () => {
      const params = form.category_id ? { category_id: form.category_id } : {}
      return (await fetchPublicFormFields(params)).data?.data || []
    },
  })
  const formFields = useMemo(
    () => (Array.isArray(formFieldsRaw) ? formFieldsRaw : []),
    [formFieldsRaw]
  )
  const [customValues, setCustomValues] = useState({})
  const setCustomValue = (key, value) =>
    setCustomValues((prev) => ({ ...prev, [key]: value }))

  // Focus search on mount (when nobody is picked yet)
  useEffect(() => {
    if (!selectedEmployee) {
      searchInputRef.current?.focus()
    }
  }, [selectedEmployee])

  const handleSearchChange = (e) => {
    setEmployeeSearch(e.target.value)
    setActiveSuggestion(0)
  }

  const submitMutation = useMutation({
    mutationFn: (payload) => submitPublicTicket(payload),
    onSuccess: (res) => {
      const data = res?.data?.data
      if (data?.ticket_number) {
        setSubmittedTicket(data)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    onError: (error) => {
      const apiErrors = error.response?.data?.errors
      const firstError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: firstError || error.response?.data?.message || error.message,
      })
    },
  })

  const handleCopy = async () => {
    if (!submittedTicket?.ticket_number) return
    try {
      await navigator.clipboard.writeText(submittedTicket.ticket_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select + execCommand for older browsers
      const temp = document.createElement('textarea')
      temp.value = submittedTicket.ticket_number
      document.body.appendChild(temp)
      temp.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        /* no-op */
      }
      document.body.removeChild(temp)
    }
  }

  const handleSubmitAnother = () => {
    setSubmittedTicket(null)
    setForm(INITIAL_FORM)
    setAttachments([])
    setCustomValues({})
    setEmployeeSearch('')
    setCopied(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const selectEmployee = (employee) => {
    setForm((prev) => ({ ...prev, requester_employee_id: employee.id }))
    setEmployeeSearch('')
  }

  const clearEmployee = () => {
    setForm((prev) => ({ ...prev, requester_employee_id: '' }))
    setEmployeeSearch('')
    // Defer focus until the input is rendered again
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const handleSearchKeyDown = (e) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectEmployee(suggestions[activeSuggestion])
    } else if (e.key === 'Escape') {
      setEmployeeSearch('')
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const next = [...attachments, ...files].slice(0, 3)
    setAttachments(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (index) => {
    const next = [...attachments]
    next.splice(index, 1)
    setAttachments(next)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const needsJustification = APPROVAL_PRIORITIES.includes(form.priority)
    submitMutation.mutate({
      ...form,
      // Only send justification for High/Urgent — strip it otherwise so we
      // don't persist dead text if the user flipped priority mid-compose.
      priority_justification: needsJustification
        ? form.priority_justification?.trim() || ''
        : '',
      attachments,
      // Server validates values against the active field definitions and
      // rejects anything that doesn't match (required/type/options).
      custom_fields: JSON.stringify(customValues),
    })
  }

  // Success state — shown after the ticket is submitted. Replaces the form entirely.
  if (submittedTicket) {
    const pendingApproval = submittedTicket.approval_status === 'pending'
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 text-center">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
              pendingApproval
                ? 'bg-amber-100 text-amber-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {pendingApproval ? <Clock className="w-9 h-9" /> : <CheckCircle2 className="w-9 h-9" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {pendingApproval ? 'Awaiting approval' : 'Ticket submitted!'}
          </h2>
          {pendingApproval ? (
            <div className="mt-3 mx-auto max-w-md">
              <p className="text-sm text-slate-700">
                Because you flagged this as <span className="font-semibold">{submittedTicket.priority || 'high/urgent'}</span> priority,
                it needs to be reviewed by an officer before it's forwarded to the MIS team.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                The approver has been notified by email. You'll be able to see the
                decision on the track page using the ticket number below.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              The MIS team has received your concern and will start working on it shortly.
            </p>
          )}

          {/* Ticket-number card with copy button */}
          <div className="mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 sm:p-6">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
              Your ticket number
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-indigo-700 tracking-wide select-all">
                {submittedTicket.ticket_number}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Save this number — you'll need it to track your ticket's status.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to={`/public-helpdesk/track?ticket=${encodeURIComponent(submittedTicket.ticket_number)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Search className="w-4 h-4" />
              Track this ticket
            </Link>
            <button
              type="button"
              onClick={handleSubmitAnother}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Submit another
            </button>
            <Link
              to="/public-helpdesk"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-full sm:w-auto justify-center"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/public-helpdesk"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* STEP 1 — Employee search gate */}
      {!selectedEmployee && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Who are you?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Type your name to find yourself in the employee directory.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={employeeSearch}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                disabled={loadingEmployees}
                placeholder={
                  loadingEmployees
                    ? 'Loading directory...'
                    : 'Start typing your name, branch, or position...'
                }
                className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <ul className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                {suggestions.map((e, idx) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSuggestion(idx)}
                      onClick={() => selectEmployee(e)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                        idx === activeSuggestion ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-slate-900">{e.fullname}</div>
                      <div className="mt-0.5 text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
                        {e.branch?.branch_name && <span>{e.branch.branch_name}</span>}
                        {e.obo?.name && <span>• {e.obo.name}</span>}
                        {e.department?.name && <span>• {e.department.name}</span>}
                        {e.position?.title && <span>• {e.position.title}</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {employeeSearch.trim().length >= 2 && suggestions.length === 0 && !loadingEmployees && (
              <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 text-center">
                No employees match "<span className="font-semibold">{employeeSearch}</span>".
                Try a different name or branch.
              </div>
            )}

            {employeeSearch.trim().length < 2 && (
              <p className="mt-3 text-xs text-slate-500 text-center">
                Tip: use ↑ / ↓ to navigate, Enter to select.
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 — Ticket form (revealed after employee is picked) */}
      {selectedEmployee && (
        <div className="space-y-4">
          {/* Selected-employee banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                  Submitting as
                </div>
                <div className="font-bold text-slate-900 truncate">
                  {selectedEmployee.fullname}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                  {selectedEmployee.branch?.branch_name && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {selectedEmployee.branch.branch_name}
                    </span>
                  )}
                  {selectedEmployee.obo?.name && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedEmployee.obo.name}
                    </span>
                  )}
                  {selectedEmployee.department?.name && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {selectedEmployee.department.name}
                    </span>
                  )}
                  {selectedEmployee.position?.title && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {selectedEmployee.position.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearEmployee}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
            >
              <Edit2 className="w-3 h-3" />
              Change
            </button>
          </div>

          {/* Ticket form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              Tell us what's wrong
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Provide as much detail as you can so we can help you faster.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Short Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="e.g. Cannot connect to the printer"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Describe the Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder="What happened? What were you trying to do? Any error messages?"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Number{' '}
                    <span className="text-xs font-normal text-slate-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="contact_number"
                      value={form.contact_number}
                      onChange={handleChange}
                      maxLength={50}
                      placeholder="e.g. +63 917 123 4567 or local 1234"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    So our IT team can reach you if they need more info.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    AnyDesk Number{' '}
                    <span className="text-xs font-normal text-slate-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Monitor className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="anydesk_number"
                      value={form.anydesk_number}
                      onChange={handleChange}
                      maxLength={50}
                      placeholder="e.g. 123 456 789"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Include if you need remote-desktop assistance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
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
                  {selectedCategory?.description && (
                    <p className="mt-1.5 text-xs text-slate-500 italic">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
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
              </div>

              {/* Justification — only shown (and required) for High/Urgent.
                  Goes into the approver's review email so they decide with full context. */}
              {APPROVAL_PRIORITIES.includes(form.priority) && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Why is this {form.priority.toLowerCase()} priority?{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-amber-800 mb-2">
                    {form.priority} tickets need approval before they reach the IT team. Briefly explain the business impact — what's blocked, who's affected, and why it can't wait.
                  </p>
                  <textarea
                    name="priority_justification"
                    value={form.priority_justification}
                    onChange={handleChange}
                    required
                    rows={3}
                    maxLength={1000}
                    placeholder="e.g. Teller terminal at Main Branch is offline, 5 customers waiting, cannot process cash withdrawals."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-amber-700 mt-1">
                    {form.priority_justification.length}/1000
                  </p>
                </div>
              )}

              {/* Configurable extra questions — admin manages via /helpdesk/form-fields */}
              {formFields.length > 0 && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Additional questions</h3>
                    <p className="text-xs text-slate-500">
                      Please answer the following so our IT team can assist faster.
                    </p>
                  </div>
                  {formFields.map((fld) => {
                    const val = customValues[fld.field_key] ?? ''
                    const required = Boolean(fld.is_required)
                    const id = `cf-${fld.field_key}`
                    return (
                      <div key={fld.id}>
                        <label
                          htmlFor={id}
                          className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                          {fld.label}
                          {required ? <span className="text-red-500"> *</span> : null}
                        </label>
                        {fld.field_type === 'textarea' ? (
                          <textarea
                            id={id}
                            value={val}
                            onChange={(e) => setCustomValue(fld.field_key, e.target.value)}
                            required={required}
                            rows={3}
                            maxLength={5000}
                            placeholder={fld.placeholder || ''}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : fld.field_type === 'select' ? (
                          <select
                            id={id}
                            value={val}
                            onChange={(e) => setCustomValue(fld.field_key, e.target.value)}
                            required={required}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">— Select —</option>
                            {(fld.options || []).map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : fld.field_type === 'number' ? (
                          <input
                            id={id}
                            type="number"
                            value={val}
                            onChange={(e) => setCustomValue(fld.field_key, e.target.value)}
                            required={required}
                            placeholder={fld.placeholder || ''}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : fld.field_type === 'date' ? (
                          <input
                            id={id}
                            type="date"
                            value={val}
                            onChange={(e) => setCustomValue(fld.field_key, e.target.value)}
                            required={required}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : fld.field_type === 'checkbox' ? (
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              id={id}
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) =>
                                setCustomValue(fld.field_key, e.target.checked)
                              }
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span>
                              {fld.placeholder || 'Yes'}
                              {required ? <span className="text-red-500"> *</span> : null}
                            </span>
                          </label>
                        ) : (
                          <input
                            id={id}
                            type="text"
                            value={val}
                            onChange={(e) => setCustomValue(fld.field_key, e.target.value)}
                            required={required}
                            maxLength={500}
                            placeholder={fld.placeholder || ''}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        )}
                        {fld.help_text ? (
                          <p className="text-[11px] text-slate-500 mt-1">{fld.help_text}</p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Attachments <span className="text-red-500">*</span>{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (at least 1 screenshot required — up to 3 files, 5 MB each)
                  </span>
                </label>
                <div
                  className={[
                    'flex items-center gap-2 flex-wrap border-2 border-dashed rounded-lg p-3 transition-colors',
                    attachments.length === 0
                      ? 'border-red-300 bg-red-50'
                      : 'border-emerald-300 bg-emerald-50',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={attachments.length >= 3}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    {attachments.length === 0 ? 'Attach screenshot' : 'Add more'}
                  </button>
                  <span
                    className={`text-xs ${
                      attachments.length === 0 ? 'text-red-700 font-semibold' : 'text-emerald-700'
                    }`}
                  >
                    {attachments.length === 0
                      ? 'No attachment yet — please attach a screenshot of the issue.'
                      : `${attachments.length}/3 file${attachments.length === 1 ? '' : 's'} attached`}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  />
                </div>

                {attachments.length > 0 && (
                  <ul className="mt-3 space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    {attachments.map((file, idx) => (
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  to="/public-helpdesk"
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitMutation.isPending || attachments.length === 0}
                  title={attachments.length === 0 ? 'Attach at least one screenshot first' : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicSubmitTicket
