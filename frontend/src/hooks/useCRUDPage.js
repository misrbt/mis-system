/**
 * Custom hook for CRUD page operations
 * Consolidates query, mutation, and modal state management
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Swal from 'sweetalert2'

/**
 * @typedef {Object} UseCRUDPageOptions
 * @property {string} queryKey - React Query key for the resource
 * @property {function(): Promise} fetchFn - Function to fetch all records
 * @property {function(Object): Promise} createFn - Function to create a record
 * @property {function({ id: number, data: Object }): Promise} updateFn - Function to update a record
 * @property {function(number): Promise} deleteFn - Function to delete a record
 * @property {Object} initialFormData - Initial form data structure
 * @property {string} resourceName - Human-readable resource name
 * @property {function(Object): Object} [mapToForm] - Map record to form data
 * @property {Array} [mobileColumns] - Column definitions for mobile table
 */

/**
 * Hook for managing CRUD page operations
 * @param {UseCRUDPageOptions} options
 */
export function useCRUDPage({
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  initialFormData = {},
  resourceName = 'Record',
  mapToForm = (record) => record,
  mobileColumns = [],
}) {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState(initialFormData)

  // Mobile table state
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  const queryClient = useQueryClient()

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData)
  }, [initialFormData])

  // Query
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await fetchFn()
      // Handle different response structures
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data
      }
      if (Array.isArray(response)) {
        return response
      }
      return []
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setIsAddModalOpen(false)
      resetForm()
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${resourceName} created successfully.`,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.response?.data?.message || error.message || `Failed to create ${resourceName.toLowerCase()}`
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      closeEditModal()
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${resourceName} updated successfully.`,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.response?.data?.message || error.message || `Failed to update ${resourceName.toLowerCase()}`
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${resourceName} deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to delete ${resourceName.toLowerCase()}`,
      })
    },
  })

  // Store delete mutation ref for callback stability
  const deleteMutateRef = useRef(deleteMutation.mutate)
  deleteMutateRef.current = deleteMutation.mutate

  // Modal handlers
  const openAddModal = useCallback(() => {
    resetForm()
    setIsAddModalOpen(true)
  }, [resetForm])

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false)
    resetForm()
  }, [resetForm])

  const openEditModal = useCallback((record) => {
    setSelectedRecord(record)
    setFormData(mapToForm(record))
    setIsEditModalOpen(true)
  }, [mapToForm])

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedRecord(null)
    resetForm()
  }, [resetForm])

  // Form handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleCreate = useCallback((e) => {
    e?.preventDefault()
    createMutation.mutate(formData)
  }, [createMutation, formData])

  const handleUpdate = useCallback((e) => {
    e?.preventDefault()
    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, data: formData })
    }
  }, [updateMutation, selectedRecord, formData])

  const handleDelete = useCallback(async (record, displayField = 'name') => {
    const displayName = record[displayField] || record.name || record.title || `ID ${record.id}`
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete ${resourceName.toLowerCase()} "${displayName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })
    if (result.isConfirmed) {
      deleteMutateRef.current(record.id)
    }
  }, [resourceName])

  // Mobile table
  const mobileTable = useReactTable({
    data,
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

  // Mobile table helpers
  const mobileSortId = mobileSorting[0]?.id || ''
  const mobileSortDesc = mobileSorting[0]?.desc || false
  const mobilePagination = mobileTable.getState().pagination
  const mobileFilteredCount = mobileGlobalFilter
    ? mobileTable.getFilteredRowModel().rows.length
    : data.length
  const mobileStart = mobileFilteredCount === 0 ? 0 : mobilePagination.pageIndex * mobilePagination.pageSize + 1
  const mobileEnd = Math.min((mobilePagination.pageIndex + 1) * mobilePagination.pageSize, mobileFilteredCount)

  const toggleMobileSortDirection = useCallback(() => {
    if (!mobileSortId) return
    setMobileSorting([{ id: mobileSortId, desc: !mobileSortDesc }])
  }, [mobileSortId, mobileSortDesc])

  const setMobileSortField = useCallback((field) => {
    setMobileSorting(field ? [{ id: field, desc: false }] : [])
  }, [])

  return {
    // Data
    data,
    isLoading,
    error,
    refetch,

    // Modal state
    isAddModalOpen,
    isEditModalOpen,
    selectedRecord,
    formData,
    setFormData,

    // Modal handlers
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,

    // Form handlers
    handleInputChange,
    handleCreate,
    handleUpdate,
    handleDelete,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mobile table
    mobileTable,
    mobileGlobalFilter,
    setMobileGlobalFilter,
    mobileSortId,
    mobileSortDesc,
    toggleMobileSortDirection,
    setMobileSortField,
    mobilePagination,
    mobileFilteredCount,
    mobileStart,
    mobileEnd,
  }
}

export default useCRUDPage
