import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  Users,
  UserPlus,
  RefreshCw,
  KeyRound,
  Mail,
  Lock,
  User,
  WifiOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  listAmlaUsers,
  createAmlaUser,
  updateAmlaUser,
  deleteAmlaUser,
  resetAmlaPassword,
} from '../../services/amlaService'

// ─── Reset Password Modal ─────────────────────────────────────────────

function ResetPasswordModal({ user, onClose, onSubmit, isSubmitting }) {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Number', valid: /\d/.test(password) },
    { label: 'Special character (@$!%*?&)', valid: /[@$!%*?&]/.test(password) },
  ]

  const validate = () => {
    const errs = {}
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Must be at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password))
      errs.password = 'Must include uppercase, lowercase, number, and special character'
    if (password !== passwordConfirmation) errs.password_confirmation = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ password, password_confirmation: passwordConfirmation })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set new password for <strong>{user?.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-800 font-medium">All existing sessions will be revoked</span>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }}
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="New password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

            {password && (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle className={`w-3 h-3 flex-shrink-0 ${check.valid ? 'text-green-500' : 'text-slate-300'}`} />
                    <span className={`text-[11px] ${check.valid ? 'text-green-600' : 'text-slate-400'}`}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => { setPasswordConfirmation(e.target.value); if (errors.password_confirmation) setErrors(p => ({ ...p, password_confirmation: undefined })) }}
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="Confirm password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <><KeyRound className="w-4 h-4" /> Reset Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── User Form Modal ──────────────────────────────────────────────────

function UserFormModal({ user, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(user)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.email.trim()) errs.email = 'Email is required'
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) errs.email = 'Invalid email address'

    if (!isEdit) {
      if (!formData.password) errs.password = 'Password is required'
      else if (formData.password.length < 8) errs.password = 'Must be at least 8 characters'
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password))
        errs.password = 'Must include uppercase, lowercase, number, and special character'
      if (formData.password !== formData.password_confirmation) errs.password_confirmation = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = { name: formData.name.trim(), email: formData.email.trim() }
    if (!isEdit) {
      payload.password = formData.password
      payload.password_confirmation = formData.password_confirmation
    }
    onSubmit(payload)
  }

  const passwordChecks = [
    { label: 'At least 8 characters', valid: formData.password?.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: 'Number', valid: /\d/.test(formData.password) },
    { label: 'Special character (@$!%*?&)', valid: /[@$!%*?&]/.test(formData.password) },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[10vh] px-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit User' : 'Create AMLA User'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update user details in the AMLA system' : 'Create a new user in the AMLA Compliance system'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* System Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs text-emerald-800 font-medium">AMLA Compliance System Account</span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => update('name', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Juan Dela Cruz"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="user@rbtbank.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password (create only) */}
          {!isEdit && (
            <>
              <div className="border-t border-slate-200 pt-2">
                <p className="text-xs text-slate-500">Set the initial password for this user</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="Create a strong password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

                {formData.password && (
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle className={`w-3 h-3 flex-shrink-0 ${check.valid ? 'text-green-500' : 'text-slate-300'}`} />
                        <span className={`text-[11px] ${check.valid ? 'text-green-600' : 'text-slate-400'}`}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="Confirm password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <>{isEdit ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} {isEdit ? 'Save Changes' : 'Create User'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Sort Icon Helper ─────────────────────────────────────────────────

function SortIcon({ column, sortBy, sortOrder }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
  return sortOrder === 'asc'
    ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
}

// ─── Main AMLA Users Component ────────────────────────────────────────

function AmlaUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [resetUser, setResetUser] = useState(null)

  // Table state
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['amla-users'],
    queryFn: async () => {
      const response = await listAmlaUsers()
      return response.data?.users || []
    },
    retry: 1,
  })

  const users = usersData || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => createAmlaUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amla-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      Swal.fire({ icon: 'success', title: 'User Created', text: 'New AMLA user has been created successfully.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.message || 'Failed to create user'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => updateAmlaUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amla-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      Swal.fire({ icon: 'success', title: 'User Updated', text: 'User details have been saved.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.message || 'Failed to update user'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteAmlaUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amla-users'] })
      Swal.fire({ icon: 'success', title: 'User Deleted', text: 'User has been removed from the AMLA system.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete user' })
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, data }) => resetAmlaPassword(id, data),
    onSuccess: () => {
      setResetUser(null)
      Swal.fire({ icon: 'success', title: 'Password Reset', text: 'Password has been reset and all sessions revoked.', timer: 2500, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.message || 'Failed to reset password'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  const handleDelete = useCallback((user) => {
    Swal.fire({
      title: 'Delete User?',
      html: `This will permanently remove <strong>${user.name}</strong> and revoke all their tokens.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(user.id)
    })
  }, [deleteMutation])

  // Sort handler
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }, [sortBy])

  // Filter, sort, paginate
  const processedData = useMemo(() => {
    // 1. Filter
    const q = searchQuery.toLowerCase()
    let filtered = users
    if (q) {
      filtered = users.filter((user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        String(user.id).includes(q)
      )
    }

    // 2. Sort
    const sorted = [...filtered].sort((a, b) => {
      let valA, valB
      switch (sortBy) {
        case 'name':
          valA = (a.name || '').toLowerCase()
          valB = (b.name || '').toLowerCase()
          break
        case 'email':
          valA = (a.email || '').toLowerCase()
          valB = (b.email || '').toLowerCase()
          break
        case 'created_at':
          valA = a.created_at || ''
          valB = b.created_at || ''
          break
        case 'id':
          valA = a.id
          valB = b.id
          break
        default:
          valA = (a.name || '').toLowerCase()
          valB = (b.name || '').toLowerCase()
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // 3. Paginate
    const totalItems = sorted.length
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * rowsPerPage
    const paginatedUsers = sorted.slice(start, start + rowsPerPage)

    return { filtered: sorted, paginatedUsers, totalItems, totalPages, safePage, start }
  }, [users, searchQuery, sortBy, sortOrder, currentPage, rowsPerPage])

  const { paginatedUsers, totalItems, totalPages, safePage, start } = processedData

  // Reset page when search changes
  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (users.length === 0) return
    const headers = ['ID', 'Name', 'Email', 'Created At']
    const rows = processedData.filtered.map(u => [
      u.id,
      u.name || '',
      u.email || '',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    ])
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `amla-users-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [users, processedData.filtered])

  const lastSynced = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'

  // ─── Main view ──────────────────────────────────────────────────────
  return (
    <>
      {/* Action header — always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">AMLA Compliance Users</h2>
          <p className="text-slate-500 text-sm">Manage user accounts on the AMLA Compliance system</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={users.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => { setEditingUser(null); setIsModalOpen(true) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all font-semibold text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Connection error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WifiOff className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Connection Failed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Unable to reach the AMLA Compliance server. Please check your connection and try again.
          </p>
          <button onClick={() => refetch()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Showing</p>
            <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Last Synced</p>
            <p className="text-sm font-semibold text-slate-700">{lastSynced}</p>
          </div>
        </div>
      </div>

      {/* Search & Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => handleSearch('')} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
            <label className="text-xs text-slate-500 whitespace-nowrap">Rows:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={() => refetch()} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider w-16">
                  <button onClick={() => handleSort('id')} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                    # <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                    User <SortIcon column="name" sortBy={sortBy} sortOrder={sortOrder} />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden md:table-cell">
                  <button onClick={() => handleSort('email')} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                    Email <SortIcon column="email" sortBy={sortBy} sortOrder={sortOrder} />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">
                  <button onClick={() => handleSort('created_at')} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                    Created <SortIcon column="created_at" sortBy={sortBy} sortOrder={sortOrder} />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 mt-2 text-sm">Loading AMLA users...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      {searchQuery ? 'No users match your search' : 'No users found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <tr key={user.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                      {user.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{user.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400 md:hidden truncate">{user.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell truncate max-w-[200px]">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setIsModalOpen(true) }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetUser(user)}
                          className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          title="Delete user"
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

        {/* Pagination Footer */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{start + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(start + rowsPerPage, totalItems)}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalItems}</span> users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true
                  if (page === 1 || page === totalPages) return true
                  return Math.abs(page - safePage) <= 1
                })
                .reduce((acc, page, i, arr) => {
                  if (i > 0 && page - arr[i - 1] > 1) acc.push('...')
                  acc.push(page)
                  return acc
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        safePage === item
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => { setIsModalOpen(false); setEditingUser(null) }}
          onSubmit={(data) => {
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data })
            } else {
              createMutation.mutate(data)
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSubmit={(data) => resetPasswordMutation.mutate({ id: resetUser.id, data })}
          isSubmitting={resetPasswordMutation.isPending}
        />
      )}
    </>
  )
}

export default AmlaUsers
