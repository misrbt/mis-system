import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw,
  Plus,
  Filter,
  Package2,
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import { getReplenishmentColumns } from './replenishment/replenishmentColumns'
import ReplenishmentFormModal from './replenishment/ReplenishmentFormModal'
import AssignModal from './replenishment/AssignModal'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../utils/assetSerial'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

const EMPTY_VALUE = '—'
const CURRENCY_PREFIX = '₱'

const INITIAL_FILTERS = {
  category_id: '',
  status_id: '',
  branch_id: '',
  vendor_id: '',
  assignment_status: '',
}

const INITIAL_FORM_DATA = {
  asset_name: '',
  serial_number: '',
  asset_category_id: '',
  subcategory_id: '',
  brand: '',
  model: '',
  acq_cost: '',
  book_value: '',
  purchase_date: '',
  warranty_expiration_date: '',
  estimate_life: '',
  vendor_id: '',
  status_id: '',
  remarks: '',
  specifications: {},
}

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

const buildFormData = (replenishment = {}) => ({
  asset_name: replenishment.asset_name || '',
  serial_number: replenishment.serial_number || '',
  asset_category_id: replenishment.asset_category_id || '',
  subcategory_id: replenishment.subcategory_id || '',
  brand: replenishment.brand || '',
  model: replenishment.model || '',
  acq_cost: replenishment.acq_cost || '',
  book_value: replenishment.book_value || '',
  purchase_date: formatDateForInput(replenishment.purchase_date),
  warranty_expiration_date: formatDateForInput(replenishment.warranty_expiration_date),
  estimate_life: replenishment.estimate_life || '',
  vendor_id: replenishment.vendor_id || '',
  status_id: replenishment.status_id || '',
  remarks: replenishment.remarks || '',
  specifications: replenishment.specifications || {},
})

const notifySuccess = (title, text) => {
  Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
  })
}

const notifyError = (fallback, error) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error?.response?.data?.message || fallback,
  })
}

function ReplenishmentPage() {
  const queryClient = useQueryClient()

  // Defer secondary queries until after first paint to prevent mount-time flood
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedReplenishment, setSelectedReplenishment] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [components, setComponents] = useState([])

  // Fetch replenishments
  const { data: replenishmentsData, isLoading, refetch, isError, error } = useQuery({
    queryKey: ['replenishments', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await apiClient.get(`/replenishments?${params.toString()}`)
      return response.data
    },
    retry: 0,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })

  // modalOpen = any form modal is open (drives secondary query loading)
  const modalOpen = isAddModalOpen || isEditModalOpen

  // Fetch filter options — only load when the filter panel or a modal is open
  const filterOrModal = hydrated && (showFilters || modalOpen)

  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
    enabled: filterOrModal,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: subcategories } = useQuery({
    queryKey: ['asset-subcategories', formData.asset_category_id],
    queryFn: async () => {
      if (!formData.asset_category_id) return []
      const response = await apiClient.get(`/asset-categories/${formData.asset_category_id}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: modalOpen && !!formData.asset_category_id,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
    enabled: filterOrModal,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
    enabled: filterOrModal,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return normalizeArrayResponse(response.data)
    },
    enabled: filterOrModal,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  // Employees and equipment only needed inside the form modal
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return normalizeArrayResponse(response.data)
    },
    enabled: hydrated && (modalOpen || isAssignModalOpen),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: equipmentList } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await apiClient.get('/equipment')
      return normalizeArrayResponse(response.data)
    },
    enabled: hydrated && modalOpen,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  // Vendor modal state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [vendorFormData, setVendorFormData] = useState({
    company_name: '',
    contact_no: '',
    address: '',
  })

  // Memoized options
  const statusOptions = useMemo(() => normalizeArrayResponse(statuses), [statuses])
  const statusColorMap = useMemo(() => {
    return statusOptions.reduce((acc, s) => {
      acc[s.id] = s.color || ''
      return acc
    }, {})
  }, [statusOptions])

  const vendorOptions = useMemo(
    () =>
      (Array.isArray(vendors) ? vendors : []).map((vendor) => ({
        id: vendor.id,
        name: vendor.company_name,
      })),
    [vendors]
  )

  const employeeOptions = useMemo(
    () =>
      (Array.isArray(employees) ? employees : []).map((emp) => ({
        id: emp.id,
        name: emp.fullname,
        position: emp.position?.title,
        branch: emp.branch?.branch_name,
      })),
    [employees]
  )

  const branchOptions = useMemo(
    () => (Array.isArray(branches) ? branches : []),
    [branches]
  )

  const equipmentOptions = useMemo(
    () =>
      (Array.isArray(equipmentList) ? equipmentList : []).map((eq) => ({
        id: eq.id,
        name: `${eq.brand} ${eq.model}`,
        brand: eq.brand,
        model: eq.model,
        asset_category_id: eq.asset_category_id,
        subcategory_id: eq.subcategory_id,
        category_name: eq.category?.name,
        subcategory_name: eq.subcategory?.name,
      })),
    [equipmentList]
  )

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/replenishments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      notifySuccess('Success', 'Reserve asset created successfully')
      setIsAddModalOpen(false)
      setFormData(INITIAL_FORM_DATA)
    },
    onError: (error) => {
      notifyError('Failed to create reserve asset', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/replenishments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      notifySuccess('Success', 'Reserve asset updated successfully')
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      notifyError('Failed to update reserve asset', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/replenishments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Reserve asset deleted successfully',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      notifyError('Failed to delete reserve asset', error)
    },
  })

  const assignEmployeeMutation = useMutation({
    mutationFn: ({ id, employeeId }) =>
      apiClient.post(`/replenishments/${id}/assign-employee`, { employee_id: employeeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      notifySuccess('Success', 'Asset assigned to employee successfully')
      setIsAssignModalOpen(false)
    },
    onError: (error) => {
      notifyError('Failed to assign asset', error)
    },
  })

  const assignBranchMutation = useMutation({
    mutationFn: ({ id, branchId }) =>
      apiClient.post(`/replenishments/${id}/assign-branch`, { branch_id: branchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      notifySuccess('Success', 'Asset assigned to branch successfully')
      setIsAssignModalOpen(false)
    },
    onError: (error) => {
      notifyError('Failed to assign asset', error)
    },
  })

  const removeAssignmentMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/replenishments/${id}/remove-assignment`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishments'] })
      notifySuccess('Success', 'Assignment removed successfully')
      setIsAssignModalOpen(false)
    },
    onError: (error) => {
      notifyError('Failed to remove assignment', error)
    },
  })

  const createVendorMutation = useMutation({
    mutationFn: (data) => apiClient.post('/vendors', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setIsVendorModalOpen(false)
      setVendorFormData({
        company_name: '',
        contact_no: '',
        address: '',
      })

      // Auto-select the newly created vendor
      if (response.data?.data?.id) {
        setFormData((prev) => ({ ...prev, vendor_id: response.data.data.id }))
      }

      notifySuccess('Success!', 'Vendor created successfully')
    },
    onError: (error) => {
      notifyError('Failed to create vendor', error)
    },
  })

  // Stable mutation refs — allow useCallbacks to have empty deps while always calling latest mutate
  const createMutateRef = useRef(createMutation.mutate)
  createMutateRef.current = createMutation.mutate
  const updateMutateRef = useRef(updateMutation.mutate)
  updateMutateRef.current = updateMutation.mutate
  const deleteMutateRef = useRef(deleteMutation.mutate)
  deleteMutateRef.current = deleteMutation.mutate
  const assignEmployeeMutateRef = useRef(assignEmployeeMutation.mutate)
  assignEmployeeMutateRef.current = assignEmployeeMutation.mutate
  const assignBranchMutateRef = useRef(assignBranchMutation.mutate)
  assignBranchMutateRef.current = assignBranchMutation.mutate
  const removeAssignmentMutateRef = useRef(removeAssignmentMutation.mutate)
  removeAssignmentMutateRef.current = removeAssignmentMutation.mutate
  const createVendorMutateRef = useRef(createVendorMutation.mutate)
  createVendorMutateRef.current = createVendorMutation.mutate

  // Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      if (name === 'asset_category_id') {
        newData.subcategory_id = ''
      }
      return newData
    })
  }, [])

  const handleVendorChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, vendor_id: value }))
  }, [])

  const generateSerialNumber = useCallback(() => {
    // Get selected category
    const selectedCategory = categories?.find(cat => cat.id == formData.asset_category_id)

    if (!selectedCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Category First',
        text: 'Please select an asset category before generating a serial number',
      })
      return
    }

    // Generate unique serial number
    const categoryCode = selectedCategory?.code || selectedCategory?.name?.substring(0, 3).toUpperCase() || 'RPL'
    const serialNumber = buildSerialNumber(categoryCode)

    setFormData(prev => ({ ...prev, serial_number: serialNumber }))

    Swal.fire({
      icon: 'success',
      title: 'Serial Number Generated',
      text: serialNumber,
      timer: 2000,
    })
  }, [formData.asset_category_id, categories])

  const openVendorModal = useCallback(() => {
    setVendorFormData({
      company_name: '',
      contact_no: '',
      address: '',
    })
    setIsVendorModalOpen(true)
  }, [])

  const handleVendorInputChange = useCallback((e) => {
    const { name, value } = e.target
    setVendorFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleCreateVendor = useCallback((e) => {
    e.preventDefault()
    createVendorMutateRef.current(vendorFormData)
  }, [vendorFormData])

  // Component handlers for Desktop PC
  const handleComponentAdd = useCallback(() => {
    const newComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category_id: '',
      subcategory_id: '',
      component_name: '',
      brand: '',
      model: '',
      serial_number: '',
      specifications: {},
      status_id: '',
      remarks: '',
    }
    setComponents((prev) => [...prev, newComponent])
  }, [])

  const handleComponentRemove = useCallback((componentId) => {
    setComponents((prev) => prev.filter((c) => c.id !== componentId))
  }, [])

  const handleComponentChange = useCallback((componentId, field, value) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, [field]: value } : c))
    )
  }, [])

  const generateComponentSerial = useCallback((componentId) => {
    const component = components.find((c) => c.id === componentId)
    if (!component) return

    const selectedCategory = categories?.find(
      (cat) => cat.id == component.category_id
    )

    if (!selectedCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Category First',
        text: 'Please select a category for this component before generating a serial number',
      })
      return
    }

    const categoryCode =
      selectedCategory?.code ||
      selectedCategory?.name?.substring(0, 3).toUpperCase() ||
      'CMP'
    const serialNumber = buildSerialNumber(categoryCode)

    setComponents((prev) =>
      prev.map((c) =>
        c.id === componentId ? { ...c, serial_number: serialNumber } : c
      )
    )

    Swal.fire({
      icon: 'success',
      title: 'Serial Number Generated',
      text: serialNumber,
      timer: 2000,
    })
  }, [categories, components])

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setComponents([])
    setIsAddModalOpen(true)
  }, [])

  const openEditModal = useCallback((replenishment) => {
    setSelectedReplenishment(replenishment)
    setFormData(buildFormData(replenishment))
    setIsEditModalOpen(true)
  }, [])

  const openAssignModal = useCallback((replenishment) => {
    setSelectedReplenishment(replenishment)
    setIsAssignModalOpen(true)
  }, [])

  const handleCreate = useCallback(
    (e) => {
      e.preventDefault()
      const payload = {
        ...formData,
        asset_category_id: formData.asset_category_id ? Number(formData.asset_category_id) : null,
        subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
        vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        estimate_life: formData.estimate_life ? Number(formData.estimate_life) : null,
      }
      createMutateRef.current(payload)
    },
    [formData]
  )

  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault()
      updateMutateRef.current({
        id: selectedReplenishment.id,
        data: {
          ...formData,
          asset_category_id: formData.asset_category_id ? Number(formData.asset_category_id) : null,
          subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
          vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
          status_id: formData.status_id ? Number(formData.status_id) : null,
          estimate_life: formData.estimate_life ? Number(formData.estimate_life) : null,
        },
      })
    },
    [formData, selectedReplenishment]
  )

  const handleDelete = useCallback(async (replenishment) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete reserve asset "${replenishment.asset_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })
    if (result.isConfirmed) {
      deleteMutateRef.current(replenishment.id)
    }
  }, [])

  const handleAssignEmployee = useCallback((id, employeeId) => {
    assignEmployeeMutateRef.current({ id, employeeId })
  }, [])

  const handleAssignBranch = useCallback((id, branchId) => {
    assignBranchMutateRef.current({ id, branchId })
  }, [])

  const handleRemoveAssignment = useCallback((id) => {
    removeAssignmentMutateRef.current(id)
  }, [])

  // Table columns
  const columns = useMemo(
    () =>
      getReplenishmentColumns({
        statusColorMap,
        openEditModal,
        openAssignModal,
        handleDelete,
        emptyValue: EMPTY_VALUE,
        currencyPrefix: CURRENCY_PREFIX,
      }),
    [statusColorMap, openEditModal, openAssignModal, handleDelete]
  )

  const replenishmentsList = Array.isArray(replenishmentsData?.data) ? replenishmentsData.data : []

  const hasActiveFilters = Object.values(filters).some((v) => v)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Replenishment</h1>
            <p className="text-sm text-slate-500">Manage reserve/spare assets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Reserve Asset</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                name="status_id"
                value={filters.status_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Branch</label>
              <select
                name="branch_id"
                value={filters.branch_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vendor</label>
              <select
                name="vendor_id"
                value={filters.vendor_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Vendors</option>
                {vendorOptions.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assignment</label>
              <select
                name="assignment_status"
                value={filters.assignment_status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data Table — same pattern as StatusPage/SubcategoryPage */}
      {isError ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-red-600 font-semibold mb-2">Failed to load replenishments</div>
          <div className="text-sm text-slate-500 mb-4">
            {error?.response?.data?.message || error?.message || 'An error occurred'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            Try again
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={replenishmentsList}
          loading={isLoading}
          pageSize={10}
        />
      )}

      {/* Add Modal — only mounted when open */}
      {isAddModalOpen && (
        <ReplenishmentFormModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Reserve Asset"
          onSubmit={handleCreate}
          submitLabel={createMutation.isPending ? 'Creating...' : 'Create Asset'}
          isSubmitting={createMutation.isPending}
          formData={formData}
          onInputChange={handleInputChange}
          onVendorChange={handleVendorChange}
          onGenerateSerial={generateSerialNumber}
          onGenerateComponentSerial={generateComponentSerial}
          onAddVendor={openVendorModal}
          categories={categories}
          subcategories={subcategories || []}
          vendorOptions={vendorOptions}
          statusOptions={statusOptions}
          equipmentOptions={equipmentOptions}
          components={components}
          onComponentAdd={handleComponentAdd}
          onComponentRemove={handleComponentRemove}
          onComponentChange={handleComponentChange}
          isEditMode={false}
        />
      )}

      {/* Edit Modal — only mounted when open */}
      {isEditModalOpen && (
        <ReplenishmentFormModal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Reserve Asset"
          onSubmit={handleUpdate}
          submitLabel={updateMutation.isPending ? 'Updating...' : 'Update Asset'}
          isSubmitting={updateMutation.isPending}
          formData={formData}
          onInputChange={handleInputChange}
          onVendorChange={handleVendorChange}
          onGenerateSerial={generateSerialNumber}
          onGenerateComponentSerial={generateComponentSerial}
          onAddVendor={openVendorModal}
          categories={categories}
          subcategories={subcategories || []}
          vendorOptions={vendorOptions}
          statusOptions={statusOptions}
          equipmentOptions={equipmentOptions}
          components={components}
          onComponentAdd={handleComponentAdd}
          onComponentRemove={handleComponentRemove}
          onComponentChange={handleComponentChange}
          isEditMode={true}
          showBookValue={true}
        />
      )}

      {/* Assign Modal — only mounted when open */}
      {isAssignModalOpen && (
        <AssignModal
          isOpen={true}
          onClose={() => setIsAssignModalOpen(false)}
          replenishment={selectedReplenishment}
          employeeOptions={employeeOptions}
          onAssignEmployee={handleAssignEmployee}
          onRemoveAssignment={handleRemoveAssignment}
          isAssigning={
            assignEmployeeMutation.isPending ||
            removeAssignmentMutation.isPending
          }
        />
      )}

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title="Add New Vendor"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={vendorFormData.company_name}
              onChange={handleVendorInputChange}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Number
            </label>
            <input
              type="text"
              name="contact_no"
              value={vendorFormData.contact_no}
              onChange={handleVendorInputChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={vendorFormData.address}
              onChange={handleVendorInputChange}
              rows="3"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter address"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsVendorModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createVendorMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ReplenishmentPage
