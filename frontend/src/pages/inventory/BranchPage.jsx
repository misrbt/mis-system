import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Edit, Trash2, Building2, MapPin, Hash } from 'lucide-react'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function BranchPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    branch_name: '',
    brak: '',
    brcode: ''
  })

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/branches')
      if (response.data.success) {
        setBranches(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch branches'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ branch_name: '', brak: '', brcode: '' })
    setIsAddModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = useCallback((branch) => {
    setSelectedBranch(branch)
    setFormData({
      branch_name: branch.branch_name,
      brak: branch.brak,
      brcode: branch.brcode
    })
    setIsEditModalOpen(true)
  }, [])

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/branches', formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000
        })
        setIsAddModalOpen(false)
        fetchBranches()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create branch'
      })
    }
  }

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.put(`/branches/${selectedBranch.id}`, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000
        })
        setIsEditModalOpen(false)
        fetchBranches()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update branch'
      })
    }
  }

  // Handle Delete
  const handleDelete = useCallback(async (branch) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete branch "${branch.branch_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/branches/${branch.id}`)
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: response.data.message,
            timer: 2000
          })
          fetchBranches()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete branch'
        })
      }
    }
  }, [])



  // Define columns for DataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'branch_name',
        header: 'Branch Name',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'brak',
        header: 'BRAK',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{info.getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'brcode',
        header: 'Branch Code',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {info.getValue()}
            </span>
          </div>
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
              title="Edit branch"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Delete branch"
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
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter branch name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              BRAK <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="brak"
                value={formData.brak}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter BRAK code"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Branch Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="brcode"
                value={formData.brcode}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter branch code"
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
              Create Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter branch name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              BRAK <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="brak"
                value={formData.brak}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter BRAK code"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Branch Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="brcode"
                value={formData.brcode}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter branch code"
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
              Update Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BranchPage
