import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Building2,
  Briefcase,
  FileText,
  Tag,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  Shield,
  Clock,
  LayoutGrid,
  Table,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

const normalizeArrayResponse = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

function AssetViewPage() {
  const { id, employeeId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingAssetId, setEditingAssetId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [addFormData, setAddFormData] = useState({
    asset_name: '',
    asset_category_id: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    acq_cost: '',
    waranty_expiration_date: '',
    estimate_life: '',
    vendor_id: '',
    remarks: '',
    assigned_to_employee_id: '',
  })

  // Determine view mode based on params
  const isAssetView = !!id

  // Fetch single asset details (when viewing individual asset)
  const { data: assetData, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${id}`)
      return response.data
    },
    enabled: isAssetView,
  })

  const asset = assetData?.data

  // Fetch employee details (when viewing employee's assets or from asset's assignment)
  const actualEmployeeId = employeeId || asset?.assigned_to_employee_id
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', actualEmployeeId],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${actualEmployeeId}`)
      return response.data
    },
    enabled: !!actualEmployeeId,
  })

  const employee = employeeData?.data

  // Fetch all assets assigned to this employee
  const { data: employeeAssetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['employeeAssets', actualEmployeeId],
    queryFn: async () => {
      const response = await apiClient.get('/assets', {
        params: { assigned_to_employee_id: actualEmployeeId }
      })
      return response.data
    },
    enabled: !!actualEmployeeId,
  })

  const employeeAssets = employeeAssetsData?.data || []
  const isLoading = isLoadingAsset || isLoadingEmployee || isLoadingAssets

  // Fetch dropdown data for edit form
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: statusesData } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
  })

  const categories = categoriesData || []
  const statuses = statusesData || []
  const vendors = vendorsData || []

  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: async ({ assetId, data }) => {
      const response = await apiClient.put(`/assets/${assetId}`, data)
      return response.data
    },
    onSuccess: async () => {
      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['asset', id] }),
        queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employee', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
      ])
      setEditingAssetId(null)
      setEditFormData({})
    },
  })

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) => {
      const response = await apiClient.delete(`/assets/${assetId}`)
      return response.data
    },
    onSuccess: async () => {
      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['asset', id] }),
        queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employee', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
      ])

      // Navigate back to assets list after deleting in asset view
      if (id) {
        navigate('/inventory/assets')
      }

      setShowDeleteModal(false)
      setDeleteTarget(null)
    },
  })

  // Add asset mutation
  const addAssetMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/assets', data)
      return response.data
    },
    onSuccess: async () => {
      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['asset', id] }),
        queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employee', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', employeeId] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['assets'] }), // For AssetsPage
      ])

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Asset created successfully',
        timer: 2000,
      })
      setShowAddModal(false)
      setAddFormData({
        asset_name: '',
        asset_category_id: '',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: '',
        acq_cost: '',
        waranty_expiration_date: '',
        estimate_life: '',
        vendor_id: '',
        remarks: '',
        assigned_to_employee_id: '',
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create asset',
      })
    },
  })

  const handleEditClick = (empAsset) => {
    setEditingAssetId(empAsset.id)
    setEditFormData({
      asset_name: empAsset.asset_name || '',
      asset_category_id: empAsset.asset_category_id || '',
      brand: empAsset.brand || '',
      model: empAsset.model || '',
      serial_number: empAsset.serial_number || '',
      purchase_date: empAsset.purchase_date || '',
      acq_cost: empAsset.acq_cost || '',
      waranty_expiration_date: empAsset.waranty_expiration_date || '',
      estimate_life: empAsset.estimate_life || '',
      vendor_id: empAsset.vendor_id || '',
      status_id: empAsset.status_id || '',
      remarks: empAsset.remarks || '',
      assigned_to_employee_id: empAsset.assigned_to_employee_id || '',
    })
  }

  const handleSaveEdit = (assetId) => {
    updateAssetMutation.mutate({ assetId, data: editFormData })
  }

  const handleCancelEdit = () => {
    setEditingAssetId(null)
    setEditFormData({})
  }

  const handleDeleteAsset = (assetId, assetName) => {
    setDeleteTarget({ id: assetId, name: assetName })
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteAssetMutation.mutate(deleteTarget.id)
    }
  }

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddInputChange = (field, value) => {
    setAddFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAsset = () => {
    // Set the employee ID (works for both /assets/:id and /employees/:employeeId/assets routes)
    const dataToSubmit = {
      ...addFormData,
      assigned_to_employee_id: actualEmployeeId,
    }
    addAssetMutation.mutate(dataToSubmit)
  }

  const openAddModal = () => {
    setAddFormData({
      asset_name: '',
      asset_category_id: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      acq_cost: '',
      waranty_expiration_date: '',
      estimate_life: '',
      vendor_id: '',
      remarks: '',
      assigned_to_employee_id: actualEmployeeId || '',
    })
    setShowAddModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Employee Not Found</h2>
        <p className="text-slate-600 mb-6">The employee you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/inventory/employees')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Employees
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-0">
        <button
          onClick={() => navigate('/inventory/assets')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Back to Assets</span>
          <span className="font-medium sm:hidden">Back</span>
        </button>
      </div>

      {/* Employee Header Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs sm:text-sm text-indigo-100 mb-1">Employee</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{employee.fullname}</h1>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-100" />
                <span>{employee.position?.title || 'No Position'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-100" />
                <span>{employee.branch?.branch_name || 'No Branch'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Employee's All Assets Section - Mobile Optimized */}
        {employeeAssets.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              {/* Section Header - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                      All Assets
                    </h2>
                  </div>
                  <span className="inline-flex items-center w-fit px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {employeeAssets.length} {employeeAssets.length === 1 ? 'Asset' : 'Assets'}
                  </span>
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Add New Asset</span>
                  <span className="xs:hidden">Add Asset</span>
                </button>
              </div>

              {/* View Mode Tabs - Mobile Optimized */}
              <div className="flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                    viewMode === 'cards'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                    viewMode === 'table'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Table</span>
                </button>
              </div>

              {/* Cards View - Mobile Optimized */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {employeeAssets.map((empAsset) => {
                  const isEditing = editingAssetId === empAsset.id

                  return (
                    <div
                      key={empAsset.id}
                      className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1"
                    >
                      {isEditing ? (
                        /* EDIT MODE - Mobile Optimized */
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-blue-500">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Asset</h3>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2">
                              <button
                                onClick={() => handleSaveEdit(empAsset.id)}
                                disabled={updateAssetMutation.isPending}
                                className="p-2 sm:p-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm touch-manipulation"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 sm:p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors touch-manipulation"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Edit Form Fields */}
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            <input
                              type="text"
                              value={editFormData.asset_name}
                              onChange={(e) => handleInputChange('asset_name', e.target.value)}
                              placeholder="Asset Name"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <select
                              value={editFormData.asset_category_id}
                              onChange={(e) => handleInputChange('asset_category_id', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={editFormData.brand}
                              onChange={(e) => handleInputChange('brand', e.target.value)}
                              placeholder="Brand"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={editFormData.model}
                              onChange={(e) => handleInputChange('model', e.target.value)}
                              placeholder="Model"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={editFormData.serial_number}
                              onChange={(e) => handleInputChange('serial_number', e.target.value)}
                              placeholder="Serial Number"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="date"
                              value={editFormData.purchase_date}
                              onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              value={editFormData.acq_cost}
                              onChange={(e) => handleInputChange('acq_cost', e.target.value)}
                              placeholder="Acquisition Cost"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              value={editFormData.estimate_life}
                              onChange={(e) => handleInputChange('estimate_life', e.target.value)}
                              placeholder="Estimated Life (years)"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="date"
                              value={editFormData.waranty_expiration_date}
                              onChange={(e) => handleInputChange('waranty_expiration_date', e.target.value)}
                              placeholder="Warranty Expiration"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <select
                              value={editFormData.vendor_id}
                              onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Vendor</option>
                              {vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                              ))}
                            </select>
                            <select
                              value={editFormData.status_id}
                              onChange={(e) => handleInputChange('status_id', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Status</option>
                              {statuses.map((status) => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                              ))}
                            </select>
                            <textarea
                              value={editFormData.remarks}
                              onChange={(e) => handleInputChange('remarks', e.target.value)}
                              placeholder="Remarks"
                              rows="2"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        /* VIEW MODE - Mobile Optimized */
                        <div className="flex flex-col h-full">
                          {/* Card Header with Gradient */}
                          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 border-b border-slate-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">
                                  {empAsset.asset_name}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm">
                                    {empAsset.status?.name || 'N/A'}
                                  </span>
                                  {empAsset.category && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700">
                                      <Tag className="w-3 h-3" />
                                      {empAsset.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Acquisition Cost Highlight */}
                            {empAsset.acq_cost && (
                              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-slate-600">Acquisition Cost</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xl font-bold text-blue-600">
                                      ₱{(empAsset.acq_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Body - Asset Details */}
                          <div className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white">
                            {/* Primary Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {empAsset.brand && (
                                <InfoCard
                                  label="Brand"
                                  value={empAsset.brand}
                                  icon="🏢"
                                />
                              )}
                              {empAsset.model && (
                                <InfoCard
                                  label="Model"
                                  value={empAsset.model}
                                  icon="📱"
                                />
                              )}
                            </div>

                            {/* Serial & Purchase Info */}
                            <div className="space-y-2.5">
                              {empAsset.serial_number && (
                                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                  <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500">Serial Number</div>
                                    <div className="text-sm font-mono font-semibold text-slate-900 truncate">{empAsset.serial_number}</div>
                                  </div>
                                </div>
                              )}

                              {empAsset.purchase_date && (
                                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-xs text-slate-500">Purchase Date</div>
                                    <div className="text-sm font-medium text-slate-900">
                                      {new Date(empAsset.purchase_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {empAsset.book_value && (
                                <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                                  <div className="flex-1">
                                    <div className="text-xs text-green-600 font-medium">Book Value</div>
                                    <div className="text-sm font-bold text-green-700">
                                      ₱{(empAsset.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Additional Details */}
                            <div className="pt-3 border-t border-slate-200 space-y-2">
                              {empAsset.estimate_life && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Estimated Life
                                  </span>
                                  <span className="font-semibold text-slate-900">{empAsset.estimate_life} years</span>
                                </div>
                              )}
                              {empAsset.waranty_expiration_date && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    Warranty Expires
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    {new Date(empAsset.waranty_expiration_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {empAsset.vendor && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Vendor</span>
                                  <span className="font-semibold text-slate-900 truncate ml-2">{empAsset.vendor.company_name}</span>
                                </div>
                              )}
                            </div>

                            {/* Remarks */}
                            {empAsset.remarks && (
                              <div className="pt-3 border-t border-slate-200">
                                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-amber-700 mb-1">Notes</div>
                                    <div className="text-sm text-slate-700 line-clamp-3">{empAsset.remarks}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons - Mobile Optimized */}
                          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEditClick(empAsset)}
                              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden xs:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(empAsset.id, empAsset.asset_name)}
                              disabled={deleteAssetMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden xs:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              )}

              {/* Table View - Mobile Optimized */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Asset Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Brand & Model</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Serial #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Purchase Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Warranty Exp.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Est. Life (Yrs)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Acq. Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Book Value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Remarks</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider sticky right-0 bg-gradient-to-r from-slate-50 to-slate-100">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {employeeAssets.map((empAsset) => {
                        const isEditing = editingAssetId === empAsset.id

                        return (
                          <tr
                            key={empAsset.id}
                            className={`${isEditing ? 'bg-blue-50 shadow-lg' : 'hover:bg-slate-50'} transition-all duration-200`}
                          >
                            {/* Asset Name */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.asset_name}
                                  onChange={(e) => handleInputChange('asset_name', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Asset Name"
                                />
                              ) : (
                                <div className="text-sm font-medium text-slate-900">{empAsset.asset_name}</div>
                              )}
                            </td>

                            {/* Brand & Model */}
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editFormData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brand"
                                  />
                                  <input
                                    type="text"
                                    value={editFormData.model}
                                    onChange={(e) => handleInputChange('model', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="Model"
                                  />
                                </div>
                              ) : (
                                <div className="text-sm text-slate-700">
                                  {empAsset.brand && <div>{empAsset.brand}</div>}
                                  {empAsset.model && <div className="text-xs text-slate-500">{empAsset.model}</div>}
                                  {!empAsset.brand && !empAsset.model && <span className="text-slate-400">—</span>}
                                </div>
                              )}
                            </td>

                            {/* Serial # */}
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.serial_number}
                                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Serial #"
                                />
                              ) : (
                                <div className="text-sm font-mono text-slate-700">{empAsset.serial_number || '—'}</div>
                              )}
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={editFormData.asset_category_id}
                                  onChange={(e) => handleInputChange('asset_category_id', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select</option>
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  {empAsset.category?.name || '—'}
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={editFormData.status_id}
                                  onChange={(e) => handleInputChange('status_id', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select</option>
                                  {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                  {empAsset.status?.name || '—'}
                                </span>
                              )}
                            </td>

                            {/* Vendor */}
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <select
                                  value={editFormData.vendor_id}
                                  onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select</option>
                                  {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="text-sm text-slate-700">{empAsset.vendor?.company_name || '—'}</div>
                              )}
                            </td>

                            {/* Purchase Date */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editFormData.purchase_date}
                                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-slate-700">
                                  {empAsset.purchase_date ? new Date(empAsset.purchase_date).toLocaleDateString() : '—'}
                                </div>
                              )}
                            </td>

                            {/* Warranty Expiration */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editFormData.waranty_expiration_date}
                                  onChange={(e) => handleInputChange('waranty_expiration_date', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-slate-700">
                                  {empAsset.waranty_expiration_date ? new Date(empAsset.waranty_expiration_date).toLocaleDateString() : '—'}
                                </div>
                              )}
                            </td>

                            {/* Estimated Life */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editFormData.estimate_life}
                                  onChange={(e) => handleInputChange('estimate_life', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Years"
                                  min="0"
                                />
                              ) : (
                                <div className="text-sm text-slate-700 text-center">{empAsset.estimate_life || '—'}</div>
                              )}
                            </td>

                            {/* Acquisition Cost */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editFormData.acq_cost}
                                  onChange={(e) => handleInputChange('acq_cost', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                />
                              ) : (
                                <div className="text-sm font-semibold text-blue-600">
                                  ₱{(empAsset.acq_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              )}
                            </td>

                            {/* Book Value */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                ₱{(empAsset.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              {isEditing && (
                                <div className="text-xs text-slate-500 mt-0.5">Auto-calculated</div>
                              )}
                            </td>

                            {/* Remarks */}
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <textarea
                                  value={editFormData.remarks}
                                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Remarks..."
                                  rows="2"
                                />
                              ) : (
                                <div className="text-sm text-slate-600 max-w-xs truncate" title={empAsset.remarks}>
                                  {empAsset.remarks || '—'}
                                </div>
                              )}
                            </td>

                            {/* Actions - Mobile Optimized */}
                            <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right sticky right-0 bg-white">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveEdit(empAsset.id)}
                                      disabled={updateAssetMutation.isPending}
                                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 touch-manipulation"
                                      title="Save Changes"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Save</span>
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors touch-manipulation"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Cancel</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(empAsset)}
                                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                                      title="Edit Asset"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAsset(empAsset.id, empAsset.asset_name)}
                                      disabled={deleteAssetMutation.isPending}
                                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                                      title="Delete Asset"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                      {/* Empty State */}
                      {employeeAssets.length === 0 && (
                        <div className="text-center py-12 bg-slate-50">
                          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assets Found</h3>
                          <p className="text-slate-600 mb-6">This employee has no assets assigned yet.</p>
                          <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm touch-manipulation"
                          >
                            <Plus className="w-5 h-5" />
                            Add First Asset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Add Asset Modal - Fully Mobile Responsive */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Add New Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 -mr-2 touch-manipulation rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Asset Name */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addFormData.asset_name}
                  onChange={(e) => handleAddInputChange('asset_name', e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter asset name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.asset_category_id}
                  onChange={(e) => handleAddInputChange('asset_category_id', e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={addFormData.brand}
                    onChange={(e) => handleAddInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter brand"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={addFormData.model}
                    onChange={(e) => handleAddInputChange('model', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter model"
                  />
                </div>
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={addFormData.serial_number}
                  onChange={(e) => handleAddInputChange('serial_number', e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter serial number"
                />
              </div>
              {/* Purchase Date & Acquisition Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={addFormData.purchase_date}
                    onChange={(e) => handleAddInputChange('purchase_date', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Acquisition Cost</label>
                  <input
                    type="number"
                    value={addFormData.acq_cost}
                    onChange={(e) => handleAddInputChange('acq_cost', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Estimated Life & Warranty Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Estimated Life (years)</label>
                  <input
                    type="number"
                    value={addFormData.estimate_life}
                    onChange={(e) => handleAddInputChange('estimate_life', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="5"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Warranty Expiration</label>
                  <input
                    type="date"
                    value={addFormData.waranty_expiration_date}
                    onChange={(e) => handleAddInputChange('waranty_expiration_date', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Vendor</label>
                <select
                  value={addFormData.vendor_id}
                  onChange={(e) => handleAddInputChange('vendor_id', e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Remarks</label>
                <textarea
                  value={addFormData.remarks}
                  onChange={(e) => handleAddInputChange('remarks', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter any additional notes..."
                />
              </div>
            </div>
            {/* Modal Footer - Mobile Optimized */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4 pb-6 sm:pb-4 shadow-lg sm:shadow-none">
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors touch-manipulation border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAsset}
                  disabled={addAssetMutation.isPending || !addFormData.asset_name || !addFormData.asset_category_id}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-base sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all touch-manipulation"
                >
                  {addAssetMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Asset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Mobile Optimized */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 pb-6 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Delete Asset</h3>
                  <p className="text-xs sm:text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{deleteTarget.name}"</span>? This will permanently remove the asset from the system.
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                  }}
                  className="px-4 py-2.5 sm:py-2 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteAssetMutation.isPending}
                  className="px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm touch-manipulation"
                >
                  {deleteAssetMutation.isPending ? 'Deleting...' : 'Delete Asset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Component for Info Cards
function InfoCard({ label, value, icon }) {
  if (!value) return null

  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-base">{icon}</span>}
        <div className="text-xs font-medium text-slate-600">{label}</div>
      </div>
      <div className="text-sm font-semibold text-slate-900 truncate">{value}</div>
    </div>
  )
}

export default AssetViewPage
