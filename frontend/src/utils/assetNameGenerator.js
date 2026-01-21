/**
 * Asset Name Generator Utility
 * Generates descriptive asset names based on brand and specifications
 */

/**
 * Generate asset name based on category, brand, and specifications
 * @param {string} categoryName - Category name (e.g., "Storage", "Monitor")
 * @param {string} brand - Asset brand
 * @param {object} specifications - Specifications object
 * @returns {string} Generated asset name
 */
export const generateAssetName = (categoryName, brand, specifications = {}) => {
  if (!categoryName) return ''

  const name = categoryName.toLowerCase()
  const parts = []

  // Always start with brand if available
  if (brand) {
    parts.push(brand)
  }

  // Storage devices (HDD, SSD, USB, Flash Drive)
  if (name.includes('storage') || name.includes('hdd') || name.includes('ssd') ||
      name.includes('usb') || name.includes('flash')) {
    if (specifications.capacity) {
      const unit = specifications.capacity_unit || 'GB'
      parts.push(`${specifications.capacity} ${unit}`)
    }
    if (specifications.interface) {
      // Clean up interface value - remove speed indicators in parentheses
      const cleanInterface = specifications.interface.replace(/\s*\([^)]*\)\s*/g, '').trim()
      parts.push(cleanInterface)
    }
    if (specifications.speed) {
      parts.push(specifications.speed)
    }
  }

  // Memory (RAM)
  else if (name.includes('memory') || name.includes('ram')) {
    if (specifications.capacity) {
      const unit = specifications.capacity_unit || 'GB'
      parts.push(`${specifications.capacity} ${unit}`)
    }
    if (specifications.memory_type) {
      parts.push(specifications.memory_type)
    }
  }

  // Monitor/Display
  else if (name.includes('monitor') || name.includes('display')) {
    if (specifications.panel_type) {
      parts.push(specifications.panel_type)
    }
    if (specifications.screen_size) {
      parts.push(`${specifications.screen_size}"`)
    }
    if (specifications.resolution) {
      parts.push(specifications.resolution)
    }
    if (specifications.refresh_rate) {
      parts.push(`${specifications.refresh_rate}Hz`)
    }
  }

  // Printer
  else if (name.includes('printer')) {
    if (specifications.printer_type) {
      parts.push(specifications.printer_type)
    }
    if (specifications.color_support) {
      parts.push(specifications.color_support)
    }
    if (specifications.print_speed) {
      parts.push(`${specifications.print_speed}ppm`)
    }
  }

  // Network devices (Switch, Router)
  else if (name.includes('network') || name.includes('switch') || name.includes('router')) {
    if (specifications.device_type) {
      parts.push(specifications.device_type)
    }
    if (specifications.ports) {
      parts.push(`${specifications.ports}-Port`)
    }
    if (specifications.poe_support) {
      parts.push(specifications.poe_support)
    }
  }

  // CCTV/Camera
  else if (name.includes('cctv') || name.includes('camera')) {
    if (specifications.camera_type) {
      parts.push(specifications.camera_type)
    }
    if (specifications.resolution) {
      parts.push(specifications.resolution)
    }
    if (specifications.night_vision_range) {
      parts.push(`${specifications.night_vision_range}m NV`)
    }
  }

  // If no specifications matched, just return brand or category
  if (parts.length === 0) {
    return brand || categoryName
  }

  return parts.join(' ')
}

/**
 * Check if asset name should be auto-generated for this category
 * @param {string} categoryName - Category name
 * @returns {boolean} True if auto-generation is supported
 */
export const shouldAutoGenerateName = (categoryName) => {
  if (!categoryName) return false

  const name = categoryName.toLowerCase()
  return (
    name.includes('storage') || name.includes('hdd') || name.includes('ssd') ||
    name.includes('usb') || name.includes('flash') || name.includes('memory') ||
    name.includes('ram') || name.includes('monitor') || name.includes('display') ||
    name.includes('printer') || name.includes('network') || name.includes('switch') ||
    name.includes('router') || name.includes('cctv') || name.includes('camera')
  )
}
