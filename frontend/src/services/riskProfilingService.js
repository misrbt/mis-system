/**
 * Risk Profiling External API Service
 *
 * Uses API key authentication (X-Api-Key header)
 * Base URL: https://risk-profiling.rbtbank.com
 * API Key: rbtBKinc1964
 */

const API_BASE = 'https://risk-profiling.rbtbank.com'
const API_KEY = 'rbtBKinc1964'
const API_PATH = '/api/risk-profiling/v1/users'

// ─── Core Fetch Helper ────────────────────────────────────────────────

const rpFetch = async (method, path, body = null) => {
  const url = `${API_BASE}${API_PATH}${path}`
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': API_KEY,
    },
  }
  if (body !== null) opts.body = JSON.stringify(body)

  const res = await fetch(url, opts)
  const data = await res.json().catch(() => ({}))

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
  if (params.search) q.set('search', params.search)
  if (params.status) q.set('status', params.status)
  if (params.role) q.set('role', params.role)
  if (params.branch_id) q.set('branch_id', String(params.branch_id))
  if (params.sort_by) q.set('sort_by', params.sort_by)
  if (params.sort_order) q.set('sort_order', params.sort_order)
  if (params.per_page) q.set('per_page', String(params.per_page))
  if (params.page) q.set('page', String(params.page))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return rpFetch('GET', qs)
}

export const getRPUser = (id) => rpFetch('GET', `/${id}`)
export const createRPUser = (data) => rpFetch('POST', '', data)
export const updateRPUser = (id, data) => rpFetch('PUT', `/${id}`, data)
export const updateRPUserStatus = (id, status) => rpFetch('PUT', `/${id}/status`, { status })
export const resetRPPassword = (id) => rpFetch('POST', `/${id}/reset-password`)
export const deleteRPUser = (id) => rpFetch('DELETE', `/${id}`)
