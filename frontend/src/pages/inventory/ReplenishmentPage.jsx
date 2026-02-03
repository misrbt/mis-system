import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw,
  Search,
  Plus,
  Filter,
  X,
  Package2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Building2,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import apiClient from '../../services/apiClient'
import { getReplenishmentColumns } from './replenishment/replenishmentColumns'
import ReplenishmentFormModal from './replenishment/ReplenishmentFormModal'
import AssignModal from './replenishment/AssignModal'
import Swal from 'sweetalert2'

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
  purchase_date: '',
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
  purchase_date: formatDateForInput(replenishment.purchase_date),
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

  // State management
  const [selectedRows, setSelectedRows] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedReplenishment, setSelectedReplenishment] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  // Fetch replenishments - disabled by default to prevent freeze if DB not ready
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
    enabled: true, // Allow it to try once
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })

  // Fetch filter options
  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: subcategories } = useQuery({
    queryKey: ['asset-subcategories', formData.asset_category_id],
    queryFn: async () => {
      if (!formData.asset_category_id) return []
      const response = await apiClient.get(`/asset-categories/${formData.asset_category_id}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: !!formData.asset_category_id,
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
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return normalizeArrayResponse(response.data)
    },
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
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

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
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
      }
      createMutation.mutate(payload)
    },
    [createMutation, formData]
  )

  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault()
      updateMutation.mutate({
        id: selectedReplenishment.id,
        data: {
          ...formData,
          asset_category_id: formData.asset_category_id ? Number(formData.asset_category_id) : null,
          subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
          vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
          status_id: formData.status_id ? Number(formData.status_id) : null,
        },
      })
    },
    [formData, selectedReplenishment, updateMutation]
  )

  const handleDelete = useCallback(
    async (replenishment) => {
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
        deleteMutation.mutate(replenishment.id)
      }
    },
    [deleteMutation]
  )

  const handleAssignEmployee = useCallback(
    (id, employeeId) => {
      assignEmployeeMutation.mutate({ id, employeeId })
    },
    [assignEmployeeMutation]
  )

  const handleAssignBranch = useCallback(
    (id, branchId) => {
      assignBranchMutation.mutate({ id, branchId })
    },
    [assignBranchMutation]
  )

  const handleRemoveAssignment = useCallback(
    (id) => {
      removeAssignmentMutation.mutate(id)
    },
    [removeAssignmentMutation]
  )

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

  // Table instance
  const table = useReactTable({
    data: replenishmentsList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection: selectedRows,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setSelectedRows,
    enableRowSelection: true,
  })

  const filteredCount = globalFilter
    ? table.getFilteredRowModel().rows.length
    : replenishmentsList.length

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

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
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
                      <span className="ml-2 text-slate-600">Loading reserve assets...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="text-red-600 font-semibold">Failed to load replenishments</div>
                      <div className="text-sm text-slate-500">
                        {error?.response?.data?.message || error?.message || 'Database table may not exist yet'}
                      </div>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                      >
                        Try again
                      </button>
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> The replenishments table may not be created yet. 
                          You can still add reserve assets using the "Add Reserve Asset" button above, 
                          but they won't be saved until the database is set up.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                    No reserve assets found. Try adjusting your filters or add a new one.
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
                      <td key={cell.id} className="px-4 py-3 text-sm">
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
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                Showing{' '}
                <span className="font-semibold">
                  {filteredCount === 0
                    ? 0
                    : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>
                -
                <span className="font-semibold">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredCount
                  )}
                </span>{' '}
                of <span className="font-semibold">{filteredCount}</span> assets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-700 px-2">
                  Page{' '}
                  <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                  <span className="font-semibold">{table.getPageCount()}</span>
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <ReplenishmentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Reserve Asset"
        onSubmit={handleCreate}
        submitLabel={createMutation.isPending ? 'Creating...' : 'Create Asset'}
        isSubmitting={createMutation.isPending}
        formData={formData}
        onInputChange={handleInputChange}
        onVendorChange={handleVendorChange}
        categories={categories}
        subcategories={subcategories || []}
        vendorOptions={vendorOptions}
        statusOptions={statusOptions}
        isEditMode={false}
      />

      {/* Edit Modal */}
      <ReplenishmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Reserve Asset"
        onSubmit={handleUpdate}
        submitLabel={updateMutation.isPending ? 'Updating...' : 'Update Asset'}
        isSubmitting={updateMutation.isPending}
        formData={formData}
        onInputChange={handleInputChange}
        onVendorChange={handleVendorChange}
        categories={categories}
        subcategories={subcategories || []}
        vendorOptions={vendorOptions}
        statusOptions={statusOptions}
        isEditMode={true}
      />

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        replenishment={selectedReplenishment}
        employeeOptions={employeeOptions}
        branchOptions={branchOptions}
        onAssignEmployee={handleAssignEmployee}
        onAssignBranch={handleAssignBranch}
        onRemoveAssignment={handleRemoveAssignment}
        isAssigning={
          assignEmployeeMutation.isPending ||
          assignBranchMutation.isPending ||
          removeAssignmentMutation.isPending
        }
      />
    </div>
  )
}

export default ReplenishmentPage
