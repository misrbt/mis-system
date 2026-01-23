import { Suspense, lazy, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  History,
  Edit,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import apiClient from '../../../services/apiClient'
import AssetFormModal from './AssetFormModal'
import { getAssetColumns } from './assetColumns'
import Modal from '../../../components/Modal'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../../utils/assetSerial'
import { formatCurrency, formatDate } from '../../../utils/assetFormatters'
import AssetsHeaderBar from './AssetsHeaderBar'
import AssetsFiltersPanel from './AssetsFiltersPanel'
import AssetsBulkActions from './AssetsBulkActions'
const AssetsPivotView = lazy(() => import('./AssetsPivotView'))

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

const EMPTY_VALUE = '—'
const CURRENCY_PREFIX = '₱'

const INITIAL_FILTERS = {
  branch_id: '',
  category_id: '',
  subcategory_id: '',
  status_id: '',
  vendor_id: '',
  purchase_date_from: '',
  purchase_date_to: '',
  search: '',
}

const INITIAL_PIVOT_CONFIG = {
  rowDimension: 'category',
  columnDimension: 'status',
  aggregation: 'count',
  showTotals: true,
}

const buildQueryParams = (filters, extra = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  return params.toString()
}

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

const buildFormData = (asset = {}) => ({
  asset_name: asset.asset_name || '',
  asset_category_id: asset.asset_category_id || '',
  subcategory_id: asset.subcategory_id || '',
  brand: asset.brand || asset.equipment?.brand || '',
  model: asset.model || asset.equipment?.model || '',
  book_value: asset.book_value || '',
  serial_number: asset.serial_number || '',
  purchase_date: formatDateForInput(asset.purchase_date),
  acq_cost: asset.acq_cost || '',
  waranty_expiration_date: formatDateForInput(asset.waranty_expiration_date),
  estimate_life: asset.estimate_life || '',
  vendor_id: asset.vendor_id || '',
  status_id: asset.status_id || '',
  remarks: asset.remarks || '',
  specifications: asset.specifications || {},
  assigned_to_employee_id: asset.assigned_to_employee_id || '',
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

function AssetsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // State management
  const [selectedRows, setSelectedRows] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const originalComponentIdsRef = useRef([])
  const [editingCell, setEditingCell] = useState(null)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches) {
      return 'cards'
    }
    return 'table'
  }) // 'table' | 'pivot' | 'cards'
  const [showFilters, setShowFilters] = useState(false)
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const isTableView = viewMode === 'table'
  const [vendorFormData, setVendorFormData] = useState({
    company_name: '',
    contact_no: '',
    address: '',
  })

  // Pivot configuration state
  const [pivotConfig, setPivotConfig] = useState(INITIAL_PIVOT_CONFIG)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const smallQuery = window.matchMedia('(max-width: 639px)')
    const largeQuery = window.matchMedia('(min-width: 640px)')
    const syncViewMode = () => {
      if (smallQuery.matches && viewMode !== 'cards') {
        setViewMode('cards')
      }
      if (largeQuery.matches && viewMode === 'cards') {
        setViewMode('table')
      }
    }

    syncViewMode()

    smallQuery.addEventListener('change', syncViewMode)
    largeQuery.addEventListener('change', syncViewMode)
    return () => {
      smallQuery.removeEventListener('change', syncViewMode)
      largeQuery.removeEventListener('change', syncViewMode)
    }
  }, [viewMode])

  // Filter state
  const [filters, setFilters] = useState(() => ({ ...INITIAL_FILTERS }))
  const deferredFilters = useDeferredValue(filters)
  const isFiltering = deferredFilters !== filters
  const [searchInput, setSearchInput] = useState(INITIAL_FILTERS.search)
  const deferredMobileGlobalFilter = useDeferredValue(mobileGlobalFilter)

  // Form state
  const [formData, setFormData] = useState(() => buildFormData())
  const [components, setComponents] = useState([])

  // Fetch assets with React Query
  const { data: assetsData, isLoading, refetch } = useQuery({
    queryKey: ['assets', deferredFilters],
    queryFn: async () => {
      const params = buildQueryParams(deferredFilters)
      const response = await apiClient.get(`/assets?${params}`)
      return response.data
    },
  })

  const { data: assetsTotalsData, isLoading: isLoadingTotals } = useQuery({
    queryKey: ['assets', 'totals', deferredFilters],
    queryFn: async () => {
      const params = buildQueryParams(deferredFilters)
      const response = await apiClient.get(`/assets/totals?${params}`)
      return response.data
    },
    enabled: isTableView,
  })

  // Fetch filter options
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: subcategories } = useQuery({
    queryKey: ['asset-subcategories', formData.asset_category_id],
    queryFn: async () => {
      if (!formData.asset_category_id) return []
      const response = await apiClient.get(`/asset-categories/${formData.asset_category_id}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: !!formData.asset_category_id,
  })

  // Fetch subcategories for filter (based on filter category selection)
  const { data: filterSubcategories } = useQuery({
    queryKey: ['filter-subcategories', filters.category_id],
    queryFn: async () => {
      if (!filters.category_id) return []
      const response = await apiClient.get(`/asset-categories/${filters.category_id}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: !!filters.category_id,
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return normalizeArrayResponse(response.data)
    },
  })

  // Fetch equipment list
  const { data: equipmentList } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await apiClient.get('/equipment')
      return normalizeArrayResponse(response.data)
    },
  })

  const employeeAcqTotals = useMemo(() => {
    const totals = {}
    const rows = assetsTotalsData?.data || []

    rows.forEach((row) => {
      const employeeKey = row.employee_id ?? 'unassigned'
      const value = parseFloat(row.total_acq_cost)
      if (!Number.isNaN(value)) {
        totals[employeeKey] = value
      }
    })

    return totals
  }, [assetsTotalsData])

  // Normalize data responses to ensure arrays
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
        contact: vendor.contact_person || vendor.email || vendor.phone,
      })),
    [vendors]
  )
  const employeeOptions = useMemo(
    () =>
      (Array.isArray(employees) ? employees : []).map((emp) => ({
        id: emp.id,
        name: emp.fullname,
        position: emp.position?.position_name,
        branch: emp.branch?.branch_name,
      })),
    [employees]
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

  const resolveEquipmentId = useCallback(
    (brand, model) => {
      const match = equipmentOptions.find(
        (eq) => eq.brand === brand && eq.model === model
      )
      return match?.id || null
    },
    [equipmentOptions]
  )



  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      if (formData.assigned_to_employee_id) {
        queryClient.invalidateQueries(['employeeAssets', formData.assigned_to_employee_id])
        queryClient.invalidateQueries(['employee', formData.assigned_to_employee_id])
      }
      notifySuccess('Success', 'Asset created successfully')
      setIsAddModalOpen(false)
      setComponents([]) // Reset components after successful creation
    },
    onError: (error) => {
      notifyError('Failed to create asset', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      notifySuccess('Success', 'Asset updated successfully')
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      notifyError('Failed to update asset', error)
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: ({ id, field, value }) =>
      apiClient.patch(`/assets/${id}/update-field`, { field, value }),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      setEditingCell(null)
    },
    onError: (error) => {
      notifyError('Failed to update field', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Asset deleted successfully',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      notifyError('Failed to delete asset', error)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => apiClient.post('/assets/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      setSelectedRows({})
      notifySuccess('Deleted!', 'Selected assets deleted successfully')
    },
    onError: (error) => {
      notifyError('Failed to delete assets', error)
    },
  })

  const createVendorMutation = useMutation({
    mutationFn: (data) => apiClient.post('/vendors', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['vendors'])
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

  // Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }

      // Clear subcategory when category changes
      if (name === 'asset_category_id') {
        newData.subcategory_id = ''
      }

      const categoryName = categories?.find(cat => cat.id == newData.asset_category_id)?.name || ''
      const subcategoryName = subcategories?.find(sub => sub.id == newData.subcategory_id)?.name || ''

      // Auto-generate asset name when relevant fields change
      if (['asset_category_id', 'subcategory_id', 'brand', 'model'].includes(name)) {
        // Build asset name from parts (filter out empty strings)
        const parts = [categoryName, subcategoryName, newData.brand, newData.model]
          .map(part => part?.trim())
          .filter(part => part)

        const generatedName = parts.join(' ')
        if (generatedName) {
          newData.asset_name = generatedName
        }
      }

      if (name === 'asset_category_id' && isAddModalOpen) {
        const lowerCategoryName = categoryName.toLowerCase()
        const isMonitorCategory = lowerCategoryName.includes('monitor') || lowerCategoryName.includes('display')
        const refreshRate = newData.specifications?.refresh_rate
        const hasRefreshRate = refreshRate !== undefined && refreshRate !== null && refreshRate !== ''

        if (isMonitorCategory && !hasRefreshRate) {
          newData.specifications = {
            ...(newData.specifications || {}),
            refresh_rate: 60,
          }
        }
      }

      return newData
    })
  }, [categories, isAddModalOpen, subcategories])

  const handleVendorChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, vendor_id: value }))
  }, [])

  const handleEmployeeChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, assigned_to_employee_id: value }))
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

    // Generate unique serial number format: CATEGORYCODE-YYYY-TIMESTAMP-RANDOM
    const categoryCode = selectedCategory?.code || selectedCategory?.name?.substring(0, 3).toUpperCase() || 'AST'
    const serialNumber = buildSerialNumber(categoryCode)

    setFormData(prev => ({ ...prev, serial_number: serialNumber }))

    Swal.fire({
      icon: 'success',
      title: 'Serial Number Generated',
      text: serialNumber,
      timer: 2000,
    })
  }, [formData.asset_category_id, categories])

  const generateComponentSerialNumber = useCallback((componentId) => {
    // Generate unique serial number for component using COMP prefix
    const serialNumber = buildSerialNumber('COMP')
    setComponents(prev => prev.map(c =>
      c.id === componentId ? { ...c, serial_number: serialNumber } : c
    ))
  }, [])

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setFilters((prev) => {
      // Clear subcategory when category changes
      if (name === 'category_id') {
        return { ...prev, [name]: value, subcategory_id: '' }
      }
      return { ...prev, [name]: value }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS })
    setSearchInput(INITIAL_FILTERS.search)
  }, [])

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => (
        prev.search === searchInput
          ? prev
          : { ...prev, search: searchInput }
      ))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput])

  const openAddModal = useCallback(() => {
    setFormData(buildFormData())
    setComponents([]) // Reset components for new asset
    setIsAddModalOpen(true)
  }, [])

  const openEditModal = useCallback((asset) => {
    setSelectedAsset(asset)
    setFormData(buildFormData(asset))
    setIsEditModalOpen(true)
  }, [])

  useEffect(() => {
    if (!isEditModalOpen || !selectedAsset) return

    const name = selectedAsset.category?.name?.toLowerCase() || ''
    const isDesktop = name.includes('desktop') || name.includes('pc')

    if (!isDesktop) {
      setComponents([])
      originalComponentIdsRef.current = []
      return
    }

    let isMounted = true
    const fetchComponents = async () => {
      try {
        const response = await apiClient.get(`/assets/${selectedAsset.id}/components`)
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : []
        if (!isMounted) return
        const normalized = data.map((component) => ({
          id: component.id,
          category_id: component.category_id || '',
          subcategory_id: component.subcategory_id || '',
          component_name: component.component_name || '',
          last_generated_name: component.component_name || '',
          brand: component.brand || '',
          model: component.model || '',
          serial_number: component.serial_number || '',
          status_id: component.status_id || component.status?.id || '',
          remarks: component.remarks || '',
          specifications: component.specifications || {},
          isNew: false,
        }))
        setComponents(normalized)
        originalComponentIdsRef.current = normalized.map((component) => component.id)
      } catch {
        if (!isMounted) return
        setComponents([])
        originalComponentIdsRef.current = []
      }
    }

    fetchComponents()

    return () => {
      isMounted = false
    }
  }, [isEditModalOpen, selectedAsset])

  // Component handlers for Desktop PC
  const handleComponentAdd = useCallback(() => {
    const defaultStatus =
      statusOptions.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('functional')
      )?.id ??
      statusOptions.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('working')
      )?.id ??
      statusOptions.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('functional')
      )?.value ??
      statusOptions.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('working')
      )?.value ??
      ''
    setComponents(prev => [...prev, {
      id: Date.now(),
      isNew: true,
      category_id: '',
      subcategory_id: '',
      component_name: '',
      last_generated_name: '',
      brand: '',
      model: '',
      specifications: {},
      serial_number: '',
      status_id: defaultStatus,
      acq_cost: '',
      remarks: '',
    }])
  }, [statusOptions])

  const saveDesktopComponentsForEdit = useCallback(async () => {
    if (!selectedAsset) return true

    const categoryName = categories?.find(cat => cat.id == formData.asset_category_id)?.name || ''
    const isDesktop =
      categoryName.toLowerCase().includes('desktop') ||
      categoryName.toLowerCase().includes('pc')

    if (!isDesktop) return true

    const existingComponents = components.filter((component) => !component.isNew)
    const newComponents = components.filter((component) => component.isNew)
    const removedIds = originalComponentIdsRef.current.filter(
      (id) => !existingComponents.some((component) => component.id === id)
    )

    try {
      if (removedIds.length) {
        await Promise.all(
          removedIds.map((id) => apiClient.delete(`/asset-components/${id}`))
        )
      }

      if (newComponents.length) {
        await Promise.all(
          newComponents.map((component) =>
            apiClient.post(`/assets/${selectedAsset.id}/components`, {
              components: [
                {
                  category_id: component.category_id ? Number(component.category_id) : null,
                  subcategory_id: component.subcategory_id ? Number(component.subcategory_id) : null,
                  component_name: component.component_name || '',
                  brand: component.brand || null,
                  model: component.model || null,
                  serial_number: component.serial_number || null,
                  remarks: component.remarks || null,
                  status_id: component.status_id ? Number(component.status_id) : null,
                  specifications: component.specifications || {},
                },
              ],
            })
          )
        )
      }

      if (existingComponents.length) {
        await Promise.all(
          existingComponents.map((component) =>
            apiClient.put(`/asset-components/${component.id}`, {
              category_id: component.category_id ? Number(component.category_id) : null,
              subcategory_id: component.subcategory_id ? Number(component.subcategory_id) : null,
              component_name: component.component_name || '',
              brand: component.brand || null,
              model: component.model || null,
              serial_number: component.serial_number || null,
              remarks: component.remarks || null,
              status_id: component.status_id ? Number(component.status_id) : null,
              specifications: component.specifications || {},
            })
          )
        )
      }

      return true
    } catch (error) {
      notifyError('Failed to update components', error)
      return false
    }
  }, [categories, components, formData.asset_category_id, selectedAsset])

  const handleComponentRemove = useCallback((id) => {
    setComponents(prev => prev.filter(c => c.id !== id))
  }, [])

  const handleComponentChange = useCallback((id, field, value) => {
    setComponents(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }, [])

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
    createVendorMutation.mutate(vendorFormData)
  }, [createVendorMutation, vendorFormData])
  const handleCreate = useCallback((e) => {
    e.preventDefault()
    const equipmentId = resolveEquipmentId(formData.brand, formData.model)
    const selectedCategory = categories?.find(cat => cat.id == formData.asset_category_id)
    const categoryCode = selectedCategory?.code || selectedCategory?.name?.substring(0, 3).toUpperCase() || 'AST'
    const serialNumber = formData.serial_number || buildSerialNumber(categoryCode)
    // Include components in payload if Desktop PC category
    const payload = {
      ...formData,
      serial_number: serialNumber,
      asset_category_id: formData.asset_category_id ? Number(formData.asset_category_id) : null,
      subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
      vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
      status_id: formData.status_id ? Number(formData.status_id) : null,
      assigned_to_employee_id: formData.assigned_to_employee_id ? Number(formData.assigned_to_employee_id) : null,
      equipment_id: equipmentId,
      components: components.filter(c => c.component_name.trim() !== '')
    }
    createMutation.mutate(payload)
  }, [createMutation, formData, components, resolveEquipmentId, categories])

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault()
    const ok = await saveDesktopComponentsForEdit()
    if (!ok) return
    const equipmentId = resolveEquipmentId(formData.brand, formData.model)
    updateMutation.mutate({
      id: selectedAsset.id,
      data: {
        ...formData,
        asset_category_id: formData.asset_category_id ? Number(formData.asset_category_id) : null,
        subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
        vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        assigned_to_employee_id: formData.assigned_to_employee_id ? Number(formData.assigned_to_employee_id) : null,
        equipment_id: equipmentId,
      },
    })
  }, [formData, selectedAsset, updateMutation, resolveEquipmentId, saveDesktopComponentsForEdit])

  const handleDelete = useCallback(
    async (asset) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete asset "${asset.asset_name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        deleteMutation.mutate(asset.id)
      }
    },
    [deleteMutation]
  )

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Object.keys(selectedRows).filter((key) => selectedRows[key])
    if (selectedIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one asset to delete',
      })
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete ${selectedIds.length} selected asset(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      bulkDeleteMutation.mutate(selectedIds)
    }
  }, [bulkDeleteMutation, selectedRows])

  const handleInlineEdit = useCallback(
    (rowId, columnId, value) => {
      updateFieldMutation.mutate({ id: rowId, field: columnId, value })
    },
    [updateFieldMutation]
  )

  // Table columns definition
  const columns = useMemo(() => {
    if (!isTableView) return []
    return getAssetColumns({
      editingCell,
      setEditingCell,
      employeeOptions,
      handleInlineEdit,
      employeeAcqTotals,
      isLoadingTotals,
      categories,
      statusOptions,
      statusColorMap,
      navigate,
      openEditModal,
      handleDelete,
      emptyValue: EMPTY_VALUE,
      currencyPrefix: CURRENCY_PREFIX,
    })
  }, [
    editingCell,
    employeeOptions,
    handleInlineEdit,
    employeeAcqTotals,
    isLoadingTotals,
    categories,
    statusOptions,
    statusColorMap,
    navigate,
    openEditModal,
    handleDelete,
    isTableView,
  ])
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'asset_name', header: 'Asset' },
      { accessorKey: 'serial_number', header: 'Serial' },
      {
        id: 'employee',
        header: 'Employee',
        accessorFn: (row) => row.assigned_employee?.fullname || row.assignedEmployee?.fullname || '',
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => row.category?.name || row.category?.category_name || '',
      },
      {
        id: 'vendor',
        header: 'Vendor',
        accessorFn: (row) => row.vendor?.company_name || '',
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => row.status?.name || '',
      },
      { accessorKey: 'purchase_date', header: 'Purchase Date' },
      { accessorKey: 'acq_cost', header: 'Acq Cost' },
      { accessorKey: 'book_value', header: 'Book Value' },
    ],
    []
  )

  const assetsList = Array.isArray(assetsData?.data) ? assetsData.data : []
  const isMobileView = viewMode === 'cards'

  // Table instance
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: isTableView ? assetsList : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection: selectedRows,
    },
    onRowSelectionChange: setSelectedRows,
    enableRowSelection: true,
  })

  const mobileTable = useReactTable({
    data: isMobileView ? assetsList : [],
    columns: mobileColumns,
    state: {
      globalFilter: deferredMobileGlobalFilter,
      sorting: mobileSorting,
    },
    onGlobalFilterChange: setMobileGlobalFilter,
    onSortingChange: setMobileSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })
  const mobileSortId = mobileSorting[0]?.id || ''
  const mobileSortDesc = mobileSorting[0]?.desc || false
  const mobilePagination = mobileTable.getState().pagination
  const mobileFilteredCount = deferredMobileGlobalFilter
    ? mobileTable.getFilteredRowModel().rows.length
    : assetsList.length
  const mobileStart = mobileFilteredCount === 0 ? 0 : mobilePagination.pageIndex * mobilePagination.pageSize + 1
  const mobileEnd = Math.min((mobilePagination.pageIndex + 1) * mobilePagination.pageSize, mobileFilteredCount)

  const selectedCount = Object.values(selectedRows).filter(Boolean).length
  const totalAssets = assetsList.length

  // Group assets by employee
  // Pivot table calculation
  const calculatePivotData = useCallback(() => {
    if (!assetsData?.data) return null

    const assets = assetsData.data
    const { rowDimension, columnDimension, aggregation } = pivotConfig

    // Get dimension values
    const getRowKey = (asset) => {
      switch (rowDimension) {
        case 'category':
          return asset.category?.category_name || 'Uncategorized'
        case 'status':
          return asset.status?.name || 'Unknown'
        case 'branch':
          return asset.assigned_employee?.branch?.branch_name || 'Unassigned'
        case 'vendor':
          return asset.vendor?.company_name || 'No Vendor'
        case 'employee':
          return asset.assigned_employee?.fullname || 'Unassigned'
        default:
          return 'Unknown'
      }
    }

    const getColumnKey = (asset) => {
      switch (columnDimension) {
        case 'category':
          return asset.category?.category_name || 'Uncategorized'
        case 'status':
          return asset.status?.name || 'Unknown'
        case 'branch':
          return asset.assigned_employee?.branch?.branch_name || 'Unassigned'
        case 'vendor':
          return asset.vendor?.company_name || 'No Vendor'
        case 'employee':
          return asset.assigned_employee?.fullname || 'Unassigned'
        default:
          return 'Unknown'
      }
    }

    // Build pivot structure
    const pivotData = {}
    const columnKeys = new Set()

    assets.forEach((asset) => {
      const rowKey = getRowKey(asset)
      const colKey = getColumnKey(asset)

      if (!pivotData[rowKey]) {
        pivotData[rowKey] = {}
      }
      if (!pivotData[rowKey][colKey]) {
        pivotData[rowKey][colKey] = []
      }

      pivotData[rowKey][colKey].push(asset)
      columnKeys.add(colKey)
    })

    // Calculate aggregated values
    const aggregatedData = {}
    Object.keys(pivotData).forEach((rowKey) => {
      aggregatedData[rowKey] = {}
      Object.keys(pivotData[rowKey]).forEach((colKey) => {
        const items = pivotData[rowKey][colKey]
        switch (aggregation) {
          case 'count':
            aggregatedData[rowKey][colKey] = items.length
            break
          case 'sum_book_value':
            aggregatedData[rowKey][colKey] = items.reduce(
              (sum, item) => sum + (parseFloat(item.book_value) || 0),
              0
            )
            break
          case 'sum_acq_cost':
            aggregatedData[rowKey][colKey] = items.reduce(
              (sum, item) => sum + (parseFloat(item.acq_cost) || 0),
              0
            )
            break
          case 'avg_book_value':
            aggregatedData[rowKey][colKey] =
              items.reduce((sum, item) => sum + (parseFloat(item.book_value) || 0), 0) /
              items.length
            break
          case 'avg_estimate_life':
            aggregatedData[rowKey][colKey] =
              items.reduce((sum, item) => sum + (parseFloat(item.estimate_life) || 0), 0) /
              items.length
            break
          default:
            aggregatedData[rowKey][colKey] = items.length
        }
      })
    })

    return {
      data: aggregatedData,
      rowKeys: Object.keys(pivotData).sort(),
      columnKeys: Array.from(columnKeys).sort(),
    }
  }, [assetsData, pivotConfig])

  const pivotData = useMemo(() => {
    if (viewMode !== 'pivot') return null
    return calculatePivotData()
  }, [calculatePivotData, viewMode])

  // Handle pivot config changes
  const handlePivotConfigChange = (field, value) => {
    setPivotConfig((prev) => ({ ...prev, [field]: value }))
  }

  // Export pivot to CSV
  const exportPivotToCSV = () => {
    if (!pivotData) return

    const { data, rowKeys, columnKeys } = pivotData
    let csv = `${pivotConfig.rowDimension},${columnKeys.join(',')}`

    if (pivotConfig.showTotals) {
      csv += ',Total'
    }
    csv += '\n'

    rowKeys.forEach((rowKey) => {
      let row = `"${rowKey}"`
      let rowTotal = 0

      columnKeys.forEach((colKey) => {
        const value = data[rowKey][colKey] || 0
        row += `,${value}`
        rowTotal += value
      })

      if (pivotConfig.showTotals) {
        row += `,${rowTotal}`
      }
      csv += row + '\n'
    })

    if (pivotConfig.showTotals) {
      let totalsRow = 'Total'
      let grandTotal = 0

      columnKeys.forEach((colKey) => {
        const colTotal = rowKeys.reduce((sum, rowKey) => sum + (data[rowKey][colKey] || 0), 0)
        totalsRow += `,${colTotal}`
        grandTotal += colTotal
      })

      totalsRow += `,${grandTotal}`
      csv += totalsRow + '\n'
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pivot-table-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Format pivot cell value
  const formatPivotValue = (value) => {
    if (value === undefined || value === null) return '—'

    switch (pivotConfig.aggregation) {
      case 'count':
        return value.toLocaleString()
      case 'sum_book_value':
      case 'sum_acq_cost':
      case 'avg_book_value':
        return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      case 'avg_estimate_life':
        return `${value.toFixed(1)} yrs`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <div className="space-y-6">
      <AssetsHeaderBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refetch}
        onAddAsset={openAddModal}
        onViewEmployees={() => navigate('/inventory/employee-list')}
      />

      <AssetsFiltersPanel
        showFilters={showFilters}
        viewMode={viewMode}
        isFiltering={isFiltering}
        onCloseFilters={() => setShowFilters(false)}
        onOpenFilters={() => setShowFilters(true)}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        filters={filters}
        onFilterChange={handleFilterChange}
        branches={branches}
        categories={categories}
        filterSubcategories={filterSubcategories}
        statusOptions={statusOptions}
        vendors={vendors}
        onClearFilters={clearFilters}
      />

      <AssetsBulkActions
        selectedCount={selectedCount}
        viewMode={viewMode}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedRows({})}
      />

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Mobile scroll hint */}
          <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 sm:hidden">
            <p className="text-xs text-blue-800 text-center">
              ← Swipe left/right to view all columns →
            </p>
          </div>
          <div className="overflow-x-auto -mx-px">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-slate-900'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-slate-600">Loading assets...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                      No assets found. Try adjusting your filters or add a new asset.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        row.getIsSelected() ? 'bg-blue-50' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && table.getRowModel().rows.length > 0 && (
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200">
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
                {/* Results info */}
                <div className="text-xs sm:text-sm text-slate-700 text-center xs:text-left">
                  <span className="hidden sm:inline">Showing </span>
                  <span className="font-semibold">
                    {totalAssets === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                  </span>
                  <span className="hidden xs:inline">-</span>
                  <span className="xs:hidden"> to </span>
                  <span className="font-semibold">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      totalAssets
                    )}
                  </span>
                  <span className="hidden xs:inline"> of </span>
                  <span className="xs:hidden"> / </span>
                  <span className="font-semibold">{totalAssets}</span>
                  <span className="hidden sm:inline"> assets</span>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden xs:inline">Previous</span>
                    <span className="xs:hidden">Prev</span>
                  </button>
                  <span className="text-xs sm:text-sm text-slate-700 px-1 sm:px-2 whitespace-nowrap">
                    <span className="hidden sm:inline">Page </span>
                    <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span>
                    <span className="hidden sm:inline"> of </span>
                    <span className="sm:hidden"> / </span>
                    <span className="font-semibold">{table.getPageCount()}</span>
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={mobileGlobalFilter ?? ''}
                onChange={(e) => setMobileGlobalFilter(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mobileSortId}
                onChange={(e) => {
                  const nextId = e.target.value
                  setMobileSorting(nextId ? [{ id: nextId, desc: false }] : [])
                }}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sort by</option>
                <option value="asset_name">Asset Name</option>
                <option value="serial_number">Serial</option>
                <option value="employee">Employee</option>
                <option value="category">Category</option>
                <option value="vendor">Vendor</option>
                <option value="status">Status</option>
                <option value="purchase_date">Purchase Date</option>
                <option value="acq_cost">Acq Cost</option>
                <option value="book_value">Book Value</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!mobileSortId) return
                  setMobileSorting([{ id: mobileSortId, desc: !mobileSortDesc }])
                }}
                disabled={!mobileSortId}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mobileSortDesc ? 'Z-A' : 'A-Z'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Loading assets...</span>
              </div>
            </div>
          ) : mobileFilteredCount === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
              No assets found. Try adjusting your filters or add a new asset.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {mobileTable.getRowModel().rows.map((row) => {
                const asset = row.original
                const assignedEmployeeId =
                  asset.assigned_to_employee_id ?? asset.assigned_employee?.id
                const hasEmployee = Boolean(assignedEmployeeId)
                const statusId = asset.status_id ?? asset.status?.id
                const statusColor = statusColorMap[statusId] || '#e2e8f0'
                const statusTextColor = statusColorMap[statusId] ? '#fff' : '#1e293b'
                const categoryLabel =
                  asset.category?.name || asset.category?.category_name || EMPTY_VALUE
                const brandModel = [asset.brand, asset.model].filter(Boolean).join(' ')
                const serialLabel = asset.serial_number || EMPTY_VALUE
                const purchaseLabel = asset.purchase_date ? formatDate(asset.purchase_date) : EMPTY_VALUE
                const vendorLabel = asset.vendor?.company_name || EMPTY_VALUE
                const acqCostLabel =
                  asset.acq_cost !== null && asset.acq_cost !== undefined && asset.acq_cost !== ''
                    ? formatCurrency(asset.acq_cost)
                    : EMPTY_VALUE
                const bookValueLabel =
                  asset.book_value !== null && asset.book_value !== undefined && asset.book_value !== ''
                    ? formatCurrency(asset.book_value)
                    : EMPTY_VALUE

                return (
                  <div key={asset.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {asset.asset_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {brandModel || EMPTY_VALUE}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                        style={{
                          backgroundColor: statusColor,
                          color: statusTextColor,
                          borderColor: statusColor,
                        }}
                      >
                        {asset.status?.name || 'Status'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500">Serial</div>
                        <div className="font-medium text-slate-700 truncate">{serialLabel}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Category</div>
                        <div className="font-medium text-slate-700 truncate">{categoryLabel}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Purchase</div>
                        <div className="font-medium text-slate-700">{purchaseLabel}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Vendor</div>
                        <div className="font-medium text-slate-700 truncate">{vendorLabel}</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500">Acq. Cost</div>
                        <div className="font-semibold text-blue-700">{acqCostLabel}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Book Value</div>
                        <div className="font-semibold text-green-700">{bookValueLabel}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (hasEmployee) {
                            navigate(`/inventory/employees/${assignedEmployeeId}/assets`)
                          } else {
                            Swal.fire({
                              icon: 'info',
                              title: 'Not Assigned',
                              text: 'This asset is not assigned to any employee',
                            })
                          }
                        }}
                        disabled={!hasEmployee}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                          hasEmployee
                            ? 'text-green-700 bg-green-50 hover:bg-green-100'
                            : 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                        title={hasEmployee ? "View employee's all assets" : 'Asset not assigned'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Employee</span>
                      </button>
                      <button
                        onClick={() => navigate(`/inventory/assets/${asset.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
                        title="View asset timeline & history"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => openEditModal(asset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        title="Edit asset"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(asset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && mobileFilteredCount > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 px-3 py-3 space-y-2">
              <div className="text-xs text-slate-600 text-center">
                Showing {mobileStart} to {mobileEnd} of {mobileFilteredCount} entries
              </div>
              <div className="flex items-center justify-between gap-2">
                <select
                  value={mobilePagination.pageSize}
                  onChange={(e) => mobileTable.setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[10, 20, 30, 40, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => mobileTable.setPageIndex(0)}
                    disabled={!mobileTable.getCanPreviousPage()}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => mobileTable.previousPage()}
                    disabled={!mobileTable.getCanPreviousPage()}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xs text-slate-700 px-1">
                    {mobilePagination.pageIndex + 1} of {mobileTable.getPageCount()}
                  </span>
                  <button
                    onClick={() => mobileTable.nextPage()}
                    disabled={!mobileTable.getCanNextPage()}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => mobileTable.setPageIndex(mobileTable.getPageCount() - 1)}
                    disabled={!mobileTable.getCanNextPage()}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Pivot View */}
      {viewMode === 'pivot' && (
        <Suspense
          fallback={(
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Loading pivot view...</span>
              </div>
            </div>
          )}
        >
          <AssetsPivotView
            isLoading={isLoading}
            pivotData={pivotData}
            pivotConfig={pivotConfig}
            onPivotConfigChange={handlePivotConfigChange}
            onExport={exportPivotToCSV}
            onRefresh={refetch}
            assetsCount={assetsData?.data?.length || 0}
            formatPivotValue={formatPivotValue}
          />
        </Suspense>
      )}

      {/* Add Modal - Part 1 */}
      <AssetFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Asset"
        onSubmit={handleCreate}
        submitLabel={createMutation.isPending ? 'Creating...' : 'Create Asset'}
        isSubmitting={createMutation.isPending}
        formData={formData}
        onInputChange={handleInputChange}
        onVendorChange={handleVendorChange}
        onEmployeeChange={handleEmployeeChange}
        onGenerateSerial={generateSerialNumber}
        onGenerateComponentSerial={generateComponentSerialNumber}
        onAddVendor={openVendorModal}
        categories={categories}
        subcategories={subcategories || []}
        vendorOptions={vendorOptions}
        employeeOptions={employeeOptions}
        statusOptions={statusOptions}
        assignmentTitle="Assignment & Remarks"
        assignmentSubtitle="Employee assignment and additional notes"
        usePlaceholders
        components={components}
        onComponentAdd={handleComponentAdd}
        onComponentRemove={handleComponentRemove}

        onComponentChange={handleComponentChange}
        equipmentOptions={equipmentOptions}
        isEditMode={false}
      />

      {/* Edit Modal - Similar to Add Modal */}
      <AssetFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Asset"
        onSubmit={handleUpdate}
        submitLabel={updateMutation.isPending ? 'Updating...' : 'Update Asset'}
        isSubmitting={updateMutation.isPending}
        formData={formData}
        onInputChange={handleInputChange}
        onVendorChange={handleVendorChange}
        onEmployeeChange={handleEmployeeChange}
        onAddVendor={openVendorModal}
        categories={categories}
        subcategories={subcategories || []}
        vendorOptions={vendorOptions}
        employeeOptions={employeeOptions}
        statusOptions={statusOptions}
        showStatus
        showBookValue
        assignmentTitle="Assignment & Status"

        assignmentSubtitle="Employee assignment and asset status"
        equipmentOptions={equipmentOptions}
        components={components}
        onComponentAdd={handleComponentAdd}
        onComponentRemove={handleComponentRemove}
        onComponentChange={handleComponentChange}
        onGenerateComponentSerial={generateComponentSerialNumber}
        isEditMode={true}
      />

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

export default AssetsPage
