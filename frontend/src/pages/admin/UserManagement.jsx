import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Edit,
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
  BarChart2,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import RiskProfilingUsers from './RiskProfilingUsers'

function UserManagement() {
  const [activeTab, setActiveTab] = useState('mis')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get('/users')
      return response.data?.data || []
    },
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/users', data)
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

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/users/${id}`, data)
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

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.patch(`/users/${userId}/toggle-status`)
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
      if (result.isConfirmed) {
        toggleMutation.mutate(user.id)
      }
    })
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  // Filter users based on search
  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const activeCount = users?.filter(u => u.is_active).length || 0
  const inactiveCount = users?.filter(u => !u.is_active).length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage users across MIS and connected systems</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('mis')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mis'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          MIS System
        </button>
        <button
          onClick={() => setActiveTab('rp')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'rp'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Risk Profiling
        </button>
      </div>

      {/* Risk Profiling tab */}
      {activeTab === 'rp' && <RiskProfilingUsers />}

      {/* MIS System tab — hidden when RP tab is active */}
      {activeTab === 'mis' && <>

      {/* Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">MIS System Users</h2>
          <p className="text-slate-500 text-sm">Manage portal access and credentials</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all font-semibold text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Inactive</p>
            <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden md:table-cell">Username</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 mt-2 text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      {searchQuery ? 'No users match your search' : 'No users found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{user.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400 md:hidden truncate">@{user.username || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                      <span className="text-slate-400">@</span>{user.username || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell truncate max-w-[200px]">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Add / Edit Modal */}
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

      </>}
    </div>
  )
}


// ─── User Form Modal ──────────────────────────────────────────────────

function UserFormModal({ user, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(user)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    role: user?.role || 'user',
    is_active: user?.is_active ?? true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.username.trim()) errs.username = 'Username is required'
    else if (formData.username.length < 3) errs.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) errs.username = 'Letters, numbers, dashes and underscores only'

    if (!formData.email.trim()) errs.email = 'Email is required'
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) errs.email = 'Invalid email address'

    if (!isEdit || formData.password) {
      if (!isEdit && !formData.password) errs.password = 'Password is required'
      else if (formData.password && formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
      else if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) errs.password = 'Must include uppercase, lowercase, number, and special character'

      if (formData.password && formData.password !== formData.password_confirmation) errs.password_confirmation = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const submitData = { ...formData }
    // On edit, only send password if changed
    if (isEdit && !submitData.password) {
      delete submitData.password
      delete submitData.password_confirmation
    }
    onSubmit(submitData)
  }

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update user credentials and role' : 'Add a new user to the MIS system'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* System Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-800 font-medium">MIS System Account</span>
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
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Juan Dela Cruz"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => update('username', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors.username ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="jdelacruz"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
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
                className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="juan.delacruz@company.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => update('role', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
              <label className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{formData.is_active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 pt-2">
            <p className="text-xs text-slate-500">
              {isEdit ? 'Leave password blank to keep current password' : 'Set the initial password for this user'}
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password {isEdit && <span className="text-slate-400 font-normal">(optional)</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => update('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder={isEdit ? 'Enter new password...' : 'Create a strong password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

            {/* Password strength indicators */}
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

          {/* Confirm Password */}
          {(formData.password || !isEdit) && (
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
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${errors.password_confirmation ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
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


export default UserManagement
