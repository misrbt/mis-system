import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { fetchRepairReminders } from '../services/repairService'

const REMINDER_DISMISSED_KEY = 'repair_reminders_dismissed'
const REMINDER_DISMISSED_EXPIRY_KEY = 'repair_reminders_dismissed_expiry'

/**
 * Custom hook for managing repair reminders
 * Handles fetching reminders, dismissal state, and localStorage persistence
 */
export const useRepairReminders = (options = {}) => {
    const { enabled = true, dueSoonDays = 4 } = options
    const [isDismissed, setIsDismissed] = useState(false)
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false)

    // Check localStorage for dismissed state on mount
    useEffect(() => {
        try {
            const dismissedExpiry = localStorage.getItem(REMINDER_DISMISSED_EXPIRY_KEY)

            if (dismissedExpiry) {
                const expiryTime = parseInt(dismissedExpiry, 10)
                // Check if dismissal has expired (session-based, or until next login)
                if (Date.now() < expiryTime) {
                    setIsDismissed(true)
                } else {
                    // Clear expired dismissal
                    localStorage.removeItem(REMINDER_DISMISSED_KEY)
                    localStorage.removeItem(REMINDER_DISMISSED_EXPIRY_KEY)
                }
            }
        } catch (error) {
            console.error('Error reading reminder dismissal state:', error)
        }
        setHasCheckedStorage(true)
    }, [])

    // Fetch reminders
    const {
        data: remindersData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['repair-reminders', dueSoonDays],
        queryFn: async () => {
            const response = await fetchRepairReminders(dueSoonDays)
            return response.data.data
        },
        enabled: enabled && hasCheckedStorage && !isDismissed,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })

    // Dismiss reminders for the current session
    const dismissReminders = useCallback(() => {
        try {
            // Set expiry to end of session (or 8 hours as fallback)
            const expiryTime = Date.now() + (8 * 60 * 60 * 1000) // 8 hours
            localStorage.setItem(REMINDER_DISMISSED_KEY, 'true')
            localStorage.setItem(REMINDER_DISMISSED_EXPIRY_KEY, expiryTime.toString())
            setIsDismissed(true)
        } catch (error) {
            console.error('Error storing reminder dismissal:', error)
        }
    }, [])

    // Clear dismissal (for testing)
    const clearDismissal = useCallback(() => {
        try {
            localStorage.removeItem(REMINDER_DISMISSED_KEY)
            localStorage.removeItem(REMINDER_DISMISSED_EXPIRY_KEY)
            setIsDismissed(false)
        } catch (error) {
            console.error('Error clearing reminder dismissal:', error)
        }
    }, [])

    // Derived state
    const hasReminders = remindersData?.has_reminders ?? false
    const overdueRepairs = remindersData?.overdue?.repairs ?? []
    const dueSoonRepairs = remindersData?.due_soon?.repairs ?? []
    const overdueCount = remindersData?.overdue?.count ?? 0
    const dueSoonCount = remindersData?.due_soon?.count ?? 0
    const totalCount = overdueCount + dueSoonCount

    // Should show modal only if we have reminders and haven't dismissed
    const shouldShowModal = hasCheckedStorage && !isDismissed && hasReminders && !isLoading

    // Debug logging
    useEffect(() => {
        if (hasCheckedStorage) {
            console.log('🔧 Repair Reminders Debug:', {
                hasCheckedStorage,
                isDismissed,
                hasReminders,
                isLoading,
                shouldShowModal,
                overdueCount,
                dueSoonCount,
                totalCount,
            })

            if (isDismissed) {
                const expiryTime = localStorage.getItem(REMINDER_DISMISSED_EXPIRY_KEY)
                if (expiryTime) {
                    const expiry = new Date(parseInt(expiryTime, 10))
                    console.log('⏰ Reminder dismissed until:', expiry.toLocaleString())
                }
            }
        }
    }, [hasCheckedStorage, isDismissed, hasReminders, isLoading, shouldShowModal, overdueCount, dueSoonCount, totalCount])

    return {
        // Data
        remindersData,
        overdueRepairs,
        dueSoonRepairs,
        overdueCount,
        dueSoonCount,
        totalCount,
        hasReminders,

        // State
        isLoading: isLoading || !hasCheckedStorage,
        isError,
        error,
        isDismissed,
        shouldShowModal,

        // Actions
        dismissReminders,
        clearDismissal,
        refetch,
    }
}

export default useRepairReminders
