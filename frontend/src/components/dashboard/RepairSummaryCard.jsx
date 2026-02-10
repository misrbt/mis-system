import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Wrench, AlertTriangle, Clock, ArrowRight, CheckCircle, Package, Calendar } from 'lucide-react'
import { fetchRepairDashboardSummary } from '../../services/repairService'

/**
 * Repair Summary Card for Inventory Dashboard
 * Displays repair statistics, latest repairs, and overdue alerts
 */
function RepairSummaryCard() {
  const navigate = useNavigate()

  const { data: summaryData, isLoading, isError } = useQuery({
    queryKey: ['repair-dashboard-summary'],
    queryFn: async () => {
      const response = await fetchRepairDashboardSummary()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-slate-200 rounded w-40" />
          <div className="h-8 bg-slate-200 rounded w-24" />
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>Failed to load repair summary</p>
        </div>
      </div>
    )
  }

  const counts = summaryData?.counts || {}
  const latestRepairs = summaryData?.latest_repairs || []
  const overdueRepairs = summaryData?.overdue_repairs || []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDueStatusBadge = (dueStatus, daysUntilDue) => {
    if (dueStatus === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          {Math.abs(daysUntilDue)}d overdue
        </span>
      )
    }
    if (dueStatus === 'due_soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
          <Clock className="w-3 h-3" />
          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`}
        </span>
      )
    }
    return null
  }

  const getStatusBadge = (status) => {
    const config = {
      Pending: { color: 'yellow', label: 'Pending' },
      'In Repair': { color: 'blue', label: 'Under Repair' },
      Completed: { color: 'green', label: 'Completed' },
    }
    const { color, label } = config[status] || { color: 'slate', label: status }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${color}-100 text-${color}-700`}>
        {label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
            <Wrench className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Repair Summary</h3>
            <p className="text-sm text-slate-500">{counts.active || 0} active repairs</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/inventory/repairs')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-yellow-700">Pending</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-900">{counts.pending || 0}</p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-700">Under Repair</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-900">{counts.in_repair || 0}</p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Due Soon</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-900">{counts.due_soon || 0}</p>
        </div>

        <div className={`p-3 rounded-lg ${
          counts.overdue > 0 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-green-50 border border-green-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${
              counts.overdue > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              Overdue
            </span>
            {counts.overdue > 0 ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className={`mt-1 text-2xl font-bold ${
            counts.overdue > 0 ? 'text-red-900' : 'text-green-900'
          }`}>
            {counts.overdue || 0}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueRepairs.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h4 className="text-sm font-semibold text-red-800">Overdue Repairs</h4>
          </div>
          <div className="space-y-2">
            {overdueRepairs.slice(0, 3).map((repair) => (
              <div
                key={repair.id}
                className="flex items-center justify-between gap-3 p-2 bg-white/50 rounded-md"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Package className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-slate-900 truncate block">
                      {repair.asset_name}
                    </span>
                    {repair.expected_return_date && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Due: {formatDate(repair.expected_return_date)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs font-semibold text-red-600">
                  {repair.days_overdue}d overdue
                </span>
              </div>
            ))}
          </div>
          {overdueRepairs.length > 3 && (
            <button
              onClick={() => navigate('/inventory/repairs?status=overdue')}
              className="mt-3 text-xs font-medium text-red-700 hover:text-red-800"
            >
              View all {overdueRepairs.length} overdue repairs →
            </button>
          )}
        </div>
      )}

      {/* Latest Repairs */}
      {latestRepairs.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Latest Active Repairs</h4>
          <div className="space-y-2">
            {latestRepairs.map((repair) => (
              <div
                key={repair.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                onClick={() => navigate(`/inventory/repairs`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-white rounded-md border border-slate-200">
                    <Wrench className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {repair.asset_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500 truncate">
                        {repair.vendor_name}
                      </p>
                      {repair.expected_return_date && (
                        <>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(repair.expected_return_date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getStatusBadge(repair.status)}
                  {getDueStatusBadge(repair.due_status, repair.days_until_due)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Wrench className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No active repairs</p>
        </div>
      )}
    </div>
  )
}

export default RepairSummaryCard
