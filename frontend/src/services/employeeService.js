import apiClient from './apiClient'

export const fetchEmployeesRequest = (params = {}) => apiClient.get('/employees', { params: { ...params, all: true } })

export const createEmployeeRequest = (payload) => apiClient.post('/employees', payload)

export const updateEmployeeRequest = (id, payload) => apiClient.put(`/employees/${id}`, payload)

export const deleteEmployeeRequest = (id) => apiClient.delete(`/employees/${id}`)

export const branchTransitionRequest = (payload) => apiClient.post('/employees/branch-transition', payload)

export const employeeTransitionRequest = (payload) => apiClient.post('/employees/employee-transition', payload)
