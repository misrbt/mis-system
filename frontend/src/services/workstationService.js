import apiClient from './apiClient'

// Workstation CRUD operations
export const fetchWorkstationsRequest = (params = {}) =>
  apiClient.get('/workstations', { params })

export const fetchWorkstationRequest = (id) =>
  apiClient.get(`/workstations/${id}`)

export const createWorkstationRequest = (payload) =>
  apiClient.post('/workstations', payload)

export const updateWorkstationRequest = (id, payload) =>
  apiClient.put(`/workstations/${id}`, payload)

export const deleteWorkstationRequest = (id) =>
  apiClient.delete(`/workstations/${id}`)

// Workstation by branch
export const fetchWorkstationsByBranchRequest = (branchId) =>
  apiClient.get(`/workstations/by-branch/${branchId}`)

// Workstation assets
export const fetchWorkstationAssetsRequest = (id) =>
  apiClient.get(`/workstations/${id}/assets`)

// Workstation employees
export const fetchWorkstationEmployeesRequest = (id) =>
  apiClient.get(`/workstations/${id}/employees`)

// Employee assignment operations
export const assignEmployeeToWorkstationRequest = (workstationId, employeeId) =>
  apiClient.post(`/workstations/${workstationId}/assign-employee`, { employee_id: employeeId })

export const unassignEmployeeFromWorkstationRequest = (workstationId, employeeId) =>
  apiClient.post(`/workstations/${workstationId}/unassign-employee`, { employee_id: employeeId })

// Asset assignment operations
export const assignAssetToWorkstationRequest = (workstationId, assetId) =>
  apiClient.post(`/workstations/${workstationId}/assign-asset`, { asset_id: assetId })

export const transferAssetBetweenWorkstationsRequest = (fromWorkstationId, assetId, toWorkstationId) =>
  apiClient.post(`/workstations/${fromWorkstationId}/transfer-asset`, {
    asset_id: assetId,
    to_workstation_id: toWorkstationId,
  })

// Employee workstations
export const fetchEmployeeWorkstationsRequest = (employeeId) =>
  apiClient.get(`/employees/${employeeId}/workstations`)

// Default export with all methods
export default {
  fetchWorkstations: fetchWorkstationsRequest,
  fetchWorkstation: fetchWorkstationRequest,
  createWorkstation: createWorkstationRequest,
  updateWorkstation: updateWorkstationRequest,
  deleteWorkstation: deleteWorkstationRequest,
  fetchWorkstationsByBranch: fetchWorkstationsByBranchRequest,
  fetchWorkstationAssets: fetchWorkstationAssetsRequest,
  fetchWorkstationEmployees: fetchWorkstationEmployeesRequest,
  assignEmployee: assignEmployeeToWorkstationRequest,
  unassignEmployee: unassignEmployeeFromWorkstationRequest,
  assignAsset: assignAssetToWorkstationRequest,
  transferAsset: transferAssetBetweenWorkstationsRequest,
  fetchEmployeeWorkstations: fetchEmployeeWorkstationsRequest,
}
