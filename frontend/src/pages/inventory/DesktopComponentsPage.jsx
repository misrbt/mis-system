import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Barcode,
  X,
  Save,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../utils/assetSerial'

function DesktopComponentsPage() {
  const queryClient = useQueryClient()
  const [editingComponent, setEditingComponent] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [addFormData, setAddFormData] = useState({
    parent_asset_id: '',
    component_type: 'system_unit',
    component_name: '',
    brand: '',
    model: '',
    serial_number: '',
    status_id: '',
    remarks: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedComponent, setExpandedComponent] = useState(null)

  // Fetch all desktop PC assets
  const { data: assetsData } = useQuery({
    queryKey: ['desktop-assets'],
    queryFn: async () => {
      const response = await apiClient.get('/assets')
      return response.data
    },
  })

  const desktopAssets = (assetsData?.data || []).filter(
    (asset) =>
      asset.category?.name?.toLowerCase().includes('desktop') ||
      asset.category?.name?.toLowerCase().includes('pc')
  )

  // Fetch all components
  const { data: componentsData, isLoading } = useQuery({
    queryKey: ['all-components'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-components')
      return response.data
    },
  })

  const allComponents = componentsData?.data || []

  // Fetch statuses
  const { data: statusesData } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/status')
      return response.data
    },
  })

  const statuses = statusesData?.data || []

  // Fetch component movements for expanded component
  const { data: movementsData } = useQuery({
    queryKey: ['component-movements', expandedComponent],
    queryFn: async () => {
      const response = await apiClient.get(`/asset-components/${expandedComponent}/movements`)
      return response.data
    },
    enabled: !!expandedComponent,
  })

  const movements = movementsData?.data || []

  // Filter components
  const filteredComponents = allComponents.filter((component) => {
    const matchesSearch =
      searchTerm === '' ||
      component.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === '' || component.component_type === filterType
    const matchesStatus = filterStatus === '' || component.status_id === parseInt(filterStatus)

    return matchesSearch && matchesType && matchesStatus
  })

  // Add component mutation
  const addComponentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/assets/${data.parent_asset_id}/components`, {
        components: [data],
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-components'])
      setShowAddModal(false)
      setAddFormData({
        parent_asset_id: '',
        component_type: 'system_unit',
        component_name: '',
        brand: '',
        model: '',
        serial_number: '',
        status_id: '',
        remarks: '',
      })
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Component has been added successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add component',
      })
    },
  })

  // Update component mutation
  const updateComponentMutation = useMutation({
    mutationFn: async ({ componentId, data }) => {
      const response = await apiClient.put(`/asset-components/${componentId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-components'])
      setEditingComponent(null)
      setEditFormData({})
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Component has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update component',
      })
    },
  })

  // Delete component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId) => {
      const response = await apiClient.delete(`/asset-components/${componentId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-components'])
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Component has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete component',
      })
    },
  })

  const handleViewQRCode = (component) => {
    if (!component.qr_code) {
      Swal.fire({
        icon: 'warning',
        title: 'No QR Code',
        text: 'This component does not have a QR code yet.',
      })
      return
    }

    Swal.fire({
      title: `QR Code: ${component.component_name}`,
      html: `
        <div class="space-y-3">
          <img src="${component.qr_code}" alt="QR Code" class="w-full max-w-md mx-auto" />
          <div class="text-sm text-slate-600">
            <p><strong>Type:</strong> ${component.component_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Serial:</strong> ${component.serial_number || 'N/A'}</p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
    })
  }

  const handleViewBarcode = (component) => {
    if (!component.barcode) {
      Swal.fire({
        icon: 'warning',
        title: 'No Barcode',
        text: 'This component does not have a barcode.',
      })
      return
    }

    Swal.fire({
      title: `Barcode: ${component.component_name}`,
      html: `
        <div class="space-y-3">
          <img src="${component.barcode}" alt="Barcode" class="w-full max-w-md mx-auto" />
          <div class="text-sm text-slate-600">
            <p><strong>Serial Number:</strong> ${component.serial_number || 'N/A'}</p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
    })
  }

  const handleEdit = (component) => {
    setEditingComponent(component.id)
    setEditFormData({
      component_type: component.component_type,
      component_name: component.component_name,
      brand: component.brand || '',
      model: component.model || '',
      serial_number: component.serial_number || '',
      status_id: component.status_id,
      remarks: component.remarks || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingComponent(null)
    setEditFormData({})
  }

  const handleSaveEdit = () => {
    updateComponentMutation.mutate({
      componentId: editingComponent,
      data: editFormData,
    })
  }

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDelete = async (component) => {
    const result = await Swal.fire({
      title: 'Delete Component?',
      html: `
        <p>Are you sure you want to delete this component?</p>
        <p class="font-semibold text-slate-900 mt-2">${component.component_name}</p>
        <p class="text-sm text-slate-600 mt-1">${component.component_type.replace('_', ' ')}</p>
        <p class="text-xs text-red-600 mt-3">This action cannot be undone.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      deleteComponentMutation.mutate(component.id)
    }
  }

  const handleAddComponent = () => {
    if (!addFormData.parent_asset_id || !addFormData.component_name || !addFormData.status_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
      })
      return
    }

    addComponentMutation.mutate(addFormData)
  }

  const handleGenerateSerial = () => {
    const serialNumber = buildSerialNumber('COMP')
    setAddFormData((prev) => ({ ...prev, serial_number: serialNumber }))
  }

  const toggleExpandComponent = (componentId) => {
    setExpandedComponent(expandedComponent === componentId ? null : componentId)
  }

  const getComponentTypeIcon = (type) => {
    switch (type) {
      case 'system_unit':
        return '🖥️'
      case 'monitor':
        return '🖥️'
      case 'keyboard_mouse':
        return '⌨️'
      default:
        return '📦'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Desktop PC Components</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage all desktop computer components across all assets
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Component
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Components</p>
              <p className="text-2xl font-bold text-slate-900">{allComponents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">System Units</p>
              <p className="text-2xl font-bold text-slate-900">
                {allComponents.filter((c) => c.component_type === 'system_unit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Monitors</p>
              <p className="text-2xl font-bold text-slate-900">
                {allComponents.filter((c) => c.component_type === 'monitor').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Other Accessories</p>
              <p className="text-2xl font-bold text-slate-900">
                {allComponents.filter((c) => ['keyboard_mouse', 'other'].includes(c.component_type)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, brand, model, or serial number..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Component Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="system_unit">System Unit</option>
              <option value="monitor">Monitor</option>
              <option value="keyboard_mouse">Keyboard & Mouse</option>
              <option value="other">Other Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component) => {
          const isEditing = editingComponent === component.id
          const isExpanded = expandedComponent === component.id

          return (
            <div
              key={component.id}
              className={`border rounded-lg p-4 transition-shadow bg-white ${
                isEditing ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              {isEditing ? (
                /* EDIT MODE */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-600 text-sm">Edit Component</h4>
                    <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Component Type</label>
                    <select
                      value={editFormData.component_type}
                      onChange={(e) => handleEditChange('component_type', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="system_unit">System Unit</option>
                      <option value="monitor">Monitor</option>
                      <option value="keyboard_mouse">Keyboard & Mouse</option>
                      <option value="other">Other Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Component Name</label>
                    <input
                      type="text"
                      value={editFormData.component_name}
                      onChange={(e) => handleEditChange('component_name', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={editFormData.brand}
                      onChange={(e) => handleEditChange('brand', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={editFormData.model}
                      onChange={(e) => handleEditChange('model', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={editFormData.serial_number}
                      onChange={(e) => handleEditChange('serial_number', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={editFormData.status_id}
                      onChange={(e) => handleEditChange('status_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
                    <textarea
                      value={editFormData.remarks}
                      onChange={(e) => handleEditChange('remarks', e.target.value)}
                      rows="2"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateComponentMutation.isPending}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {updateComponentMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded hover:bg-slate-300 flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getComponentTypeIcon(component.component_type)}</span>
                        <h4 className="font-semibold text-slate-900 truncate">{component.component_name}</h4>
                      </div>
                      <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {component.component_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Parent Asset:</span>
                      <span className="font-medium text-slate-900 truncate ml-2">
                        {component.parent_asset?.asset_name || 'N/A'}
                      </span>
                    </div>
                    {component.brand && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Brand:</span>
                        <span className="font-medium text-slate-900 truncate ml-2">{component.brand}</span>
                      </div>
                    )}
                    {component.model && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Model:</span>
                        <span className="font-medium text-slate-900 truncate ml-2">{component.model}</span>
                      </div>
                    )}
                    {component.serial_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Serial:</span>
                        <span className="font-mono text-xs text-slate-900 truncate ml-2">
                          {component.serial_number}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {component.status?.name || 'N/A'}
                      </span>
                    </div>
                    {component.assigned_employee && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assigned:</span>
                        <span className="font-medium text-slate-900 truncate ml-2">
                          {component.assigned_employee.fullname}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Movement History */}
                  <button
                    onClick={() => toggleExpandComponent(component.id)}
                    className="w-full py-2 mb-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <History className="w-4 h-4" />
                    <span>{isExpanded ? 'Hide' : 'Show'} Movement History</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Movement History */}
                  {isExpanded && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                      <h5 className="text-xs font-semibold text-slate-700 mb-2">Movement History</h5>
                      {movements.length === 0 ? (
                        <p className="text-xs text-slate-500">No movement history available.</p>
                      ) : (
                        <div className="space-y-2">
                          {movements.map((movement) => (
                            <div key={movement.id} className="text-xs">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="font-medium text-slate-700">
                                  {movement.movement_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-5 text-slate-600">
                                {new Date(movement.movement_date).toLocaleDateString()} -{' '}
                                {movement.performed_by?.name || 'System'}
                              </div>
                              {movement.remarks && (
                                <div className="ml-5 text-slate-500 italic">{movement.remarks}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleEdit(component)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Edit Component"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(component)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Delete Component"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                    <button
                      onClick={() => handleViewQRCode(component)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-xs font-medium">QR</span>
                    </button>
                    <button
                      onClick={() => handleViewBarcode(component)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="View Barcode"
                    >
                      <Barcode className="w-4 h-4" />
                      <span className="text-xs font-medium">Barcode</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Components Found</h3>
          <p className="text-sm text-slate-600 mb-4">
            {searchTerm || filterType || filterStatus
              ? 'Try adjusting your filters to see more results.'
              : 'Start by adding your first desktop PC component.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>
        </div>
      )}

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-slate-900">Add New Component</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parent Desktop PC Asset <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.parent_asset_id}
                  onChange={(e) => setAddFormData({ ...addFormData, parent_asset_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select parent asset</option>
                  {desktopAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_name} - {asset.serial_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Component Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.component_type}
                  onChange={(e) => setAddFormData({ ...addFormData, component_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="system_unit">System Unit</option>
                  <option value="monitor">Monitor</option>
                  <option value="keyboard_mouse">Keyboard & Mouse</option>
                  <option value="other">Other Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Component Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addFormData.component_name}
                  onChange={(e) => setAddFormData({ ...addFormData, component_name: e.target.value })}
                  placeholder="e.g., Dell OptiPlex 7090"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={addFormData.brand}
                    onChange={(e) => setAddFormData({ ...addFormData, brand: e.target.value })}
                    placeholder="e.g., Dell"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={addFormData.model}
                    onChange={(e) => setAddFormData({ ...addFormData, model: e.target.value })}
                    placeholder="e.g., OptiPlex 7090"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addFormData.serial_number}
                    onChange={(e) => setAddFormData({ ...addFormData, serial_number: e.target.value })}
                    placeholder="Enter or generate serial number"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleGenerateSerial}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.status_id}
                  onChange={(e) => setAddFormData({ ...addFormData, status_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                <textarea
                  value={addFormData.remarks}
                  onChange={(e) => setAddFormData({ ...addFormData, remarks: e.target.value })}
                  rows="3"
                  placeholder="Additional notes about this component"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComponent}
                disabled={addComponentMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {addComponentMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Component
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesktopComponentsPage
