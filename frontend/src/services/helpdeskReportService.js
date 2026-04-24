import apiClient from './apiClient'

export const fetchHelpdeskSummary = (params) =>
  apiClient.get('/helpdesk/reports/summary', { params })

export const fetchTopRequesters = (params) =>
  apiClient.get('/helpdesk/reports/top-requesters', { params })

export const fetchTopResolvers = (params) =>
  apiClient.get('/helpdesk/reports/top-resolvers', { params })

export const fetchHelpdeskBreakdowns = (params) =>
  apiClient.get('/helpdesk/reports/breakdowns', { params })

export const fetchHelpdeskVolumeTrend = (params) =>
  apiClient.get('/helpdesk/reports/volume-trend', { params })

export const fetchHelpdeskDetailedTickets = (params) =>
  apiClient.get('/helpdesk/reports/tickets', { params })

export const fetchHelpdeskWorkload = () =>
  apiClient.get('/helpdesk/reports/workload')

export const fetchRecurringIssues = (params) =>
  apiClient.get('/helpdesk/reports/recurring-issues', { params })

export const fetchTicketsByBranch = (params) =>
  apiClient.get('/helpdesk/reports/tickets-by-branch', { params })

export const fetchBranchesWithRequesters = (params) =>
  apiClient.get('/helpdesk/reports/branches-with-requesters', { params })
