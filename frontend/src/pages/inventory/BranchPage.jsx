import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
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

  const resetForm = () => setFormData(initialForm)

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
        text: error.response?.data?.message || 'Failed to create branch',
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
        text: error.response?.data?.message || 'Failed to update branch',
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

      {/* Data Table */}
      <DataTable columns={columns} data={branches} loading={loading} pageSize={10} />

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
