import Swal from 'sweetalert2'

/**
 * Reusable SweetAlert utility for consistent alerts across the application
 */

// Default configuration for all alerts
const defaultConfig = {
    confirmButtonColor: '#3b82f6', // blue-500
    cancelButtonColor: '#6b7280',  // gray-500
    customClass: {
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 rounded-lg font-medium',
    },
}

/**
 * Show success alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {object} options - Additional SweetAlert2 options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 */
export const showSuccess = (title, message = '', options = {}) => {
    return Swal.fire({
        icon: 'success',
        title,
        text: message,
        position: options.position || 'center',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        ...defaultConfig,
        ...options,
    })
}

/**
 * Show error alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {object} options - Additional SweetAlert2 options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 */
export const showError = (title, message = '', options = {}) => {
    return Swal.fire({
        icon: 'error',
        title,
        text: message,
        position: options.position || 'center',
        confirmButtonText: 'OK',
        ...defaultConfig,
        ...options,
    })
}

/**
 * Show warning alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {object} options - Additional SweetAlert2 options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 */
export const showWarning = (title, message = '', options = {}) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text: message,
        position: options.position || 'center',
        confirmButtonText: 'OK',
        ...defaultConfig,
        confirmButtonColor: '#f59e0b', // amber-500
        ...options,
    })
}

/**
 * Show info alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {object} options - Additional SweetAlert2 options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 */
export const showInfo = (title, message = '', options = {}) => {
    return Swal.fire({
        icon: 'info',
        title,
        text: message,
        position: options.position || 'center',
        confirmButtonText: 'OK',
        ...defaultConfig,
        ...options,
    })
}

/**
 * Show confirmation dialog
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {object} options - Additional options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 * @returns {Promise} Resolves to { isConfirmed: boolean }
 */
export const showConfirm = (title, message = '', options = {}) => {
    return Swal.fire({
        icon: 'question',
        title,
        text: message,
        position: options.position || 'center',
        showCancelButton: true,
        confirmButtonText: options.confirmText || 'Yes',
        cancelButtonText: options.cancelText || 'Cancel',
        reverseButtons: true,
        ...defaultConfig,
        ...options,
    })
}

/**
 * Show delete confirmation dialog
 * @param {string} itemName - Name of the item to delete
 * @param {object} options - Additional options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 * @returns {Promise} Resolves to { isConfirmed: boolean }
 */
export const showDeleteConfirm = (itemName = 'this item', options = {}) => {
    return Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        html: `You are about to delete <strong>${itemName}</strong>.<br/>This action cannot be undone.`,
        position: options.position || 'center',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444', // red-500
        reverseButtons: true,
        ...defaultConfig,
        ...options,
    })
}

/**
 * Show loading alert
 * @param {string} title - Loading message
 */
export const showLoading = (title = 'Processing...') => {
    return Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })
}

/**
 * Close any open alert
 */
export const closeAlert = () => {
    Swal.close()
}

/**
 * Show toast notification (small notification at corner)
 * @param {string} message - Toast message
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {object} options - Additional options
 * @param {string} options.position - 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
 */
export const showToast = (message, type = 'success', options = {}) => {
    const Toast = Swal.mixin({
        toast: true,
        position: options.position || 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
    })

    return Toast.fire({
        icon: type,
        title: message,
        ...options,
    })
}

/**
 * Show custom HTML alert
 * @param {string} title - Alert title
 * @param {string} html - HTML content
 * @param {object} options - Additional options
 */
export const showCustom = (title, html, options = {}) => {
    return Swal.fire({
        title,
        html,
        ...defaultConfig,
        ...options,
    })
}

export default {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    closeAlert,
    showToast,
    showCustom,
}
