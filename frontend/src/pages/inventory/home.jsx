import React, { useState, lazy, Suspense } from 'react'
import {
  Package,
  Wrench,
  Clock,
  Building2,
  TrendingUp,
} from 'lucide-react'

// Custom Hooks (data fetching)
import { useAllDashboardData } from '../../hooks/useDashboardData'

// Utility Functions
import {
  calculateKPIMetrics,
  STATUS_COLOR_MAP,
  formatCompactNumber,
} from '../../utils/dashboardUtils'

// UI Components
import DashboardCard from '../../components/dashboard/DashboardCard'
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../../components/dashboard/SkeletonLoader'

// Lazy load heavy chart components for better performance
const MonthlyExpensesChart = lazy(() =>
  import('../../components/dashboard/Charts').then((mod) => ({ default: mod.MonthlyExpensesChart }))
)
const YearlyComparisonChart = lazy(() =>
  import('../../components/dashboard/Charts').then((mod) => ({ default: mod.YearlyComparisonChart }))
)

// Branch Analytics Charts
const BranchComparisonChart = lazy(() =>
  import('../../components/dashboard/BranchCharts').then((mod) => ({ default: mod.BranchComparisonChart }))
)
const BranchExpenseTrendsChart = lazy(() =>
  import('../../components/dashboard/BranchCharts').then((mod) => ({ default: mod.BranchExpenseTrendsChart }))
)
const BranchStatusBreakdownChart = lazy(() =>
  import('../../components/dashboard/BranchCharts').then((mod) => ({ default: mod.BranchStatusBreakdownChart }))
)
const BranchContributionBars = lazy(() =>
  import('../../components/dashboard/BranchCharts').then((mod) => ({ default: mod.BranchContributionBars }))
)

/**
 * Main Dashboard Component
 * Clean architecture with separation of concerns
 */
function InventoryHome() {
  // State Management
  const [selectedBranchesForTrend, setSelectedBranchesForTrend] = useState(null) // null = all branches
  const [showBranchSection, setShowBranchSection] = useState(true)

  // Data Fetching with Custom Hook
  const {
    statistics,
    currentMonthExpenses,
    monthlyExpenses,
    yearlyExpenses,
    branchStatistics,
    isLoading,
  } = useAllDashboardData()

  // Extract Data
  const statsData = statistics.data
  const monthlyExpensesData = Array.isArray(monthlyExpenses.data)
    ? monthlyExpenses.data
    : Array.isArray(monthlyExpenses.data?.data)
      ? monthlyExpenses.data.data
      : []
  const yearlyExpensesData = Array.isArray(yearlyExpenses.data)
    ? yearlyExpenses.data
    : Array.isArray(yearlyExpenses.data?.data)
      ? yearlyExpenses.data.data
      : []
  const currentMonthTotal = currentMonthExpenses.data?.total_expenses || 0

  // Branch Statistics Data
  const branchStats = branchStatistics.data || {}
  const branchSummary = branchStats.summary || []
  const branchMonthlyTrends = branchStats.monthly_trends || []
  const branchStatusBreakdown = branchStats.status_breakdown || []

  // Calculate KPI Metrics
  const kpiMetrics = calculateKPIMetrics(statsData, currentMonthTotal)

  // KPI Cards Configuration
  const kpiCards = [
    {
      label: 'Total Assets',
      value: kpiMetrics.totalAssets.toLocaleString(),
      trend: null,
      trendUp: null,
      icon: Package,
      color: 'blue',
    },
    {
      label: "This Month's Expenses",
      value: formatCompactNumber(kpiMetrics.currentMonthExpenses),
      trend: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
      trendUp: null,
      icon: TrendingUp,
      color: 'indigo',
      isMonetary: true,
    },
    {
      label: 'Under Repair',
      value: kpiMetrics.underRepair.toLocaleString(),
      trend: 'Needs attention',
      trendUp: null,
      icon: Wrench,
      color: 'amber',
    },
    {
      label: 'Due for Maintenance',
      value: kpiMetrics.dueForMaintenance.toLocaleString(),
      trend: 'Warranty expiring',
      trendUp: null,
      icon: Clock,
      color: 'orange',
    },
  ]

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(7)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonTable />
            <SkeletonTable />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              IT Asset Inventory Dashboard
            </h1>

            <p className="text-slate-600">
              Real-time overview of your asset management system
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Financial Charts */}
        <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"><SkeletonChart /><SkeletonChart /></div>}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Expenses */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Monthly Expenses
                </h3>
                <span className="text-xs text-slate-500">
                  Year {new Date().getFullYear()}
                </span>
              </div>
              <MonthlyExpensesChart data={monthlyExpensesData} />

              {/* Summary Cards */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {monthlyExpensesData.slice(-3).map((monthData) => (
                  <div
                    key={monthData.month_key}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      {monthData.month}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      ₱{(parseFloat(monthData.total_cost) / 1000).toFixed(0)}k
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-500">
                          ₱{(parseFloat(monthData.acquisition_cost) / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-500">
                          ₱{(parseFloat(monthData.repair_cost) / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yearly Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Yearly Expenses Comparison
              </h3>
              <YearlyComparisonChart data={yearlyExpensesData} />

              {/* Yearly Summary */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {yearlyExpensesData.map((yearData) => (
                  <div
                    key={yearData.year}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                  >
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      {yearData.year}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      ₱{(parseFloat(yearData.total_cost) / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {yearData.asset_count} assets
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Suspense>

        {/* Branch Analytics Section */}
        {showBranchSection && branchSummary.length > 0 && (
          <Suspense fallback={<div className="mb-8"><SkeletonChart /></div>}>
            <div className="mb-8">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Branch Analytics</h2>
                </div>
                <button
                  onClick={() => setShowBranchSection(false)}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Hide Section
                </button>
              </div>

              {/* Row 1: Branch Comparison + Contribution Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Branch Comparison Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Branch Comparison
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Asset count by status across all branches
                  </p>
                  <BranchComparisonChart
                    data={branchSummary}
                    statusBreakdown={branchStatusBreakdown}
                    statusColorMap={STATUS_COLOR_MAP}
                  />
                </div>

                {/* Branch Contribution Bars (1/3 width) */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Branch Contribution
                  </h3>
                  <BranchContributionBars data={branchSummary} />
                </div>
              </div>

              {/* Row 2: Expense Trends Chart with Branch Filter */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Branch Expense Trends
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Monthly expenses (acquisitions + repairs) over the last 12 months
                    </p>
                  </div>
                  {/* Branch Filter */}
                  <select
                    value={selectedBranchesForTrend || 'all'}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedBranchesForTrend(value === 'all' ? null : [value])
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Branches</option>
                    {[...branchSummary]
                      .sort((a, b) => {
                        const codeA = a.brcode || '';
                        const codeB = b.brcode || '';
                        return codeA.localeCompare(codeB);
                      })
                      .map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                  </select>
                </div>
                <BranchExpenseTrendsChart
                  data={branchMonthlyTrends}
                  selectedBranches={selectedBranchesForTrend}
                  branchSummary={branchSummary}
                />
              </div>

              {/* Status Breakdown Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Asset Status Breakdown by Branch
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Distribution of asset statuses across branches
                </p>
                <BranchStatusBreakdownChart
                  data={branchStatusBreakdown}
                  statusColorMap={STATUS_COLOR_MAP}
                  branchSummary={branchSummary}
                />
              </div>
            </div>
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default InventoryHome
