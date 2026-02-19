/**
 * Risk Profiling External API Service
 *
 * Credentials are resolved in this priority order:
 *   1. Environment variables (VITE_RP_API_URL, VITE_RP_EMAIL, VITE_RP_PASSWORD)
 *   2. Values saved via saveRPCredentials() in localStorage
 *
 * If neither is present, isRPConfigured() returns false and the UI shows
 * a one-time setup form. After saving, the page works without any env setup.
 *
 * The auth token is cached in sessionStorage (~60-minute lifespan).
 */

const STORAGE_URL_KEY      = 'rp_api_url'
const STORAGE_EMAIL_KEY    = 'rp_email'
const STORAGE_PASSWORD_KEY = 'rp_password'
const TOKEN_KEY            = 'rp_token'
const EXPIRY_KEY           = 'rp_token_expiry'

// ─── Credential Helpers ───────────────────────────────────────────────

const getCredentials = () => ({
  apiBase:  (import.meta.env.VITE_RP_API_URL   || localStorage.getItem(STORAGE_URL_KEY)      || '').replace(/\/+$/, ''),
  email:     import.meta.env.VITE_RP_EMAIL      || localStorage.getItem(STORAGE_EMAIL_KEY)    || '',
  password:  import.meta.env.VITE_RP_PASSWORD   || localStorage.getItem(STORAGE_PASSWORD_KEY) || '',
})

/** Returns true if all three credentials are available (env or localStorage). */
export const isRPConfigured = () => {
  const { apiBase, email, password } = getCredentials()
  return Boolean(apiBase && email && password)
}

/** Persist credentials to localStorage (used by the one-time setup form). */
export const saveRPCredentials = (apiBase, email, password) => {
  localStorage.setItem(STORAGE_URL_KEY,      apiBase.replace(/\/+$/, ''))
  localStorage.setItem(STORAGE_EMAIL_KEY,    email)
  localStorage.setItem(STORAGE_PASSWORD_KEY, password)
  clearToken()  // force re-auth with the new credentials
}

/** Remove saved localStorage credentials and clear the cached token. */
export const clearRPCredentials = () => {
  localStorage.removeItem(STORAGE_URL_KEY)
  localStorage.removeItem(STORAGE_EMAIL_KEY)
  localStorage.removeItem(STORAGE_PASSWORD_KEY)
  clearToken()
}

// ─── Token Cache ──────────────────────────────────────────────────────

const getToken  = () => sessionStorage.getItem(TOKEN_KEY)
const getExpiry = () => sessionStorage.getItem(EXPIRY_KEY)

const saveToken = (token, expiresAt) => {
  sessionStorage.setItem(TOKEN_KEY,  token)
  sessionStorage.setItem(EXPIRY_KEY, expiresAt)
}

const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
}

const isTokenValid = () => {
  const token  = getToken()
  const expiry = getExpiry()
  if (!token || !expiry) return false
  return new Date(expiry) > new Date(Date.now() + 60_000)
}

// ─── Authentication ───────────────────────────────────────────────────

const authenticate = async () => {
  const { apiBase, email, password } = getCredentials()

  if (!apiBase || !email || !password) {
    throw Object.assign(
      new Error('Risk Profiling API is not configured.'),
      { status: 'not_configured' }
    )
  }

  const origin   = new URL(apiBase).origin
  const loginUrl = `${origin}/api/v1/auth/login`

  const res  = await fetch(loginUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ email, password }),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok || !body.success) {
    throw new Error(body.message || 'Authentication failed. Check your credentials.')
  }

  const { token, expires_at } = body.data
  saveToken(token, expires_at)
  return token
}

// ─── Core Fetch Helper ────────────────────────────────────────────────

const rpFetch = async (method, path, body = null, retried = false) => {
  const { apiBase } = getCredentials()

  if (!apiBase) {
    throw Object.assign(new Error('Risk Profiling API is not configured.'), { status: 'not_configured' })
  }

  if (!isTokenValid()) {
    await authenticate()
  }

  const url  = `${apiBase}/users${path}`
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept:         'application/json',
      Authorization:  `Bearer ${getToken()}`,
    },
  }
  if (body !== null) opts.body = JSON.stringify(body)

  const res  = await fetch(url, opts)
  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && !retried) {
    clearToken()
    return rpFetch(method, path, body, true)
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(data.message || `Request failed (${res.status})`),
      { status: res.status, errors: data.errors || null, data }
    )
  }

  return data
}

// ─── User CRUD ────────────────────────────────────────────────────────

export const listRPUsers = (params = {}) => {
  const q = new URLSearchParams()
  if (params.search)    q.set('search',    params.search)
  if (params.status)    q.set('status',    params.status)
  if (params.role)      q.set('role',      params.role)
  if (params.branch_id) q.set('branch_id', String(params.branch_id))
  if (params.per_page)  q.set('per_page',  String(params.per_page))
  if (params.page)      q.set('page',      String(params.page))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return rpFetch('GET', qs)
}

export const getRPUser         = (id)        => rpFetch('GET',    `/${id}`)
export const createRPUser      = (data)      => rpFetch('POST',   '',       data)
export const updateRPUser      = (id, data)  => rpFetch('PUT',    `/${id}`, data)
export const updateRPUserStatus = (id, status) => rpFetch('PUT',  `/${id}/status`, { status })
export const resetRPPassword   = (id)        => rpFetch('POST',   `/${id}/reset-password`)
export const deleteRPUser      = (id)        => rpFetch('DELETE', `/${id}`)
export const syncRPUserRoles   = (id, roleIds) => rpFetch('PUT',  `/${id}/roles`, { role_ids: roleIds })
