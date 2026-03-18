/**
 * AMLA Compliance System External API Service
 *
 * Base URL: https://rbtcompliance.rbtbank.com/api
 * No authentication required.
 */

const API_BASE = import.meta.env.DEV
  ? '/amla-api'
  : 'http://rbtcompliance.rbtbank.com/api'

// ─── Core Fetch Helper ────────────────────────────────────────────────

const amlaFetch = async (method, path, body = null) => {
  const url = `${API_BASE}${path}`
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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

// ─── User CRUD + Reset Password ───────────────────────────────────────

export const listAmlaUsers = () => amlaFetch('GET', '/users')

export const getAmlaUser = (id) => amlaFetch('GET', `/users/${id}`)

export const createAmlaUser = (data) => amlaFetch('POST', '/users', data)

export const updateAmlaUser = (id, data) => amlaFetch('PUT', `/users/${id}`, data)

export const deleteAmlaUser = (id) => amlaFetch('DELETE', `/users/${id}`)

export const resetAmlaPassword = (id, data) =>
  amlaFetch('POST', `/users/${id}/reset-password`, data)
