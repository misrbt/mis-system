/**
 * Custom hook for managing asset form state and validation
 * Consolidates edit and add form logic
 */

import { useState } from 'react'
import Swal from 'sweetalert2'
import { isValidNumber, isValidDate } from '../utils/assetFormatters'

const INITIAL_FORM_STATE = {
  asset_name: '',
  asset_category_id: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  acq_cost: '',
  waranty_expiration_date: '',
  estimate_life: '',
  vendor_id: '',
  remarks: '',
  assigned_to_employee_id: '',
}

export const useAssetForm = (initialData = INITIAL_FORM_STATE) => {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  /**
   * Handle single field change
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  /**
   * Handle multiple field changes at once
   */
  const handleMultipleChanges = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  /**
   * Mark a field as touched
   */
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  /**
   * Reset form to initial state or provided data
   */
  const resetForm = (data = INITIAL_FORM_STATE) => {
    setFormData(data)
    setErrors({})
    setTouched({})
  }

  /**
   * Validate individual field
   */
  const validateField = (field, value) => {
    const validationRules = {
      asset_name: {
        required: true,
        message: 'Asset name is required',
      },
      asset_category_id: {
        required: true,
        message: 'Category is required',
      },
      purchase_date: {
        required: true,
        validate: (val) => isValidDate(val),
        message: 'Valid purchase date is required',
      },
      acq_cost: {
        required: true,
        validate: (val) => isValidNumber(val) && Number(val) > 0,
        message: 'Acquisition cost must be a valid positive number',
      },
      estimate_life: {
        validate: (val) => !val || (isValidNumber(val) && Number(val) > 0),
        message: 'Estimated life must be a positive number',
      },
      waranty_expiration_date: {
        validate: (val) => !val || isValidDate(val),
        message: 'Invalid warranty expiration date',
      },
    }

    const rule = validationRules[field]
    if (!rule) return null

    // Check required
    if (rule.required && !value) {
      return rule.message
    }

    // Check custom validation
    if (rule.validate && value && !rule.validate(value)) {
      return rule.message
    }

    return null
  }

  /**
   * Validate entire form
   * Returns true if valid, false if invalid (and shows SweetAlert)
   */
  const validateForm = (showAlert = true) => {
    const newErrors = {}

    // Required fields validation
    const requiredFields = [
      { field: 'asset_name', label: 'Asset Name' },
      { field: 'asset_category_id', label: 'Category' },
      { field: 'purchase_date', label: 'Purchase Date' },
      { field: 'acq_cost', label: 'Acquisition Cost' },
    ]

    for (const { field, label } of requiredFields) {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`
      }
    }

    // Acquisition cost validation
    if (formData.acq_cost) {
      if (!isValidNumber(formData.acq_cost) || Number(formData.acq_cost) <= 0) {
        newErrors.acq_cost = 'Acquisition cost must be a valid positive number'
      }
    }

    // Purchase date validation
    if (formData.purchase_date && !isValidDate(formData.purchase_date)) {
      newErrors.purchase_date = 'Invalid purchase date'
    }

    // Warranty date validation
    if (formData.waranty_expiration_date && !isValidDate(formData.waranty_expiration_date)) {
      newErrors.waranty_expiration_date = 'Invalid warranty expiration date'
    }

    // Estimated life validation
    if (formData.estimate_life) {
      if (!isValidNumber(formData.estimate_life) || Number(formData.estimate_life) <= 0) {
        newErrors.estimate_life = 'Estimated life must be a positive number'
      }
    }

    // Warranty should not be before purchase date
    if (
      formData.purchase_date &&
      formData.waranty_expiration_date &&
      isValidDate(formData.purchase_date) &&
      isValidDate(formData.waranty_expiration_date)
    ) {
      const purchaseDate = new Date(formData.purchase_date)
      const warrantyDate = new Date(formData.waranty_expiration_date)
      if (warrantyDate < purchaseDate) {
        newErrors.waranty_expiration_date = 'Warranty expiration cannot be before purchase date'
      }
    }

    setErrors(newErrors)

    const isValid = Object.keys(newErrors).length === 0

    // Show error alert if validation fails
    if (!isValid && showAlert) {
      const firstError = Object.values(newErrors)[0]
      Swal.fire({
        title: 'Validation Error',
        text: firstError,
        icon: 'error',
        confirmButtonColor: '#3b82f6',
      })
    }

    return isValid
  }

  /**
   * Check if form has unsaved changes
   */
  const hasChanges = (originalData = INITIAL_FORM_STATE) => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  /**
   * Get form data with proper type conversions
   */
  const getFormattedFormData = () => {
    return {
      ...formData,
      acq_cost: formData.acq_cost ? Number(formData.acq_cost) : null,
      estimate_life: formData.estimate_life ? Number(formData.estimate_life) : null,
      asset_category_id: formData.asset_category_id || null,
      vendor_id: formData.vendor_id || null,
      assigned_to_employee_id: formData.assigned_to_employee_id || null,
    }
  }

  return {
    // State
    formData,
    errors,
    touched,

    // Actions
    handleChange,
    handleMultipleChanges,
    handleBlur,
    resetForm,
    setFormData,

    // Validation
    validateField,
    validateForm,
    hasChanges,

    // Helpers
    getFormattedFormData,
    isValid: Object.keys(errors).length === 0,
  }
}
