import apiClient from './apiClient'

/**
 * Report Service - API calls for asset reports
 */
const reportService = {
  /**
   * Get asset report data with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response with asset data and summary
   */
  getAssetReport: async (filters) => {
    const response = await apiClient.get('/reports/assets', { params: filters })
    return response.data
  },

  /**
   * Export asset report as PDF (server-side generation)
   * @param {Object} filters - Filter parameters
   * @returns {Promise} PDF blob
   */
  exportPDF: async (filters) => {
    const response = await apiClient.post(
      '/reports/assets/export',
      { format: 'pdf', ...filters },
      { responseType: 'blob' }
    )
    return response
  },
}

export default reportService
