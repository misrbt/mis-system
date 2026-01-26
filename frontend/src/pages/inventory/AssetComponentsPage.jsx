import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import { buildSerialNumber } from '../../utils/assetSerial'
import AssetComponentsHeader from './asset-components/AssetComponentsHeader'
import AssetComponentsAddModal from './asset-components/AssetComponentsAddModal'
import AssetComponentsTransferModal from './asset-components/AssetComponentsTransferModal'
import AssetComponentsCodeModal from './asset-components/AssetComponentsCodeModal'
import AssetComponentsGrid from './asset-components/AssetComponentsGrid'

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

  const editingCategoryId = editingComponent?.category_id

  // Fetch subcategories for edit mode (based on selected category)
  const { data: editSubcategoriesData, isLoading: isLoadingEditSubcategories } = useQuery({
    queryKey: ['component-subcategories', editingCategoryId],
    queryFn: async () => {
      const response = await apiClient.get(`/asset-categories/${editingCategoryId}/subcategories`)
      return response.data
    },
    enabled: !!editingCategoryId && !!editingComponent,
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

  // Fetch equipment list for brand/model dropdowns
  const { data: equipmentData } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await apiClient.get('/equipment')
      return response.data
    },
  })

  const statuses = statusesData || []
  const categories = categoriesData?.data || []
  const subcategories = subcategoriesData?.data || []
  const editSubcategories = editSubcategoriesData?.data || []
  const vendors = vendorsData?.data || []
  const components = componentsData || []
  const equipment = useMemo(
    () => equipmentData?.data || equipmentData || [],
    [equipmentData]
  )

  const equipmentOptions = useMemo(
    () =>
      (Array.isArray(equipment) ? equipment : []).map((eq) => ({
        id: eq.id,
        name: `${eq.brand || ''} ${eq.model || ''}`.trim(),
        brand: eq.brand,
        model: eq.model,
        asset_category_id: eq.asset_category_id,
        subcategory_id: eq.subcategory_id,
        category_name: eq.category?.name,
        subcategory_name: eq.subcategory?.name,
      })),
    [equipment]
  )

  const buildCategoryLabel = (eq) =>
    [eq.category_name, eq.subcategory_name].filter(Boolean).join(' / ')

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
    const normalizedSpecs = { ...(addFormData.specifications || {}) }
    if (normalizedSpecs.speed !== undefined && normalizedSpecs.speed !== null && normalizedSpecs.speed !== '') {
      const speedNum = Number(normalizedSpecs.speed)
      normalizedSpecs.speed = Number.isNaN(speedNum) ? normalizedSpecs.speed : Math.round(speedNum)
    }
    addComponentMutation.mutate({
      ...addFormData,
      specifications: normalizedSpecs,
    })
  }

  const handleGenerateSerial = () => {
    const serial = buildSerialNumber('COMP')
    setAddFormData((prev) => ({ ...prev, serial_number: serial }))
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return ''
    return categories.find((cat) => cat.id == categoryId)?.name || ''
  }

  const getSubcategoryName = (subcategoryId, list = subcategories) => {
    if (!subcategoryId) return ''
    return list.find((sub) => sub.id == subcategoryId)?.name || ''
  }

  const buildSpecSummary = (categoryName, specs) => {
    if (!specs || typeof specs !== 'object') return ''

    const name = categoryName?.toLowerCase() || ''
    const parts = []

    const addPart = (value) => {
      if (value === undefined || value === null || value === '') return
      parts.push(String(value).trim())
    }

    if (name.includes('laptop')) {
      addPart(specs.processor)
      if (specs.ram) addPart(`${specs.ram}${specs.ram_unit || 'GB'} RAM`)
      if (specs.storage_capacity) {
        const storageLabel = specs.storage_type ? `${specs.storage_type}` : 'Storage'
        addPart(`${specs.storage_capacity}${specs.storage_unit || 'GB'} ${storageLabel}`)
      }
      addPart(specs.screen_size ? `${specs.screen_size}"` : '')
    } else if (name.includes('memory') || name.includes('ram')) {
      const capacityValue = specs.capacity ? `${specs.capacity}${specs.capacity_unit || 'GB'}` : ''
      const speedValue = specs.speed ? `${specs.speed}MHz` : ''
      const ramParts = [capacityValue, specs.memory_type, speedValue, 'RAM'].filter(Boolean)
      addPart(ramParts.join(' '))
    } else if (name.includes('storage') || name.includes('hdd') || name.includes('ssd')) {
      if (specs.capacity) addPart(`${specs.capacity}${specs.capacity_unit || 'GB'} Storage`)
      addPart(specs.interface)
      addPart(specs.form_factor)
    } else if (name.includes('monitor') || name.includes('display')) {
      addPart(specs.screen_size ? `${specs.screen_size}"` : '')
      addPart(specs.resolution)
      addPart(specs.refresh_rate ? `${specs.refresh_rate}Hz` : '')
    } else {
      if (specs.ram) addPart(`${specs.ram}${specs.ram_unit || 'GB'} RAM`)
      if (specs.capacity) addPart(`${specs.capacity}${specs.capacity_unit || ''}`.trim())
    }

    return parts.filter(Boolean).join(' / ')
  }

  const buildComponentName = (data, subcategoryList = subcategories) => {
    const categoryName = getCategoryName(data.category_id)
    const subcategoryName = getSubcategoryName(data.subcategory_id, subcategoryList)
    const baseParts = [categoryName, subcategoryName, data.brand]
      .map((part) => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean)

    const specSummary = buildSpecSummary(categoryName, data.specifications)
    const baseName = baseParts.join(' ').trim()

    if (specSummary) {
      return baseName ? `${baseName} (${specSummary})` : specSummary
    }

    return baseName
  }

  const updateAddFormField = (field, value) => {
    setAddFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'category_id') {
        next.subcategory_id = ''
      }
      if (['category_id', 'subcategory_id', 'brand', 'model', 'specifications'].includes(field)) {
        const generatedName = buildComponentName(next, subcategories)
        if (generatedName) {
          next.component_name = generatedName
        }
      }
      return next
    })
  }

  const updateEditField = (field, value) => {
    setEditingComponent((prev) => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      if (field === 'category_id') {
        next.subcategory_id = ''
      }
      if (['category_id', 'subcategory_id', 'brand', 'model', 'specifications'].includes(field)) {
        const generatedName = buildComponentName(next, editSubcategories)
        if (generatedName) {
          next.component_name = generatedName
        }
      }
      return next
    })
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

    const normalizedSpecs = { ...(editData.specifications || {}) }
    if (normalizedSpecs.speed !== undefined && normalizedSpecs.speed !== null && normalizedSpecs.speed !== '') {
      const speedNum = Number(normalizedSpecs.speed)
      normalizedSpecs.speed = Number.isNaN(speedNum) ? normalizedSpecs.speed : Math.round(speedNum)
    }

    const sanitizedData = {
      category_id: category_id,
      subcategory_id: editData.subcategory_id ? Number(editData.subcategory_id) : null,
      component_name: editData.component_name.trim(),
      brand: editData.brand?.trim() || null,
      model: editData.model?.trim() || null,
      serial_number: editData.serial_number?.trim() || null,
      remarks: editData.remarks?.trim() || null,
      status_id: status_id,
      specifications: normalizedSpecs,
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
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/inventory/assets'))}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    )
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(`/inventory/assets/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <AssetComponentsHeader
        asset={asset}
        components={components}
        onBack={handleBack}
        onAdd={() => setShowAddModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AssetComponentsGrid
          components={components}
          editingComponent={editingComponent}
          isLoadingCategories={isLoadingCategories}
          categoriesError={categoriesError}
          categories={categories}
          editSubcategories={editSubcategories}
          isLoadingEditSubcategories={isLoadingEditSubcategories}
          equipmentOptions={equipmentOptions}
          buildCategoryLabel={buildCategoryLabel}
          statuses={statuses}
          updateEditField={updateEditField}
          setEditingComponent={setEditingComponent}
          handleEditSave={handleEditSave}
          handleDelete={handleDelete}
          setShowTransferModal={setShowTransferModal}
          setShowCodeModal={setShowCodeModal}
          getStatusColor={getStatusColor}
          getCategoryName={getCategoryName}
          getSubcategoryName={getSubcategoryName}
          onAdd={() => setShowAddModal(true)}
        />
      </div>

      <AssetComponentsAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddComponent}
        addFormData={addFormData}
        updateAddFormField={updateAddFormField}
        setAddFormData={setAddFormData}
        handleGenerateSerial={handleGenerateSerial}
        categories={categories}
        subcategories={subcategories}
        equipmentOptions={equipmentOptions}
        buildCategoryLabel={buildCategoryLabel}
        statuses={statuses}
        vendors={vendors}
        addComponentMutation={addComponentMutation}
      />

      <AssetComponentsTransferModal
        isOpen={!!showTransferModal}
        component={showTransferModal}
        employeeSearch={employeeSearch}
        onEmployeeSearchChange={setEmployeeSearch}
        filteredEmployees={filteredEmployees}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={setSelectedEmployeeId}
        onSubmit={handleSubmitTransfer}
        isSubmitting={transferComponentMutation.isPending}
        onClose={closeTransferModal}
      />

      <AssetComponentsCodeModal
        showCodeModal={showCodeModal}
        onClose={() => setShowCodeModal(null)}
        onDownload={(payload) => {
          if (payload.type === 'qr') {
            handleDownloadQR(payload.component)
          } else {
            handleDownloadBarcode(payload.component)
          }
        }}
      />
    </div>
  )
}

export default AssetComponentsPage
