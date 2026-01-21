import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Barcode,
  ArrowRight,
  X,
  Save,
  Monitor,
  User,
  Activity,
  RefreshCw,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../utils/assetSerial'
import SpecificationFields from '../../components/specifications/SpecificationFields'

function AssetComponentsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(null)
  const [showCodeModal, setShowCodeModal] = useState(null)
  const [editingComponent, setEditingComponent] = useState(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [addFormData, setAddFormData] = useState({
    category_id: '',
    subcategory_id: '',
    component_name: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    specifications: {},
    acq_cost: '',
    vendor_id: '',
    status_id: '',
    remarks: '',
  })

  // Fetch asset details
  const { data: asset, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${id}`)
      return response.data.data
    },
  })

  // Fetch components
  const { data: componentsData, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['asset-components', id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${id}/components`)
      return response.data.data
    },
  })

  // Fetch statuses
  const { data: statusesData } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return response.data.data
    },
  })

  // Fetch employees for transfer
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return response.data
    },
  })

  // Fetch asset categories for component types
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return response.data
    },
  })

  // Fetch subcategories (cascading based on selected category)
  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories', addFormData.category_id],
    queryFn: async () => {
      const response = await apiClient.get(`/asset-categories/${addFormData.category_id}/subcategories`)
      return response.data
    },
    enabled: !!addFormData.category_id && showAddModal,
  })

  // Fetch vendors
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return response.data
    },
    enabled: showAddModal,
  })

  const statuses = statusesData || []
  const categories = categoriesData?.data || []
  const subcategories = subcategoriesData?.data || []
  const vendors = vendorsData?.data || []
  const components = componentsData || []

  // Memoize employees to prevent unnecessary re-renders
  const employees = useMemo(() => employeesData?.data || [], [employeesData?.data])

  // Filter employees based on search (same as bulk transfer)
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees

    const searchTrimmed = employeeSearch.trim()
    if (!searchTrimmed) return employees

    const searchLower = searchTrimmed.toLowerCase()

    return employees.filter((employee) => {
      const fullnameLower = employee.fullname?.toLowerCase() || ''
      const firstnameLower = employee.firstname?.toLowerCase() || ''
      const lastnameLower = employee.lastname?.toLowerCase() || ''
      const branchLower = employee.branch?.branch_name?.toLowerCase() || ''
      const positionLower = employee.position?.position_name?.toLowerCase() || ''
      const emailLower = employee.email?.toLowerCase() || ''

      return (
        fullnameLower.includes(searchLower) ||
        firstnameLower.includes(searchLower) ||
        lastnameLower.includes(searchLower) ||
        branchLower.includes(searchLower) ||
        positionLower.includes(searchLower) ||
        emailLower.includes(searchLower)
      )
    })
  }, [employees, employeeSearch])

  // Helper to format validation errors
  const formatValidationErrors = (error) => {
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join('\n')
    }
    return error.response?.data?.message || 'An error occurred'
  }

  // Add component mutation
  const addComponentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/assets/${id}/components`, {
        components: [data],
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', id])
      Swal.fire('Success', 'Component added successfully', 'success')
      setShowAddModal(false)
      resetAddForm()
    },
    onError: (error) => {
      Swal.fire('Error', formatValidationErrors(error), 'error')
    },
  })

  // Update component mutation
  const updateComponentMutation = useMutation({
    mutationFn: async ({ componentId, data }) => {
      const response = await apiClient.put(`/asset-components/${componentId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', id])
      Swal.fire('Success', 'Component updated successfully', 'success')
      setEditingComponent(null)
    },
    onError: (error) => {
      const errorMessage = formatValidationErrors(error)
      Swal.fire('Error', errorMessage, 'error')
    },
  })

  // Delete component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId) => {
      await apiClient.delete(`/asset-components/${componentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', id])
      Swal.fire('Success', 'Component deleted successfully', 'success')
    },
    onError: (error) => {
      Swal.fire('Error', formatValidationErrors(error), 'error')
    },
  })

  // Transfer component mutation (using proper transfer endpoint)
  const transferComponentMutation = useMutation({
    mutationFn: async ({ componentId, employeeId }) => {
      const response = await apiClient.post(`/asset-components/${componentId}/transfer`, {
        to_employee_id: employeeId,
        reason: 'Component transfer',
        remarks: 'Transferred component to new employee',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['asset-components', id])
      setShowTransferModal(null)
      setEmployeeSearch('')
      setSelectedEmployeeId('')
      Swal.fire({
        icon: 'success',
        title: 'Component Transferred',
        text: 'Component has been transferred successfully',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire('Error', formatValidationErrors(error), 'error')
    },
  })

  const resetAddForm = () => {
    setAddFormData({
      category_id: '',
      subcategory_id: '',
      component_name: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      specifications: {},
      acq_cost: '',
      vendor_id: '',
      status_id: '',
      remarks: '',
    })
  }

  const handleAddComponent = (e) => {
    e.preventDefault()
    addComponentMutation.mutate(addFormData)
  }

  const handleGenerateSerial = () => {
    const serial = buildSerialNumber('COMP')
    setAddFormData((prev) => ({ ...prev, serial_number: serial }))
  }

  const handleEditSave = (component) => {
    // Validate required fields
    if (!editingComponent.category_id || editingComponent.category_id === '') {
      Swal.fire('Validation Error', 'Please select a category', 'warning')
      return
    }
    if (!editingComponent.component_name || !editingComponent.component_name.trim()) {
      Swal.fire('Validation Error', 'Please enter a component name', 'warning')
      return
    }
    if (!editingComponent.status_id || editingComponent.status_id === '') {
      Swal.fire('Validation Error', 'Please select a status', 'warning')
      return
    }

    // Exclude 'id' and sanitize data: convert empty strings to null for nullable fields
    const { id: _id, ...editData } = editingComponent

    // Parse IDs to integers, ensuring they're valid numbers
    const category_id = Number(editData.category_id)
    const status_id = Number(editData.status_id)

    // Double-check that IDs are valid numbers
    if (isNaN(category_id) || category_id <= 0) {
      Swal.fire('Validation Error', 'Invalid category selected', 'warning')
      return
    }
    if (isNaN(status_id) || status_id <= 0) {
      Swal.fire('Validation Error', 'Invalid status selected', 'warning')
      return
    }

    const sanitizedData = {
      category_id: category_id,
      component_name: editData.component_name.trim(),
      brand: editData.brand?.trim() || null,
      model: editData.model?.trim() || null,
      serial_number: editData.serial_number?.trim() || null,
      remarks: editData.remarks?.trim() || null,
      status_id: status_id,
    }

    updateComponentMutation.mutate({
      componentId: component.id,
      data: sanitizedData,
    })
  }

  const handleDelete = (component) => {
    Swal.fire({
      title: 'Delete Component?',
      text: `Are you sure you want to delete ${component.component_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteComponentMutation.mutate(component.id)
      }
    })
  }

  const handleSubmitTransfer = () => {
    if (!selectedEmployeeId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Employee Selected',
        text: 'Please select an employee to transfer the component to',
      })
      return
    }

    const selectedEmployee = employees.find(emp => emp.id === parseInt(selectedEmployeeId))
    const employeeName = selectedEmployee
      ? `${selectedEmployee.fullname}${selectedEmployee.position?.position_name ? ` (${selectedEmployee.position.position_name})` : ''}`
      : 'selected employee'

    Swal.fire({
      title: 'Confirm Transfer',
      text: `Transfer this component to ${employeeName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Transfer',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        transferComponentMutation.mutate({
          componentId: showTransferModal.id,
          employeeId: selectedEmployeeId,
        })
      }
    })
  }

  const closeTransferModal = () => {
    setShowTransferModal(null)
    setEmployeeSearch('')
    setSelectedEmployeeId('')
  }

  const handleDownloadQR = (component) => {
    const link = document.createElement('a')
    link.href = component.qr_code
    link.download = `${component.component_name}-QR.svg`
    link.click()
  }

  const handleDownloadBarcode = (component) => {
    const link = document.createElement('a')
    link.href = component.barcode
    link.download = `${component.component_name}-Barcode.svg`
    link.click()
  }

  const getStatusColor = (statusName) => {
    const name = statusName?.toLowerCase() || ''
    if (name.includes('active') || name.includes('working')) return 'bg-green-100 text-green-700 border-green-200'
    if (name.includes('repair') || name.includes('maintenance'))
      return 'bg-amber-100 text-amber-700 border-amber-200'
    if (name.includes('disposed') || name.includes('retired')) return 'bg-red-100 text-red-700 border-red-200'
    if (name.includes('storage') || name.includes('spare')) return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }



  if (isLoadingAsset || isLoadingComponents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading components...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Asset Not Found</h2>
        <button
          onClick={() => navigate('/inventory/assets')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/inventory/assets/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Monitor className="w-4 h-4" />
                <span>Desktop PC Components</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {asset.brand} {asset.model}
              </h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Component
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium">Total Components</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{components.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {components.filter((c) => c.status?.name?.toLowerCase().includes('active')).length}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs font-medium">In Repair</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">
                {components.filter((c) => c.status?.name?.toLowerCase().includes('repair')).length}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium">Assigned</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {components.filter((c) => c.assigned_employee).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {components.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Components Yet</h3>
            <p className="text-gray-500 mb-4">Add components to track individual parts of this desktop PC</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Component
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <div key={component.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {editingComponent?.id === component.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Category 
                      </label>
                      <select
                        value={editingComponent.category_id || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, category_id: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoadingCategories}
                      >
                        <option value="">
                          {isLoadingCategories ? 'Loading categories...' :
                           categoriesError ? `Error: ${categoriesError.message}` :
                           !categories ? 'Loading...' :
                           categories.length === 0 ? 'No categories available' :
                           'Select Category'}
                        </option>
                        {categories && categories.length > 0 ? (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} 
                            </option>
                          ))
                        ) : null}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Component Name *</label>
                      <input
                        type="text"
                        value={editingComponent.component_name || ''}
                        onChange={(e) =>
                          setEditingComponent((prev) => ({ ...prev, component_name: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Component Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Brand</label>
                      <input
                        type="text"
                        value={editingComponent.brand || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Model</label>
                      <input
                        type="text"
                        value={editingComponent.model || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Model"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Status *</label>
                      <select
                        value={editingComponent.status_id || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, status_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Status</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={editingComponent.serial_number || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, serial_number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Serial Number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Remarks</label>
                      <textarea
                        value={editingComponent.remarks || ''}
                        onChange={(e) => setEditingComponent((prev) => ({ ...prev, remarks: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Remarks"
                        rows="2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(component)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingComponent(null)}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">{component.category?.name || 'Uncategorized'}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{component.component_name}</h3>
                        <p className="text-sm text-gray-600">
                          {component.brand || ''} {component.model || ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {/* Serial Number */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Serial:</span>
                        <span className="font-medium text-gray-900">{component.serial_number || <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>

                      {/* Status */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(component.status?.name)}`}>
                          {component.status?.name || 'N/A'}
                        </span>
                      </div>

                      {/* Subcategory */}
                      {component.subcategory && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subcategory:</span>
                          <span className="font-medium text-gray-900">{component.subcategory.name}</span>
                        </div>
                      )}

                      {/* Purchase Date */}
                      {component.purchase_date && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Purchase Date:</span>
                          <span className="font-medium text-gray-900">{new Date(component.purchase_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Acquisition Cost */}
                      {component.acq_cost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Acq. Cost:</span>
                          <span className="font-medium text-green-700">₱{Number(component.acq_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {/* Vendor */}
                      {component.vendor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Vendor:</span>
                          <span className="font-medium text-gray-900 truncate max-w-[150px]" title={component.vendor.company_name}>{component.vendor.company_name}</span>
                        </div>
                      )}

                      {/* Specifications */}
                      {component.specifications && Object.keys(component.specifications).length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Specifications</div>
                          <div className="space-y-1">
                            {Object.entries(component.specifications).map(([key, value]) => (
                              value && (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span className="font-medium text-gray-900">{value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {component.remarks && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Remarks:</span>
                          <span className="font-medium text-gray-900">{component.remarks}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingComponent({
                          id: component.id,
                          category_id: component.category_id || '',
                          component_name: component.component_name || '',
                          brand: component.brand || '',
                          model: component.model || '',
                          serial_number: component.serial_number || '',
                          status_id: component.status_id || '',
                          remarks: component.remarks || '',
                        })}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(component)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => setShowTransferModal(component)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Transfer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCodeModal({ component, type: 'qr' })
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        QR
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCodeModal({ component, type: 'barcode' })
                        }}
                        className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                      >
                        <Barcode className="w-4 h-4" />
                        Barcode
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Component</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddComponent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Component Category *</label>
                <select
                  value={addFormData.category_id}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Component Name *</label>
                <input
                  type="text"
                  value={addFormData.component_name}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, component_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Intel Core i7 CPU"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={addFormData.brand}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Intel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={addFormData.model}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., i7-12700K"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addFormData.serial_number}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, serial_number: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Serial number"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSerial}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={addFormData.status_id}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, status_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={addFormData.remarks}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Optional Fields Section */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Optional Details</h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
                      <select
                        value={addFormData.subcategory_id}
                        onChange={(e) => setAddFormData({ ...addFormData, subcategory_id: e.target.value })}
                        disabled={!addFormData.category_id}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
                      <input
                        type="date"
                        value={addFormData.purchase_date}
                        onChange={(e) => setAddFormData({ ...addFormData, purchase_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Acquisition Cost</label>
                      <input
                        type="number"
                        value={addFormData.acq_cost}
                        onChange={(e) => setAddFormData({ ...addFormData, acq_cost: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
                      <select
                        value={addFormData.vendor_id}
                        onChange={(e) => setAddFormData({ ...addFormData, vendor_id: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specifications Section */}
                  {addFormData.category_id && (
                    <SpecificationFields
                      categoryName={categories.find(c => c.id === parseInt(addFormData.category_id))?.name || ''}
                      subcategoryName={subcategories.find(s => s.id === parseInt(addFormData.subcategory_id))?.name || ''}
                      specifications={addFormData.specifications}
                      onChange={(specs) => setAddFormData({ ...addFormData, specifications: specs })}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={addComponentMutation.isPending}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {addComponentMutation.isPending ? 'Adding...' : 'Add Component'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal - Similar to Bulk Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transfer Component</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Transfer <strong>{showTransferModal.component_name}</strong> to an employee
                  </p>
                </div>
                <button
                  onClick={closeTransferModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search employees by name, position, branch, or email..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                {filteredEmployees.length} employee(s) found
              </p>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {employeeSearch ? 'No employees found matching your search' : 'No employees available'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployeeId(emp.id.toString())}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 ${
                        selectedEmployeeId === emp.id.toString()
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{emp.fullname}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            {emp.position?.position_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {emp.position.position_name}
                              </span>
                            )}
                            {emp.branch?.branch_name && (
                              <span>{emp.branch.branch_name}</span>
                            )}
                          </div>
                          {emp.email && (
                            <p className="text-xs text-gray-500 mt-1">{emp.email}</p>
                          )}
                        </div>
                        {selectedEmployeeId === emp.id.toString() && (
                          <div className="ml-4">
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleSubmitTransfer}
                disabled={!selectedEmployeeId || transferComponentMutation.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {transferComponentMutation.isPending ? 'Transferring...' : 'Transfer Component'}
              </button>
              <button
                onClick={closeTransferModal}
                disabled={transferComponentMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / Barcode Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {showCodeModal.type === 'qr' ? 'QR Code' : 'Barcode'} - {showCodeModal.component.component_name}
                </h2>
                <button
                  onClick={() => setShowCodeModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Display the code */}
              <div className="flex justify-center items-center bg-gray-50 rounded-lg p-8 mb-6">
                {showCodeModal.type === 'qr' ? (
                  showCodeModal.component.qr_code ? (
                    <img
                      src={showCodeModal.component.qr_code}
                      alt="QR Code"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <QrCode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No QR code available</p>
                    </div>
                  )
                ) : (
                  showCodeModal.component.barcode ? (
                    <img
                      src={showCodeModal.component.barcode}
                      alt="Barcode"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Barcode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No barcode available</p>
                    </div>
                  )
                )}
              </div>

              {/* Component Info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Component:</span>
                    <p className="font-semibold text-gray-900">{showCodeModal.component.component_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-semibold text-gray-900">{showCodeModal.component.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Serial:</span>
                    <p className="font-semibold text-gray-900">{showCodeModal.component.serial_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-semibold text-gray-900">{showCodeModal.component.status?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (showCodeModal.type === 'qr') {
                      handleDownloadQR(showCodeModal.component)
                    } else {
                      handleDownloadBarcode(showCodeModal.component)
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download {showCodeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
                </button>
                <button
                  onClick={() => setShowCodeModal(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetComponentsPage
