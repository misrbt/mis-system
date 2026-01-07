import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import SectionForm from '../../components/sections/SectionForm'
import { getSectionColumns } from '../../components/sections/sectionColumns.jsx'
import {
  fetchSectionsRequest,
  createSectionRequest,
  updateSectionRequest,
  deleteSectionRequest,
} from '../../services/sectionService'

const initialForm = { name: '' }

function SectionPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [formData, setFormData] = useState(initialForm)

  const resetForm = () => setFormData(initialForm)

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchSectionsRequest()
      if (response.data?.success) {
        setSections(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch sections',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((section) => {
    setSelectedSection(section)
    setFormData({ name: section.name })
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedSection(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await createSectionRequest(formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchSections()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create section',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await updateSectionRequest(selectedSection.id, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        closeEditModal()
        fetchSections()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update section',
      })
    }
  }

  const handleDelete = useCallback(
    async (section) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete section "${section.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        try {
          const response = await deleteSectionRequest(section.id)
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response.data.message,
              timer: 2000,
            })
            fetchSections()
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to delete section',
          })
        }
      }
    },
    [fetchSections]
  )

  const columns = useMemo(() => getSectionColumns(openEditModal, handleDelete), [handleDelete, openEditModal])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Section Management</h1>
          <p className="text-sm text-slate-600 mt-1.5">Manage and monitor all sections</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Section</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={sections} loading={loading} pageSize={10} />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Section"
        size="md"
      >
        <SectionForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          submitLabel="Create Section"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Section"
        size="md"
      >
        <SectionForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
          submitLabel="Update Section"
        />
      </Modal>
    </div>
  )
}

export default SectionPage
