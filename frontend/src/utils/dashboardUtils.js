/**
 * Dashboard utility functions for data processing and formatting
 * Implements DRY principle by centralizing common operations
 */

/**
 * Format currency to Philippine Peso
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

/**
 * Format large numbers with comma separators
 */
export const formatCompactNumber = (number) => {
  return `₱${Number(number || 0).toLocaleString()}`
}

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Transform data for category chart
 */
export const transformCategoryChartData = (assetsByCategory) => {
  return assetsByCategory.map(item => ({
    name: item.category,
    value: item.count,
  }))
}

/**
 * Transform data for status chart
 */
export const transformStatusChartData = (assetsByStatus, colorMap) => {
  return assetsByStatus.map(item => ({
    name: item.status,
    value: item.count,
    color: colorMap[item.status] || '#64748b',
  }))
}

/**
 * Transform data for acquisitions chart
 */
export const transformAcquisitionsChartData = (monthlyAcquisitions) => {
  return monthlyAcquisitions.map(item => ({
    name: item.month || 'N/A',
    count: item.count || 0,
  }))
}

/**
 * Calculate KPI metrics from statistics data
 */
export const calculateKPIMetrics = (statsData, currentMonthTotal) => {
  const overview = statsData?.overview || {}
  const assetsByStatus = statsData?.assets_by_status || []

  const resolveNumber = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback
    const numeric = Number(value)
    return Number.isNaN(numeric) ? fallback : numeric
  }

  // Get specific status counts
  const getStatusCount = (statusName) => {
    const status = assetsByStatus.find(s => s.status === statusName)
    return status?.count || 0
  }

  const totalAssetsFallback = assetsByStatus.reduce(
    (sum, item) => sum + (Number(item?.count) || 0),
    0
  )

  return {
    totalAssets: resolveNumber(overview.total_assets, 0) || totalAssetsFallback,
    currentMonthExpenses: currentMonthTotal,
    availableAssets: resolveNumber(overview.available_assets, getStatusCount('Available')),
    assignedAssets: resolveNumber(overview.assigned_assets, getStatusCount('Assigned')),
    underRepair: resolveNumber(overview.under_repair, getStatusCount('Under Repair')),
    dueForMaintenance: resolveNumber(overview.warranty_expiring_soon, 0),
    retiredLost: getStatusCount('Retired') + getStatusCount('Lost'),
  }
}

/**
 * Generate color palette for charts
 */
export const generateChartColors = (count) => {
  const baseColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ]

  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }

  // Generate more colors if needed
  const colors = [...baseColors]
  while (colors.length < count) {
    colors.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
  }
  return colors
}

/**
 * Status color mapping
 */
export const STATUS_COLOR_MAP = {
  Available: '#10b981',
  Assigned: '#3b82f6',
  'Under Repair': '#f59e0b',
  Retired: '#6b7280',
  Lost: '#ef4444',
  Functional: '#3b82f6',
  'For Disposal': '#94a3b8',
  'Unserviceable': '#ef4444',
  New: '#22c55e',
  indigo: '#6366f1',
}

/**
 * Status badge configuration
 */
export const STATUS_BADGE_CONFIG = {
  Available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  'Under Repair': 'bg-amber-100 text-amber-700 border-amber-200',
  Retired: 'bg-slate-100 text-slate-700 border-slate-200',
  Lost: 'bg-red-100 text-red-700 border-red-200',
}

/**
 * Priority badge configuration
 */
export const PRIORITY_BADGE_CONFIG = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-700',
}

/**
 * KPI card icon mapping
 */
export const KPI_ICON_CONFIG = {
  totalAssets: { color: 'blue', bgColor: 'bg-blue-50' },
  currentMonthExpenses: { color: 'indigo', bgColor: 'bg-indigo-50' },
  availableAssets: { color: 'emerald', bgColor: 'bg-emerald-50' },
  assignedAssets: { color: 'blue', bgColor: 'bg-blue-50' },
  underRepair: { color: 'amber', bgColor: 'bg-amber-50' },
  dueForMaintenance: { color: 'orange', bgColor: 'bg-orange-50' },
  retiredLost: { color: 'slate', bgColor: 'bg-slate-50' },
}

/**
 * Filter and search assets
 */
export const filterAssets = (assets, searchQuery, selectedBranch, selectedStatuses) => {
  return assets.filter(asset => {
    const matchesSearch =
      !searchQuery ||
      asset.asset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBranch =
      selectedBranch === 'all' ||
      asset.branch?.toLowerCase() === selectedBranch.toLowerCase()

    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(asset.status)

    return matchesSearch && matchesBranch && matchesStatus
  })
}

/**
 * Paginate array
 */
export const paginateArray = (array, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return array.slice(startIndex, endIndex)
}

/**
 * Calculate total pages
 */
export const calculateTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Format date to locale string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A'

  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(date)
}

/**
 * Branch Analytics Utility Functions
 */

/**
 * Calculate total expenses for a specific branch from monthly trends
 * @param {Array} monthlyTrends - Array of monthly trend data
 * @param {string} branchName - Name of the branch
 * @returns {number} Total expenses (acquisitions + repairs)
 */
export const calculateBranchTotalExpenses = (monthlyTrends, branchName) => {
  if (!monthlyTrends || !Array.isArray(monthlyTrends) || !branchName) {
    return 0
  }

  return monthlyTrends.reduce((sum, monthData) => {
    const branchData = monthData.branches?.[branchName]
    if (!branchData) return sum

    const acquisitionCost = Number(branchData.acquisition_cost) || 0
    const repairCost = Number(branchData.repair_cost) || 0
    return sum + acquisitionCost + repairCost
  }, 0)
}

/**
 * Get top N branches by total asset count
 * @param {Array} branchSummary - Array of branch summary data
 * @param {number} topN - Number of top branches to return (default: 5)
 * @returns {Array} Sorted array of top branches by asset count
 */
export const getTopBranchesByAssets = (branchSummary, topN = 5) => {
  if (!branchSummary || !Array.isArray(branchSummary)) {
    return []
  }

  return [...branchSummary]
    .sort((a, b) => (b.total_assets || 0) - (a.total_assets || 0))
    .slice(0, topN)
}

/**
 * Get top N branches by total book value
 * @param {Array} branchSummary - Array of branch summary data
 * @param {number} topN - Number of top branches to return (default: 5)
 * @returns {Array} Sorted array of top branches by book value
 */
export const getTopBranchesByValue = (branchSummary, topN = 5) => {
  if (!branchSummary || !Array.isArray(branchSummary)) {
    return []
  }

  return [...branchSummary]
    .sort((a, b) => (b.total_book_value || 0) - (a.total_book_value || 0))
    .slice(0, topN)
}

/**
 * Format branch statistics data for export
 * @param {Object} branchStats - Branch statistics object
 * @returns {Object} Formatted data ready for export (CSV, Excel, etc.)
 */
export const formatBranchDataForExport = (branchStats) => {
  if (!branchStats) {
    return { summary: [], trends: [], statusBreakdown: [] }
  }

  const { summary = [], monthly_trends = [], status_breakdown = [] } = branchStats

  // Format summary data
  const formattedSummary = summary.map(branch => ({
    'Branch Name': branch.branch_name || 'N/A',
    'Total Assets': branch.total_assets || 0,
    'Total Book Value': formatCurrency(branch.total_book_value || 0),
    'Total Acquisition Cost': formatCurrency(branch.total_acquisition_cost || 0),
  }))

  // Format monthly trends (flatten by branch)
  const formattedTrends = []
  monthly_trends.forEach(monthData => {
    Object.entries(monthData.branches || {}).forEach(([branchName, data]) => {
      formattedTrends.push({
        'Month': monthData.month || 'N/A',
        'Branch': branchName,
        'Acquisition Cost': formatCurrency(data.acquisition_cost || 0),
        'Repair Cost': formatCurrency(data.repair_cost || 0),
        'Total Expense': formatCurrency(data.total_expense || 0),
        'Assets Acquired': data.assets_acquired || 0,
        'Repairs Completed': data.repairs_count || 0,
      })
    })
  })

  // Format status breakdown
  const formattedStatusBreakdown = []
  status_breakdown.forEach(branch => {
    branch.statuses?.forEach(status => {
      formattedStatusBreakdown.push({
        'Branch': branch.branch_name || 'N/A',
        'Status': status.status || 'N/A',
        'Count': status.count || 0,
      })
    })
  })

  return {
    summary: formattedSummary,
    trends: formattedTrends,
    statusBreakdown: formattedStatusBreakdown,
  }
}

/**
 * Calculate branch performance metrics
 * @param {Object} branchData - Single branch summary object
 * @param {Array} monthlyTrends - Array of monthly trend data
 * @returns {Object} Performance metrics for the branch
 */
export const calculateBranchPerformanceMetrics = (branchData, monthlyTrends) => {
  if (!branchData) {
    return {
      totalExpenses: 0,
      averageMonthlyExpense: 0,
      assetUtilizationRate: 0,
      expensePerAsset: 0,
    }
  }

  const totalExpenses = calculateBranchTotalExpenses(monthlyTrends, branchData.branch_name)
  const averageMonthlyExpense = monthlyTrends.length > 0 ? totalExpenses / monthlyTrends.length : 0
  const totalAssets = branchData.total_assets || 0
  const expensePerAsset = totalAssets > 0 ? totalExpenses / totalAssets : 0

  return {
    totalExpenses,
    averageMonthlyExpense,
    expensePerAsset,
    totalAssets,
    totalBookValue: branchData.total_book_value || 0,
  }
}
