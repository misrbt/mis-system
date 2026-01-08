import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Swal from 'sweetalert2'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import BranchForm from '../../components/branches/BranchForm'
import { getBranchColumns } from '../../components/branches/branchColumns.jsx'
import {
  fetchBranchesRequest,
  createBranchRequest,
  updateBranchRequest,
  deleteBranchRequest,
} from '../../services/branchService'

const initialForm = {
  branch_name: '',
  brak: '',
  brcode: '',
}

function BranchPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  const resetForm = () => setFormData(initialForm)
  const getErrorMessage = (error, fallbackMessage) => {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      return Object.values(errors).flat().join('\n')
    }
    return error.response?.data?.message || error.message || fallbackMessage
  }

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchBranchesRequest()
      if (response.data?.success) {
        setBranches(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch branches',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((branch) => {
    setSelectedBranch(branch)
    setFormData({
      branch_name: branch.branch_name,
      brak: branch.brak,
      brcode: branch.brcode,
    })
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedBranch(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await createBranchRequest(formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchBranches()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getErrorMessage(error, 'Failed to create branch'),
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await updateBranchRequest(selectedBranch.id, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        closeEditModal()
        fetchBranches()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getErrorMessage(error, 'Failed to update branch'),
      })
    }
  }

  const handleDelete = useCallback(
    async (branch) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete branch "${branch.branch_name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        try {
          const response = await deleteBranchRequest(branch.id)
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response.data.message,
              timer: 2000,
            })
            fetchBranches()
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to delete branch',
          })
        }
      }
    },
    [fetchBranches]
  )

  const columns = useMemo(() => getBranchColumns(openEditModal, handleDelete), [handleDelete, openEditModal])
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'branch_name', header: 'Branch Name' },
      { accessorKey: 'brak', header: 'BRAK' },
      { accessorKey: 'brcode', header: 'Branch Code' },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const mobileTable = useReactTable({
    data: branches,
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
          <h1 className="text-3xl font-bold text-slate-900">Branch Management</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage and monitor all branch locations</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Branch</span>
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
              placeholder="Search branches..."
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
              <option value="branch_name">Branch Name</option>
              <option value="brak">BRAK</option>
              <option value="brcode">Branch Code</option>
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
            Loading branches...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No branches found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const branch = row.original
            return (
              <div key={branch.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {branch.branch_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      BRAK: {branch.brak || 'N/A'}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {branch.brcode || 'N/A'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit branch"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete branch"
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
        <DataTable columns={columns} data={branches} loading={loading} pageSize={10} />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Branch"
        size="md"
      >
        <BranchForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          submitLabel="Create Branch"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch"
        size="md"
      >
        <BranchForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
          submitLabel="Update Branch"
        />
      </Modal>
    </div>
  )
}

export default BranchPage
