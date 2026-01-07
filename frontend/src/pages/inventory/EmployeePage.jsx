import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create employee',
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update employee',
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

      {/* Data Table */}
      <DataTable columns={columns} data={employees} loading={loading} pageSize={10} />

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
