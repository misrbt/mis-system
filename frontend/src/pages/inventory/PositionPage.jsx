import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Edit, Trash2, Briefcase, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function PositionPage() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    title: ''
  })
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  // Fetch positions
  const fetchPositions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/positions')
      if (response.data.success) {
        setPositions(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch positions'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ title: '' })
    setIsAddModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = useCallback((position) => {
    setSelectedPosition(position)
    setFormData({
      title: position.title
    })
    setIsEditModalOpen(true)
  }, [])

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/positions', formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000
        })
        setIsAddModalOpen(false)
        fetchPositions()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create position'
      })
    }
  }

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.put(`/positions/${selectedPosition.id}`, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000
        })
        setIsEditModalOpen(false)
        fetchPositions()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update position'
      })
    }
  }

  // Handle Delete
  const handleDelete = useCallback(async (position) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete position "${position.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/positions/${position.id}`)
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: response.data.message,
            timer: 2000
          })
          fetchPositions()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete position'
        })
      }
    }
  }, [])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Position Title',
        cell: (info) => (
          <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>
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
              title="Edit position"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Delete position"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [openEditModal, handleDelete]
  )
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'title', header: 'Position Title' },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const mobileTable = useReactTable({
    data: positions,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Position Management</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage and monitor all positions</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Position</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={mobileGlobalFilter ?? ''}
              onChange={(e) => setMobileGlobalFilter(e.target.value)}
              placeholder="Search positions..."
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
              <option value="title">Position Title</option>
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
            Loading positions...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No positions found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const position = row.original
            return (
              <div key={position.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {position.title}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(position)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit position"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(position)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete position"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })
        )}

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
        <DataTable columns={columns} data={positions} loading={loading} pageSize={10} />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Position"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Position Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter position title"
              />
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
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Create Position
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Position"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Position Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter position title"
              />
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
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Update Position
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PositionPage
