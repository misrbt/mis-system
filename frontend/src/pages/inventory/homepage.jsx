import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  CheckCircle,
  UserCheck,
  Wrench,
  Clock,
  XCircle,
  Plus,
  UserPlus,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  Send,
  Settings,
  QrCode,
  Upload,
  Printer,
  FileText,
  AlertTriangle,
  Building2,
  MapPin,
  Hash,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import apiClient from '../../services/apiClient'

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
        <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
        <p className="text-sm font-bold text-blue-600">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

// Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    Available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    'Under Repair': 'bg-amber-100 text-amber-700 border-amber-200',
    Retired: 'bg-slate-100 text-slate-700 border-slate-200',
    Lost: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[status] || config.Available}`}>
      {status}
    </span>
  )
}

// Priority badge component
const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-slate-100 text-slate-700',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config[priority] || config.Low}`}>
      {priority}
    </span>
  )
}

// Skeleton loader component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
    <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-20"></div>
  </div>
)

function InventoryHome() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('30')
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch dashboard statistics
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/statistics')
      return response.data.data
    },
  })

  // Fetch assets needing attention
  const { data: attentionAssetsData } = useQuery({
    queryKey: ['assets-needing-attention'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/assets-needing-attention', {
        params: { limit: 50 }
      })
      return response.data.data
    },
  })

  // Fetch recent activity
  const { data: recentActivityData } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/recent-activity', {
        params: { limit: 10 }
      })
      return response.data.data
    },
  })

  // Fetch current month's expenses
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const { data: currentMonthExpensesData } = useQuery({
    queryKey: ['current-month-expenses', currentYear, currentMonth],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/expense-trends', {
        params: { year: currentYear, month: currentMonth }
      })
      return response.data.data
    },
  })

  // Fetch monthly expenses
  const { data: monthlyExpensesData } = useQuery({
    queryKey: ['monthly-expenses'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/monthly-expenses')
      return response.data.data
    },
  })

  // Fetch yearly expenses
  const { data: yearlyExpensesData } = useQuery({
    queryKey: ['yearly-expenses'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/yearly-expenses')
      return response.data.data
    },
  })

  // Fetch branches list for dashboard display
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return response.data.success ? response.data.data : []
    },
  })

  const attentionAssets = attentionAssetsData || []
  const recentActivity = recentActivityData || []
  const monthlyExpenses = monthlyExpensesData || []
  const yearlyExpenses = yearlyExpensesData || []
  const branches = branchesData || []
  const currentMonthExpenses = currentMonthExpensesData || {}
  const currentMonthTotal = currentMonthExpenses.total_expenses || 0

  const counts = statsData?.counts || {}
  const assetsByCategory = statsData?.assets_by_category || []
  const assetsByStatus = statsData?.assets_by_status || []
  const monthlyAcquisitions = statsData?.monthly_acquisitions || []

  // Prepare chart data
  const categoryChartData = assetsByCategory.map(item => ({
    name: item.category,
    value: item.count,
  }))

  const statusChartData = assetsByStatus.map(item => ({
    name: item.status,
    value: item.count,
    color: item.color || '#64748b',
  }))

  const trendChartData = monthlyAcquisitions.slice(-6).map((item, index) => ({
    month: item.month?.substring(5) || '',
    repairs: 15 - index * 2, // Static trend for demonstration
  }))

  // KPI cards configuration
  const kpiCards = [
    {
      label: 'Total Assets',
      value: counts.total_assets || 0,
      trend: '+12%',
      trendUp: true,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'This Month\'s Expenses',
      value: `₱${currentMonthTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      trend: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
      trendUp: null,
      icon: TrendingUp,
      color: 'indigo',
      isMonetary: true,
    },
    {
      label: 'Available',
      value: assetsByStatus.find(s => s.status === 'Available')?.count || 0,
      trend: '+8%',
      trendUp: true,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      label: 'Assigned',
      value: assetsByStatus.find(s => s.status === 'Assigned')?.count || 0,
      trend: '+15%',
      trendUp: true,
      icon: UserCheck,
      color: 'blue',
    },
    {
      label: 'Under Repair',
      value: counts.active_repairs || 0,
      trend: '-5%',
      trendUp: false,
      icon: Wrench,
      color: 'amber',
    },
    {
      label: 'Due for Maintenance',
      value: counts.warranty_expiring_soon || 0,
      trend: '+3%',
      trendUp: true,
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Returned',
      value: (assetsByStatus.find(s => s.status === 'Retired')?.count || 0) + (assetsByStatus.find(s => s.status === 'Lost')?.count || 0),
      trend: '+2%',
      trendUp: true,
      icon: XCircle,
      color: 'slate',
    },
  ]

  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600',
    slate: 'from-slate-500 to-slate-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  // Status filter chips
  const statusFilters = ['Available', 'Assigned', 'Under Repair', 'Retired']

  const toggleStatus = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  // Pagination
  const totalPages = Math.ceil(attentionAssets.length / itemsPerPage)
  const paginatedAssets = attentionAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IT Asset Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Inventory overview, assignments, and maintenance health</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Global Search */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Asset Tag, Serial, Model, Employee, Branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-3 lg:col-span-2">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="md:col-span-3 lg:col-span-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          {/* Status Filters */}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-slate-600">{card.label}</p>
                <div className={`w-10 h-10 bg-gradient-to-br ${colorMap[card.color]} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">{card.value}</p>
              <div className="flex items-center gap-1 text-xs">
                {card.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={card.trendUp ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                  {card.trend}
                </span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assets by Category */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Assets by Category</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No category data</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Asset Status Distribution</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No status data</p>
              </div>
            </div>
          )}
        </div>

        {/* Repairs Trend */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Repairs Trend</h3>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="repairs" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Wrench className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No repair data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Tracking Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Monthly Expenses</h3>
            <span className="text-xs text-slate-500">Year {new Date().getFullYear()}</span>
          </div>
          {monthlyExpenses.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">{payload[0].payload.month}</p>
                            <div className="space-y-1">
                              <p className="text-xs text-emerald-600">
                                Acquisitions: ₱{parseFloat(payload[0].payload.acquisition_cost).toLocaleString()}
                              </p>
                              <p className="text-xs text-amber-600">
                                Repairs: ₱{parseFloat(payload[0].payload.repair_cost).toLocaleString()}
                              </p>
                              <p className="text-xs font-bold text-slate-900 border-t pt-1">
                                Total: ₱{parseFloat(payload[0].payload.total_cost).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="acquisition_cost" stackId="a" fill="#10b981" name="Acquisitions" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="repair_cost" stackId="a" fill="#f59e0b" name="Repairs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {monthlyExpenses.slice(-3).map((monthData) => (
                  <div key={monthData.month_key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">{monthData.month}</p>
                    <p className="text-lg font-bold text-slate-900">₱{parseFloat(monthData.total_cost).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-500">₱{parseFloat(monthData.acquisition_cost).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-500">₱{parseFloat(monthData.repair_cost).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No expense data</p>
              </div>
            </div>
          )}
        </div>

        {/* Yearly Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Yearly Expenses Comparison</h3>
            <span className="text-xs text-slate-500">Last 3 Years</span>
          </div>
          {yearlyExpenses.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={yearlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">{payload[0].payload.year}</p>
                            <div className="space-y-1">
                              <p className="text-xs text-emerald-600">
                                Acquisitions: ₱{parseFloat(payload[0].payload.acquisition_cost).toLocaleString()}
                              </p>
                              <p className="text-xs text-amber-600">
                                Repairs: ₱{parseFloat(payload[0].payload.repair_cost).toLocaleString()}
                              </p>
                              <p className="text-xs font-bold text-slate-900 border-t pt-1">
                                Total: ₱{parseFloat(payload[0].payload.total_cost).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-600 border-t pt-1">
                                Assets: {payload[0].payload.asset_count}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="acquisition_cost" fill="#3b82f6" name="Acquisitions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="repair_cost" fill="#f59e0b" name="Repairs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {yearlyExpenses.map((yearData) => (
                  <div key={yearData.year} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">{yearData.year}</p>
                    <p className="text-lg font-bold text-slate-900">₱{parseFloat(yearData.total_cost).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{yearData.asset_count} assets</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No expense data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Assets Table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Assets Needing Attention</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Asset Tag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Warranty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedAssets.length > 0 ? (
                  paginatedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900 whitespace-nowrap">{asset.asset_tag}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{asset.item}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{asset.branch}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{asset.assigned_to}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{asset.warranty_expiry}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{asset.next_maintenance}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={asset.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative group">
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Send className="w-4 h-4" /> Assign/Transfer
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Create Ticket
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Settings className="w-4 h-4" /> Mark Repaired
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Retire
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle className="w-16 h-16 mb-3 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No assets need attention</p>
                        <p className="text-xs text-slate-500 mt-1">All assets are in good standing</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {paginatedAssets.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, attentionAssets.length)} of {attentionAssets.length} assets
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Branches */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Branches</h3>
              <Link to="/inventory/branch" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Manage
              </Link>
            </div>
            {branchesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : branches.length > 0 ? (
              <div className="space-y-3">
                {branches.map((branch) => (
                  <div key={branch.id} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{branch.branch_name}</p>
                      <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {branch.brak || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {branch.brcode || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No branches found.</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.action}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {activity.user} · {activity.asset}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <QrCode className="w-5 h-5 text-slate-600" />
                Scan QR Code
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <Upload className="w-5 h-5 text-slate-600" />
                Import CSV
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <Printer className="w-5 h-5 text-slate-600" />
                Print QR Labels
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-slate-600" />
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryHome
