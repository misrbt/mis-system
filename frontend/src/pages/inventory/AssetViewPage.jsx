import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  Package,
  User,
  Edit,
  Save,
  X,
  Clock,
  LayoutGrid,
  Table,
  MapPin,
  Activity,
  ArrowRight,
  CornerUpLeft,
  RefreshCw,
  History,
  Users,
  Wrench,
  BarChart3,
  ChevronDown,
  QrCode,
  Barcode,
  MessageSquare,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

// Extracted Components
import AssetMovementTimeline from '../../components/AssetMovementTimeline'
import AssetAssignmentHistory from '../../components/AssetAssignmentHistory'
import TransferAssetModal from '../../components/TransferAssetModal'
import ReturnAssetModal from '../../components/ReturnAssetModal'
import StatusUpdateModal from '../../components/StatusUpdateModal'
import RepairFormModal from '../../components/RepairFormModal'
import CodeDisplayModal from '../../components/CodeDisplayModal'
import AssetCardsView from '../../components/asset-view/AssetCardsView'
import AssetTableView from '../../components/asset-view/AssetTableView'
import AssetComponentsSection from '../../components/asset-view/AssetComponentsSection'
import AddAssetModal from '../../components/asset-view/AddAssetModal'
import DeleteConfirmModal from '../../components/asset-view/DeleteConfirmModal'
import EmployeeHeader from '../../components/asset-view/EmployeeHeader'
import AssetsSectionHeader from '../../components/asset-view/AssetsSectionHeader'
import EmployeeAssetHistory from '../../components/employee/EmployeeAssetHistory'

// Custom Hooks
import { useAssetDropdownData } from '../../hooks/useAssetDropdownData'
import { useAssetQueryInvalidation } from '../../hooks/useAssetQueryInvalidation'

// Utils
import { buildSerialNumber } from '../../utils/assetSerial'

// Services
import { fetchEmployeeAssetHistory } from '../../services/employeeAssetHistoryService'

function AssetViewPage() {
  const { id, employeeId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { invalidateAssetRelatedQueries } = useAssetQueryInvalidation()
  const [editingAssetId, setEditingAssetId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [statusPickerFor, setStatusPickerFor] = useState(null)
  const [showCodesFor, setShowCodesFor] = useState({}) // { [assetId]: 'qr' | 'barcode' | null }
  const [codeModal, setCodeModal] = useState(null) // { src, title, type }
  const [remarksModal, setRemarksModal] = useState(null) // { asset_name, remarks }
  const [showEditModal, setShowEditModal] = useState(false)
  const [editModalData, setEditModalData] = useState(null)
  const serialGenRef = useRef(null)
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
  const [components, setComponents] = useState([])

  // Movement tracking state (for individual asset view)
  const [activeTab, setActiveTab] = useState('timeline') // 'timeline' or 'assignments'
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false)
  const [repairModalAssetId, setRepairModalAssetId] = useState(null) // Track which asset to open repair modal for

  // Employee view tab state
  const [employeeViewTab, setEmployeeViewTab] = useState('assets') // 'assets' or 'history'

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

  // Fetch asset for repair modal (when opened from cards view quick status change)
  const { data: repairModalAssetData } = useQuery({
    queryKey: ['asset', repairModalAssetId],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${repairModalAssetId}`)
      return response.data
    },
    enabled: !!repairModalAssetId && isRepairModalOpen,
  })

  const repairModalAsset = repairModalAssetData?.data

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

  const employeeAssets = Array.isArray(employeeAssetsData?.data) ? employeeAssetsData.data : []
  const totalEmployeeAcqCost = employeeAssets.reduce((sum, assetItem) => {
    const value = Number(assetItem?.acq_cost)
    if (Number.isNaN(value)) return sum
    return sum + value
  }, 0)

  // Fetch employee asset history
  const { data: employeeHistoryData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['employee-asset-history', actualEmployeeId],
    queryFn: async () => {
      const response = await fetchEmployeeAssetHistory(actualEmployeeId)
      return response.data
    },
    enabled: !!actualEmployeeId && employeeViewTab === 'history',
  })

  const employeeHistory = employeeHistoryData?.data || []
  const employeeHistoryStats = employeeHistoryData?.statistics || {}

  // Fetch dropdown data using custom hook (consolidated)
  const { categories, statuses, vendors, statusColorMap, isLoading: isLoadingDropdowns } = useAssetDropdownData()

  const isLoading = isLoadingAsset || isLoadingEmployee || isLoadingAssets || isLoadingDropdowns

  // Movement tracking queries (for individual asset view)
  const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['asset-movements', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/movements/history`)).data,
    enabled: isAssetView && !!id,
  })

  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['asset-assignments', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/movements/assignments`)).data,
    enabled: isAssetView && !!id,
  })

  const { data: statisticsData } = useQuery({
    queryKey: ['asset-statistics', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/movements/statistics`)).data,
    enabled: isAssetView && !!id,
  })

  const movements = movementsData?.data || []
  const assignments = assignmentsData?.data || []
  const statistics = statisticsData?.data || {}



  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: async ({ assetId, data }) => {
      const response = await apiClient.put(`/assets/${assetId}`, data)
      return response.data
    },
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)
      setEditingAssetId(null)
      setEditFormData({})
      setShowEditModal(false)
      setEditModalData(null)

      Swal.fire({
        icon: 'success',
        title: 'Asset Updated',
        text: 'Asset has been updated successfully',
        timer: 2000,
        showConfirmButton: false,
      })
    },
  })

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) => {
      const response = await apiClient.delete(`/assets/${assetId}`)
      return response.data
    },
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)

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
      console.log('Creating asset with data:', data)
      const response = await apiClient.post('/assets', data)
      console.log('Asset creation response:', response.data)
      return response.data
    },
    onSuccess: async (data) => {
      console.log('Asset created successfully:', data)
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Asset created successfully',
        timer: 2000,
        showConfirmButton: false,
      })

      setShowAddModal(false)
      setComponents([]) // Reset components after successful creation
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


      // Extract detailed error messages
      let errorMessage = 'Failed to create asset'
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors
        errorMessage = Object.values(errors).flat().join('\n')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      Swal.fire({
        icon: 'error',
        title: 'Error Creating Asset',
        text: errorMessage,
        confirmButtonText: 'OK',
      })
    },
  })

  // Helper function to format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ''
    }
  }

  const handleEditClick = (empAsset) => {
    if (viewMode === 'table') {
      // Table view - use modal
      setEditModalData(empAsset)
      setEditFormData({
        asset_name: empAsset.asset_name || '',
        asset_category_id: empAsset.asset_category_id || '',
        brand: empAsset.brand || '',
        model: empAsset.model || '',
        serial_number: empAsset.serial_number || '',
        purchase_date: formatDateForInput(empAsset.purchase_date),
        acq_cost: empAsset.acq_cost || '',
        waranty_expiration_date: formatDateForInput(empAsset.waranty_expiration_date),
        estimate_life: empAsset.estimate_life || '',
        vendor_id: empAsset.vendor_id || '',
        status_id: empAsset.status_id || '',
        remarks: empAsset.remarks || '',
        assigned_to_employee_id: empAsset.assigned_to_employee_id || '',
      })
      setShowEditModal(true)
    } else {
      // Card view - inline editing
      setEditingAssetId(empAsset.id)
      setEditFormData({
        asset_name: empAsset.asset_name || '',
        asset_category_id: empAsset.asset_category_id || '',
        brand: empAsset.brand || '',
        model: empAsset.model || '',
        serial_number: empAsset.serial_number || '',
        purchase_date: formatDateForInput(empAsset.purchase_date),
        acq_cost: empAsset.acq_cost || '',
        waranty_expiration_date: formatDateForInput(empAsset.waranty_expiration_date),
        estimate_life: empAsset.estimate_life || '',
        vendor_id: empAsset.vendor_id || '',
        status_id: empAsset.status_id || '',
        remarks: empAsset.remarks || '',
        assigned_to_employee_id: empAsset.assigned_to_employee_id || '',
      })
    }
  }

  const handleSaveEdit = () => {
    if (editModalData) {
      updateAssetMutation.mutate({ assetId: editModalData.id, data: editFormData })
    } else if (editingAssetId) {
      updateAssetMutation.mutate({ assetId: editingAssetId, data: editFormData })
    }
  }

  const handleCancelEdit = () => {
    setEditingAssetId(null)
    setEditFormData({})
    setShowEditModal(false)
    setEditModalData(null)
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

  // Component handlers for Desktop PC
  const handleComponentAdd = () => {
    setComponents(prev => [...prev, {
      id: Date.now(),
      component_type: 'system_unit',
      component_name: '',
      brand: '',
      model: '',
      serial_number: '',
      status_id: '',
      acq_cost: '',
      remarks: '',
    }])
  }

  const handleComponentRemove = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id))
  }

  const handleComponentChange = (id, field, value) => {
    setComponents(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const generateSerialNumber = () => {
    // Get selected category
    const selectedCategory = categories.find(cat => cat.id == addFormData.asset_category_id)

    // Generate unique serial number format: CATEGORYCODE-YYYY-TIMESTAMP-RANDOM
    const categoryCode = selectedCategory?.code || selectedCategory?.name?.substring(0, 3).toUpperCase() || 'AST'
    if (!serialGenRef.current) {
      serialGenRef.current = {
        categoryCode,
        serialNumber: buildSerialNumber(categoryCode),
      }
    }
    if (serialGenRef.current?.categoryCode !== categoryCode) {
      serialGenRef.current = {
        categoryCode,
        serialNumber: buildSerialNumber(categoryCode),
      }
    }

    setAddFormData(prev => ({ ...prev, serial_number: serialGenRef.current.serialNumber }))
  }

  const generateComponentSerialNumber = (componentId) => {
    // Generate unique serial number for component using COMP prefix
    const serialNumber = buildSerialNumber('COMP')
    setComponents(prev => prev.map(c =>
      c.id === componentId ? { ...c, serial_number: serialNumber } : c
    ))
  }

  const handleAddAsset = () => {
    // Validate required fields
    if (!addFormData.asset_name || !addFormData.asset_category_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in asset name and category',
      })
      return
    }

    // Set the employee ID (works for both /assets/:id and /employees/:employeeId/assets routes)
    const dataToSubmit = {
      ...addFormData,
      assigned_to_employee_id: actualEmployeeId || null,
      // Convert string IDs to numbers
      asset_category_id: addFormData.asset_category_id ? Number(addFormData.asset_category_id) : null,
      vendor_id: addFormData.vendor_id ? Number(addFormData.vendor_id) : null,
      // Convert numeric strings to numbers
      acq_cost: addFormData.acq_cost ? Number(addFormData.acq_cost) : null,
      estimate_life: addFormData.estimate_life ? Number(addFormData.estimate_life) : null,
      // Include components if any (for Desktop PC)
      components: components.filter(c => c.component_name.trim() !== ''),
    }
    addAssetMutation.mutate(dataToSubmit)
  }

  const openAddModal = () => {
    console.log('Opening add modal for employee:', actualEmployeeId)

    // Check if we have an employee ID
    if (!actualEmployeeId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Employee Selected',
        text: 'Cannot add asset without an employee assignment',
      })
      return
    }

    serialGenRef.current = null
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
      assigned_to_employee_id: actualEmployeeId,
    })
    setComponents([]) // Reset components when opening modal
    setShowAddModal(true)
  }

  const updateStatusMutation = useMutation({
    mutationFn: async ({ assetId, statusId }) => {
      const response = await apiClient.patch(`/assets/${assetId}/status`, { status_id: statusId })
      return { ...response.data, assetId, statusId }
    },
    onSuccess: async (data) => {
      const { assetId, statusId } = data

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['asset', id] }),
        queryClient.invalidateQueries({ queryKey: ['employeeAssets', actualEmployeeId] }),
        queryClient.invalidateQueries({ queryKey: ['assets'] }),
      ])

      // Check if the selected status is "Under Repair"
      const selectedStatus = statuses.find(s => s.id === statusId)

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        // After SweetAlert closes, open repair modal if status is "Under Repair"
        if (selectedStatus?.name === 'Under Repair') {
          // Set which asset to open repair modal for
          setRepairModalAssetId(assetId)
          setIsRepairModalOpen(true)
        }
      })

      setStatusPickerFor(null)
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update status',
      })
      setStatusPickerFor(null)
    },
  })

  const handleQuickStatusChange = (assetId, statusId) => {
    if (!statusId) return
    const numericStatusId = Number(statusId)
    if (Number.isNaN(numericStatusId)) return
    updateStatusMutation.mutate({ assetId, statusId: numericStatusId })
  }

  const handleDownloadCode = () => {
    if (!codeModal?.src) return
    const link = document.createElement('a')
    link.href = codeModal.src
    link.download = `${codeModal.title || 'code'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintCode = () => {
    if (!codeModal?.src) return
    const printWindow = window.open('', '_blank', 'width=600,height=600')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>${codeModal.title || 'Code'}</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            img { max-width: 90vw; max-height: 90vh; }
          </style>
        </head>
        <body>
          <img src="${codeModal.src}" alt="${codeModal.title || 'Code'}" />
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Individual Asset View with Movement Tracking
  if (isAssetView && !employeeId) {
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

    const currentEmployee = asset?.assigned_employee
    const currentStatus = asset?.status
    const currentAssignmentDays = statistics?.current_assignment_days || 0

    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {codeModal &&
          createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
              onClick={() => setCodeModal(null)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {codeModal.type === 'qr' ? (
                        <QrCode className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Barcode className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">
                        {codeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
                      </div>
                      <div className="text-lg font-semibold text-slate-800">{codeModal.title}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCodeModal(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-slate-50">
                  <div className="flex flex-col items-center gap-4">
                    {/* Image container */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <img
                        src={codeModal.src}
                        alt={codeModal.title || 'Code'}
                        className="w-full max-w-lg object-contain"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                      <button
                        onClick={handleDownloadCode}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </button>

                      <button
                        onClick={handlePrintCode}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Print</span>
                      </button>

                      <button
                        onClick={() => setCodeModal(null)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Back button and Asset info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {asset.brand} {asset.model}
                  </h1>
                  <p className="text-sm text-gray-600">Serial: {asset.serial_number}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <button
                    onClick={() => setStatusPickerFor(statusPickerFor === asset.id ? null : asset.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border"
                      style={{
                        backgroundColor: statusColorMap[asset?.status_id] || '#E2E8F0',
                        color: statusColorMap[asset?.status_id] ? '#fff' : '#1e293b',
                        borderColor: statusColorMap[asset?.status_id] || '#cbd5e1',
                      }}
                    >
                      {asset?.status?.name || 'Status'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {statusPickerFor === asset.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      <select
                        value={asset?.status_id || ''}
                        onChange={(e) => {
                          handleQuickStatusChange(asset.id, e.target.value)
                          setStatusPickerFor(null)
                        }}
                        className="w-full px-3 py-2 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select status</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>{status.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  disabled={!currentEmployee}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Transfer
                </button>
                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  disabled={!currentEmployee}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <CornerUpLeft className="w-4 h-4" />
                  Return
                </button>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Assignments</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {statistics?.assignment_count || 0}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-xs font-medium">Transfers</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics?.transfer_count || 0}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs font-medium">Repairs</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {statistics?.repair_count || 0}
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium">Status Changes</span>
                </div>
                <p className="text-2xl font-bold text-indigo-900">
                  {statistics?.status_change_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Asset Info */}
            <div className="col-span-4 space-y-6">
              {/* Current Assignment Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Current Assignment
                </h3>
                {currentEmployee ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{currentEmployee.fullname}</p>
                        {currentEmployee.position && (
                          <p className="text-sm text-gray-600">{currentEmployee.position.position_name}</p>
                        )}
                        {currentEmployee.branch && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {currentEmployee.branch.branch_name}
                          </div>
                        )}
                      </div>
                    </div>
                    {currentAssignmentDays > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Assigned for <strong>{currentAssignmentDays} days</strong>
                          </span>
                        </div>
                      </div>
                    )}
                    {/* View All Employee Assets Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/inventory/employees/${currentEmployee.id}/assets`)}
                        className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        View All {currentEmployee.fullname.split(' ')[0]}'s Assets
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm">Not assigned</p>
                    <p className="text-gray-400 text-xs mt-1">Asset is in inventory</p>
                  </div>
                )}
              </div>

              {/* Current Status & Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Asset Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="font-medium text-gray-900">{currentStatus?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">{asset.category?.name || 'N/A'}</span>
                  </div>
                  {asset.purchase_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Purchase Date</span>
                      <span className="font-medium text-gray-900">
                        {new Date(asset.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {asset.acq_cost && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Acquisition Cost</span>
                      <span className="font-medium text-gray-900">
                        ₱{parseFloat(asset.acq_cost).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {asset.book_value !== null && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Book Value</span>
                      <span className="font-medium text-gray-900">
                        ₱{parseFloat(asset.book_value).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {asset.vendor && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Vendor</span>
                      <span className="font-medium text-gray-900">{asset.vendor.company_name}</span>
                    </div>
                  )}
                  {asset.warranty_expiration && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Warranty Expiration</span>
                      <span className="font-medium text-gray-900">
                        {new Date(asset.warranty_expiration).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Components Section - Only for Desktop PC */}
            {asset && (asset.category?.name?.toLowerCase().includes('desktop') || asset.category?.name?.toLowerCase().includes('pc')) && (
              <div className="lg:col-span-12 mb-6">
                <AssetComponentsSection assetId={asset.id} asset={asset} statuses={statuses} />
              </div>
            )}

            {/* Right Column - Movement History */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-0">
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'timeline'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      Movement Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab('assignments')}
                      className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'assignments'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Assignment History
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'timeline' && (
                    <AssetMovementTimeline
                      movements={movements}
                      loading={isLoadingMovements}
                    />
                  )}
                  {activeTab === 'assignments' && (
                    <AssetAssignmentHistory
                      assignments={assignments}
                      loading={isLoadingAssignments}
                      currentEmployeeId={currentEmployee?.id}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <TransferAssetModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          asset={asset}
        />
        <ReturnAssetModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          asset={asset}
        />
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          asset={asset}
          onAfterUpdate={() => {
            // Auto-open repair modal when status changes to "Under Repair"
            setIsRepairModalOpen(true)
          }}
        />
        <RepairFormModal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          asset={asset}
        />
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
      {/* QR Code / Barcode Modal */}
      {codeModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
            onClick={() => setCodeModal(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {codeModal.type === 'qr' ? (
                      <QrCode className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Barcode className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">
                      {codeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
                    </div>
                    <div className="text-lg font-semibold text-slate-800">{codeModal.title}</div>
                  </div>
                </div>
                <button
                  onClick={() => setCodeModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                  {/* Image container */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <img
                      src={codeModal.src}
                      alt={codeModal.title || 'Code'}
                      className="w-full max-w-lg object-contain"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                      onClick={handleDownloadCode}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </button>

                    <button
                      onClick={handlePrintCode}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>

                    <button
                      onClick={() => setCodeModal(null)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Remarks Modal */}
      {remarksModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
            onClick={() => setRemarksModal(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Remarks</div>
                    <div className="text-lg font-semibold text-slate-800">{remarksModal.asset_name}</div>
                  </div>
                </div>
                <button
                  onClick={() => setRemarksModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-slate-50">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[120px]">
                  {remarksModal.remarks ? (
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {remarksModal.remarks}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">No remarks available for this asset</p>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setRemarksModal(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
      <EmployeeHeader employee={employee} />

      {/* Employee's Assets and History Section - Mobile Optimized */}
      <div className="mt-6 sm:mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          {/* Main Tabs - Assets vs History */}
          <div className="flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setEmployeeViewTab('assets')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 border-b-2 transition-colors whitespace-nowrap touch-manipulation font-medium ${
                employeeViewTab === 'assets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm sm:text-base">My Assets</span>
              {employeeAssets.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {employeeAssets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setEmployeeViewTab('history')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 border-b-2 transition-colors whitespace-nowrap touch-manipulation font-medium ${
                employeeViewTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm sm:text-base">Asset History</span>
            </button>
          </div>

          {/* Assets Tab Content */}
          {employeeViewTab === 'assets' && (
            <>
              {employeeAssets.length > 0 ? (
                <>
                  {/* Section Header - Mobile Optimized */}
                  <AssetsSectionHeader
                    assetCount={employeeAssets.length}
                    totalAcqCost={totalEmployeeAcqCost}
                    onAddClick={openAddModal}
                  />

                  {/* View Mode Tabs - Hidden on Mobile */}
                  <div className="hidden sm:flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
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
                <AssetCardsView
                  assets={employeeAssets}
                  editingAssetId={editingAssetId}
                  editFormData={editFormData}
                  categories={categories}
                  statuses={statuses}
                  vendors={vendors}
                  statusColorMap={statusColorMap}
                  statusPickerFor={statusPickerFor}
                  showCodesFor={showCodesFor}
                  onEditClick={handleEditClick}
                  onSaveEdit={() => handleSaveEdit()}
                  onCancelEdit={handleCancelEdit}
                  onInputChange={(field, value) => handleInputChange(field, value)}
                  onDeleteClick={(assetId, assetName) => handleDeleteAsset(assetId, assetName)}
                  onQuickStatusChange={(assetId, statusId) => handleQuickStatusChange(assetId, statusId)}
                  onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
                  onCodeToggle={(assetId, type) => setShowCodesFor(prev => ({ ...prev, [assetId]: prev[assetId] === type ? null : type }))}
                  onCodeView={(code) => setCodeModal(code)}
                  onCardClick={(assetId) => navigate(`/inventory/assets/${assetId}`)}
                  isPending={updateAssetMutation.isPending || deleteAssetMutation.isPending}
                />
              )}

                  {/* Table View - Mobile Optimized */}
                  {viewMode === 'table' && (
                    <AssetTableView
                      assets={employeeAssets}
                      categories={categories}
                      statuses={statuses}
                      vendors={vendors}
                      statusColorMap={statusColorMap}
                      statusPickerFor={statusPickerFor}
                      totalEmployeeAcqCost={totalEmployeeAcqCost}
                      onEditClick={handleEditClick}
                      onDeleteClick={(assetId, assetName) => handleDeleteAsset(assetId, assetName)}
                      onQuickStatusChange={(assetId, statusId) => handleQuickStatusChange(assetId, statusId)}
                      onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
                      onCodeView={(code) => setCodeModal(code)}
                      onRemarksView={(asset) => setRemarksModal({ asset_name: asset.asset_name, remarks: asset.remarks })}
                      onCardClick={(assetId) => navigate(`/inventory/assets/${assetId}`)}
                      onAddClick={() => openAddModal()}
                      isPending={updateAssetMutation.isPending || deleteAssetMutation.isPending}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No assets assigned</p>
                  <p className="text-gray-400 text-sm mt-1">This employee doesn't have any assets assigned yet</p>
                  <button
                    onClick={openAddModal}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign First Asset
                  </button>
                </div>
              )}
            </>
          )}

          {/* Asset History Tab Content */}
          {employeeViewTab === 'history' && (
            <div className="mt-4">
              <EmployeeAssetHistory
                movements={employeeHistory}
                loading={isLoadingHistory}
                statistics={employeeHistoryStats}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal - Fully Mobile Responsive */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={addFormData}
        onInputChange={handleAddInputChange}
        categories={categories}
        vendors={vendors}
        statuses={statuses}
        onGenerateSerial={generateSerialNumber}
        onGenerateComponentSerial={generateComponentSerialNumber}
        onSubmit={handleAddAsset}
        isPending={addAssetMutation.isPending}
<<<<<<< Updated upstream
=======
        onAddVendor={openVendorModal}
        components={components}
        onComponentAdd={handleComponentAdd}
        onComponentRemove={handleComponentRemove}
        onComponentChange={handleComponentChange}
>>>>>>> Stashed changes
      />

      {/* Delete Confirmation Modal - Mobile Optimized */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
        assetName={deleteTarget?.name}
        isPending={deleteAssetMutation.isPending}
      />

      {/* Edit Asset Modal - For Table View */}
      {showEditModal && editModalData &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
            onClick={handleCancelEdit}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Edit Asset</div>
                    <div className="text-lg font-semibold text-slate-800">{editModalData.asset_name}</div>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-slate-50 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Asset Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.asset_name}
                      onChange={(e) => handleInputChange('asset_name', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter asset name"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.asset_category_id}
                      onChange={(e) => handleInputChange('asset_category_id', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                      value={editFormData.status_id}
                      onChange={(e) => handleInputChange('status_id', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select status</option>
                      {statuses?.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={editFormData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter brand"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                    <input
                      type="text"
                      value={editFormData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter model"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
                    <input
                      type="text"
                      value={editFormData.serial_number}
                      onChange={(e) => handleInputChange('serial_number', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter serial number"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.purchase_date}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Warranty Expiration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Expiration</label>
                    <input
                      type="date"
                      value={editFormData.waranty_expiration_date}
                      onChange={(e) => handleInputChange('waranty_expiration_date', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Acquisition Cost */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Acquisition Cost</label>
                    <input
                      type="number"
                      value={editFormData.acq_cost}
                      onChange={(e) => handleInputChange('acq_cost', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Estimated Life */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Life (Years)</label>
                    <input
                      type="number"
                      value={editFormData.estimate_life}
                      onChange={(e) => handleInputChange('estimate_life', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Years"
                      min="0"
                    />
                  </div>

                  {/* Vendor */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
                    <select
                      value={editFormData.vendor_id}
                      onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select vendor</option>
                      {vendors?.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Remarks */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                    <textarea
                      value={editFormData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any notes or remarks..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateAssetMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateAssetMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Repair Form Modal - for cards view quick status change */}
      <RepairFormModal
        isOpen={isRepairModalOpen}
        onClose={() => {
          setIsRepairModalOpen(false)
          setRepairModalAssetId(null)
        }}
        asset={repairModalAsset || asset}
      />
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
