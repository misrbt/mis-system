import apiClient from './apiClient'

const auditLogService = {
  /**
   * Fetch audit logs with filtering
   * @param {Object} params - Filter parameters (asset_id, movement_type, date_from, date_to, performed_by, search, etc.)
   */
  fetchAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs', { params })
    return response.data
  },

  /**
   * Get complete audit log for a specific asset
   * @param {number} assetId - Asset ID
   */
  fetchAssetAuditLog: async (assetId) => {
    const response = await apiClient.get(`/audit-logs/assets/${assetId}`)
    return response.data
  },

  /**
   * Get audit logs for a specific user
   * @param {number} userId - User ID
   */
  fetchUserAuditLog: async (userId) => {
    const response = await apiClient.get(`/audit-logs/users/${userId}`)
    return response.data
  },

  /**
   * Get audit log statistics
   * @param {Object} params - Filter parameters for stats
   */
  fetchStatistics: async (params = {}) => {
    const response = await apiClient.get('/audit-logs/statistics', { params })
    return response.data
  },

  /**
   * Export audit logs
   * @param {Object} params - Filter parameters and format
   */
  exportAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs/export', {
      params,
      responseType: params.format === 'pdf' ? 'blob' : 'json',
    })
    return response.data
  },
}

export default auditLogService
