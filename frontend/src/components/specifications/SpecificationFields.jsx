import React, { useEffect, useState } from 'react'
import { HardDrive, Cpu, Printer, Wifi, Monitor, Camera, Laptop } from 'lucide-react'

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
    if (name.includes('laptop') || name.includes('notebook')) return 'laptop'
    if (name.includes('server')) return 'server'
    if (name.includes('ups') || name.includes('uninterruptible')) return 'ups'
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
              step="1"
              min="0"
              value={specifications.speed || ''}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  handleChange('speed', '')
                  return
                }

                const numericValue = Number(value)
                handleChange('speed', Number.isNaN(numericValue) ? value : Math.round(numericValue))
              }}
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
    const deviceType = specifications.device_type || ''
    const isRouter = deviceType === 'Router'
    const isSwitch = deviceType === 'Switch'
    const isFirewall = deviceType === 'Firewall'
    
    return (
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-5 h-5 text-cyan-600" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Network Device Specifications</h4>
            {deviceType && (
              <p className="text-xs text-cyan-600 font-medium">{deviceType}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Device Type - Always shown */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              value={specifications.device_type || ''}
              onChange={(e) => handleChange('device_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              required
            >
              <option value="">Select type</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Access Point">Access Point</option>
              <option value="Firewall">Firewall</option>
              <option value="Modem">Modem</option>
            </select>
          </div>

          {/* Number of Ports */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Number of Ports</label>
            <input
              type="number"
              value={specifications.ports || ''}
              onChange={(e) => handleChange('ports', e.target.value)}
              placeholder="e.g., 24, 48"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Port Speed */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Port Speed</label>
            <select
              value={specifications.speed || ''}
              onChange={(e) => handleChange('speed', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select speed</option>
              <option value="10/100 Mbps">10/100 Mbps (Fast Ethernet)</option>
              <option value="Gigabit">Gigabit (1 Gbps)</option>
              <option value="10 Gigabit">10 Gigabit (10 Gbps)</option>
              <option value="25 Gigabit">25 Gigabit (25 Gbps)</option>
              <option value="40 Gigabit">40 Gigabit (40 Gbps)</option>
              <option value="100 Gigabit">100 Gigabit (100 Gbps)</option>
            </select>
          </div>

          {/* Layer Support - For Switches */}
          {isSwitch && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Layer Support</label>
              <select
                value={specifications.layer_support || ''}
                onChange={(e) => handleChange('layer_support', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">Select layer</option>
                <option value="Layer 2">Layer 2 (Unmanaged)</option>
                <option value="Layer 2+ (Smart)">Layer 2+ (Smart/Web-Managed)</option>
                <option value="Layer 3">Layer 3 (Managed)</option>
                <option value="Layer 3+ (Core)">Layer 3+ (Core Switch)</option>
              </select>
            </div>
          )}

          {/* PoE Support */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">PoE Support</label>
            <select
              value={specifications.poe_support || ''}
              onChange={(e) => handleChange('poe_support', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select option</option>
              <option value="No">No PoE</option>
              <option value="PoE (802.3af)">PoE (802.3af) - 15.4W</option>
              <option value="PoE+ (802.3at)">PoE+ (802.3at) - 30W</option>
              <option value="PoE++ (802.3bt)">PoE++ (802.3bt) - 60W/100W</option>
            </select>
          </div>

          {/* Management Interface */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Management</label>
            <select
              value={specifications.management || ''}
              onChange={(e) => handleChange('management', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select management</option>
              <option value="Unmanaged">Unmanaged</option>
              <option value="Web GUI">Web GUI</option>
              <option value="CLI + Web GUI">CLI + Web GUI</option>
              <option value="SNMP">SNMP</option>
              <option value="Cloud Managed">Cloud Managed</option>
            </select>
          </div>

          {/* Throughput - For Routers & Firewalls */}
          {(isRouter || isFirewall) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Throughput</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={specifications.throughput || ''}
                  onChange={(e) => handleChange('throughput', e.target.value)}
                  placeholder="e.g., 1000"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <select
                  value={specifications.throughput_unit || 'Mbps'}
                  onChange={(e) => handleChange('throughput_unit', e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="Mbps">Mbps</option>
                  <option value="Gbps">Gbps</option>
                </select>
              </div>
            </div>
          )}

          {/* VPN Support - For Routers & Firewalls */}
          {(isRouter || isFirewall) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">VPN Support</label>
              <select
                value={specifications.vpn_support || ''}
                onChange={(e) => handleChange('vpn_support', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">Select VPN</option>
                <option value="No VPN">No VPN</option>
                <option value="IPSec">IPSec</option>
                <option value="SSL VPN">SSL VPN</option>
                <option value="IPSec + SSL">IPSec + SSL</option>
                <option value="OpenVPN">OpenVPN</option>
                <option value="WireGuard">WireGuard</option>
              </select>
            </div>
          )}

          {/* Firewall Type - For Firewalls */}
          {isFirewall && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Firewall Type</label>
              <select
                value={specifications.firewall_type || ''}
                onChange={(e) => handleChange('firewall_type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">Select type</option>
                <option value="Stateful">Stateful Firewall</option>
                <option value="Next-Gen (NGFW)">Next-Gen (NGFW)</option>
                <option value="UTM">UTM (Unified Threat Management)</option>
                <option value="Web Application Firewall">Web Application Firewall</option>
              </select>
            </div>
          )}

          {/* Security Features - For Firewalls */}
          {isFirewall && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Security Features</label>
              <input
                type="text"
                value={specifications.security_features || ''}
                onChange={(e) => handleChange('security_features', e.target.value)}
                placeholder="e.g., IPS, DPI, Anti-malware, Web filtering"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          )}

          {/* Routing Protocol - For Routers */}
          {isRouter && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Routing Protocols</label>
              <input
                type="text"
                value={specifications.routing_protocols || ''}
                onChange={(e) => handleChange('routing_protocols', e.target.value)}
                placeholder="e.g., BGP, OSPF, RIP"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          )}

          {/* Wireless Standard - For Routers & Access Points */}
          {(isRouter || deviceType === 'Access Point') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Wireless Standard</label>
              <select
                value={specifications.wireless_standard || ''}
                onChange={(e) => handleChange('wireless_standard', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">Select standard</option>
                <option value="N/A">N/A (Wired Only)</option>
                <option value="Wi-Fi 4 (802.11n)">Wi-Fi 4 (802.11n)</option>
                <option value="Wi-Fi 5 (802.11ac)">Wi-Fi 5 (802.11ac)</option>
                <option value="Wi-Fi 6 (802.11ax)">Wi-Fi 6 (802.11ax)</option>
                <option value="Wi-Fi 6E">Wi-Fi 6E</option>
                <option value="Wi-Fi 7 (802.11be)">Wi-Fi 7 (802.11be)</option>
              </select>
            </div>
          )}

          {/* Form Factor */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Form Factor</label>
            <select
              value={specifications.form_factor || ''}
              onChange={(e) => handleChange('form_factor', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select form factor</option>
              <option value="Desktop">Desktop</option>
              <option value="Rackmount 1U">Rackmount 1U</option>
              <option value="Rackmount 2U">Rackmount 2U</option>
              <option value="Wall-Mount">Wall-Mount</option>
              <option value="Ceiling-Mount">Ceiling-Mount</option>
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

  // Laptop specifications
  if (categoryType === 'laptop') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Laptop className="w-5 h-5 text-amber-600" />
          <h4 className="text-sm font-semibold text-slate-900">Laptop Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Processor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={specifications.processor || ''}
              onChange={(e) => handleChange('processor', e.target.value)}
              placeholder="e.g., Intel Core i5-1235U"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              RAM <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.ram || ''}
                onChange={(e) => handleChange('ram', e.target.value)}
                placeholder="e.g., 16"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <select
                value={specifications.ram_unit || 'GB'}
                onChange={(e) => handleChange('ram_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="GB">GB</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Storage Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.storage_capacity || ''}
                onChange={(e) => handleChange('storage_capacity', e.target.value)}
                placeholder="e.g., 512"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <select
                value={specifications.storage_unit || 'GB'}
                onChange={(e) => handleChange('storage_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Storage Type</label>
            <select
              value={specifications.storage_type || ''}
              onChange={(e) => handleChange('storage_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select type</option>
              <option value="SSD">SSD</option>
              <option value="HDD">HDD</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Screen Size (inches) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={specifications.screen_size || ''}
              onChange={(e) => handleChange('screen_size', e.target.value)}
              placeholder="e.g., 14"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Resolution</label>
            <select
              value={specifications.resolution || ''}
              onChange={(e) => handleChange('resolution', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select resolution</option>
              <option value="1366x768">1366x768 (HD)</option>
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="2560x1440">2560x1440 (QHD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Graphics</label>
            <input
              type="text"
              value={specifications.gpu || ''}
              onChange={(e) => handleChange('gpu', e.target.value)}
              placeholder="e.g., Intel Iris Xe"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Operating System</label>
            <input
              type="text"
              value={specifications.os || ''}
              onChange={(e) => handleChange('os', e.target.value)}
              placeholder="e.g., Windows 11 Pro"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    )
  }

  // Server specifications
  if (categoryType === 'server') {
    return (
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-slate-700" />
          <h4 className="text-sm font-semibold text-slate-900">Server Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Processor */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Processor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={specifications.processor || ''}
              onChange={(e) => handleChange('processor', e.target.value)}
              placeholder="e.g., Intel Xeon E5-2680 v4"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              required
            />
          </div>

          {/* CPU Cores */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">CPU Cores</label>
            <input
              type="number"
              value={specifications.cpu_cores || ''}
              onChange={(e) => handleChange('cpu_cores', e.target.value)}
              placeholder="e.g., 14"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          {/* RAM */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              RAM <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.ram || ''}
                onChange={(e) => handleChange('ram', e.target.value)}
                placeholder="e.g., 64"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                required
              />
              <select
                value={specifications.ram_unit || 'GB'}
                onChange={(e) => handleChange('ram_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>

          {/* RAM Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">RAM Type</label>
            <select
              value={specifications.ram_type || ''}
              onChange={(e) => handleChange('ram_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select type</option>
              <option value="DDR3">DDR3</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
              <option value="ECC DDR4">ECC DDR4</option>
              <option value="ECC DDR5">ECC DDR5</option>
            </select>
          </div>

          {/* Storage Capacity */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Storage Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.storage_capacity || ''}
                onChange={(e) => handleChange('storage_capacity', e.target.value)}
                placeholder="e.g., 2"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                required
              />
              <select
                value={specifications.storage_unit || 'TB'}
                onChange={(e) => handleChange('storage_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="GB">GB</option>
                <option value="TB">TB</option>
                <option value="PB">PB</option>
              </select>
            </div>
          </div>

          {/* Storage Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Storage Type</label>
            <select
              value={specifications.storage_type || ''}
              onChange={(e) => handleChange('storage_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select type</option>
              <option value="SAS HDD">SAS HDD</option>
              <option value="SATA HDD">SATA HDD</option>
              <option value="SAS SSD">SAS SSD</option>
              <option value="SATA SSD">SATA SSD</option>
              <option value="NVMe SSD">NVMe SSD</option>
            </select>
          </div>

          {/* RAID Configuration */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">RAID Configuration</label>
            <select
              value={specifications.raid_config || ''}
              onChange={(e) => handleChange('raid_config', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select RAID</option>
              <option value="RAID 0">RAID 0 (Striping)</option>
              <option value="RAID 1">RAID 1 (Mirroring)</option>
              <option value="RAID 5">RAID 5 (Striping with Parity)</option>
              <option value="RAID 6">RAID 6 (Double Parity)</option>
              <option value="RAID 10">RAID 10 (1+0)</option>
              <option value="No RAID">No RAID</option>
            </select>
          </div>

          {/* Operating System */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Operating System</label>
            <input
              type="text"
              value={specifications.os || ''}
              onChange={(e) => handleChange('os', e.target.value)}
              placeholder="e.g., Windows Server 2022, Ubuntu 22.04"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          {/* Network Ports */ }
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Network Ports</label>
            <select
              value={specifications.network_ports || ''}
              onChange={(e) => handleChange('network_ports', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select ports</option>
              <option value="1x Gigabit">1x Gigabit</option>
              <option value="2x Gigabit">2x Gigabit</option>
              <option value="4x Gigabit">4x Gigabit</option>
              <option value="2x 10 Gigabit">2x 10 Gigabit</option>
              <option value="4x 10 Gigabit">4x 10 Gigabit</option>
            </select>
          </div>

          {/* Power Supply */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Power Supply</label>
            <select
              value={specifications.power_supply || ''}
              onChange={(e) => handleChange('power_supply', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select PSU</option>
              <option value="Single PSU">Single PSU</option>
              <option value="Redundant PSU">Redundant PSU (Hot-swap)</option>
              <option value="Dual PSU">Dual PSU</option>
            </select>
          </div>

          {/* Form Factor */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Form Factor</label>
            <select
              value={specifications.form_factor || ''}
              onChange={(e) => handleChange('form_factor', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select form factor</option>
              <option value="1U Rack">1U Rack</option>
              <option value="2U Rack">2U Rack</option>
              <option value="4U Rack">4U Rack</option>
              <option value="Tower">Tower</option>
              <option value="Blade">Blade</option>
            </select>
          </div>

          {/* Virtualization Support */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Virtualization</label>
            <select
              value={specifications.virtualization || ''}
              onChange={(e) => handleChange('virtualization', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="">Select support</option>
              <option value="VMware ESXi">VMware ESXi</option>
              <option value="Hyper-V">Hyper-V</option>
              <option value="Proxmox">Proxmox</option>
              <option value="KVM">KVM</option>
              <option value="Not Virtualized">Not Virtualized</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // UPS (Uninterruptible Power Supply) specifications
  if (categoryType === 'ups') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-orange-600" />
          <h4 className="text-sm font-semibold text-slate-900">UPS Specifications</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Capacity (VA) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Capacity (VA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={specifications.capacity_va || ''}
              onChange={(e) => handleChange('capacity_va', e.target.value)}
              placeholder="e.g., 1500"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Power (Watts) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Power (Watts) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={specifications.power_watts || ''}
              onChange={(e) => handleChange('power_watts', e.target.value)}
              placeholder="e.g., 900"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Topology */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Topology</label>
            <select
              value={specifications.topology || ''}
              onChange={(e) => handleChange('topology', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select topology</option>
              <option value="Standby">Standby (Off-line)</option>
              <option value="Line-Interactive">Line-Interactive</option>
              <option value="Online">Online (Double-Conversion)</option>
            </select>
          </div>

          {/* Runtime at Full Load */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Runtime at Full Load</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.runtime || ''}
                onChange={(e) => handleChange('runtime', e.target.value)}
                placeholder="e.g., 10"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <select
                value={specifications.runtime_unit || 'minutes'}
                onChange={(e) => handleChange('runtime_unit', e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
            </div>
          </div>

          {/* Input Voltage */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Input Voltage</label>
            <select
              value={specifications.input_voltage || ''}
              onChange={(e) => handleChange('input_voltage', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select voltage</option>
              <option value="110-120V">110-120V</option>
              <option value="220-240V">220-240V</option>
              <option value="100-240V">100-240V (Auto-sensing)</option>
            </select>
          </div>

          {/* Output Voltage */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Output Voltage</label>
            <select
              value={specifications.output_voltage || ''}
              onChange={(e) => handleChange('output_voltage', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select voltage</option>
              <option value="110-120V">110-120V</option>
              <option value="220-240V">220-240V</option>
            </select>
          </div>

          {/* Waveform */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Output Waveform</label>
            <select
              value={specifications.waveform || ''}
              onChange={(e) => handleChange('waveform', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select waveform</option>
              <option value="Pure Sine Wave">Pure Sine Wave</option>
              <option value="Simulated Sine Wave">Simulated Sine Wave (Step Approximation)</option>
              <option value="Square Wave">Square Wave</option>
            </select>
          </div>

          {/* Number of Outlets */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Number of Outlets</label>
            <input
              type="number"
              value={specifications.outlets || ''}
              onChange={(e) => handleChange('outlets', e.target.value)}
              placeholder="e.g., 8"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Battery Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Battery Type</label>
            <select
              value={specifications.battery_type || ''}
              onChange={(e) => handleChange('battery_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select battery type</option>
              <option value="Sealed Lead Acid (SLA)">Sealed Lead Acid (SLA)</option>
              <option value="Lithium-ion">Lithium-ion</option>
              <option value="User-replaceable">User-replaceable</option>
              <option value="Hot-swappable">Hot-swappable</option>
            </select>
          </div>

          {/* Recharge Time */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Recharge Time</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={specifications.recharge_time || ''}
                onChange={(e) => handleChange('recharge_time', e.target.value)}
                placeholder="e.g., 8"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <span className="px-3 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg border border-slate-300">
                hours
              </span>
            </div>
          </div>

          {/* Form Factor */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Form Factor</label>
            <select
              value={specifications.form_factor || ''}
              onChange={(e) => handleChange('form_factor', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select form factor</option>
              <option value="Tower">Tower</option>
              <option value="Rackmount 1U">Rackmount 1U</option>
              <option value="Rackmount 2U">Rackmount 2U</option>
              <option value="Rackmount 3U">Rackmount 3U</option>
              <option value="Desktop">Desktop</option>
            </select>
          </div>

          {/* Communication Interface */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Communication</label>
            <select
              value={specifications.communication || ''}
              onChange={(e) => handleChange('communication', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select interface</option>
              <option value="None">None</option>
              <option value="USB">USB</option>
              <option value="Serial (RS-232)">Serial (RS-232)</option>
              <option value="Network (SNMP)">Network (SNMP)</option>
              <option value="USB + Network">USB + Network</option>
            </select>
          </div>

          {/* Features */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Additional Features</label>
            <input
              type="text"
              value={specifications.features || ''}
              onChange={(e) => handleChange('features', e.target.value)}
              placeholder="e.g., LCD display, Auto voltage regulation (AVR), Surge protection"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default SpecificationFields
