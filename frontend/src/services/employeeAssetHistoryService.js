import apiClient from './apiClient'

export const fetchEmployeeAssetHistory = (employeeId, params = {}) =>
  apiClient.get(`/employees/${employeeId}/asset-history`, { params })
