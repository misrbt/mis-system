import apiClient from './apiClient'

// Ticket CRUD
export const fetchTickets = (params) => apiClient.get('/tickets', { params })

export const fetchTicket = (id) => apiClient.get(`/tickets/${id}`)

export const createTicket = (payload) => {
  // If attachments are present, send as multipart form data.
  const files = Array.isArray(payload.attachments) ? payload.attachments : []
  const hasFiles = files.some((f) => f instanceof File)

  if (hasFiles) {
    const formData = new FormData()
    Object.keys(payload).forEach((key) => {
      if (key === 'attachments') return
      const value = payload[key]
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value)
      }
    })
    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('attachments[]', file)
      }
    })
    return apiClient.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // Plain JSON create (no files)
  const { attachments: _ignore, ...rest } = payload
  return apiClient.post('/tickets', rest)
}

export const updateTicket = (id, data) => apiClient.put(`/tickets/${id}`, data)

export const deleteTicket = (id) => apiClient.delete(`/tickets/${id}`)

// Status / assignment
export const updateTicketStatus = (id, payload) =>
  apiClient.patch(`/tickets/${id}/status`, payload)

export const assignTicket = (id, assignedToUserId) =>
  apiClient.patch(`/tickets/${id}/assign`, { assigned_to_user_id: assignedToUserId })

// Remarks
export const fetchTicketRemarks = (id) => apiClient.get(`/tickets/${id}/remarks`)

export const addTicketRemark = (id, remark, remarkType = 'general', attachments = [], isInternal = false) => {
  const files = Array.isArray(attachments) ? attachments.filter((f) => f instanceof File) : []
  const internalFlag = isInternal ? '1' : '0'
  if (files.length > 0) {
    const formData = new FormData()
    if (remark) formData.append('remark', remark)
    formData.append('remark_type', remarkType)
    formData.append('is_internal', internalFlag)
    files.forEach((file) => formData.append('attachments[]', file))
    return apiClient.post(`/tickets/${id}/remarks`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  return apiClient.post(`/tickets/${id}/remarks`, {
    remark,
    remark_type: remarkType,
    is_internal: isInternal,
  })
}

// Attachments
export const uploadTicketAttachments = (id, files) => {
  const formData = new FormData()
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append('attachments[]', file)
    }
  })
  return apiClient.post(`/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteTicketAttachment = (ticketId, attachmentId) =>
  apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`)

// Executive escalation — manually forward a High/Urgent ticket to all
// configured global approvers (e.g., President, C-suite). One-time per ticket.
export const fetchEscalationPreview = (id) =>
  apiClient.get(`/tickets/${id}/escalation-preview`)

export const escalateTicket = (id) => apiClient.post(`/tickets/${id}/escalate`)

// Stats
export const fetchTicketStatistics = () => apiClient.get('/tickets/statistics')

// Reference data (reused endpoints)
export const fetchTicketEmployees = () => apiClient.get('/employees', { params: { all: true } })

export const fetchTicketAssignees = () => apiClient.get('/users', { params: { all: true } })
