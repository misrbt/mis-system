import apiClient from './apiClient'

export const fetchBranchesRequest = () => apiClient.get('/branches')

export const createBranchRequest = (payload) => apiClient.post('/branches', payload)

export const updateBranchRequest = (id, payload) => apiClient.put(`/branches/${id}`, payload)

export const deleteBranchRequest = (id) => apiClient.delete(`/branches/${id}`)
