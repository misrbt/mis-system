import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  Download,
  Upload,
  RefreshCw,
  Table2,
  BarChart3,
  Save,
  XCircle,
  User,
  Briefcase,
  Building2,
  Eye,
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
import Modal from '../../components/Modal'
import SearchableSelect from '../../components/SearchableSelect'
import Swal from 'sweetalert2'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

function AssetsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // State management
  const [selectedRows, setSelectedRows] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'pivot'
  const [showFilters, setShowFilters] = useState(false)

  // Pivot configuration state
  const [pivotConfig, setPivotConfig] = useState({
    rowDimension: 'category',
    columnDimension: 'status',
    aggregation: 'count',
    showTotals: true,
  })

  // Filter state
  const [filters, setFilters] = useState({
    branch_id: '',
    category_id: '',
    status_id: '',
    vendor_id: '',
    purchase_date_from: '',
    purchase_date_to: '',
    search: '',
  })

  // Form state
  const [formData, setFormData] = useState({
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

  // Fetch assets with React Query
  const { data: assetsData, isLoading, refetch } = useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await apiClient.get(`/assets?${params}`)
      return response.data
    },
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Asset created successfully',
        timer: 2000,
      })
      setIsAddModalOpen(false)
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create asset',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Asset updated successfully',
        timer: 2000,
      })
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update asset',
      })
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update field',
      })
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
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete asset',
      })
    },
  })

  const deleteEmployeeAssetsMutation = useMutation({
    mutationFn: (employeeId) => apiClient.delete(`/employees/${employeeId}/assets`),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['assets'])
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: data?.message || 'All assets for this employee were deleted',
        timer: 2000,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete assets for employee',
      })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => apiClient.post('/assets/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      setSelectedRows({})
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Selected assets deleted successfully',
        timer: 2000,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete assets',
      })
    },
  })

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      branch_id: '',
      category_id: '',
      status_id: '',
      vendor_id: '',
      purchase_date_from: '',
      purchase_date_to: '',
      search: '',
    })
  }

  const openAddModal = () => {
    setFormData({
      asset_name: '',
      asset_category_id: '',
      brand: '',
      model: '',
      book_value: '',
      serial_number: '',
      purchase_date: '',
      acq_cost: '',
      waranty_expiration_date: '',
      estimate_life: '',
      vendor_id: '',
      status_id: '',
      remarks: '',
      assigned_to_employee_id: '',
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((asset) => {
    setSelectedAsset(asset)
    setFormData({
      asset_name: asset.asset_name || '',
      asset_category_id: asset.asset_category_id || '',
      brand: asset.brand || '',
      model: asset.model || '',
      book_value: asset.book_value || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      acq_cost: asset.acq_cost || '',
      waranty_expiration_date: asset.waranty_expiration_date || '',
      estimate_life: asset.estimate_life || '',
      vendor_id: asset.vendor_id || '',
      status_id: asset.status_id || '',
      remarks: asset.remarks || '',
      assigned_to_employee_id: asset.assigned_to_employee_id || '',
    })
    setIsEditModalOpen(true)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    updateMutation.mutate({ id: selectedAsset.id, data: formData })
  }

  const handleDelete = useCallback(
    async (asset) => {
      const employeeName = asset.assigned_employee?.fullname
      const assignedEmployeeId = asset.assigned_to_employee_id
      const shouldDeleteAll = Boolean(assignedEmployeeId)

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: shouldDeleteAll
          ? `Delete all assets assigned to ${employeeName || 'this employee'}?`
          : `Delete asset "${asset.asset_name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        if (shouldDeleteAll) {
          deleteEmployeeAssetsMutation.mutate(assignedEmployeeId)
        } else {
          deleteMutation.mutate(asset.id)
        }
      }
    },
    [deleteMutation, deleteEmployeeAssetsMutation]
  )

  const handleBulkDelete = async () => {
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
  }

  const handleInlineEdit = (rowId, columnId, value) => {
    updateFieldMutation.mutate({ id: rowId, field: columnId, value })
  }

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'assigned_employee',
        header: 'Employee Info',
        cell: ({ row }) => {
          const employee = row.original.assigned_employee
          const isEditing = editingCell === `${row.id}-assigned_employee`
          const currentEmployeeId = row.original.assigned_to_employee_id || employee?.id || ''

          if (isEditing) {
            return (
              <div className="min-w-[220px]">
                <SearchableSelect
                  label="Assign to"
                  hideLabel
                  options={
                    employees?.map((emp) => ({
                      id: emp.id,
                      name: emp.fullname,
                      position: emp.position?.position_name,
                      branch: emp.branch?.branch_name,
                    })) || []
                  }
                  value={currentEmployeeId}
                  onChange={(value) => {
                    handleInlineEdit(row.original.id, 'assigned_to_employee_id', value)
                    setEditingCell(null)
                  }}
                  displayField="name"
                  secondaryField="position"
                  tertiaryField="branch"
                  placeholder="Select employee..."
                  emptyMessage="No employees found"
                />
              </div>
            )
          }

          if (!employee) {
            return (
              <div
                className="flex items-center gap-2 text-slate-400 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
                onDoubleClick={() => setEditingCell(`${row.id}-assigned_employee`)}
              >
                <User className="w-4 h-4" />
                <span className="text-xs italic">Unassigned</span>
              </div>
            )
          }
          return (
            <div
              className="flex flex-col gap-1.5 py-1 cursor-pointer hover:bg-slate-100 px-2 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-assigned_employee`)}
            >
              {/* Employee Name */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {employee.fullname}
                </span>
              </div>

              {/* Position */}
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-slate-600 truncate">
                  {employee.position?.title || 'No Position'}
                </span>
              </div>

              {/* Branch */}
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-slate-500 truncate">
                  {employee.branch?.branch_name || 'No Branch'}
                </span>
              </div>
            </div>
          )
        },
        size: 220,
      },
      {
        accessorKey: 'asset_name',
        header: 'Asset Name',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell === `${row.id}-asset_name`
          if (isEditing) {
            return (
              <input
                autoFocus
                type="text"
                defaultValue={getValue()}
                onBlur={(e) => handleInlineEdit(row.original.id, 'asset_name', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'asset_name', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          }
          return (
            <div
              className="text-sm text-slate-900 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-asset_name`)}
            >
              {getValue()}
            </div>
          )
        },
        size: 150,
      },
      {
        accessorKey: 'serial_number',
        header: 'Serial No.',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell === `${row.id}-serial_number`
          if (isEditing) {
            return (
              <input
                autoFocus
                type="text"
                defaultValue={getValue() || ''}
                onBlur={(e) =>
                  handleInlineEdit(row.original.id, 'serial_number', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'serial_number', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          }
          return (
            <div
              className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-serial_number`)}
            >
              {getValue() || '—'}
            </div>
          )
        },
        size: 130,
      },
      {
        accessorKey: 'purchase_date',
        header: 'Purchase Date',
        cell: ({ row }) => {
          const isEditing = editingCell === `${row.id}-purchase_date`
          const value = row.original.purchase_date

          if (isEditing) {
            return (
              <input
                autoFocus
                type="date"
                defaultValue={value || ''}
                onBlur={(e) => handleInlineEdit(row.original.id, 'purchase_date', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'purchase_date', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          }

          return (
            <div
              className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-purchase_date`)}
            >
              {value ? new Date(value).toLocaleDateString() : '—'}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const isEditing = editingCell === `${row.id}-category`
          const currentCategoryId = row.original.asset_category_id || row.original.category?.id || ''

          if (isEditing) {
            return (
              <select
                autoFocus
                defaultValue={currentCategoryId}
                onChange={(e) => handleInlineEdit(row.original.id, 'asset_category_id', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'asset_category_id', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name || cat.category_name}
                  </option>
                ))}
              </select>
            )
          }

          return (
            <div
              className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-category`)}
            >
              {row.original.category?.name || row.original.category?.category_name || '—'}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'acq_cost',
        header: 'Acq.cost',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell === `${row.id}-acq_cost`
          const value = getValue()

          if (isEditing) {
            return (
              <input
                autoFocus
                type="number"
                step="0.01"
                defaultValue={value || ''}
                onBlur={(e) => handleInlineEdit(row.original.id, 'acq_cost', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'acq_cost', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          }

          return (
            <div
              className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-acq_cost`)}
            >
              {value ? `₱${Number(value).toLocaleString()}` : '—'}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'estimate_life',
        header: 'Est. Life',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell === `${row.id}-estimate_life`
          const value = getValue()

          if (isEditing) {
            return (
              <input
                autoFocus
                type="number"
                step="1"
                min="0"
                defaultValue={value || ''}
                onBlur={(e) =>
                  handleInlineEdit(row.original.id, 'estimate_life', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'estimate_life', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          }

          return (
            <div
              className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
              onDoubleClick={() => setEditingCell(`${row.id}-estimate_life`)}
            >
              {value || '—'} yrs
            </div>
          )
        },
        size: 90,
      },
      {
        accessorKey: 'book_value',
        header: 'Book Value',
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <div className="text-sm text-slate-900 font-normal">
              {value ? `₱${Number(value).toLocaleString()}` : '—'}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const isEditing = editingCell === `${row.id}-status`
          const currentStatusId = row.original.status_id || status?.id || ''

          if (isEditing) {
            return (
              <select
                autoFocus
                defaultValue={currentStatusId}
                onChange={(e) => handleInlineEdit(row.original.id, 'status_id', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInlineEdit(row.original.id, 'status_id', e.target.value)
                  } else if (e.key === 'Escape') {
                    setEditingCell(null)
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                {(statuses || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )
          }

          const statusColors = {
            Active: 'bg-green-100 text-green-800 border-green-200',
            Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            'Under Repair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Disposed: 'bg-red-100 text-red-800 border-red-200',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                statusColors[status?.name] || 'bg-slate-100 text-slate-800 border-slate-200'
              } cursor-pointer`}
              onDoubleClick={() => setEditingCell(`${row.id}-status`)}
            >
              {status?.name || '-'}
            </span>
          )
        },
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/inventory/assets/${row.original.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
              title="View asset details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openEditModal(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
              title="Edit asset"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
              title="Delete asset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        enableSorting: false,
        size: 160,
      },
    ],
    [editingCell, openEditModal, handleDelete, navigate, handleInlineEdit, statuses, categories, employees]
  )

  // Table instance
  const table = useReactTable({
    data: assetsData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection: selectedRows,
    },
    onRowSelectionChange: setSelectedRows,
    enableRowSelection: true,
  })

  const selectedCount = Object.values(selectedRows).filter(Boolean).length

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

  const pivotData = useMemo(() => calculatePivotData(), [calculatePivotData])

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IT Asset Inventory</h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Track and manage all company assets with ease
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('pivot')}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'pivot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Pivot view"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Pivot</span>
            </button>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Asset name, serial, brand..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
              <select
                name="branch_id"
                value={filters.branch_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                name="status_id"
                value={filters.status_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statuses?.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
              <select
                name="vendor_id"
                value={filters.vendor_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Vendors</option>
                {(Array.isArray(vendors) ? vendors : []).map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purchase From
              </label>
              <input
                type="date"
                name="purchase_date_from"
                value={filters.purchase_date_from}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purchase To
              </label>
              <input
                type="date"
                name="purchase_date_to"
                value={filters.purchase_date_to}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {!showFilters && viewMode === 'table' && (
        <button
          onClick={() => setShowFilters(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <Filter className="w-4 h-4" />
          Show Filters
        </button>
      )}

      {/* Bulk Actions */}
      {selectedCount > 0 && viewMode === 'table' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} asset(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows({})}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} assets
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-700">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Pivot View */}
      {viewMode === 'pivot' && (
        <div className="space-y-4">
          {/* Pivot Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pivot Table Configuration
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportPivotToCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-all"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Row Dimension */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Row Dimension
                </label>
                <select
                  value={pivotConfig.rowDimension}
                  onChange={(e) => handlePivotConfigChange('rowDimension', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="category">Category</option>
                  <option value="status">Status</option>
                  <option value="branch">Branch</option>
                  <option value="vendor">Vendor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {/* Column Dimension */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Column Dimension
                </label>
                <select
                  value={pivotConfig.columnDimension}
                  onChange={(e) => handlePivotConfigChange('columnDimension', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="status">Status</option>
                  <option value="category">Category</option>
                  <option value="branch">Branch</option>
                  <option value="vendor">Vendor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {/* Aggregation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aggregation
                </label>
                <select
                  value={pivotConfig.aggregation}
                  onChange={(e) => handlePivotConfigChange('aggregation', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="count">Count</option>
                  <option value="sum_book_value">Sum - Book Value</option>
                  <option value="sum_acq_cost">Sum - Acquisition Cost</option>
                  <option value="avg_book_value">Average - Book Value</option>
                  <option value="avg_estimate_life">Average - Estimated Life</option>
                </select>
              </div>

              {/* Show Totals Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={pivotConfig.showTotals}
                    onChange={(e) => handlePivotConfigChange('showTotals', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Show Totals</span>
                </label>
              </div>
            </div>

            {/* Aggregation Description */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Current View:</strong> Showing{' '}
                <span className="font-semibold">
                  {pivotConfig.aggregation === 'count'
                    ? 'count of assets'
                    : pivotConfig.aggregation === 'sum_book_value'
                      ? 'total book value'
                      : pivotConfig.aggregation === 'sum_acq_cost'
                        ? 'total acquisition cost'
                        : pivotConfig.aggregation === 'avg_book_value'
                          ? 'average book value'
                          : 'average estimated life'}
                </span>{' '}
                grouped by{' '}
                <span className="font-semibold">{pivotConfig.rowDimension}</span> (rows) and{' '}
                <span className="font-semibold">{pivotConfig.columnDimension}</span> (columns)
              </p>
            </div>
          </div>

          {/* Pivot Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading pivot data...</span>
                </div>
              </div>
            ) : !pivotData || pivotData.rowKeys.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No data available for the selected configuration. Try adjusting your filters or
                configuration.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r-2 border-slate-300 sticky left-0 bg-slate-100 z-10">
                        {pivotConfig.rowDimension}
                      </th>
                      {pivotData.columnKeys.map((colKey) => (
                        <th
                          key={colKey}
                          className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200"
                        >
                          {colKey}
                        </th>
                      ))}
                      {pivotConfig.showTotals && (
                        <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border-l-2 border-blue-300">
                          Total
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pivotData.rowKeys.map((rowKey, rowIndex) => {
                      const rowTotal = pivotData.columnKeys.reduce(
                        (sum, colKey) => sum + (pivotData.data[rowKey][colKey] || 0),
                        0
                      )

                      return (
                        <tr
                          key={rowKey}
                          className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900 border-r-2 border-slate-300 sticky left-0 bg-inherit z-10">
                            {rowKey}
                          </td>
                          {pivotData.columnKeys.map((colKey) => {
                            const value = pivotData.data[rowKey][colKey]
                            const hasValue = value !== undefined && value !== null && value !== 0

                            return (
                              <td
                                key={`${rowKey}-${colKey}`}
                                className={`px-4 py-3 text-sm text-center border-r border-slate-200 ${
                                  hasValue
                                    ? 'text-slate-900 font-medium bg-green-50'
                                    : 'text-slate-400'
                                }`}
                              >
                                {formatPivotValue(value)}
                              </td>
                            )
                          })}
                          {pivotConfig.showTotals && (
                            <td className="px-4 py-3 text-sm font-bold text-center text-blue-900 bg-blue-50 border-l-2 border-blue-300">
                              {formatPivotValue(rowTotal)}
                            </td>
                          )}
                        </tr>
                      )
                    })}

                    {/* Totals Row */}
                    {pivotConfig.showTotals && (
                      <tr className="bg-blue-100 border-t-2 border-blue-300 font-bold">
                        <td className="px-4 py-3 text-sm text-blue-900 border-r-2 border-blue-300 sticky left-0 bg-blue-100 z-10">
                          Total
                        </td>
                        {pivotData.columnKeys.map((colKey) => {
                          const colTotal = pivotData.rowKeys.reduce(
                            (sum, rowKey) => sum + (pivotData.data[rowKey][colKey] || 0),
                            0
                          )

                          return (
                            <td
                              key={`total-${colKey}`}
                              className="px-4 py-3 text-sm text-center text-blue-900 border-r border-blue-200"
                            >
                              {formatPivotValue(colTotal)}
                            </td>
                          )
                        })}
                        {pivotConfig.showTotals && (
                          <td className="px-4 py-3 text-sm text-center text-blue-900 bg-blue-200 border-l-2 border-blue-400">
                            {formatPivotValue(
                              pivotData.rowKeys.reduce(
                                (sum, rowKey) =>
                                  sum +
                                  pivotData.columnKeys.reduce(
                                    (rowSum, colKey) =>
                                      rowSum + (pivotData.data[rowKey][colKey] || 0),
                                    0
                                  ),
                                0
                              )
                            )}
                          </td>
                        )}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pivot Stats Summary */}
          {pivotData && pivotData.rowKeys.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-1">Total Assets</div>
                <div className="text-2xl font-bold text-slate-900">
                  {assetsData?.data?.length || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-1">
                  Unique {pivotConfig.rowDimension}s
                </div>
                <div className="text-2xl font-bold text-blue-600">{pivotData.rowKeys.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-1">
                  Unique {pivotConfig.columnDimension}s
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {pivotData.columnKeys.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-1">Data Points</div>
                <div className="text-2xl font-bold text-purple-600">
                  {pivotData.rowKeys.length * pivotData.columnKeys.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Modal - Part 1 */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Asset" size="xl">
        <form onSubmit={handleCreate} className="space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Basic Information</h4>
                <p className="text-xs text-slate-500">Asset identification and details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter asset name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="asset_category_id"
                  value={formData.asset_category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter model"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter serial number"
                />
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Financial Details</h4>
                <p className="text-xs text-slate-500">Costs, values, and financial information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Acquisition Cost</label>
                <input
                  type="number"
                  step="0.01"
                  name="acq_cost"
                  value={formData.acq_cost}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Life (years)</label>
                <input
                  type="number"
                  name="estimate_life"
                  value={formData.estimate_life}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Expiration</label>
                <input
                  type="date"
                  name="waranty_expiration_date"
                  value={formData.waranty_expiration_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <SearchableSelect
                  label="Vendor"
                  options={
                    (Array.isArray(vendors) ? vendors : []).map((vendor) => ({
                      id: vendor.id,
                      name: vendor.company_name,
                      contact: vendor.contact_person || vendor.email || vendor.phone,
                    }))
                  }
                  value={formData.vendor_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
                  displayField="name"
                  secondaryField="contact"
                  placeholder="Select vendor or search..."
                  emptyMessage="No vendors found"
                  allowClear={true}
                />
              </div>
            </div>
          </div>

          {/* Assignment & Status Section */}
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Assignment & Remarks</h4>
                <p className="text-xs text-slate-500">Employee assignment and additional notes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <SearchableSelect
                  label="Assigned To Employee"
                  options={employees?.map(emp => ({
                    id: emp.id,
                    name: emp.fullname,
                    position: emp.position?.position_name,
                    branch: emp.branch?.branch_name
                  })) || []}
                  value={formData.assigned_to_employee_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, assigned_to_employee_id: value }))}
                  displayField="name"
                  secondaryField="position"
                  tertiaryField="branch"
                  placeholder="Select employee or search..."
                  emptyMessage="No employees found"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any additional remarks or notes"
                />
              </div>
            </div>
          </div>

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
              disabled={createMutation.isPending}
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal - Similar to Add Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Asset" size="xl">
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Basic Information</h4>
                <p className="text-xs text-slate-500">Asset identification and details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="asset_category_id"
                  value={formData.asset_category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Financial Details</h4>
                <p className="text-xs text-slate-500">Costs, values, and financial information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Acquisition Cost</label>
                <input
                  type="number"
                  step="0.01"
                  name="acq_cost"
                  value={formData.acq_cost}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Book Value (Auto-calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="book_value"
                  value={formData.book_value}
                  disabled
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  title="Book value is automatically calculated based on depreciation"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Calculated using straight-line depreciation
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Life (years)</label>
                <input
                  type="number"
                  name="estimate_life"
                  value={formData.estimate_life}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Expiration</label>
                <input
                  type="date"
                  name="waranty_expiration_date"
                  value={formData.waranty_expiration_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <SearchableSelect
                  label="Vendor"
                  options={
                    (Array.isArray(vendors) ? vendors : []).map((vendor) => ({
                      id: vendor.id,
                      name: vendor.company_name,
                      contact: vendor.contact_person || vendor.email || vendor.phone,
                    }))
                  }
                  value={formData.vendor_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
                  displayField="name"
                  secondaryField="contact"
                  placeholder="Select vendor or search..."
                  emptyMessage="No vendors found"
                  allowClear={true}
                />
              </div>
            </div>
          </div>

          {/* Assignment & Status Section */}
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Assignment & Status</h4>
                <p className="text-xs text-slate-500">Employee assignment and asset status</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select status</option>
                  {statuses?.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <SearchableSelect
                  label="Assigned To Employee"
                  options={employees?.map(emp => ({
                    id: emp.id,
                    name: emp.fullname,
                    position: emp.position?.position_name,
                    branch: emp.branch?.branch_name
                  })) || []}
                  value={formData.assigned_to_employee_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, assigned_to_employee_id: value }))}
                  displayField="name"
                  secondaryField="position"
                  tertiaryField="branch"
                  placeholder="Select employee or search..."
                  emptyMessage="No employees found"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

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
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AssetsPage
