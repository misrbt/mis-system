import apiClient from './apiClient'

export const fetchHelpdeskAuditLogs = (params) =>
  apiClient.get('/helpdesk-audit-logs', { params })

export const fetchHelpdeskAuditStatistics = (params) =>
  apiClient.get('/helpdesk-audit-logs/statistics', { params })

export const fetchTicketAuditLog = (ticketId) =>
  apiClient.get(`/helpdesk-audit-logs/tickets/${ticketId}`)

export const exportHelpdeskAuditLogs = (params) =>
  apiClient.get('/helpdesk-audit-logs/export', { params })
