import { useState, useMemo, useCallback } from 'react'
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
  AtSign,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Users,
  UserPlus,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Building2,
  WifiOff,
  Settings,
  Link,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  isRPConfigured,
  saveRPCredentials,
  clearRPCredentials,
  listRPUsers,
  createRPUser,
  updateRPUser,
  updateRPUserStatus,
  resetRPPassword,
  deleteRPUser,
} from '../../services/riskProfilingService'

// ─── Temporary Password Modal ─────────────────────────────────────────

function TempPasswordModal({ password, title, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title || 'Temporary Password'}</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            This password is shown <strong>only once</strong>. Securely transmit it to the user.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium mb-2 uppercase tracking-wide">
            Temporary Password
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-lg font-mono font-bold text-slate-900 tracking-wider break-all">
              {password}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 hover:bg-amber-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-amber-600" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center">
          The user will be required to change this password on first login.
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all"
        >
          I've noted the password
        </button>
      </div>
    </div>
  )
}

// ─── User Form Modal ──────────────────────────────────────────────────

function UserFormModal({ user, discoveredRoles, discoveredBranches, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(user)

  const [formData, setFormData] = useState({
    first_name:     user?.first_name     || '',
    middle_initial: user?.middle_initial || '',
    last_name:      user?.last_name      || '',
    username:       user?.username       || '',
    email:          user?.email          || '',
    branch_id:      user?.branch?.id     || '',
    status:         user?.status         || 'active',
    password:            '',
    password_confirmation: '',
  })
  const [selectedRoleIds, setSelectedRoleIds] = useState(
    () => user?.roles?.map((r) => r.id) || []
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
    if (errors.role_ids) setErrors((prev) => ({ ...prev, role_ids: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.first_name.trim()) errs.first_name = 'First name is required'
    if (!formData.last_name.trim())  errs.last_name  = 'Last name is required'
    if (!formData.username.trim())   errs.username   = 'Username is required'
    if (!formData.email.trim())      errs.email      = 'Email is required'
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      errs.email = 'Invalid email address'
    if (!formData.branch_id) errs.branch_id = 'Branch is required'
    if (selectedRoleIds.length === 0) errs.role_ids = 'At least one role is required'
    if (!isEdit || formData.password) {
      if (formData.password && formData.password.length < 8)
        errs.password = 'Password must be at least 8 characters'
      if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password))
        errs.password = 'Must include uppercase, lowercase, number, and special character'
      if (formData.password && formData.password !== formData.password_confirmation)
        errs.password_confirmation = 'Passwords do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      first_name:     formData.first_name.trim(),
      last_name:      formData.last_name.trim(),
      username:       formData.username.trim(),
      email:          formData.email.trim(),
      branch_id:      Number(formData.branch_id),
      role_ids:       selectedRoleIds,
      status:         formData.status,
    }
    if (formData.middle_initial.trim()) payload.middle_initial = formData.middle_initial.trim()
    if (formData.password) {
      payload.password              = formData.password
      payload.password_confirmation = formData.password_confirmation
    }
    onSubmit(payload)
  }

  const passwordChecks = [
    { label: 'At least 8 characters',          valid: formData.password?.length >= 8 },
    { label: 'Uppercase letter',                valid: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase letter',                valid: /[a-z]/.test(formData.password) },
    { label: 'Number',                          valid: /\d/.test(formData.password) },
    { label: 'Special character (@$!%*?&)',     valid: /[@$!%*?&]/.test(formData.password) },
  ]

  const inputCls = (hasErr) =>
    `w-full px-3 py-2.5 text-sm bg-slate-50 border ${
      hasErr ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-violet-500'
    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[6vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-auto z-10">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit User' : 'Create Risk Profiling User'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update user details and roles' : 'Provision a new user in the Risk Profiling system'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* System badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg">
            <Shield className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <span className="text-xs text-violet-800 font-medium">Risk Profiling System Account</span>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                placeholder="Jane"
                className={inputCls(errors.first_name)}
              />
              {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">M.I.</label>
              <input
                type="text"
                value={formData.middle_initial}
                onChange={(e) => update('middle_initial', e.target.value.slice(0, 1))}
                placeholder="A"
                maxLength={1}
                className={inputCls(false)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                placeholder="Doe"
                className={inputCls(errors.last_name)}
              />
              {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="janedoe"
                className={`${inputCls(errors.username)} pl-10`}
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane.doe@example.com"
                className={`${inputCls(errors.email)} pl-10`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Branch</label>
            {discoveredBranches.length > 0 ? (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.branch_id}
                  onChange={(e) => update('branch_id', e.target.value)}
                  className={`${inputCls(errors.branch_id)} pl-10 appearance-none`}
                >
                  <option value="">Select branch...</option>
                  {discoveredBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={formData.branch_id}
                  onChange={(e) => update('branch_id', e.target.value)}
                  placeholder="Branch ID"
                  className={`${inputCls(errors.branch_id)} pl-10`}
                />
              </div>
            )}
            {errors.branch_id && <p className="mt-1 text-xs text-red-500">{errors.branch_id}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Status</label>
            <div className="flex gap-3">
              {['active', 'inactive'].map((s) => (
                <label
                  key={s}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    formData.status === s
                      ? s === 'active'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={() => update('status', s)}
                    className="sr-only"
                  />
                  <span className={`w-1.5 h-1.5 rounded-full ${s === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Roles</label>
            {discoveredRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-[42px]">
                {discoveredRoles.map((role) => {
                  const active = selectedRoleIds.includes(role.id)
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        active
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400 hover:text-violet-600'
                      }`}
                    >
                      {active && <CheckCircle className="w-3 h-3" />}
                      {role.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Role IDs comma-separated e.g. 1, 2"
                value={selectedRoleIds.join(', ')}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim(), 10))
                    .filter((n) => !isNaN(n))
                  setSelectedRoleIds(ids)
                }}
                className={inputCls(errors.role_ids)}
              />
            )}
            {errors.role_ids && <p className="mt-1 text-xs text-red-500">{errors.role_ids}</p>}
          </div>

          {/* Password section */}
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Leave password blank to keep the current password'
                : 'Leave password blank — a secure temporary password will be auto-generated'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password {isEdit && <span className="text-slate-400 font-normal">(optional)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder={isEdit ? 'Enter new password...' : 'Auto-generated if left blank'}
                className={`${inputCls(errors.password)} pl-10 pr-10`}
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

          {formData.password && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={(e) => update('password_confirmation', e.target.value)}
                  placeholder="Confirm password"
                  className={`${inputCls(errors.password_confirmation)} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>
              )}
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
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <>{isEdit ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}{' '}
                  {isEdit ? 'Save Changes' : 'Create User'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Setup Form ───────────────────────────────────────────────────────

function SetupForm({ onSaved }) {
  const [apiUrl,   setApiUrl]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!apiUrl.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Verify credentials before saving
      const origin   = new URL(apiUrl.trim()).origin
      const res      = await fetch(`${origin}/api/v1/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.success) {
        throw new Error(body.message || 'Authentication failed. Check your credentials.')
      }
      saveRPCredentials(apiUrl.trim(), email.trim(), password)
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not connect. Check the API URL and credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start justify-center pt-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Link className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Connect Risk Profiling API</h3>
              <p className="text-xs text-slate-500 mt-0.5">One-time setup — saved for this browser</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <WifiOff className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">API Base URL</label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://risk-profiling.example.com/api/risk-profiling/v1"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">Include the full path up to /v1</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : <><Link className="w-4 h-4" /> Save & Connect</>}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          Credentials are saved locally. You won't need to enter them again.
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────

function RiskProfilingUsers() {
  const [configured,   setConfigured]   = useState(isRPConfigured)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage,  setCurrentPage]  = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser,  setEditingUser]  = useState(null)
  const [tempPassword, setTempPassword] = useState(null)
  const queryClient = useQueryClient()

  if (!configured) {
    return <SetupForm onSaved={() => setConfigured(true)} />
  }

  const queryKey = ['rp-users', searchQuery, statusFilter, currentPage]

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listRPUsers({
        search:   searchQuery  || undefined,
        status:   statusFilter || undefined,
        per_page: 20,
        page:     currentPage,
      }),
    staleTime: 30_000,
    retry: 1,
  })

  const users = data?.data || []
  const meta  = data?.meta || {}

  // Derive roles and branches from the loaded page of users
  const { discoveredRoles, discoveredBranches } = useMemo(() => {
    const rolesMap    = new Map()
    const branchesMap = new Map()
    users.forEach((u) => {
      u.roles?.forEach((r) => { if (!rolesMap.has(r.id)) rolesMap.set(r.id, r) })
      if (u.branch?.id && !branchesMap.has(u.branch.id)) branchesMap.set(u.branch.id, u.branch)
    })
    return {
      discoveredRoles:    Array.from(rolesMap.values()),
      discoveredBranches: Array.from(branchesMap.values()),
    }
  }, [users])

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['rp-users'] }),
    [queryClient]
  )

  // ── Error helper ──

  const showApiError = (err) => {
    const msg = err.errors
      ? Object.values(err.errors).flat().join('\n')
      : err.message || 'An error occurred'
    Swal.fire({ icon: 'error', title: 'Error', text: msg })
  }

  // ── Mutations ──

  const createMutation = useMutation({
    mutationFn: createRPUser,
    onSuccess: (res) => {
      invalidate()
      setIsCreateOpen(false)
      if (res.temporary_password) {
        setTempPassword({ password: res.temporary_password, title: 'User Created — Temporary Password' })
      } else {
        Swal.fire({ icon: 'success', title: 'User Created', timer: 2000, showConfirmButton: false })
      }
    },
    onError: showApiError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRPUser(id, data),
    onSuccess: () => {
      invalidate()
      setEditingUser(null)
      Swal.fire({ icon: 'success', title: 'User Updated', timer: 2000, showConfirmButton: false })
    },
    onError: showApiError,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateRPUserStatus(id, status),
    onSuccess: (res) => {
      invalidate()
      Swal.fire({ icon: 'success', title: res.message || 'Status Updated', timer: 1500, showConfirmButton: false })
    },
    onError: showApiError,
  })

  const resetPwMutation = useMutation({
    mutationFn: (id) => resetRPPassword(id),
    onSuccess: (res) => {
      invalidate()
      if (res.temporary_password) {
        setTempPassword({ password: res.temporary_password, title: 'Password Reset — New Temporary Password' })
      }
    },
    onError: showApiError,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRPUser(id),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'User Deleted', timer: 1500, showConfirmButton: false })
    },
    onError: showApiError,
  })

  // ── Handlers ──

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const action    = newStatus === 'inactive' ? 'Deactivate' : 'Activate'
    Swal.fire({
      title: `${action} User?`,
      text: `${action} ${user.full_name}?${newStatus === 'inactive' ? ' This will immediately revoke their session.' : ''}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'inactive' ? '#f59e0b' : '#22c55e',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${action.toLowerCase()}`,
    }).then((r) => {
      if (r.isConfirmed) statusMutation.mutate({ id: user.id, status: newStatus })
    })
  }

  const handleResetPassword = (user) => {
    Swal.fire({
      title: 'Reset Password?',
      text: `Generate a new temporary password for ${user.full_name}? Their current session will be revoked.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, reset password',
    }).then((r) => {
      if (r.isConfirmed) resetPwMutation.mutate(user.id)
    })
  }

  const handleDelete = (user) => {
    Swal.fire({
      title: 'Delete User?',
      text: `Permanently delete ${user.full_name}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete permanently',
    }).then((r) => {
      if (r.isConfirmed) deleteMutation.mutate(user.id)
    })
  }

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }, [])

  const handleStatusFilter = (val) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const isMutating =
    statusMutation.isPending ||
    resetPwMutation.isPending ||
    deleteMutation.isPending

  const activeCount   = users.filter((u) => u.status === 'active').length
  const inactiveCount = users.filter((u) => u.status !== 'active').length

  // ── Render ──

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Risk Profiling Users</h2>
          <p className="text-slate-500 text-sm">Manage users in the Risk Profiling system</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              clearRPCredentials()
              queryClient.removeQueries({ queryKey: ['rp-users'] })
              setConfigured(false)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Change API credentials"
          >
            <Settings className="w-3.5 h-3.5" />
            Reconfigure
          </button>
          <button
            onClick={() => invalidate()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-lg shadow-violet-500/25 transition-all font-semibold text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-violet-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900">{meta.total ?? users.length}</p>
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

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:border-l sm:pl-3 sm:border-slate-200">
          {[
            { label: 'All',      value: '' },
            { label: 'Active',   value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden md:table-cell">Username</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider hidden lg:table-cell">Branch</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Roles</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
                    <p className="text-slate-500 mt-2 text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <WifiOff className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-medium text-sm">Failed to load users</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">{error?.message}</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-3 px-4 py-1.5 text-xs font-medium text-violet-600 border border-violet-300 rounded-lg hover:bg-violet-50 transition-colors"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      {searchQuery || statusFilter ? 'No users match your filters' : 'No users found'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-violet-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {user.first_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {user.full_name || `${user.first_name} ${user.last_name}`}
                          </p>
                          <p className="text-xs text-slate-400 md:hidden">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                      <span className="text-slate-400">@</span>{user.username}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell truncate max-w-[200px]">
                      {user.email}
                    </td>

                    {/* Branch */}
                    <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">
                      {user.branch?.name || <span className="text-slate-400">—</span>}
                    </td>

                    {/* Roles */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.length > 0 ? (
                          user.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium"
                            >
                              <Shield className="w-2.5 h-2.5" />
                              {r.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">No roles</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isMutating}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:shadow-sm disabled:opacity-50 ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={`Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          disabled={isMutating}
                          className="p-2 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          disabled={isMutating}
                          className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Reset password"
                        >
                          {resetPwMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <KeyRound className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isMutating}
                          className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors disabled:opacity-50"
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

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Page {meta.current_page} of {meta.last_page} &bull; {meta.total} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <UserFormModal
          user={null}
          discoveredRoles={discoveredRoles}
          discoveredBranches={discoveredBranches}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingUser && (
        <UserFormModal
          user={editingUser}
          discoveredRoles={discoveredRoles}
          discoveredBranches={discoveredBranches}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingUser.id, data })}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {tempPassword && (
        <TempPasswordModal
          password={tempPassword.password}
          title={tempPassword.title}
          onClose={() => setTempPassword(null)}
        />
      )}
    </div>
  )
}

export default RiskProfilingUsers
