import apiClient from './apiClient'

export const fetchPublicEmployees = () => apiClient.get('/public/helpdesk/employees')

export const fetchPublicCategories = () => apiClient.get('/public/helpdesk/categories')

export const submitPublicTicket = (payload) => {
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
      if (file instanceof File) formData.append('attachments[]', file)
    })
    return apiClient.post('/public/helpdesk/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  const { attachments: _ignore, ...rest } = payload
  return apiClient.post('/public/helpdesk/tickets', rest)
}

export const trackPublicTicket = (ticketNumber) =>
  apiClient.get(`/public/helpdesk/tickets/track/${encodeURIComponent(ticketNumber)}`)

export const submitPublicTicketRating = ({ ticketNumber, rating, comment }) =>
  apiClient.patch(`/public/helpdesk/tickets/track/${encodeURIComponent(ticketNumber)}/rating`, {
    rating,
    comment,
  })

// Approval workflow — token-based, no auth.
export const fetchApprovalRequest = (token) =>
  apiClient.get(`/public/helpdesk/approval/${encodeURIComponent(token)}`)

export const approveTicket = (token, approverName) =>
  apiClient.post(`/public/helpdesk/approval/${encodeURIComponent(token)}/approve`, {
    approver_name: approverName || null,
  })

export const rejectTicket = (token, { reason, approverName } = {}) =>
  apiClient.post(`/public/helpdesk/approval/${encodeURIComponent(token)}/reject`, {
    reason: reason || null,
    approver_name: approverName || null,
  })

export const addPublicTicketRemark = ({ ticketNumber, remark, attachments }) => {
  const files = Array.isArray(attachments) ? attachments.filter((f) => f instanceof File) : []
  if (files.length > 0) {
    const formData = new FormData()
    if (remark) formData.append('remark', remark)
    files.forEach((file) => formData.append('attachments[]', file))
    return apiClient.post(
      `/public/helpdesk/tickets/track/${encodeURIComponent(ticketNumber)}/remarks`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
  return apiClient.post(
    `/public/helpdesk/tickets/track/${encodeURIComponent(ticketNumber)}/remarks`,
    { remark }
  )
}
