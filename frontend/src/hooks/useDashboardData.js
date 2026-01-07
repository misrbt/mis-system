import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/apiClient'

/**
 * Custom hook for fetching dashboard statistics
 * Implements data fetching logic with React Query
 */
export const useDashboardStatistics = () => {
  return useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/statistics')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Custom hook for fetching assets needing attention
 */
export const useAssetsNeedingAttention = (limit = 50) => {
  return useQuery({
    queryKey: ['assets-needing-attention', limit],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/assets-needing-attention', {
        params: { limit }
      })
      return response.data.data
    },
    staleTime: 3 * 60 * 1000,
  })
}

/**
 * Custom hook for fetching recent activity
 */
export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/recent-activity', {
        params: { limit }
      })
      return response.data.data
    },
    staleTime: 1 * 60 * 1000, // Fresh for 1 minute
  })
}

/**
 * Custom hook for fetching current month expenses
 */
export const useCurrentMonthExpenses = (year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  const currentYear = year
  const currentMonth = month

  return useQuery({
    queryKey: ['current-month-expenses', currentYear, currentMonth],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/expense-trends', {
        params: { year: currentYear, month: currentMonth }
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Custom hook for fetching monthly expenses
 */
export const useMonthlyExpenses = () => {
  return useQuery({
    queryKey: ['monthly-expenses'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/monthly-expenses')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Custom hook for fetching yearly expenses
 */
export const useYearlyExpenses = () => {
  return useQuery({
    queryKey: ['yearly-expenses'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/yearly-expenses')
      return response.data.data
    },
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes (changes rarely)
  })
}

/**
 * Custom hook for fetching branches
 */
export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return response.data.success ? response.data.data : []
    },
    staleTime: 15 * 60 * 1000, // Fresh for 15 minutes (rarely changes)
  })
}

/**
 * Custom hook for fetching branch statistics
 */
export const useBranchStatistics = (months = 12) => {
  return useQuery({
    queryKey: ['branch-statistics', months],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/branch-statistics', {
        params: { months }
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  })
}

/**
 * Composite hook that fetches all dashboard data
 * Use this for convenience when you need all data at once
 */
export const useAllDashboardData = ({ expenseYear, expenseMonth } = {}) => {
  const resolvedYear = expenseYear ?? new Date().getFullYear()
  const resolvedMonth = expenseMonth ?? new Date().getMonth() + 1

  const statistics = useDashboardStatistics()
  const attentionAssets = useAssetsNeedingAttention()
  const recentActivity = useRecentActivity()
  const currentMonthExpenses = useCurrentMonthExpenses(resolvedYear, resolvedMonth)
  const monthlyExpenses = useMonthlyExpenses()
  const yearlyExpenses = useYearlyExpenses()
  const branches = useBranches()
  const branchStatistics = useBranchStatistics()

  return {
    statistics,
    attentionAssets,
    recentActivity,
    currentMonthExpenses,
    monthlyExpenses,
    yearlyExpenses,
    branches,
    branchStatistics,
    isLoading:
      statistics.isLoading ||
      attentionAssets.isLoading ||
      recentActivity.isLoading ||
      currentMonthExpenses.isLoading ||
      monthlyExpenses.isLoading ||
      yearlyExpenses.isLoading ||
      branches.isLoading ||
      branchStatistics.isLoading,
  }
}
