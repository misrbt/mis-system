import apiClient from './apiClient'

export const fetchRepairRemarks = (repairId) => apiClient.get(`/repairs/${repairId}/remarks`)

export const addRepairRemark = (repairId, data) => apiClient.post(`/repairs/${repairId}/remarks`, data)
