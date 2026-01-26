import { useCallback, useEffect, useMemo, useState } from 'react'
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
import EmployeeForm from '../../components/employees/EmployeeForm'
import { getEmployeeColumns } from '../../components/employees/employeeColumns.jsx'
import {
  fetchEmployeesRequest,
  createEmployeeRequest,
  updateEmployeeRequest,
  deleteEmployeeRequest,
} from '../../services/employeeService'
import { fetchBranchesRequest } from '../../services/branchService'
import { fetchSectionsRequest } from '../../services/sectionService'
import { fetchPositionsRequest } from '../../services/positionService'

const initialForm = {
  fullname: '',
  branch_id: '',
  department_id: '',
  position_id: '',
}

function EmployeePage() {
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [sections, setSections] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  const resetForm = () => setFormData(initialForm)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchEmployeesRequest()
      if (response.data?.success) {
        setEmployees(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch employees',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReferenceData = useCallback(async () => {
    try {
      const [branchRes, sectionRes, positionRes] = await Promise.all([
        fetchBranchesRequest(),
        fetchSectionsRequest(),
        fetchPositionsRequest(),
      ])
      if (branchRes.data?.success) setBranches(branchRes.data.data)
      if (sectionRes.data?.success) setSections(sectionRes.data.data)
      if (positionRes.data?.success) setPositions(positionRes.data.data)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reference data',
      })
    }
  }, [])

  useEffect(() => {
    fetchReferenceData()
    fetchEmployees()
  }, [fetchEmployees, fetchReferenceData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((employee) => {
    setSelectedEmployee(employee)
    setFormData({
      fullname: employee.fullname || '',
      branch_id: employee.branch_id || '',
      department_id: employee.department_id || '',
      position_id: employee.position_id || '',
    })
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await createEmployeeRequest(formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchEmployees()
      }
    } catch (error) {
      const fullnameError = error.response?.data?.errors?.fullname?.[0]
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: fullnameError || error.response?.data?.message || 'Failed to create employee',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await updateEmployeeRequest(selectedEmployee.id, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        closeEditModal()
        fetchEmployees()
      }
    } catch (error) {
      const fullnameError = error.response?.data?.errors?.fullname?.[0]
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: fullnameError || error.response?.data?.message || 'Failed to update employee',
      })
    }
  }

  const handleDelete = useCallback(
    async (employee) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete employee "${employee.fullname}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        try {
          const response = await deleteEmployeeRequest(employee.id)
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response.data.message,
              timer: 2000,
            })
            fetchEmployees()
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to delete employee',
          })
        }
      }
    },
    [fetchEmployees]
  )

  const columns = useMemo(() => getEmployeeColumns(openEditModal, handleDelete), [handleDelete, openEditModal])
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'fullname', header: 'Full Name' },
      { accessorKey: 'branch.branch_name', header: 'Branch' },
      { accessorKey: 'department.name', header: 'Department' },
      { accessorKey: 'position.title', header: 'Position' },
    ],
    []
  )

  const mobileTable = useReactTable({
    data: employees,
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
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage employees and their assignments</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Employee</span>
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
              placeholder="Search employees..."
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
              <option value="fullname">Full Name</option>
              <option value="branch.branch_name">Branch</option>
              <option value="department.name">Department</option>
              <option value="position.title">Position</option>
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
            Loading employees...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No employees found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const employee = row.original
            return (
              <div key={employee.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {employee.fullname}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Branch</div>
                    <div className="font-medium text-slate-700 truncate">
                      {employee.branch?.branch_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Department</div>
                    <div className="font-medium text-slate-700 truncate">
                      {employee.department?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Position</div>
                    <div className="font-medium text-slate-700 truncate">
                      {employee.position?.title || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit employee"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete employee"
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
        <DataTable columns={columns} data={employees} loading={loading} pageSize={10} />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        size="md"
      >
        <EmployeeForm
          formData={formData}
          branches={branches}
          sections={sections}
          positions={positions}
          onChange={handleInputChange}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          submitLabel="Create Employee"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        size="md"
      >
        <EmployeeForm
          formData={formData}
          branches={branches}
          sections={sections}
          positions={positions}
          onChange={handleInputChange}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
          submitLabel="Update Employee"
        />
      </Modal>
    </div>
  )
}

export default EmployeePage
