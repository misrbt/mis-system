/**
 * Custom hook for asset-related query invalidation
 * Consolidates query invalidation logic across mutations (DRY principle)
 */

import { useQueryClient } from '@tanstack/react-query'

export const useAssetQueryInvalidation = () => {
  const queryClient = useQueryClient()

  /**
   * Invalidate all asset-related queries
   * Used after create, update, delete, status change, transfer, etc.
   *
   * @param {number|string} assetId - The asset ID
   * @param {number|string} employeeId - The employee ID from params
   * @param {number|string} actualEmployeeId - The actual assigned employee ID
   */
  const invalidateAssetRelatedQueries = async (assetId, employeeId, actualEmployeeId) => {
    const queriesToInvalidate = [
      // Asset queries
      { queryKey: ['asset', assetId] },
      { queryKey: ['assets'] },

      // Employee queries
      { queryKey: ['employee', employeeId] },
      { queryKey: ['employee', actualEmployeeId] },

      // Employee assets queries
      { queryKey: ['employeeAssets', employeeId] },
      { queryKey: ['employeeAssets', actualEmployeeId] },

      // Movement tracking queries
      { queryKey: ['asset-movements', assetId] },
      { queryKey: ['asset-assignments', assetId] },
      { queryKey: ['asset-statistics', assetId] },

      // Dashboard queries (if asset changes affect dashboard)
      { queryKey: ['dashboard-statistics'] },
      { queryKey: ['assets-needing-attention'] },
    ]

    // Invalidate all queries in parallel
    await Promise.all(
      queriesToInvalidate.map((query) =>
        queryClient.invalidateQueries(query)
      )
    )
  }

  /**
   * Invalidate only asset-specific queries
   * Use when employee context doesn't change
   */
  const invalidateAssetQueries = async (assetId) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['assets'] }),
      queryClient.invalidateQueries({ queryKey: ['asset-movements', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['asset-assignments', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['asset-statistics', assetId] }),
    ])
  }

  /**
   * Invalidate employee-specific queries
   * Use when employee data changes
   */
  const invalidateEmployeeQueries = async (employeeId) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employeeAssets', employeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
    ])
  }

  /**
   * Invalidate dashboard queries
   * Use when changes affect dashboard statistics
   */
  const invalidateDashboardQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard-statistics'] }),
      queryClient.invalidateQueries({ queryKey: ['assets-needing-attention'] }),
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] }),
    ])
  }

  /**
   * Invalidate all queries (nuclear option)
   * Use sparingly, only when necessary
   */
  const invalidateAllQueries = async () => {
    await queryClient.invalidateQueries()
  }

  return {
    invalidateAssetRelatedQueries,
    invalidateAssetQueries,
    invalidateEmployeeQueries,
    invalidateDashboardQueries,
    invalidateAllQueries,
  }
}
