/**
 * QR Code Service
 * Generates custom QR codes using:
 * 1. Backend API (preferred - stores in database)
 * 2. QR Code Monkey API (direct frontend generation)
 *
 * QR Code Monkey API: https://www.qrcode-monkey.com/qr-code-api-with-logo/
 */

import apiClient from './apiClient'

const QR_CODE_API_URL = 'https://api.qrcode-monkey.com/qr/custom'

/**
 * API timeout in milliseconds
 */
const API_TIMEOUT = 15000

/**
 * Error codes for different failure scenarios
 */
export const QR_ERROR_CODES = {
  NO_INTERNET: 'NO_INTERNET',
  API_TIMEOUT: 'API_TIMEOUT',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GENERATION_FAILED: 'GENERATION_FAILED',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [QR_ERROR_CODES.NO_INTERNET]: 'Unable to connect to QR code service. Please check your internet connection.',
  [QR_ERROR_CODES.API_TIMEOUT]: 'QR code generation timed out. Please try again.',
  [QR_ERROR_CODES.API_ERROR]: 'QR code service is temporarily unavailable. Please try again later.',
  [QR_ERROR_CODES.NETWORK_ERROR]: 'Network error occurred. Please check your connection and try again.',
  [QR_ERROR_CODES.GENERATION_FAILED]: 'Failed to generate QR code. Please try again.',
}

/**
 * Get user-friendly error message
 * @param {string} errorCode - Error code
 * @param {string} fallbackMessage - Fallback message if code not found
 * @returns {string}
 */
export function getErrorMessage(errorCode, fallbackMessage = 'An error occurred') {
  return ERROR_MESSAGES[errorCode] || fallbackMessage
}

/**
 * Default QR code configuration
 * Standard square QR code design matching sample-qrcode.png:
 * - body: square (standard square modules)
 * - eye: frame0 (square eye frame)
 * - eyeBall: ball0 (square eye ball)
 * - erf1, erf2, erf3: eye frame colors (empty = use bodyColor)
 * - erb1, erb2, erb3: eye ball colors (empty = use bodyColor)
 */
const DEFAULT_CONFIG = {
  body: 'square',
  eye: 'frame0',
  eyeBall: 'ball0',
  erf1: '',
  erf2: '',
  erf3: '',
  erb1: '',
  erb2: '',
  erb3: '',
  bodyColor: '#000000',
  bgColor: '#FFFFFF',
}

/**
 * Check if the error is a network/connection error
 * @param {Error} error
 * @returns {boolean}
 */
function isNetworkError(error) {
  return (
    !navigator.onLine ||
    error.message?.includes('Network Error') ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('ERR_NETWORK') ||
    error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  )
}

/**
 * Check if the error is a timeout error
 * @param {Error} error
 * @returns {boolean}
 */
function isTimeoutError(error) {
  return (
    error.message?.includes('timeout') ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  )
}

/**
 * Create a standardized error object
 * @param {Error} error - Original error
 * @returns {Object} - Standardized error object
 */
function createQRError(error) {
  let code = QR_ERROR_CODES.GENERATION_FAILED
  let message = error.message || 'Failed to generate QR code'

  if (!navigator.onLine) {
    code = QR_ERROR_CODES.NO_INTERNET
    message = ERROR_MESSAGES[code]
  } else if (isTimeoutError(error)) {
    code = QR_ERROR_CODES.API_TIMEOUT
    message = ERROR_MESSAGES[code]
  } else if (isNetworkError(error)) {
    code = QR_ERROR_CODES.NETWORK_ERROR
    message = ERROR_MESSAGES[code]
  }

  // Check for backend error response
  if (error.response?.data) {
    const backendError = error.response.data
    if (backendError.error_code) {
      code = backendError.error_code
    }
    if (backendError.error || backendError.message) {
      message = backendError.error || backendError.message
    }
  }

  const qrError = new Error(message)
  qrError.code = code
  qrError.originalError = error

  return qrError
}

/**
 * Generate QR code for an asset via Backend API
 * This is the preferred method as it stores the QR code in the database
 *
 * @param {number} assetId - The asset ID
 * @returns {Promise<Object>} - Returns object with qr_code data
 * @throws {Error} - Throws error with code and user-friendly message
 */
export async function generateQRCodeViaBackend(assetId) {
  // Check internet connection first
  if (!navigator.onLine) {
    const error = new Error(ERROR_MESSAGES[QR_ERROR_CODES.NO_INTERNET])
    error.code = QR_ERROR_CODES.NO_INTERNET
    throw error
  }

  try {
    const response = await apiClient.post(`/assets/${assetId}/generate-qr-code`, null, {
      timeout: API_TIMEOUT,
    })

    // Check if backend returned a warning (fallback was used)
    if (response.data.warning) {
      console.warn('QR code generated with warning:', response.data.warning)
    }

    return response.data
  } catch (error) {
    console.error('Failed to generate QR code via backend:', error)
    throw createQRError(error)
  }
}

/**
 * Regenerate QR code for an asset (forces new generation)
 *
 * @param {number} assetId - The asset ID
 * @returns {Promise<Object>} - Returns object with new qr_code data
 * @throws {Error} - Throws error with code and user-friendly message
 */
export async function regenerateQRCode(assetId) {
  return generateQRCodeViaBackend(assetId)
}

/**
 * Generate a QR code directly using QR Code Monkey API
 * Use this when you need a QR code without storing it in database
 *
 * @param {string} data - The content to encode in the QR code
 * @param {Object} options - Optional configuration overrides
 * @returns {Promise<string>} - Returns the QR code image as a data URL
 * @throws {Error} - Throws error with code and user-friendly message
 */
export async function generateQRCodeDirect(data, options = {}) {
  // Check internet connection first
  if (!navigator.onLine) {
    const error = new Error(ERROR_MESSAGES[QR_ERROR_CODES.NO_INTERNET])
    error.code = QR_ERROR_CODES.NO_INTERNET
    throw error
  }

  const { size = 300, config = {}, file = 'png' } = options

  const requestBody = {
    data,
    config: {
      ...DEFAULT_CONFIG,
      ...config,
    },
    size,
    download: false,
    file,
  }

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(QR_CODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = new Error(`QR Code API error: ${response.status} ${response.statusText}`)
      error.code = QR_ERROR_CODES.API_ERROR
      throw error
    }

    // The API returns binary image data
    const blob = await response.blob()

    // Validate response
    if (!blob || blob.size < 100) {
      const error = new Error('QR Code API returned invalid response')
      error.code = QR_ERROR_CODES.API_ERROR
      throw error
    }

    return URL.createObjectURL(blob)
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      const timeoutError = new Error(ERROR_MESSAGES[QR_ERROR_CODES.API_TIMEOUT])
      timeoutError.code = QR_ERROR_CODES.API_TIMEOUT
      throw timeoutError
    }

    // Handle network errors
    if (isNetworkError(error)) {
      const networkError = new Error(ERROR_MESSAGES[QR_ERROR_CODES.NETWORK_ERROR])
      networkError.code = QR_ERROR_CODES.NETWORK_ERROR
      throw networkError
    }

    console.error('Failed to generate QR code directly:', error)
    throw createQRError(error)
  }
}

/**
 * Get QR code for an asset
 * Returns existing QR code if available, or generates a new one
 *
 * @param {Object} asset - Asset object with qr_code and other details
 * @param {boolean} forceRegenerate - Force regeneration even if QR code exists
 * @returns {Promise<Object>} - Returns object with src (data URL) and asset info
 */
export async function getAssetQRCode(asset, forceRegenerate = false) {
  // If asset already has QR code and we don't need to regenerate, return it
  if (asset?.qr_code && !forceRegenerate) {
    return {
      src: asset.qr_code,
      asset_name: asset.asset_name,
      serial_number: asset.serial_number,
      type: 'qr',
      source: 'cached',
    }
  }

  // Try to generate via backend API first
  if (asset?.id) {
    try {
      const response = await generateQRCodeViaBackend(asset.id)
      if (response?.data?.qr_code) {
        return {
          src: response.data.qr_code,
          asset_name: asset.asset_name,
          serial_number: asset.serial_number,
          type: 'qr',
          source: 'backend',
        }
      }
    } catch (error) {
      console.warn('Backend QR generation failed, falling back to direct API:', error)
    }
  }

  // Fallback: Generate directly using QR Code Monkey API
  if (asset?.serial_number) {
    const qrCodeUrl = await generateQRCodeDirect(asset.serial_number, {
      size: 300,
      config: DEFAULT_CONFIG,
    })

    return {
      src: qrCodeUrl,
      asset_name: asset.asset_name,
      serial_number: asset.serial_number,
      type: 'qr',
      source: 'direct',
    }
  }

  throw new Error('Asset serial number or ID is required to generate QR code')
}

/**
 * Generate a QR code with asset URL (for scanning to view asset details)
 *
 * @param {Object} asset - Asset object
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Returns object with src and asset info
 */
export async function generateAssetQRCodeWithUrl(asset, options = {}) {
  if (!asset?.id) {
    throw new Error('Asset ID is required to generate QR code URL')
  }

  // Create a URL that points to the asset detail page
  const baseUrl = window.location.origin
  const assetUrl = `${baseUrl}/inventory/assets/${asset.id}`

  const qrCodeUrl = await generateQRCodeDirect(assetUrl, {
    size: options.size || 300,
    config: {
      ...DEFAULT_CONFIG,
      ...options.config,
    },
  })

  return {
    src: qrCodeUrl,
    asset_name: asset.asset_name,
    serial_number: asset.serial_number,
    asset_url: assetUrl,
    type: 'qr',
    source: 'direct',
  }
}

/**
 * Cleanup function to revoke object URLs when no longer needed
 * Call this when the QR code is no longer displayed to free memory
 *
 * @param {string} objectUrl - The object URL to revoke
 */
export function revokeQRCodeUrl(objectUrl) {
  if (objectUrl && objectUrl.startsWith('blob:')) {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Check if a QR code source needs cleanup (is a blob URL)
 *
 * @param {string} src - The QR code source
 * @returns {boolean}
 */
export function needsCleanup(src) {
  return src && src.startsWith('blob:')
}

export default {
  generateQRCodeViaBackend,
  regenerateQRCode,
  generateQRCodeDirect,
  getAssetQRCode,
  generateAssetQRCodeWithUrl,
  revokeQRCodeUrl,
  needsCleanup,
  DEFAULT_CONFIG,
}
