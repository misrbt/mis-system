/**
 * Asset Formatting Utilities
 * Centralized formatting functions for asset-related data
 */

/**
 * Format date to localized string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format currency amount in Philippine Peso
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0
  return `₱${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format large currency amounts in compact form (e.g., ₱1.2M, ₱500k)
 * @param {number|string} amount - Amount to format
 * @returns {string} Compact currency string
 */
export const formatCompactCurrency = (amount) => {
  const value = Number(amount) || 0
  if (value >= 1000000) {
    return `₱${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `₱${(value / 1000).toFixed(0)}k`
  }
  return formatCurrency(value)
}

/**
 * Normalize API response to array
 * @param {object|array} payload - API response payload
 * @returns {array} Normalized array
 */
export const normalizeArrayResponse = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

/**
 * Get status color from status color map
 * @param {number} statusId - Status ID
 * @param {object} statusColorMap - Map of status ID to color
 * @returns {string} Hex color code
 */
export const getStatusColor = (statusId, statusColorMap) => {
  return statusColorMap[statusId] || '#64748b'
}

/**
 * Calculate warranty status based on expiration date
 * @param {string} expirationDate - Warranty expiration date
 * @returns {object} Status object with status, label, and color
 */
export const getWarrantyStatus = (expirationDate) => {
  if (!expirationDate) {
    return {
      status: 'no-warranty',
      label: 'No Warranty',
      color: 'gray',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    }
  }

  const expiry = new Date(expirationDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      color: 'red',
      badgeClass: 'bg-red-100 text-red-700 border-red-300',
      daysOverdue: Math.abs(daysUntilExpiry),
    }
  }

  if (daysUntilExpiry <= 30) {
    return {
      status: 'expiring-soon',
      label: 'Expiring Soon',
      color: 'orange',
      badgeClass: 'bg-orange-100 text-orange-700 border-orange-300',
      daysRemaining: daysUntilExpiry,
    }
  }

  return {
    status: 'active',
    label: 'Active',
    color: 'green',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    daysRemaining: daysUntilExpiry,
  }
}

/**
 * Format a number with commas
 * @param {number|string} number - Number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (number) => {
  const value = Number(number) || 0
  return value.toLocaleString()
}

/**
 * Calculate depreciation based on purchase date and estimated life
 * @param {number} acquisitionCost - Original acquisition cost
 * @param {string} purchaseDate - Purchase date ISO string
 * @param {number} estimatedLife - Estimated life in years
 * @returns {object} Depreciation info with current book value and depreciation amount
 */
export const calculateDepreciation = (acquisitionCost, purchaseDate, estimatedLife) => {
  if (!acquisitionCost || !purchaseDate || !estimatedLife) {
    return {
      bookValue: acquisitionCost || 0,
      depreciationAmount: 0,
      depreciationRate: 0,
      yearsElapsed: 0,
    }
  }

  const cost = Number(acquisitionCost)
  const life = Number(estimatedLife)
  const purchase = new Date(purchaseDate)
  const now = new Date()

  const yearsElapsed = (now - purchase) / (1000 * 60 * 60 * 24 * 365.25)
  const annualDepreciation = cost / life
  const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, cost)
  const bookValue = Math.max(cost - totalDepreciation, 0)
  const depreciationRate = (totalDepreciation / cost) * 100

  return {
    bookValue: Math.round(bookValue * 100) / 100,
    depreciationAmount: Math.round(totalDepreciation * 100) / 100,
    depreciationRate: Math.round(depreciationRate * 100) / 100,
    yearsElapsed: Math.round(yearsElapsed * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
  }
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get relative time description (e.g., "2 days ago", "in 3 hours")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time description
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
  if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Validate if a value is a valid number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  return !isNaN(Number(value)) && value !== null && value !== ''
}

/**
 * Validate if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}
