import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  Calendar,
  Package,
  Wrench,
  Loader2,
  ChevronDown,
  Building2,
  Tag,
  RefreshCw,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import dashboardService from '../../services/dashboardService'
import Swal from 'sweetalert2'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6']

function MonthlyExpensesPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [showDetails, setShowDetails] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  // Check if viewing current month
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth

  // Fetch expense trends for selected period
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['expense-trends', selectedYear, selectedMonth],
    queryFn: () => dashboardService.fetchExpenseTrends(selectedYear, selectedMonth),
    refetchInterval: isCurrentMonth ? 30000 : false, // Refetch every 30 seconds for current month
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Fetch expense breakdown
  const { data: breakdownData, isLoading: breakdownLoading, refetch: refetchBreakdown } = useQuery({
    queryKey: ['expense-breakdown', selectedYear, selectedMonth],
    queryFn: () => dashboardService.fetchExpenseBreakdown(selectedYear, selectedMonth),
    refetchInterval: isCurrentMonth ? 30000 : false, // Refetch every 30 seconds for current month
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Fetch 12-month trend
  const { data: yearlyTrendData, refetch: refetchYearly } = useQuery({
    queryKey: ['monthly-expenses'],
    queryFn: () => dashboardService.fetchMonthlyExpenses(),
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Manual refresh function
  const handleRefresh = () => {
    refetchTrends()
    refetchBreakdown()
    refetchYearly()
    setLastUpdated(new Date())
  }

  // Format last updated time
  const formatLastUpdated = () => {
    const now = new Date()
    const diff = Math.floor((now - lastUpdated) / 1000) // seconds

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return lastUpdated.toLocaleTimeString()
  }

  const trends = trendsData?.data?.data || {}
  const breakdown = breakdownData?.data?.data || {}
  const yearlyTrend = yearlyTrendData?.data?.data || []

  const assetPurchases = trends.asset_purchases || {}
  const repairs = trends.repairs || {}
  const totalExpenses = trends.total_expenses || 0

  // Quick period selection
  const setThisMonth = () => {
    setSelectedYear(currentYear)
    setSelectedMonth(currentMonth)
  }

  const setLastMonth = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    setSelectedYear(date.getFullYear())
    setSelectedMonth(date.getMonth() + 1)
  }

  // Prepare chart data
  const categoryChartData = breakdown.by_category
    ? Object.entries(breakdown.by_category).map(([name, data]) => ({
        name,
        value: data.total_cost || 0,
        count: data.count || 0,
      }))
    : []

  const branchChartData = breakdown.by_branch
    ? Object.entries(breakdown.by_branch).map(([name, data]) => ({
        name,
        value: data.total_cost || 0,
        count: data.count || 0,
      }))
    : []

  const trendChartData = yearlyTrend
    .slice(-12)
    .map((item) => ({
      month: item.month,
      assets: item.acquisition_cost || 0,
      repairs: item.repair_cost || 0,
      total: item.total_cost || 0,
    }))

  const isLoading = trendsLoading || breakdownLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Monthly Expenses</h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Track and analyze IT asset and repair expenses by month
            {isCurrentMonth && <span className="ml-2 text-green-600 font-medium">● Live</span>}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: {formatLastUpdated()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Select Period</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-end gap-2 md:col-span-2">
            <button
              onClick={setThisMonth}
              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={setLastMonth}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Last Month
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading expense data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Purchases */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-10 h-10 opacity-80" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {assetPurchases.count || 0} assets
                </span>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Asset Purchases</p>
                <p className="text-3xl font-bold">
                  ₱{((assetPurchases.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                </p>
              </div>
            </div>

            {/* Repair Costs */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Wrench className="w-10 h-10 opacity-80" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {repairs.count || 0} repairs
                </span>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Repair Costs</p>
                <p className="text-3xl font-bold">
                  ₱{((repairs.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                </p>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg shadow-sm p-6 text-emerald-950">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold">
                  ₱{(totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category - Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Expenses by Category</h3>
              </div>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  No category data for this period
                </div>
              )}
            </div>

            {/* Expenses by Branch - Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">Expenses by Branch</h3>
              </div>
              {branchChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={branchChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  No branch data for this period
                </div>
              )}
            </div>
          </div>

          {/* 12-Month Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">12-Month Expense Trend</h3>
            </div>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="assets" stroke="#3b82f6" name="Asset Purchases" strokeWidth={2} />
                  <Line type="monotone" dataKey="repairs" stroke="#f59e0b" name="Repair Costs" strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke="#10b981" name="Total" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No trend data available
              </div>
            )}
          </div>

          {/* Detailed Tables */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Detailed Breakdown</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showDetails ? 'Hide' : 'Show'} Details
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showDetails && (
              <div className="p-6 space-y-6">
                {/* Asset Purchases Table */}
                {assetPurchases.items && assetPurchases.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Asset Purchases ({assetPurchases.count})</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Asset Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Category
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Purchase Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Branch
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700 uppercase">
                              Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {assetPurchases.items.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-sm text-slate-900">{asset.asset_name}</td>
                              <td className="px-4 py-2 text-sm text-slate-600">{asset.category?.name || '—'}</td>
                              <td className="px-4 py-2 text-sm text-slate-600">
                                {asset.purchase_date
                                  ? new Date(asset.purchase_date).toLocaleDateString()
                                  : '—'}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-600">
                                {asset.assigned_employee?.branch?.branch_name || 'Unassigned'}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                                ₱{(asset.acq_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Repairs Table */}
                {repairs.items && repairs.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Repairs ({repairs.count})</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Asset
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Vendor
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Repair Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700 uppercase">
                              Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {repairs.items.map((repair) => (
                            <tr key={repair.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-sm text-slate-900">{repair.asset?.asset_name || '—'}</td>
                              <td className="px-4 py-2 text-sm text-slate-600">
                                {repair.vendor?.company_name || '—'}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-600">
                                {repair.repair_date
                                  ? new Date(repair.repair_date).toLocaleDateString()
                                  : '—'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {repair.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                                ₱{(repair.repair_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!assetPurchases.items || assetPurchases.items.length === 0) &&
                  (!repairs.items || repairs.items.length === 0) && (
                    <div className="text-center py-8 text-slate-500">No detailed data for this period</div>
                  )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MonthlyExpensesPage
