import apiClient from './apiClient'

const equipmentService = {
    getAll: () => apiClient.get('/equipment'),
    getById: (id) => apiClient.get(`/equipment/${id}`),
    create: (data) => apiClient.post('/equipment', data),
    update: (id, data) => apiClient.put(`/equipment/${id}`, data),
    delete: (id) => apiClient.delete(`/equipment/${id}`),
}

export default equipmentService
