import apiClient from './apiClient'

// Admin — CRUD. Pass { all: 1 } to include inactive.
export const fetchTicketFormFields = (params) =>
  apiClient.get('/ticket-form-fields', { params })

export const fetchTicketFormField = (id) =>
  apiClient.get(`/ticket-form-fields/${id}`)

export const createTicketFormField = (payload) =>
  apiClient.post('/ticket-form-fields', payload)

export const updateTicketFormField = (id, payload) =>
  apiClient.put(`/ticket-form-fields/${id}`, payload)

export const deleteTicketFormField = (id) =>
  apiClient.delete(`/ticket-form-fields/${id}`)

export const toggleTicketFormFieldActive = (id) =>
  apiClient.patch(`/ticket-form-fields/${id}/toggle-active`)

// Public — consumed by the public submit form. Optional category_id to
// return only fields that apply to that category plus the global ones.
export const fetchPublicFormFields = (params) =>
  apiClient.get('/public/helpdesk/form-fields', { params })
