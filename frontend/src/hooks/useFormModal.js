/**
 * Custom hook for modal form handling
 * Consolidates form state, validation, and mutation logic (DRY principle)
 */

import { useState, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'

/**
 * @typedef {Object} ValidationRule
 * @property {boolean} [required] - Field is required
 * @property {number} [minLength] - Minimum character length
 * @property {number} [maxLength] - Maximum character length
 * @property {string} [label] - Human-readable field name for error messages
 * @property {RegExp} [pattern] - Regex pattern to match
 * @property {function(any): string|null} [custom] - Custom validation function returning error message or null
 */

/**
 * @typedef {Object} UseFormModalOptions
 * @property {Object} [initialData] - Initial form data
 * @property {Object<string, ValidationRule>} [validationRules] - Validation rules per field
 * @property {function(Object): Promise} mutationFn - Mutation function to call on submit
 * @property {function(any): void} [onSuccess] - Callback on successful mutation
 * @property {function(Error): void} [onError] - Callback on mutation error
 * @property {function(): void} [onClose] - Callback to close the modal
 * @property {string} [successTitle] - Title for success alert
 * @property {string} [successMessage] - Message for success alert
 * @property {string} [errorTitle] - Title for error alert
 * @property {boolean} [showSuccessAlert] - Whether to show success alert (default: true)
 * @property {boolean} [showErrorAlert] - Whether to show error alert (default: true)
 * @property {boolean} [autoCloseOnSuccess] - Auto close modal on success (default: true)
 */

/**
 * Hook for managing modal forms with validation and mutations
 * @param {UseFormModalOptions} options
 */
export function useFormModal({
  initialData = {},
  validationRules = {},
  mutationFn,
  onSuccess,
  onError,
  onClose,
  successTitle = 'Success',
  successMessage = 'Operation completed successfully',
  errorTitle = 'Error',
  showSuccessAlert = true,
  showErrorAlert = true,
  autoCloseOnSuccess = true,
}) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Reset form when initialData changes (e.g., when opening modal with different data)
  useEffect(() => {
    setFormData(initialData)
    setErrors({})
    setTouched({})
  }, [JSON.stringify(initialData)])

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {string|null} Error message or null
   */
  const validateField = useCallback((field, value) => {
    const rules = validationRules[field]
    if (!rules) return null

    const label = rules.label || field

    // Required check
    if (rules.required) {
      if (value === null || value === undefined) {
        return `${label} is required`
      }
      if (typeof value === 'string' && value.trim() === '') {
        return `${label} is required`
      }
    }

    // Skip other validations if empty and not required
    if (value === null || value === undefined || value === '') {
      return null
    }

    // Min length check
    if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) {
      return `${label} must be at least ${rules.minLength} characters`
    }

    // Max length check
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `${label} must not exceed ${rules.maxLength} characters`
    }

    // Pattern check
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${label} format is invalid`
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }, [validationRules])

  /**
   * Validate all fields
   * @returns {boolean} True if valid
   */
  const validate = useCallback(() => {
    const newErrors = {}

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, validationRules, validateField])

  /**
   * Handle form reset
   */
  const reset = useCallback(() => {
    setFormData(initialData)
    setErrors({})
    setTouched({})
  }, [initialData])

  /**
   * Handle modal close with reset
   */
  const handleClose = useCallback(() => {
    reset()
    onClose?.()
  }, [reset, onClose])

  // Mutation setup
  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (showSuccessAlert) {
        Swal.fire({
          icon: 'success',
          title: successTitle,
          text: successMessage,
          timer: 2000,
          showConfirmButton: false,
        })
      }

      onSuccess?.(data)

      if (autoCloseOnSuccess) {
        handleClose()
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Operation failed'
      const validationErrors = error.response?.data?.errors || {}

      setErrors((prev) => ({ ...prev, ...validationErrors }))

      if (showErrorAlert) {
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
        })
      }

      onError?.(error)
    },
  })

  /**
   * Handle form submission
   * @param {Event} [e] - Form event
   */
  const handleSubmit = useCallback((e) => {
    e?.preventDefault()

    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
      })
      return
    }

    mutation.mutate(formData)
  }, [validate, mutation, formData])

  /**
   * Update a single field
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Mark as touched
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [errors])

  /**
   * Create an onChange handler for a field
   * @param {string} field - Field name
   * @returns {function} Event handler
   */
  const handleChange = useCallback((field) => (e) => {
    const value = e?.target?.value !== undefined ? e.target.value : e
    setField(field, value)
  }, [setField])

  /**
   * Create an onBlur handler for a field (validates on blur)
   * @param {string} field - Field name
   * @returns {function} Event handler
   */
  const handleBlur = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }))
    }
  }, [formData, validateField])

  /**
   * Get character count info for a field
   * @param {string} field - Field name
   * @returns {{ current: number, min: number|null, isValid: boolean }}
   */
  const getCharCount = useCallback((field) => {
    const value = formData[field] || ''
    const rules = validationRules[field]
    const min = rules?.minLength || null

    return {
      current: typeof value === 'string' ? value.length : 0,
      min,
      isValid: min ? value.length >= min : true,
    }
  }, [formData, validationRules])

  return {
    // Form state
    formData,
    setFormData,
    errors,
    touched,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,

    // Actions
    handleSubmit,
    handleChange,
    handleBlur,
    handleClose,
    setField,
    reset,
    validate,

    // Utilities
    getCharCount,

    // Mutation object for advanced usage
    mutation,
  }
}

export default useFormModal
