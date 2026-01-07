import apiClient from './apiClient'

const dashboardService = {
  /**
   * Get monthly expenses for the last 12 months
   */
  fetchMonthlyExpenses: async () => {
    const response = await apiClient.get('/dashboard/monthly-expenses')
    return response.data
  },

  /**
   * Get yearly expenses comparison
   */
  fetchYearlyExpenses: async () => {
    const response = await apiClient.get('/dashboard/yearly-expenses')
    return response.data
  },

  /**
   * Get expense trends for specific period
   * @param {number} year - Year
   * @param {number} month - Month (optional)
   */
  fetchExpenseTrends: async (year, month = null) => {
    const params = { year }
    if (month) {
      params.month = month
    }
    const response = await apiClient.get('/dashboard/expense-trends', { params })
    return response.data
  },

  /**
   * Get expense breakdown by category, branch, vendor
   * @param {number} year - Year
   * @param {number} month - Month (optional)
   */
  fetchExpenseBreakdown: async (year, month = null) => {
    const params = { year }
    if (month) {
      params.month = month
    }
    const response = await apiClient.get('/dashboard/expense-breakdown', { params })
    return response.data
  },

  /**
   * Get comprehensive dashboard statistics
   */
  fetchStatistics: async () => {
    const response = await apiClient.get('/dashboard/statistics')
    return response.data
  },

  /**
   * Get asset status distribution
   */
  fetchStatusDistribution: async () => {
    const response = await apiClient.get('/dashboard/status-distribution')
    return response.data
  },

  /**
   * Get asset acquisition trend
   */
  fetchAssetTrend: async () => {
    const response = await apiClient.get('/dashboard/asset-trend')
    return response.data
  },

  /**
   * Get assets needing attention
   */
  fetchAssetsNeedingAttention: async (limit = 50) => {
    const response = await apiClient.get('/dashboard/assets-needing-attention', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get recent activity
   */
  fetchRecentActivity: async (limit = 10) => {
    const response = await apiClient.get('/dashboard/recent-activity', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get branch-level statistics with monthly trends
   * @param {number} months - Number of months (default 12)
   */
  fetchBranchStatistics: async (months = 12) => {
    const response = await apiClient.get('/dashboard/branch-statistics', {
      params: { months },
    })
    return response.data
  },
}

export default dashboardService
