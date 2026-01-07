import apiClient from './apiClient'

export const fetchEmployeesRequest = () => apiClient.get('/employees')

export const createEmployeeRequest = (payload) => apiClient.post('/employees', payload)

export const updateEmployeeRequest = (id, payload) => apiClient.put(`/employees/${id}`, payload)

export const deleteEmployeeRequest = (id) => apiClient.delete(`/employees/${id}`)
