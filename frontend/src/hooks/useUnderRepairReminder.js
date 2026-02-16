import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import apiClient from '../services/apiClient'

const DISMISSED_KEY = 'under_repair_reminder_dismissed'
const DISMISSED_EXPIRY_KEY = 'under_repair_reminder_dismissed_expiry'

/**
 * Custom hook for managing "Under Repair" asset status reminders.
 * Shows a popup whenever there are assets with "Under Repair" status.
 * Dismissal lasts for the current session (8 hours), then reappears on next login.
 * If no assets are under repair, the modal won't show regardless of dismissal state.
 */
export const useUnderRepairReminder = (options = {}) => {
    const { enabled = true } = options
    const [isDismissed, setIsDismissed] = useState(false)
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false)

    // Check localStorage for dismissed state on mount
    useEffect(() => {
        try {
            const dismissedExpiry = localStorage.getItem(DISMISSED_EXPIRY_KEY)

            if (dismissedExpiry) {
                const expiryTime = parseInt(dismissedExpiry, 10)
                if (Date.now() < expiryTime) {
                    setIsDismissed(true)
                } else {
                    // Clear expired dismissal
                    localStorage.removeItem(DISMISSED_KEY)
                    localStorage.removeItem(DISMISSED_EXPIRY_KEY)
                }
            }
        } catch (error) {
            console.error('Error reading under repair reminder dismissal state:', error)
        }
        setHasCheckedStorage(true)
    }, [])

    // Fetch under-repair assets
    const {
        data: reminderData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['under-repair-assets-reminder'],
        queryFn: async () => {
            const response = await apiClient.get('/dashboard/under-repair-assets')
            return response.data.data
        },
        enabled: enabled && hasCheckedStorage && !isDismissed,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })

    // Dismiss reminders for the current session
    const dismissReminder = useCallback(() => {
        try {
            // Set expiry to 8 hours (same pattern as repair reminders)
            const expiryTime = Date.now() + (8 * 60 * 60 * 1000)
            localStorage.setItem(DISMISSED_KEY, 'true')
            localStorage.setItem(DISMISSED_EXPIRY_KEY, expiryTime.toString())
            setIsDismissed(true)
        } catch (error) {
            console.error('Error storing under repair reminder dismissal:', error)
        }
    }, [])

    // Clear dismissal (for testing)
    const clearDismissal = useCallback(() => {
        try {
            localStorage.removeItem(DISMISSED_KEY)
            localStorage.removeItem(DISMISSED_EXPIRY_KEY)
            setIsDismissed(false)
        } catch (error) {
            console.error('Error clearing under repair reminder dismissal:', error)
        }
    }, [])

    // Derived state
    const hasUnderRepair = reminderData?.has_under_repair ?? false
    const underRepairAssets = reminderData?.assets ?? []
    const underRepairCount = reminderData?.count ?? 0

    // Show modal only if we have under-repair assets and haven't dismissed
    const shouldShowModal = hasCheckedStorage && !isDismissed && hasUnderRepair && !isLoading

    return {
        // Data
        reminderData,
        underRepairAssets,
        underRepairCount,
        hasUnderRepair,

        // State
        isLoading: isLoading || !hasCheckedStorage,
        isError,
        error,
        isDismissed,
        shouldShowModal,

        // Actions
        dismissReminder,
        clearDismissal,
        refetch,
    }
}

export default useUnderRepairReminder
