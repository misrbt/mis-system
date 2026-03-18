/**
 * Custom Hooks - Centralized exports for all custom hooks
 */

// CRUD and Form Management
export { useFormModal } from './useFormModal'
export { useCRUDPage } from './useCRUDPage'

// Asset Management
export { useAssetQueryInvalidation } from './useAssetQueryInvalidation'
export { useAssetDropdownData } from './useAssetDropdownData'
export { useAssetForm } from './useAssetForm'
export { useQRCode } from './useQRCode'

// Dashboard
export { useDashboardData } from './useDashboardData'

// Repairs
export { useRepairReminders } from './useRepairReminders'
export { useUnderRepairReminder } from './useUnderRepairReminder'

// Utilities
export { usePing } from './usePing'
export { useDebounce, useDebouncedCallback } from './useDebounce'
