import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  X,
  Eye,
  EyeOff,
  User,
  AtSign,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  Phone,
  Hash,
  MapPin,
  KeyRound,
  ChevronDown,
  Filter,
  Monitor,
  Settings2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import authApiClient from '../../services/authApiClient'
import Swal from 'sweetalert2'

function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [configuringUser, setConfiguringUser] = useState(null)
  const queryClient = useQueryClient()

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ['branches-dropdown'],
    queryFn: async () => {
      const response = await authApiClient.get('/branches/dropdown')
      return response.data?.data || []
    },
  })

  // Fetch systems
  const { data: systems } = useQuery({
    queryKey: ['systems-list'],
    queryFn: async () => {
      const response = await authApiClient.get('/systems')
      return response.data?.data || []
    },
  })

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await authApiClient.get('/users')
      return response.data?.data || []
    },
  })

  // Create user
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await authApiClient.post('/users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      Swal.fire({ icon: 'success', title: 'User Created', text: 'New user has been added successfully.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.response?.data?.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.response?.data?.message || 'Failed to create user'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Update user
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await authApiClient.put(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      Swal.fire({ icon: 'success', title: 'User Updated', text: 'User details have been saved.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.response?.data?.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.response?.data?.message || 'Failed to update user'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Toggle status
  const toggleMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await authApiClient.patch(`/users/${userId}/toggle-status`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      Swal.fire({ icon: 'success', title: data.message, timer: 1500, showConfirmButton: false })
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to toggle status' })
    },
  })

  // Delete user
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await authApiClient.delete(`/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      Swal.fire({ icon: 'success', title: 'User Deleted', timer: 1500, showConfirmButton: false })
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to delete user' })
    },
  })

  // Configure system access
  const configureAccessMutation = useMutation({
    mutationFn: async ({ id, systems }) => {
      const response = await authApiClient.put(`/users/${id}/access`, { systems })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setConfiguringUser(null)
      Swal.fire({ icon: 'success', title: 'Access Updated', text: 'System access configured successfully.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to configure access'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await authApiClient.post(`/users/${id}/reset-password`, data)
      return response.data
    },
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Password Reset', text: 'User password has been reset.', timer: 2000, showConfirmButton: false })
    },
    onError: (error) => {
      const errors = error.response?.data?.errors
      const msg = errors ? Object.values(errors).flat().join('\n') : error.response?.data?.message || 'Failed to reset password'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  const handleToggleStatus = (user) => {
    const action = user.is_active ? 'deactivate' : 'activate'
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
      text: `Are you sure you want to ${action} ${user.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: user.is_active ? '#f59e0b' : '#22c55e',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${action}`,
    }).then((result) => {
      if (result.isConfirmed) toggleMutation.mutate(user.id)
    })
  }

  const handleDelete = (user) => {
    Swal.fire({
      title: 'Delete User?',
      html: `This will permanently remove <strong>${user.name}</strong> and revoke all their access tokens.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(user.id)
    })
  }

  const handleResetPassword = (user) => {
    Swal.fire({
      title: `Reset Password`,
      html: `<p class="text-sm text-gray-500 mb-3">Set a new password for <strong>${user.name}</strong></p>`,
      input: 'password',
      inputPlaceholder: 'New password (min 8 chars, mixed case, number, symbol)',
      inputAttributes: { autocomplete: 'new-password' },
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Reset Password',
      inputValidator: (value) => {
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value))
          return 'Must include uppercase, lowercase, number, and special character'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        resetPasswordMutation.mutate({
          id: user.id,
          data: { password: result.value, password_confirmation: result.value },
        })
      }
    })
  }

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBranch = !filterBranch || String(user.branch_id) === filterBranch
    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' ? user.is_active : !user.is_active)

    return matchesSearch && matchesBranch && matchesStatus
  }) || []

  const activeCount = users?.filter(u => u.is_active).length || 0
  const inactiveCount = users?.filter(u => !u.is_active).length || 0
  const hasFilters = filterBranch || filterStatus

  const clearFilters = () => {
    setFilterBranch('')
    setFilterStatus('')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Centralized user accounts across all RBT systems</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true) }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all font-semibold text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Inactive</p>
            <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Branches</p>
            <p className="text-2xl font-bold text-violet-600">{branches?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 p-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, username, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              hasFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </button>
        </div>

        {showFilters && (
          <div className="px-3 pb-3 pt-0 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {filteredUsers.length} of {users?.length || 0} users
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden md:table-cell">Branch / Dept</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden xl:table-cell">System Access</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 mt-3 text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      {searchQuery || hasFilters ? 'No users match your filters' : 'No users found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    {/* Employee Info */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                          {user.employee_id && (
                            <p className="text-[11px] text-slate-400 font-mono">{user.employee_id}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Branch / Department */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      {user.branch ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 font-medium truncate">{user.branch.branch_name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {user.department && (
                              <span className="text-[11px] text-slate-400">{user.department}</span>
                            )}
                            {user.position && (
                              <span className="text-[11px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{user.position}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        <p className="text-sm text-slate-600 truncate max-w-[200px]">{user.email}</p>
                        {user.phone_number && (
                          <p className="text-xs text-slate-400">{user.phone_number}</p>
                        )}
                      </div>
                    </td>

                    {/* System Access */}
                    <td className="px-5 py-3 hidden xl:table-cell">
                      {user.systems?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.systems.map((sys) => {
                            const shortName = sys.slug === 'mis_system' ? 'MIS' :
                               sys.slug === 'amla_report' ? 'AMLA' :
                               sys.slug === 'risk_profiling' ? 'Risk' :
                               sys.slug === 'sigcard' ? 'Sigcard' :
                               sys.slug === 'grc_system' ? 'GRC' : sys.name
                            return (
                              <span
                                key={sys.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                                title={`${sys.name} — ${sys.role}`}
                              >
                                <Monitor className="w-3 h-3" />
                                {shortName}
                                <span className="text-[10px] text-indigo-400 font-normal">({sys.role})</span>
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No access</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:shadow-sm ${
                          user.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={`Click to ${user.is_active ? 'deactivate' : 'activate'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setIsModalOpen(true) }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfiguringUser(user)}
                          className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                          title="Configure system access"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          branches={branches || []}
          systems={systems || []}
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

      {/* Configure Access Modal */}
      {configuringUser && (
        <ConfigureAccessModal
          user={configuringUser}
          systems={systems || []}
          onClose={() => setConfiguringUser(null)}
          onSave={(systemsData) => {
            configureAccessMutation.mutate({ id: configuringUser.id, systems: systemsData })
          }}
          isSaving={configureAccessMutation.isPending}
        />
      )}
    </div>
  )
}


// ─── User Form Modal ──────────────────────────────────────────────────

function UserFormModal({ user, branches, systems, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(user)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    is_active: user?.is_active ?? true,
    branch_id: user?.branch_id || '',
    employee_id: user?.employee_id || '',
    department: user?.department || '',
    position: user?.position || '',
    phone_number: user?.phone_number || '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const validateStep1 = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.username.trim()) errs.username = 'Username is required'
    else if (formData.username.length < 3) errs.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) errs.username = 'Letters, numbers, dashes, underscores only'
    if (!formData.email.trim()) errs.email = 'Email is required'
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) errs.email = 'Invalid email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (!isEdit || formData.password) {
      if (!isEdit && !formData.password) errs.password = 'Password is required'
      else if (formData.password && formData.password.length < 8) errs.password = 'At least 8 characters'
      else if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) errs.password = 'Must include uppercase, lowercase, number, and special char'
      if (formData.password && formData.password !== formData.password_confirmation) errs.password_confirmation = 'Passwords do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateStep2()) return

    const submitData = { ...formData }
    if (isEdit && !submitData.password) {
      delete submitData.password
      delete submitData.password_confirmation
    }
    if (!submitData.branch_id) submitData.branch_id = null
    if (!submitData.employee_id) delete submitData.employee_id
    if (!submitData.department) submitData.department = null
    if (!submitData.position) submitData.position = null
    if (!submitData.phone_number) submitData.phone_number = null
    onSubmit(submitData)
  }

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const passwordChecks = [
    { label: '8+ characters', valid: formData.password?.length >= 8 },
    { label: 'Uppercase', valid: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase', valid: /[a-z]/.test(formData.password) },
    { label: 'Number', valid: /\d/.test(formData.password) },
    { label: 'Symbol (@$!%*?&)', valid: /[@$!%*?&]/.test(formData.password) },
  ]

  const inputClass = (field) =>
    `w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[8vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] overflow-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit ? 'Update account details and assignment' : 'Step ' + step + ' of 2 — ' + (step === 1 ? 'Account & Assignment' : 'Security & Access')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Step indicators (only for create) */}
          {!isEdit && (
            <div className="flex gap-2 mt-3">
              <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
              <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            </div>
          )}
        </div>

        <form onSubmit={isEdit ? handleSubmit : (e) => { e.preventDefault(); step === 1 ? handleNext() : handleSubmit(e) }} className="p-6 space-y-4">

          {/* === STEP 1: Account Info & Branch === */}
          {(step === 1 || isEdit) && (
            <>
              {/* Section: Account Info */}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Information</p>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                  <input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)} className={inputClass('name')} placeholder="Juan Dela Cruz" />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Username <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AtSign className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={formData.username} onChange={(e) => update('username', e.target.value)} className={inputClass('username')} placeholder="jdelacruz" />
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></div>
                    <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} className={inputClass('email')} placeholder="juan@rbtbank.com" />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Section: Branch Assignment */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Branch & Employment</p>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Assigned Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-4 w-4 text-slate-400" /></div>
                  <select value={formData.branch_id} onChange={(e) => update('branch_id', e.target.value ? Number(e.target.value) : '')} className={inputClass('branch_id')}>
                    <option value="">Select branch...</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.display_name}</option>)}
                  </select>
                </div>
              </div>

              {/* Employee ID & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Employee ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={formData.employee_id} onChange={(e) => update('employee_id', e.target.value)} className={inputClass('employee_id')} placeholder="EMP-001" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={formData.phone_number} onChange={(e) => update('phone_number', e.target.value)} className={inputClass('phone_number')} placeholder="09171234567" />
                  </div>
                </div>
              </div>

              {/* Department & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={formData.department} onChange={(e) => update('department', e.target.value)} className={inputClass('department')} placeholder="IT" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Position</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={formData.position} onChange={(e) => update('position', e.target.value)} className={inputClass('position')} placeholder="MIS" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === STEP 2 (create) or inline (edit): Security & Access === */}
          {(step === 2 || isEdit) && (
            <>
              {!isEdit && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Security & Access</p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Status</label>
                <label className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => update('is_active', e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <span className={`text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              {/* System Access hint */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                <Settings2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="text-xs text-indigo-700">
                  {isEdit
                    ? 'Use the configure access button (gear icon) in the table to manage system access & roles.'
                    : 'After creating the user, use the configure access button to assign system access & roles.'}
                </span>
              </div>

              {/* Password section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500 mb-3">
                  {isEdit ? 'Leave password blank to keep current password' : 'Set the initial password for this user'}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password {isEdit && <span className="text-slate-400 font-normal">(optional)</span>}
                  {!isEdit && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder={isEdit ? 'Enter new password...' : 'Create a strong password'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

                {formData.password && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {passwordChecks.map((check, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${check.valid ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CheckCircle className={`w-3 h-3 ${check.valid ? 'text-green-500' : 'text-slate-300'}`} />
                        {check.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {(formData.password || !isEdit) && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={(e) => update('password_confirmation', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="Confirm password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            {step === 2 && !isEdit && (
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Back
              </button>
            )}
            <button type="button" onClick={onClose} className={`${step === 2 && !isEdit ? '' : 'flex-1'} px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors`}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : isEdit ? (
                <><Edit className="w-4 h-4" /> Save Changes</>
              ) : step === 1 ? (
                <>Next: Security</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create User</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// ─── Configure Access Modal ──────────────────────────────────────────

const SYSTEM_COLORS = {
  mis_system: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500', dot: 'bg-blue-400' },
  amla_report: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500', dot: 'bg-emerald-400' },
  risk_profiling: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', accent: 'bg-violet-500', dot: 'bg-violet-400' },
  sigcard: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500', dot: 'bg-amber-400' },
  grc_system: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-500', dot: 'bg-rose-400' },
}

function ConfigureAccessModal({ user, systems, onClose, onSave, isSaving }) {
  // State: each system can be 'off', 'selecting' (picking role), or 'confirmed' (role chosen)
  const [accessConfig, setAccessConfig] = useState(() => {
    const config = {}
    systems.forEach((sys) => {
      const existing = user.systems?.find((s) => s.id === sys.id)
      config[sys.id] = existing
        ? { status: 'confirmed', role: existing.role }
        : { status: 'off', role: null }
    })
    return config
  })

  const enableSystem = (sysId) => {
    setAccessConfig((prev) => ({
      ...prev,
      [sysId]: { status: 'selecting', role: null },
    }))
  }

  const selectRole = (sysId, role) => {
    setAccessConfig((prev) => ({
      ...prev,
      [sysId]: { status: 'confirmed', role },
    }))
  }

  const disableSystem = (sysId) => {
    setAccessConfig((prev) => ({
      ...prev,
      [sysId]: { status: 'off', role: null },
    }))
  }

  const changeRole = (sysId) => {
    setAccessConfig((prev) => ({
      ...prev,
      [sysId]: { ...prev[sysId], status: 'selecting' },
    }))
  }

  const handleSave = () => {
    const systemsData = Object.entries(accessConfig)
      .filter(([, c]) => c.status === 'confirmed' && c.role)
      .map(([sysId, c]) => ({ id: Number(sysId), role: c.role }))
    onSave(systemsData)
  }

  const confirmedCount = Object.values(accessConfig).filter((c) => c.status === 'confirmed').length
  const hasPending = Object.values(accessConfig).some((c) => c.status === 'selecting')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[6vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Configure System Access</h2>
                <p className="text-xs text-slate-500">{user.name} &mdash; {user.branch?.branch_name || 'No branch'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Enable a system, then select the role for that system.</p>
        </div>

        {/* Systems List */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Systems</p>
            <span className="text-xs text-slate-400">{confirmedCount} of {systems.length} configured</span>
          </div>

          {systems.map((sys) => {
            const config = accessConfig[sys.id]
            const c = SYSTEM_COLORS[sys.slug] || SYSTEM_COLORS.mis_system
            const selectedRoleLabel = sys.available_roles?.find((r) => r.value === config.role)?.label

            return (
              <div key={sys.id}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  config.status === 'confirmed' ? `${c.border} ${c.bg}` :
                  config.status === 'selecting' ? 'border-blue-300 bg-blue-50/30' :
                  'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* ── OFF state: show system info + Enable button ── */}
                {config.status === 'off' && (
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-600">{sys.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{sys.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => enableSystem(sys.id)}
                      className="flex-shrink-0 ml-3 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Enable
                    </button>
                  </div>
                )}

                {/* ── SELECTING state: show role picker ── */}
                {config.status === 'selecting' && (
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-bold text-blue-800">{sys.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => disableSystem(sys.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Select a role for this system:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sys.available_roles?.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => selectRole(sys.id, r.value)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                            <Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{r.label}</p>
                            <p className="text-[11px] text-slate-400">
                              {r.value === 'admin' ? 'Full system access' :
                               r.value === 'manager' ? 'Management & approvals' :
                               r.value === 'cashier' ? 'Transaction processing' :
                               r.value === 'compliance' ? 'Compliance monitoring' :
                               r.value === 'compliance-audit' ? 'Audit & compliance review' :
                               r.value === 'audit' ? 'System auditing' :
                               'Standard access'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── CONFIRMED state: show assigned role with change/remove ── */}
                {config.status === 'confirmed' && (
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                        <Monitor className={`w-4 h-4 ${c.text}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${c.text}`}>{sys.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">Role:</span>
                          <span className={`text-xs font-bold ${c.text}`}>{selectedRoleLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => changeRole(sys.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => disableSystem(sys.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {confirmedCount === 0 && !hasPending && (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mt-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">No systems configured. Enable a system and select a role to grant access.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {hasPending && (
                <span className="text-amber-600 font-medium">You have unsaved role selections. Pick a role or cancel.</span>
              )}
              {!hasPending && confirmedCount > 0 && (
                <span>{confirmedCount} system{confirmedCount !== 1 ? 's' : ''} configured</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || hasPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Settings2 className="w-4 h-4" /> Save Access</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default UserManagement
