import apiClient from './apiClient'

// List — admin pass { all: 1 } to include inactive entries.
export const fetchTicketApprovers = (params) =>
  apiClient.get('/ticket-approvers', { params })

export const fetchTicketApprover = (id) => apiClient.get(`/ticket-approvers/${id}`)

export const createTicketApprover = (payload) =>
  apiClient.post('/ticket-approvers', payload)

export const updateTicketApprover = (id, payload) =>
  apiClient.put(`/ticket-approvers/${id}`, payload)

export const deleteTicketApprover = (id) => apiClient.delete(`/ticket-approvers/${id}`)

export const toggleTicketApproverActive = (id) =>
  apiClient.patch(`/ticket-approvers/${id}/toggle-active`)

// Employees whose Position title contains "Manager" — feeds the admin
// page's "Pick a manager" dropdown so branch/OBO can auto-fill.
export const fetchApproverManagers = () =>
  apiClient.get('/ticket-approvers/managers')
