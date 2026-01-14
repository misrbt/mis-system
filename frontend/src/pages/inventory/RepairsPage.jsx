import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wrench, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import RepairFilters from '../../components/repairs/RepairFilters'
import EditRepairForm from '../../components/repairs/EditRepairForm'
import CompleteRepairModal from '../../components/repairs/CompleteRepairModal'
import InRepairModal from '../../components/repairs/InRepairModal'
import RemarksModal from '../../components/repairs/RemarksModal'
import { getRepairColumns } from '../../components/repairs/repairColumns.jsx'
import { fetchRepairs, fetchRepairStats, fetchRepairAssets, fetchVendors, updateRepair, deleteRepair, updateRepairStatus } from '../../services/repairService'
import Swal from 'sweetalert2'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

const initialFilters = {
  asset_id: '',
  vendor_id: '',
  status: '',
  repair_date_from: '',
  repair_date_to: '',
  search: '',
}

const initialForm = {
  asset_id: '',
  vendor_id: '',
  description: '',
  repair_date: '',
  expected_return_date: '',
  actual_return_date: '',
  repair_cost: '',
  status: 'Pending',
  remarks: '',
}

function RepairsPage() {
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState(initialFilters)
  const [formData, setFormData] = useState(initialForm)
  const [showFilters, setShowFilters] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState(null)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isInRepairModalOpen, setIsInRepairModalOpen] = useState(false)
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false)
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  const { data: repairsData, isLoading } = useQuery({
    queryKey: ['repairs', filters],
    queryFn: async () => {
      const params = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value
      })
      const response = await fetchRepairs(params)
      return response.data
    },
  })

  const { data: statsData } = useQuery({
    queryKey: ['repair-statistics'],
    queryFn: async () => (await fetchRepairStats()).data.data,
  })

  const { data: assetsData } = useQuery({
    queryKey: ['assets', 'repairs'],
    queryFn: async () => (await fetchRepairAssets()).data,
  })

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => (await fetchVendors()).data,
  })

  const assets = normalizeArrayResponse(assetsData)
  const vendors = normalizeArrayResponse(vendorsData)
  const repairsList = Array.isArray(repairsData?.data) ? repairsData.data : []

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRepair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['repairs'])
      queryClient.invalidateQueries(['repair-statistics'])
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Repair record updated successfully',
        timer: 2000,
      })
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update repair record',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRepair(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['repairs'])
      queryClient.invalidateQueries(['repair-statistics'])
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Repair record deleted successfully',
        timer: 2000,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete repair record',
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, ...payload }) => updateRepairStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['repairs'])
      queryClient.invalidateQueries(['repair-statistics'])
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Status updated successfully',
        timer: 2000,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update status',
      })
    },
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => setFilters(initialFilters)

  const openEditModal = useCallback((repair) => {
    setSelectedRepair(repair)

    // Helper function to format date to YYYY-MM-DD for date inputs
    const formatDate = (date) => {
      if (!date) return ''
      // Extract just the date part (YYYY-MM-DD) from ISO datetime or date string
      return date.split('T')[0]
    }

    setFormData({
      asset_id: repair.asset_id || '',
      vendor_id: repair.vendor_id || '',
      description: repair.description || '',
      repair_date: formatDate(repair.repair_date),
      expected_return_date: formatDate(repair.expected_return_date),
      actual_return_date: formatDate(repair.actual_return_date),
      repair_cost: repair.repair_cost || '',
      status: repair.status || 'Pending',
      remarks: repair.remarks || '',
    })
    setIsEditModalOpen(true)
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    updateMutation.mutate({ id: selectedRepair.id, data: formData })
  }

  const handleDelete = useCallback(
    async (repair) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete repair record for "${repair.asset?.asset_name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        deleteMutation.mutate(repair.id)
      }
    },
    [deleteMutation]
  )

  const handleStatusChange = useCallback(
    async (repair, newStatus) => {
      // Show appropriate modal based on status
      if (newStatus === 'Completed') {
        setSelectedRepair(repair)
        setIsCompleteModalOpen(true)
        return
      }

      if (newStatus === 'In Repair') {
        setSelectedRepair(repair)
        setIsInRepairModalOpen(true)
        return
      }

      // For other status changes, use simple confirmation
      const result = await Swal.fire({
        title: 'Update Status',
        text: `Change status to "${newStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        const payload = {
          status: newStatus,
          actual_return_date: newStatus === 'Returned' ? new Date().toISOString().split('T')[0] : null,
        }
        updateStatusMutation.mutate({ id: repair.id, ...payload })
      }
    },
    [updateStatusMutation]
  )

  const handleCompleteSubmit = (formData) => {
    const payload = {
      status: 'Completed',
      ...formData,
    }
    updateStatusMutation.mutate(
      { id: selectedRepair.id, ...payload },
      {
        onSuccess: () => {
          setIsCompleteModalOpen(false)
          setSelectedRepair(null)
        },
      }
    )
  }

  const handleInRepairSubmit = (formData) => {
    // Build payload with only relevant fields based on delivered_by_type
    const payload = {
      status: 'In Repair',
      delivered_by_type: formData.delivered_by_type,
    }

    // Add type-specific fields
    if (formData.delivered_by_type === 'employee') {
      payload.delivered_by_employee_name = formData.delivered_by_employee_name
    } else if (formData.delivered_by_type === 'branch') {
      payload.delivered_by_branch_id = formData.delivered_by_branch_id
    }

    // Add optional job order file if present
    if (formData.job_order) {
      payload.job_order = formData.job_order
    }

    // Add remark
    if (formData.remark) {
      payload.remark = formData.remark
      payload.remark_type = 'status_change'
    }

    updateStatusMutation.mutate(
      { id: selectedRepair.id, ...payload },
      {
        onSuccess: () => {
          setIsInRepairModalOpen(false)
          setSelectedRepair(null)
        },
      }
    )
  }

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Repair': 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Returned: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const openRemarksModal = useCallback((repair) => {
    setSelectedRepair(repair)
    setIsRemarksModalOpen(true)
  }, [])

  const columns = useMemo(
    () => getRepairColumns(handleStatusChange, openEditModal, handleDelete, getStatusBadge, openRemarksModal),
    [handleDelete, handleStatusChange, openEditModal, openRemarksModal]
  )
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'asset.asset_name', header: 'Asset' },
      { accessorKey: 'vendor.company_name', header: 'Vendor' },
      { accessorKey: 'repair_date', header: 'Repair Date' },
      { accessorKey: 'expected_return_date', header: 'Expected Return' },
      { accessorKey: 'repair_cost', header: 'Cost' },
      { accessorKey: 'status', header: 'Status' },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const mobileTable = useReactTable({
    data: repairsList,
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
  const mobileFilteredCount = mobileTable.getFilteredRowModel().rows.length
  const mobileStart = mobileFilteredCount === 0 ? 0 : mobilePagination.pageIndex * mobilePagination.pageSize + 1
  const mobileEnd = Math.min((mobilePagination.pageIndex + 1) * mobilePagination.pageSize, mobileFilteredCount)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Repairs</h1>
          <p className="text-sm text-slate-600 mt-1.5">Track and manage asset repair records</p>
        </div>
        <RepairFilters
          showFilters={showFilters}
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          onToggle={() => setShowFilters((prev) => !prev)}
        />
      </div>

      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statsData.pending}</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Under Repair</p>
                <p className="text-2xl font-bold text-blue-600">{statsData.in_repair}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statsData.completed}</p>
              </div>
              <Wrench className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Returned</p>
                <p className="text-2xl font-bold text-slate-600">{statsData.returned}</p>
              </div>
              <Wrench className="w-8 h-8 text-slate-500" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={mobileGlobalFilter ?? ''}
              onChange={(e) => setMobileGlobalFilter(e.target.value)}
              placeholder="Search repairs..."
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
              <option value="asset.asset_name">Asset</option>
              <option value="vendor.company_name">Vendor</option>
              <option value="repair_date">Repair Date</option>
              <option value="expected_return_date">Expected Return</option>
              <option value="repair_cost">Cost</option>
              <option value="status">Status</option>
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Loading repairs...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No repairs found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const repair = row.original
            const status = repair.status
            const nextStatus = {
              Pending: 'In Repair',
              'In Repair': 'Completed',
              Completed: 'Returned',
            }[status]
            const statusDisplay = {
              'In Repair': 'Under Repair',
            }[status] || status
            const nextStatusDisplay = {
              'In Repair': 'Under Repair',
            }[nextStatus] || nextStatus
            const repairCost = repair.repair_cost
              ? `P${Number(repair.repair_cost).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : 'N/A'

            return (
              <div key={repair.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {repair.asset?.asset_name || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {repair.asset?.category?.name || 'N/A'}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                      status
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="leading-none">{statusDisplay}</span>
                  </span>
                </div>

                {nextStatus && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleStatusChange(repair, nextStatus)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:border-blue-300 hover:text-blue-700 transition-colors"
                      title={`Change status to ${nextStatusDisplay}`}
                    >
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Next</span>
                      <span>{nextStatusDisplay}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Vendor</div>
                    <div className="font-medium text-slate-700 truncate">
                      {repair.vendor?.company_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Repair Date</div>
                    <div className="font-medium text-slate-700">
                      {repair.repair_date ? new Date(repair.repair_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Expected Return</div>
                    <div className="font-medium text-slate-700">
                      {repair.expected_return_date
                        ? new Date(repair.expected_return_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Cost</div>
                    <div className="font-semibold text-slate-900">{repairCost}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openRemarksModal(repair)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200"
                    title="View remarks history"
                  >
                    <span>Remarks</span>
                  </button>
                  <button
                    onClick={() => openEditModal(repair)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit repair"
                  >
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(repair)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete repair"
                  >
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })
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

      {/* Data Table */}
      <div className="hidden sm:block">
        <DataTable columns={columns} data={repairsList} loading={isLoading} pageSize={10} />
      </div>

      {isEditModalOpen && selectedRepair && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Repair Record"
          size="lg"
        >
          <EditRepairForm
            formData={formData}
            assets={assets}
            vendors={vendors}
            onChange={handleInputChange}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={updateMutation.isPending}
          />
        </Modal>
      )}

      {/* Complete Repair Modal */}
      {isCompleteModalOpen && selectedRepair && (
        <CompleteRepairModal
          isOpen={isCompleteModalOpen}
          onClose={() => {
            setIsCompleteModalOpen(false)
            setSelectedRepair(null)
          }}
          onSubmit={handleCompleteSubmit}
          repair={selectedRepair}
          isSubmitting={updateStatusMutation.isPending}
        />
      )}

      {/* Under Repair Modal */}
      {isInRepairModalOpen && selectedRepair && (
        <InRepairModal
          isOpen={isInRepairModalOpen}
          onClose={() => {
            setIsInRepairModalOpen(false)
            setSelectedRepair(null)
          }}
          onSubmit={handleInRepairSubmit}
          repair={selectedRepair}
          isSubmitting={updateStatusMutation.isPending}
        />
      )}

      {/* Remarks Modal */}
      {isRemarksModalOpen && selectedRepair && (
        <RemarksModal
          isOpen={isRemarksModalOpen}
          onClose={() => {
            setIsRemarksModalOpen(false)
            setSelectedRepair(null)
          }}
          repair={selectedRepair}
        />
      )}
    </div>
  )
}

export default RepairsPage
