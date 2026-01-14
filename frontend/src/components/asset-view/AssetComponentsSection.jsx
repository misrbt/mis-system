import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, Edit, Trash2, QrCode, ArrowRight, Barcode, X, Save } from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function AssetComponentsSection({ assetId, asset, statuses = [] }) {
  const queryClient = useQueryClient()
  const [editingComponent, setEditingComponent] = useState(null)
  const [editFormData, setEditFormData] = useState({})

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
      assigned_to_employee_id: component.assigned_to_employee_id || '',
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Components</h3>
        </div>
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600">No components tracked for this asset</p>
          <p className="text-xs text-slate-500 mt-1">Components can be added when creating the asset</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Components <span className="text-sm text-slate-500">({components.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => {
          const isEditing = editingComponent === component.id

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
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        <h4 className="font-semibold text-slate-900 truncate">{component.component_name}</h4>
                      </div>
                      <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {component.component_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
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
    </div>
  )
}

export default AssetComponentsSection
