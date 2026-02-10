/**
 * SweetAlert Utility - Usage Examples
 * 
 * This file demonstrates how to use the reusable SweetAlert utility
 * Replace manual Swal.fire() calls with these helper functions
 */

import {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    closeAlert,
    showToast,
} from '../utils/sweetAlert'

// ============================================
// 1. SUCCESS ALERTS
// ============================================

// Simple success message
const handleCreateSuccess = () => {
    showSuccess('Created!', 'Asset created successfully')
}

// Success without message
const handleSaveSuccess = () => {
    showSuccess('Saved!')
}

// Success with custom options
const handleUpdateSuccess = () => {
    showSuccess('Updated!', 'Changes saved successfully', {
        timer: 2000, // Close after 2 seconds
    })
}

// ============================================
// 2. ERROR ALERTS
// ============================================

// Simple error
const handleError = () => {
    showError('Failed!', 'Something went wrong')
}

// API error handling
const handleApiError = (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    showError('Error', message)
}

// ============================================
// 3. WARNING ALERTS
// ============================================

const showWarningExample = () => {
    showWarning('Warning', 'This action may have consequences')
}

// ============================================
// 4. INFO ALERTS
// ============================================

const showInfoExample = () => {
    showInfo('Information', 'Please review before proceeding')
}

// ============================================
// 5. CONFIRMATION DIALOGS
// ============================================

// Basic confirmation
const handleSubmit = async () => {
    const result = await showConfirm(
        'Confirm Submission',
        'Are you sure you want to submit this form?'
    )

    if (result.isConfirmed) {
        // User clicked "Yes"
        // Proceed with action
        console.log('Confirmed!')
    }
}

// Custom button text
const handleTransfer = async () => {
    const result = await showConfirm(
        'Transfer Asset',
        'Transfer this asset to another location?',
        {
            confirmText: 'Transfer',
            cancelText: 'Keep Here',
        }
    )

    if (result.isConfirmed) {
        // Proceed with transfer
    }
}

// ============================================
// 6. DELETE CONFIRMATION
// ============================================

const handleDelete = async (assetName) => {
    const result = await showDeleteConfirm(assetName)

    if (result.isConfirmed) {
        try {
            // Perform delete
            await deleteAsset()
            showSuccess('Deleted!', 'Asset has been deleted')
        } catch (error) {
            showError('Failed', 'Could not delete asset')
        }
    }
}

// ============================================
// 7. LOADING ALERTS
// ============================================

const handleProcess = async () => {
    // Show loading
    showLoading('Processing your request...')

    try {
        await someAsyncOperation()

        // Close loading and show success
        closeAlert()
        showSuccess('Complete!', 'Operation completed successfully')
    } catch (error) {
        closeAlert()
        showError('Failed', error.message)
    }
}

// ============================================
// 8. TOAST NOTIFICATIONS
// ============================================

// Success toast (small notification at corner)
const handleQuickSave = () => {
    showToast('Saved successfully', 'success')
}

// Error toast
const handleValidationError = () => {
    showToast('Please fill all required fields', 'error')
}

// Info toast
const handleCopy = () => {
    showToast('Copied to clipboard', 'info')
}

// Warning toast
const handleWarningToast = () => {
    showToast('Changes not saved', 'warning')
}

// ============================================
// 9. REAL-WORLD EXAMPLES
// ============================================

// Example: Create Asset
const createAsset = async (assetData) => {
    try {
        showLoading('Creating asset...')

        const response = await api.post('/assets', assetData)

        closeAlert()
        await showSuccess('Created!', 'Asset created successfully')

        // Navigate or refresh
    } catch (error) {
        closeAlert()
        showError('Failed to create asset', error.response?.data?.message)
    }
}

// Example: Delete with confirmation
const deleteAsset = async (asset) => {
    const result = await showDeleteConfirm(asset.asset_name)

    if (result.isConfirmed) {
        try {
            showLoading('Deleting...')
            await api.delete(`/assets/${asset.id}`)
            closeAlert()

            showToast('Asset deleted successfully', 'success')
            // Refresh list
        } catch (error) {
            closeAlert()
            showError('Delete Failed', 'Could not delete asset')
        }
    }
}

// Example: Update with validation
const updateAsset = async (assetData) => {
    // Show confirmation
    const result = await showConfirm(
        'Update Asset',
        'Save these changes?',
        { confirmText: 'Save', cancelText: 'Discard' }
    )

    if (result.isConfirmed) {
        try {
            showLoading('Saving changes...')
            await api.put(`/assets/${assetData.id}`, assetData)
            closeAlert()

            showSuccess('Updated!', 'Asset updated successfully')
        } catch (error) {
            closeAlert()
            showError('Update Failed', error.response?.data?.message)
        }
    }
}

// Example: Bulk action
const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) {
        showWarning('No Selection', 'Please select items to delete')
        return
    }

    const result = await showConfirm(
        'Delete Multiple Items',
        `Delete ${selectedIds.length} selected items?`,
        {
            confirmText: 'Delete All',
            icon: 'warning',
            confirmButtonColor: '#ef4444',
        }
    )

    if (result.isConfirmed) {
        try {
            showLoading('Deleting items...')
            await api.post('/assets/bulk-delete', { ids: selectedIds })
            closeAlert()

            showSuccess('Deleted!', `${selectedIds.length} items deleted`)
        } catch (error) {
            closeAlert()
            showError('Failed', 'Could not delete some items')
        }
    }
}

export {
    handleCreateSuccess,
    handleError,
    handleSubmit,
    handleDelete,
    handleProcess,
    handleQuickSave,
    createAsset,
    deleteAsset,
    updateAsset,
    handleBulkDelete,
}
