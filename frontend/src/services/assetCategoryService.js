import apiClient from './apiClient'

export const getCategories = () => apiClient.get('/asset-categories')

export const createCategory = (payload) => apiClient.post('/asset-categories', payload)

export const updateCategory = (id, payload) => apiClient.put(`/asset-categories/${id}`, payload)

export const deleteCategory = (id) => apiClient.delete(`/asset-categories/${id}`)
