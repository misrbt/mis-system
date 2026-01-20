import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, Plus, Edit, Trash2, QrCode, ArrowRight, Barcode, X, Save,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../utils/assetSerial'

function AssetComponentsSection({ assetId, asset, statuses = [] }) {
  const queryClient = useQueryClient()
  const [editingComponent, setEditingComponent] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [addFormData, setAddFormData] = useState({
    component_type: 'system_unit',
    component_name: '',
    brand: '',
    model: '',
    serial_number: '',
    status_id: '',
    remarks: '',
  })

  // Fetch components
  const { data: componentsData, isLoading } = useQuery({
    queryKey: ['asset-components', assetId],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${assetId}/components`)
      return response.data
    },
    enabled: !!assetId,
  })

  const components = componentsData?.data || []

  // Fetch employees for transfer
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return response.data
    },
    enabled: showTransferModal !== null,
  })

  const employees = employeesData?.data || []

  // Add component mutation
  const addComponentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/assets/${assetId}/components`, {
        components: [data],
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', assetId])
      setShowAddModal(false)
      setAddFormData({
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
      queryClient.invalidateQueries(['asset-components', assetId])
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
      queryClient.invalidateQueries(['asset-components', assetId])
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

  // Transfer component mutation
  const transferComponentMutation = useMutation({
    mutationFn: async ({ componentId, employeeId }) => {
      const response = await apiClient.put(`/asset-components/${componentId}`, {
        assigned_to_employee_id: employeeId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', assetId])
      setShowTransferModal(null)
      setSelectedEmployeeId('')
      Swal.fire({
        icon: 'success',
        title: 'Transferred!',
        text: 'Component has been transferred successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to transfer component',
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
    setEditFormData(prev => ({ ...prev, [field]: value }))
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

  const handleTransfer = (component) => {
    setShowTransferModal(component.id)
    setSelectedEmployeeId('')
  }

  const handleConfirmTransfer = () => {
    if (!selectedEmployeeId) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Employee',
        text: 'Please select an employee to transfer the component to.',
      })
      return
    }

    transferComponentMutation.mutate({
      componentId: showTransferModal,
      employeeId: selectedEmployeeId,
    })
  }

  const handleAddComponent = () => {
    if (!addFormData.component_name || !addFormData.status_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in component name and status.',
      })
      return
    }

    addComponentMutation.mutate(addFormData)
  }

  const handleGenerateSerial = () => {
    const serialNumber = buildSerialNumber('COMP')
    setAddFormData(prev => ({ ...prev, serial_number: serialNumber }))
  }

  const getStatusColor = (statusName) => {
    const name = statusName?.toLowerCase() || ''
    if (name.includes('active') || name.includes('working') || name.includes('deployed')) {
      return 'bg-green-100 text-green-700'
    }
    if (name.includes('repair') || name.includes('maintenance')) {
      return 'bg-amber-100 text-amber-700'
    }
    if (name.includes('disposed') || name.includes('broken')) {
      return 'bg-red-100 text-red-700'
    }
    if (name.includes('stock') || name.includes('storage')) {
      return 'bg-blue-100 text-blue-700'
    }
    return 'bg-slate-100 text-slate-700'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Header - Collapsible */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Desktop PC Components
                <span className="ml-2 text-sm text-slate-600">({components.length})</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">Track individual parts with status and transfer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddModal(true)
              }}
              className="px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Component</span>
              <span className="sm:hidden">Add</span>
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-4 sm:p-6">
            {components.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No components tracked yet</p>
                <p className="text-xs text-slate-500 mt-1">Click "Add Component" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map((component) => {
                  const isEditing = editingComponent === component.id

                  return (
                    <div
                      key={component.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isEditing ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-slate-200 hover:shadow-md bg-white'
                      }`}
                    >
                      {isEditing ? (
                        /* EDIT MODE */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-600 text-sm">Edit Component</h4>
                            <button
                              onClick={handleCancelEdit}
                              className="text-slate-400 hover:text-slate-600"
                            >
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
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                <h4 className="font-semibold text-slate-900 truncate text-sm">{component.component_name}</h4>
                              </div>
                              <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {component.component_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs mb-4">
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
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Status:</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(component.status?.name)}`}>
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

                          <div className="space-y-2 pt-3 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleEdit(component)}
                                className="px-2 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(component)}
                                className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleTransfer(component)}
                                className="px-2 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Transfer
                              </button>
                              <button
                                onClick={() => handleViewQRCode(component)}
                                className="px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                QR
                              </button>
                              <button
                                onClick={() => handleViewBarcode(component)}
                                className="px-2 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                              >
                                <Barcode className="w-3.5 h-3.5" />
                                Barcode
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Transfer Component</h3>
              <button
                onClick={() => setShowTransferModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Select an employee to transfer this component to:
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullname} - {emp.position?.position_name || 'No Position'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowTransferModal(null)}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={transferComponentMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {transferComponentMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AssetComponentsSection
