import apiClient from './apiClient'

// List — default returns active only; pass { all: true } for admin mgmt.
export const fetchTicketCategories = (params) =>
  apiClient.get('/ticket-categories', { params })

export const fetchTicketCategory = (id) => apiClient.get(`/ticket-categories/${id}`)

export const createTicketCategory = (payload) =>
  apiClient.post('/ticket-categories', payload)

export const updateTicketCategory = (id, payload) =>
  apiClient.put(`/ticket-categories/${id}`, payload)

export const deleteTicketCategory = (id) => apiClient.delete(`/ticket-categories/${id}`)

export const toggleTicketCategoryActive = (id) =>
  apiClient.patch(`/ticket-categories/${id}/toggle-active`)
