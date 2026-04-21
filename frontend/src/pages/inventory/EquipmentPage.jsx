import { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Monitor, Cpu, FileText, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import SpecificationFields from '../../components/specifications/SpecificationFields'
import equipmentService from '../../services/equipmentService'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function EquipmentPage() {
  const queryClient = useQueryClient()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    brand_id: '',
    equipment_model_id: '',
    description: '',
    asset_category_id: '',
    subcategory_id: '',
    specifications: {},
  })
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const searchTimeout = useRef(null)

  const { data: equipmentList = [], isLoading: loading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await equipmentService.getAll()
      return response.data.success ? response.data.data : []
    },
  })

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await apiClient.get('/brands')
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch models for selected brand
  const { data: brandModels = [] } = useQuery({
    queryKey: ['brand-models', formData.brand_id],
    queryFn: async () => {
      const response = await apiClient.get(`/brands/${formData.brand_id}/models`)
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    enabled: !!formData.brand_id,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: subcategories = [] } = useQuery({
    queryKey: ['asset-subcategories', formData.asset_category_id],
    queryFn: async () => {
      const response = await apiClient.get(`/asset-categories/${formData.asset_category_id}/subcategories`)
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    enabled: !!formData.asset_category_id,
    staleTime: 5 * 60 * 1000,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      // Reset subcategory and specs when category changes
      if (name === 'asset_category_id') {
        next.subcategory_id = ''
        next.specifications = {}
      }
      // When brand dropdown changes, sync the text field and reset model
      if (name === 'brand_id') {
        const selected = brands.find((b) => String(b.id) === String(value))
        next.brand = selected?.name || ''
        next.equipment_model_id = ''
        next.model = ''
      }
      // When model dropdown changes, sync the text field
      if (name === 'equipment_model_id') {
        const selected = brandModels.find((m) => String(m.id) === String(value))
        next.model = selected?.name || ''
      }
      return next
    })
  }

  const handleAddNewBrand = async () => {
    const { value: brandName } = await Swal.fire({
      title: 'Add New Brand',
      input: 'text',
      inputLabel: 'Brand Name',
      inputPlaceholder: 'e.g., Dell, HP, Lenovo',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value?.trim()) return 'Brand name is required'
      },
    })
    if (!brandName) return

    try {
      const response = await apiClient.post('/brands', { name: brandName.trim() })
      if (response.data.success) {
        await queryClient.invalidateQueries({ queryKey: ['brands'] })
        const newBrand = response.data.data
        setFormData((prev) => ({
          ...prev,
          brand_id: newBrand.id,
          brand: newBrand.name,
          equipment_model_id: '',
          model: '',
        }))
        Swal.fire({ icon: 'success', title: 'Brand added', timer: 1500, showConfirmButton: false })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add brand',
      })
    }
  }

  const handleAddNewModel = async () => {
    if (!formData.brand_id) {
      Swal.fire({ icon: 'warning', title: 'Select a brand first' })
      return
    }
    const { value: modelName } = await Swal.fire({
      title: 'Add New Model',
      input: 'text',
      inputLabel: `Model name for ${formData.brand}`,
      inputPlaceholder: 'e.g., Latitude 5420',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value?.trim()) return 'Model name is required'
      },
    })
    if (!modelName) return

    try {
      const response = await apiClient.post(`/brands/${formData.brand_id}/models`, { name: modelName.trim() })
      if (response.data.success) {
        await queryClient.invalidateQueries({ queryKey: ['brand-models', formData.brand_id] })
        const newModel = response.data.data
        setFormData((prev) => ({
          ...prev,
          equipment_model_id: newModel.id,
          model: newModel.name,
        }))
        Swal.fire({ icon: 'success', title: 'Model added', timer: 1500, showConfirmButton: false })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add model',
      })
    }
  }

  const handleSpecificationsChange = (specs) => {
    setFormData((prev) => ({ ...prev, specifications: specs }))
  }

  const openAddModal = () => {
    setFormData({
      brand: '',
      model: '',
      brand_id: '',
      equipment_model_id: '',
      description: '',
      asset_category_id: '',
      subcategory_id: '',
      specifications: {},
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((equipment) => {
    setSelectedEquipment(equipment)
    setFormData({
      brand: equipment.brand || '',
      model: equipment.model || '',
      brand_id: equipment.brand_id || '',
      equipment_model_id: equipment.equipment_model_id || '',
      description: equipment.description || '',
      asset_category_id: equipment.asset_category_id || '',
      subcategory_id: equipment.subcategory_id || '',
      specifications: equipment.specifications && typeof equipment.specifications === 'object'
        ? equipment.specifications
        : {},
    })
    setIsEditModalOpen(true)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await equipmentService.create(formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        queryClient.invalidateQueries({ queryKey: ['equipment'] })
        queryClient.invalidateQueries({ queryKey: ['brands'] })
        queryClient.invalidateQueries({ queryKey: ['brand-models'] })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create equipment',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await equipmentService.update(selectedEquipment.id, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsEditModalOpen(false)
        queryClient.invalidateQueries({ queryKey: ['equipment'] })
        queryClient.invalidateQueries({ queryKey: ['brands'] })
        queryClient.invalidateQueries({ queryKey: ['brand-models'] })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update equipment',
      })
    }
  }

  const handleDelete = useCallback(async (equipment) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete equipment "${equipment.brand} - ${equipment.model}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        const response = await equipmentService.delete(equipment.id)
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: response.data.message,
            timer: 2000,
          })
          queryClient.invalidateQueries({ queryKey: ['equipment'] })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete equipment',
        })
      }
    }
  }, [queryClient])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'brand',
        header: 'Brand',
        cell: (info) => (
          <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>
        ),
      },
      {
        accessorKey: 'model',
        header: 'Model',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => (
          <div className="text-sm text-slate-700 truncate max-w-xs">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue()?.name || 'N/A'}</div>
        ),
      },
      {
        accessorKey: 'subcategory',
        header: 'Subcategory',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue()?.name || 'N/A'}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
              title="Edit equipment"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Delete equipment"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleDelete, openEditModal]
  )

  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'brand', header: 'Brand' },
      { accessorKey: 'model', header: 'Model' },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'subcategory', header: 'Subcategory' },
    ],
    []
  )

  const mobileTable = useReactTable({
    data: equipmentList,
    columns: mobileColumns,
    state: {
      globalFilter: mobileGlobalFilter,
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
  const mobileFilteredCount = mobileGlobalFilter
    ? mobileTable.getFilteredRowModel().rows.length
    : equipmentList.length
  const mobileStart = mobileFilteredCount === 0 ? 0 : mobilePagination.pageIndex * mobilePagination.pageSize + 1
  const mobileEnd = Math.min((mobilePagination.pageIndex + 1) * mobilePagination.pageSize, mobileFilteredCount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipment</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage standardized equipment models and descriptions</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                clearTimeout(searchTimeout.current)
                searchTimeout.current = setTimeout(() => setMobileGlobalFilter(e.target.value), 300)
              }}
              placeholder="Search equipment..."
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
              <option value="brand">Brand</option>
              <option value="model">Model</option>
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

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Loading equipment...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No equipment found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const equipment = row.original
            return (
              <div key={equipment.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">{equipment.brand}</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-1">{equipment.model}</div>
                {equipment.description && (
                  <div className="text-xs text-slate-500 mb-3">{equipment.description}</div>
                )}
                {(equipment.category || equipment.subcategory) && (
                  <div className="text-xs text-slate-500 mb-3">
                    {[equipment.category?.name, equipment.subcategory?.name].filter(Boolean).join(' / ')}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => openEditModal(equipment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit equipment"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(equipment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete equipment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
         {/* Pagination Controls */}
         {!loading && mobileFilteredCount > 0 && (
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

      {/* Data Table */}
      <div className="hidden sm:block">
        <DataTable columns={columns} data={equipmentList} loading={loading} pageSize={10} />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Equipment"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              name="asset_category_id"
              value={formData.asset_category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {formData.asset_category_id && subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Monitor className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddNewBrand}
                className="px-3 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium whitespace-nowrap"
                title="Add new brand"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Cpu className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="equipment_model_id"
                  value={formData.equipment_model_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.brand_id}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.brand_id ? 'Select model' : 'Select brand first'}</option>
                  {brandModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddNewModel}
                disabled={!formData.brand_id}
                className="px-3 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add new model"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>

          {formData.asset_category_id && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Specifications</h4>
              <SpecificationFields
                categoryName={categories.find((c) => Number(c.id) === Number(formData.asset_category_id))?.name || ''}
                subcategoryName={subcategories.find((s) => Number(s.id) === Number(formData.subcategory_id))?.name || ''}
                specifications={formData.specifications || {}}
                onChange={handleSpecificationsChange}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Create Equipment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Equipment"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              name="asset_category_id"
              value={formData.asset_category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {formData.asset_category_id && subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Monitor className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddNewBrand}
                className="px-3 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium whitespace-nowrap"
                title="Add new brand"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Cpu className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="equipment_model_id"
                  value={formData.equipment_model_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.brand_id}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.brand_id ? 'Select model' : 'Select brand first'}</option>
                  {brandModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddNewModel}
                disabled={!formData.brand_id}
                className="px-3 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add new model"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>

          {formData.asset_category_id && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Specifications</h4>
              <SpecificationFields
                categoryName={categories.find((c) => Number(c.id) === Number(formData.asset_category_id))?.name || ''}
                subcategoryName={subcategories.find((s) => Number(s.id) === Number(formData.subcategory_id))?.name || ''}
                specifications={formData.specifications || {}}
                onChange={handleSpecificationsChange}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Update Equipment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default EquipmentPage
