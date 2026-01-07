import apiClient from './apiClient'

export const fetchRepairs = (params) => apiClient.get('/repairs', { params })

export const fetchRepairStats = () => apiClient.get('/repairs/statistics')

export const fetchRepairAssets = () => apiClient.get('/assets', { params: { all: true } })

export const fetchRepairStatuses = () => apiClient.get('/statuses')

export const fetchVendors = () => apiClient.get('/vendors')

export const updateRepair = (id, data) => apiClient.put(`/repairs/${id}`, data)

export const deleteRepair = (id) => apiClient.delete(`/repairs/${id}`)

export const updateRepairStatus = (id, payload) => {
  // If payload contains a file, use FormData with POST (Laravel requirement for file uploads)
  if (payload.job_order instanceof File) {
    const formData = new FormData()

    // Add all payload fields to FormData
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key])
      }
    })

    // Laravel requires _method field for PATCH/PUT with file uploads
    formData.append('_method', 'PATCH')

    return apiClient.post(`/repairs/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
  return apiClient.patch(`/repairs/${id}/status`, payload)
}
