import apiClient from './apiClient'

export const fetchSectionsRequest = () => apiClient.get('/sections')

export const createSectionRequest = (payload) => apiClient.post('/sections', payload)

export const updateSectionRequest = (id, payload) => apiClient.put(`/sections/${id}`, payload)

export const deleteSectionRequest = (id) => apiClient.delete(`/sections/${id}`)
