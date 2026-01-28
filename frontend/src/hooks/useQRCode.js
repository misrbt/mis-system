/**
 * Custom hook for generating QR codes
 * Uses backend API with fallback to QR Code Monkey direct API
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getAssetQRCode,
  generateAssetQRCodeWithUrl,
  regenerateQRCode,
  revokeQRCodeUrl,
  needsCleanup,
} from '../services/qrCodeService'

/**
 * Hook for generating and managing QR codes
 * @returns {Object} - QR code generation utilities
 */
export function useQRCode() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const previousSrcRef = useRef(null)

  // Cleanup blob URL when component unmounts or qrCode changes
  useEffect(() => {
    return () => {
      if (previousSrcRef.current && needsCleanup(previousSrcRef.current)) {
        revokeQRCodeUrl(previousSrcRef.current)
      }
    }
  }, [])

  // Track previous src for cleanup
  useEffect(() => {
    if (qrCode?.src !== previousSrcRef.current) {
      // Cleanup old blob URL if it exists
      if (previousSrcRef.current && needsCleanup(previousSrcRef.current)) {
        revokeQRCodeUrl(previousSrcRef.current)
      }
      previousSrcRef.current = qrCode?.src
    }
  }, [qrCode?.src])

  /**
   * Get QR code for an asset
   * Returns cached QR code if available, otherwise generates new one
   *
   * @param {Object} asset - Asset object
   * @param {boolean} forceRegenerate - Force regeneration
   * @returns {Promise<Object>} - QR code data
   */
  const getQRCode = useCallback(async (asset, forceRegenerate = false) => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await getAssetQRCode(asset, forceRegenerate)
      setQrCode(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  /**
   * Regenerate QR code for an asset (via backend)
   *
   * @param {Object} asset - Asset object with id
   * @returns {Promise<Object>} - New QR code data
   */
  const regenerate = useCallback(async (asset) => {
    if (!asset?.id) {
      throw new Error('Asset ID is required to regenerate QR code')
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await regenerateQRCode(asset.id)
      const result = {
        src: response.data?.qr_code,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'qr',
        source: 'backend',
      }
      setQrCode(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  /**
   * Generate QR code with URL to asset page (direct API)
   *
   * @param {Object} asset - Asset object
   * @param {Object} options - Optional configuration
   * @returns {Promise<Object>} - QR code data
   */
  const generateWithUrl = useCallback(async (asset, options = {}) => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateAssetQRCodeWithUrl(asset, options)
      setQrCode(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  /**
   * Clear the current QR code
   */
  const clearQRCode = useCallback(() => {
    if (qrCode?.src && needsCleanup(qrCode.src)) {
      revokeQRCodeUrl(qrCode.src)
    }
    setQrCode(null)
    setError(null)
    previousSrcRef.current = null
  }, [qrCode])

  return {
    qrCode,
    isGenerating,
    error,
    getQRCode,
    regenerate,
    generateWithUrl,
    clearQRCode,
  }
}

export default useQRCode
