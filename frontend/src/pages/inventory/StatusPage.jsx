import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'

function StatusPage() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  })

  // Fetch statuses
  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/statuses')
      if (response.data.success) {
        setStatuses(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch statuses',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatuses()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setFormData({ name: '', color: '#3B82F6' })
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((status) => {
    setSelectedStatus(status)
    setFormData({
      name: status.name,
      color: status.color || '#3B82F6',
    })
    setIsEditModalOpen(true)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/statuses', formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchStatuses()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create status',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.put(`/statuses/${selectedStatus.id}`, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsEditModalOpen(false)
        fetchStatuses()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update status',
      })
    }
  }

  const handleDelete = useCallback(async (status) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete status "${status.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/statuses/${status.id}`)
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: response.data.message,
            timer: 2000,
          })
          fetchStatuses()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete status',
        })
      }
    }
  }, [])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Status Name',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: info.row.original.color || '#3B82F6' }}
            />
            <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>
          </div>
        ),
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg border-2 border-slate-200 shadow-sm"
              style={{ backgroundColor: info.getValue() || '#3B82F6' }}
            />
            <span className="text-xs font-mono text-slate-600">{info.getValue() || '#3B82F6'}</span>
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
              title="Edit status"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Delete status"
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
          <h1 className="text-3xl font-bold text-slate-900">Status Management</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage available statuses for assets</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Status</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={statuses} loading={loading} pageSize={10} />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Status"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter status name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="h-10 w-20 rounded-lg border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div
                className="h-10 w-10 rounded-lg border-2 border-slate-300 shadow-sm"
                style={{ backgroundColor: formData.color }}
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
              Create Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Status"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter status name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="h-10 w-20 rounded-lg border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div
                className="h-10 w-10 rounded-lg border-2 border-slate-300 shadow-sm"
                style={{ backgroundColor: formData.color }}
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
              Update Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StatusPage
