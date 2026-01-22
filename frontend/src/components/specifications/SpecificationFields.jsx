import React, { useEffect, useState } from 'react'
import { HardDrive, Cpu, Printer, Wifi, Monitor, Camera } from 'lucide-react'

/**
 * Dynamic specification fields based on category
 * Shows category-specific fields for detailed equipment specifications
 */
const SpecificationFields = ({ categoryName, subcategoryName, specifications = {}, onChange }) => {
  const [isCustomRefreshRate, setIsCustomRefreshRate] = useState(false)
  const handleChange = (field, value) => {
    onChange({
      ...specifications,
      [field]: value,
    })
  }

  // Helper to get category type from name
  const getCategoryType = () => {
    const name = categoryName?.toLowerCase() || ''
    if (name.includes('storage') || name.includes('hdd') || name.includes('ssd')) return 'storage'
    if (name.includes('memory') || name.includes('ram')) return 'memory'
    if (name.includes('printer')) return 'printer'
    if (name.includes('network') || name.includes('switch') || name.includes('router')) return 'network'
    if (name.includes('monitor') || name.includes('display')) return 'monitor'
    if (name.includes('cctv') || name.includes('camera')) return 'cctv'
    return null
  }

  // Helper to detect storage type from subcategory
  const getStorageType = () => {
    const subcat = subcategoryName?.toLowerCase() || ''
    if (subcat.includes('usb') || subcat.includes('flash')) return 'usb'
    if (subcat.includes('ssd') && subcat.includes('sata')) return 'ssd_sata'
    if (subcat.includes('nvme')) return 'nvme'
    if (subcat.includes('external') || (subcat.includes('hdd') && subcat.includes('external'))) return 'external_hdd'
    if (subcat.includes('hdd') || subcat.includes('hard')) return 'hdd_internal'
    if (subcat.includes('ssd')) return 'ssd_sata' // Default SSD to SATA type
    return null
  }

  const categoryType = getCategoryType()
  const isDotMatrix = categoryType === 'printer' && specifications.printer_type === 'Dot Matrix'

  useEffect(() => {
    if (categoryType !== 'monitor') {
      setIsCustomRefreshRate(false)
      return
    }

    const refreshRate = specifications.refresh_rate
    const hasRefreshRate = refreshRate !== undefined && refreshRate !== null && refreshRate !== ''
    if (hasRefreshRate && Number(refreshRate) !== 60) {
      setIsCustomRefreshRate(true)
    }
  }, [categoryType, specifications.refresh_rate])

  useEffect(() => {
    if (isDotMatrix && specifications.color_support !== 'N/A') {
      handleChange('color_support', 'N/A')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDotMatrix])

  if (!categoryType) return null

  // Storage specifications (with subcategory-based field visibility)
  if (categoryType === 'storage') {
    const storageType = getStorageType()

    // Show/hide fields based on storage type
    const showInterface = storageType !== null
    const showFormFactor = ['ssd_sata', 'hdd_internal', 'nvme'].includes(storageType)
    const showSpeed = ['usb', 'external_hdd'].includes(storageType)

    // Get interface options based on storage type
    const getInterfaceOptions = () => {
      if (storageType === 'usb' || storageType === 'external_hdd') {
        return [
          { value: 'USB-A', label: 'USB-A' },
          { value: 'USB-C', label: 'USB-C' },
        ]
      }
      if (storageType === 'ssd_sata' || storageType === 'hdd_internal') {
        return [
          { value: 'SATA', label: 'SATA' },
          { value: 'SAS', label: 'SAS' },
        ]
      }
      if (storageType === 'nvme') {
        return [
          { value: 'PCIe 3.0 x4', label: 'PCIe 3.0 x4 (~3,500 MB/s)' },
          { value: 'PCIe 4.0 x4', label: 'PCIe 4.0 x4 (~7,000 MB/s)' },
          { value: 'PCIe 5.0 x4', label: 'PCIe 5.0 x4 (~12,000 MB/s)' },
        ]
      }
      return []
    }

    // Get form factor options based on storage type
    const getFormFactorOptions = () => {
      if (storageType === 'ssd_sata') {
        return [
          { value: '2.5"', label: '2.5"' },
          { value: 'M.2 SATA', label: 'M.2 SATA' },
        ]
      }
      if (storageType === 'hdd_internal') {
        return [
          { value: '3.5"', label: '3.5"' },
          { value: '2.5"', label: '2.5"' },
        ]
      }
      if (storageType === 'nvme') {
        return [
          { value: 'M.2 2280', label: 'M.2 2280' },
          { value: 'M.2 2242', label: 'M.2 2242' },
          { value: 'M.2 22110', label: 'M.2 22110' },
        ]
      }
      return []
    }

    // Get speed options for USB devices
    const getSpeedOptions = () => {
      return [
        { value: 'USB 2.0', label: 'USB 2.0' },
        { value: 'USB 3.0', label: 'USB 3.0' },
        { value: 'USB 3.1', label: 'USB 3.1' },
        { value: 'USB 3.2', label: 'USB 3.2' },
      ]
    }

    // Get storage type label for header
    const getStorageTypeLabel = () => {
      if (storageType === 'usb') return 'USB/Flash Drive'
      if (storageType === 'ssd_sata') return 'SSD SATA'
      if (storageType === 'hdd_internal') return 'HDD (Internal)'
      if (storageType === 'external_hdd') return 'External HDD'
      if (storageType === 'nvme') return 'NVMe SSD'
      return 'Storage'
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Storage Specifications</h4>
            {storageType && (
              <p className="text-xs text-blue-600 font-medium">{getStorageTypeLabel()}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Capacity - Always visible and required */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.capacity || ''}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="512"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <select
                value={specifications.capacity_unit || 'GB'}
                onChange={(e) => handleChange('capacity_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>

          {/* Interface - Show based on storage type */}
          {showInterface && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Interface</label>
              <select
                value={specifications.interface || ''}
                onChange={(e) => handleChange('interface', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select interface</option>
                {getInterfaceOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Form Factor - Show for SSD SATA, HDD Internal, NVMe */}
          {showFormFactor && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Form Factor</label>
              <select
                value={specifications.form_factor || ''}
                onChange={(e) => handleChange('form_factor', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select form factor</option>
                {getFormFactorOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Speed - Show for USB and External HDD */}
          {showSpeed && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Speed</label>
              <select
                value={specifications.speed || ''}
                onChange={(e) => handleChange('speed', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select speed</option>
                {getSpeedOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Memory specifications (RAM)
  if (categoryType === 'memory') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-semibold text-slate-900">Memory Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.capacity || ''}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="16"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
              <select
                value={specifications.capacity_unit || 'GB'}
                onChange={(e) => handleChange('capacity_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="GB">GB</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select
              value={specifications.memory_type || ''}
              onChange={(e) => handleChange('memory_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select type</option>
              <option value="DDR3">DDR3</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Speed (MHz)</label>
            <input
              type="number"
              value={specifications.speed || ''}
              onChange={(e) => handleChange('speed', e.target.value)}
              placeholder="e.g., 3200"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Form Factor</label>
            <select
              value={specifications.form_factor || ''}
              onChange={(e) => handleChange('form_factor', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select form factor</option>
              <option value="DIMM">DIMM</option>
              <option value="SO-DIMM">SO-DIMM</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // Printer specifications
  if (categoryType === 'printer') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Printer className="w-5 h-5 text-green-600" />
          <h4 className="text-sm font-semibold text-slate-900">Printer Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Printer Type</label>
            <select
              value={specifications.printer_type || ''}
              onChange={(e) => handleChange('printer_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select type</option>
              <option value="Inkjet">Inkjet</option>
              <option value="Laser">Laser</option>
              <option value="Thermal">Thermal</option>
              <option value="Dot Matrix">Dot Matrix</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Color Support</label>
            <select
              value={isDotMatrix ? 'N/A' : (specifications.color_support || '')}
              onChange={(e) => handleChange('color_support', e.target.value)}
              disabled={isDotMatrix}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select option</option>
              <option value="N/A">N/A</option>
              <option value="Monochrome">Monochrome</option>
              <option value="Color">Color</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Print Speed (ppm)</label>
            <input
              type="number"
              value={specifications.print_speed || ''}
              onChange={(e) => handleChange('print_speed', e.target.value)}
              placeholder="e.g., 30"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Connectivity</label>
            <input
              type="text"
              value={specifications.connectivity || ''}
              onChange={(e) => handleChange('connectivity', e.target.value)}
              placeholder="e.g., USB, Network, WiFi"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    )
  }

  // Network device specifications
  if (categoryType === 'network') {
    return (
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-5 h-5 text-cyan-600" />
          <h4 className="text-sm font-semibold text-slate-900">Network Device Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Device Type</label>
            <select
              value={specifications.device_type || ''}
              onChange={(e) => handleChange('device_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select type</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Access Point">Access Point</option>
              <option value="Firewall">Firewall</option>
              <option value="Modem">Modem</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Number of Ports</label>
            <input
              type="number"
              value={specifications.ports || ''}
              onChange={(e) => handleChange('ports', e.target.value)}
              placeholder="e.g., 24"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Speed</label>
            <select
              value={specifications.speed || ''}
              onChange={(e) => handleChange('speed', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select speed</option>
              <option value="10/100 Mbps">10/100 Mbps</option>
              <option value="Gigabit">Gigabit (1 Gbps)</option>
              <option value="10 Gigabit">10 Gigabit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">PoE Support</label>
            <select
              value={specifications.poe_support || ''}
              onChange={(e) => handleChange('poe_support', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // Monitor specifications
  if (categoryType === 'monitor') {
    const defaultRefreshRate = 60
    const refreshRateValue = isCustomRefreshRate
      ? (specifications.refresh_rate ?? '')
      : defaultRefreshRate
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-semibold text-slate-900">Monitor Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Screen Size (inches) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={specifications.screen_size || ''}
              onChange={(e) => handleChange('screen_size', e.target.value)}
              placeholder="e.g., 24"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Resolution</label>
            <select
              value={specifications.resolution || ''}
              onChange={(e) => handleChange('resolution', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select resolution</option>
              <option value="1366x768">1366x768 (HD)</option>
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="2560x1440">2560x1440 (QHD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Panel Type</label>
            <select
              value={specifications.panel_type || ''}
              onChange={(e) => handleChange('panel_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select panel type</option>
              <option value="IPS">IPS</option>
              <option value="VA">VA</option>
              <option value="TN">TN</option>
              <option value="OLED">OLED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Refresh Rate (Hz)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={refreshRateValue}
                onChange={(e) => handleChange('refresh_rate', e.target.value)}
                placeholder="e.g., 60, 144"
                disabled={!isCustomRefreshRate}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (isCustomRefreshRate) {
                    setIsCustomRefreshRate(false)
                    handleChange('refresh_rate', defaultRefreshRate)
                    return
                  }

                  setIsCustomRefreshRate(true)
                  if (specifications.refresh_rate === '' || specifications.refresh_rate === null || specifications.refresh_rate === undefined) {
                    handleChange('refresh_rate', defaultRefreshRate)
                  }
                }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
              >
                {isCustomRefreshRate ? 'Use 60Hz' : 'Custom'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // CCTV specifications
  if (categoryType === 'cctv') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-red-600" />
          <h4 className="text-sm font-semibold text-slate-900">CCTV Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Resolution</label>
            <select
              value={specifications.resolution || ''}
              onChange={(e) => handleChange('resolution', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select resolution</option>
              <option value="720p">720p (1MP)</option>
              <option value="1080p">1080p (2MP)</option>
              <option value="4MP">4MP</option>
              <option value="5MP">5MP</option>
              <option value="4K">4K (8MP)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Camera Type</label>
            <select
              value={specifications.camera_type || ''}
              onChange={(e) => handleChange('camera_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select type</option>
              <option value="Bullet">Bullet</option>
              <option value="Dome">Dome</option>
              <option value="PTZ">PTZ</option>
              <option value="IP Camera">IP Camera</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Night Vision Range (m)</label>
            <input
              type="number"
              value={specifications.night_vision_range || ''}
              onChange={(e) => handleChange('night_vision_range', e.target.value)}
              placeholder="e.g., 30"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Storage Support</label>
            <input
              type="text"
              value={specifications.storage_support || ''}
              onChange={(e) => handleChange('storage_support', e.target.value)}
              placeholder="e.g., SD Card, NVR"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default SpecificationFields
