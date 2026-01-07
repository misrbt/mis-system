import apiClient from './apiClient'

export const fetchPositionsRequest = () => apiClient.get('/positions')
