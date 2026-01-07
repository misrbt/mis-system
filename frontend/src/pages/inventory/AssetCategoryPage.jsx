import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import CategoryForm from '../../components/asset-categories/CategoryForm'
import { getCategoryColumns } from '../../components/asset-categories/categoryColumns.jsx'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/assetCategoryService'

function AssetCategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [formData, setFormData] = useState({ name: '' })

  const resetForm = () => setFormData({ name: '' })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getCategories()
      if (response.data?.success) {
        setCategories(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch categories',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((category) => {
    setSelectedCategory(category)
    setFormData({ name: category.name })
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedCategory(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const response = await createCategory(formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchCategories()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create category',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await updateCategory(selectedCategory.id, formData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        closeEditModal()
        fetchCategories()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update category',
      })
    }
  }

  const handleDelete = useCallback(
    async (category) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete category "${category.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        try {
          const response = await deleteCategory(category.id)
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response.data.message,
              timer: 2000,
            })
            fetchCategories()
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to delete category',
          })
        }
      }
    },
    [fetchCategories]
  )

  const columns = useMemo(() => getCategoryColumns(openEditModal, handleDelete), [handleDelete, openEditModal])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asset Categories</h1>
          <p className="text-sm text-slate-600 mt-1.5">Organize your assets by category</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={categories} loading={loading} pageSize={10} />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        size="md"
      >
        <CategoryForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          submitLabel="Create Category"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
        size="md"
      >
        <CategoryForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
          submitLabel="Update Category"
        />
      </Modal>
    </div>
  )
}

export default AssetCategoryPage
