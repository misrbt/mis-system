import apiClient from './apiClient'

export const getSubcategories = (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return apiClient.get(`/asset-subcategories${queryString ? `?${queryString}` : ''}`)
}

export const getSubcategoriesByCategory = (categoryId) => {
  return apiClient.get(`/asset-categories/${categoryId}/subcategories`)
}

export const createSubcategory = (payload) => apiClient.post('/asset-subcategories', payload)

export const updateSubcategory = (id, payload) => apiClient.put(`/asset-subcategories/${id}`, payload)

export const deleteSubcategory = (id) => apiClient.delete(`/asset-subcategories/${id}`)
