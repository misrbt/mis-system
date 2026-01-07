/**
 * Custom hook for fetching asset dropdown data
 * Consolidates categories, statuses, and vendors queries
 */

import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import { normalizeArrayResponse } from '../utils/assetFormatters'

export const useAssetDropdownData = () => {
  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Fetch statuses
  const {
    data: statusesData,
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  // Fetch vendors
  const {
    data: vendorsData,
    isLoading: isLoadingVendors,
    error: vendorsError,
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  // Normalize data
  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const statuses = Array.isArray(statusesData) ? statusesData : []
  const vendors = Array.isArray(vendorsData) ? vendorsData : []

  // Create status color map for easy lookup
  const statusColorMap = statuses.reduce((acc, status) => {
    acc[status.id] = status.color || '#64748b'
    return acc
  }, {})

  // Create category name map for easy lookup
  const categoryNameMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name
    return acc
  }, {})

  // Create vendor name map for easy lookup
  const vendorNameMap = vendors.reduce((acc, vendor) => {
    acc[vendor.id] = vendor.company_name
    return acc
  }, {})

  return {
    // Data
    categories,
    statuses,
    vendors,

    // Helper maps
    statusColorMap,
    categoryNameMap,
    vendorNameMap,

    // Loading states
    isLoading: isLoadingCategories || isLoadingStatuses || isLoadingVendors,
    isLoadingCategories,
    isLoadingStatuses,
    isLoadingVendors,

    // Error states
    hasError: !!categoriesError || !!statusesError || !!vendorsError,
    categoriesError,
    statusesError,
    vendorsError,
  }
}
