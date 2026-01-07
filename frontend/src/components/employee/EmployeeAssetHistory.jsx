import PropTypes from 'prop-types'
import {
  Package,
  User,
  ArrowRight,
  RefreshCw,
  Wrench,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
} from 'lucide-react'

function EmployeeAssetHistory({ movements = [], loading = false, statistics = {} }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">No asset history found</p>
        <p className="text-gray-400 text-sm mt-1">Asset movements will appear here once available</p>
      </div>
    )
  }

  const getMovementIcon = (type) => {
    const iconMap = {
      created: Package,
      assigned: User,
      transferred: ArrowRight,
      returned: User,
      status_changed: RefreshCw,
      repair_initiated: Wrench,
      repair_in_progress: Wrench,
      repair_completed: Wrench,
      repair_returned: Wrench,
      repair_status_changed: Wrench,
      repair_updated: Wrench,
      repair_deleted: Wrench,
      repair_remark_added: MessageSquare,
      updated: FileText,
      disposed: Package,
      code_generated: Package,
      inventory_operation: Package,
    }
    return iconMap[type] || FileText
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const formatMovementType = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium">Total Assets</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{statistics.total_assets || 0}</p>
            <p className="text-xs text-blue-600 mt-1">
              {statistics.currently_assigned || 0} currently assigned
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Total Movements</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{statistics.total_movements || 0}</p>
            <p className="text-xs text-purple-600 mt-1">All activity records</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Movement Types</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {Object.keys(statistics.by_type || {}).length}
            </p>
            <p className="text-xs text-green-600 mt-1">Different activity types</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {movements.map((movement, index) => {
            const Icon = getMovementIcon(movement.movement_type)
            const { date, time } = formatDate(movement.movement_date)
            const colorClass = movement.color || 'bg-blue-100 text-blue-700 border-blue-200'

            return (
              <div key={index} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass} border-2`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          {movement.asset?.asset_name || 'Unknown Asset'}
                        </h4>
                        {movement.asset?.serial_number && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {movement.asset.serial_number}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded border ${colorClass}`}
                        >
                          {formatMovementType(movement.movement_type)}
                        </span>
                      </div>
                      {movement.description && (
                        <p className="text-sm text-gray-700 mt-1">{movement.description}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                      <div className="font-medium text-gray-700">{date}</div>
                      <div>{time}</div>
                    </div>
                  </div>

                  {/* Additional details */}
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                    {movement.asset?.category && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium">Category:</span>
                        <span>{movement.asset.category.name}</span>
                      </div>
                    )}

                    {movement.asset?.status && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="font-medium">Current Status:</span>
                        <span>{movement.asset.status.name}</span>
                      </div>
                    )}

                    {movement.from_employee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">From:</span>
                        <span>{movement.from_employee.fullname}</span>
                        {movement.from_employee.branch && (
                          <span className="text-gray-400">
                            ({movement.from_employee.branch.branch_name})
                          </span>
                        )}
                      </div>
                    )}

                    {movement.to_employee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">To:</span>
                        <span>{movement.to_employee.fullname}</span>
                        {movement.to_employee.branch && (
                          <span className="text-gray-400">
                            ({movement.to_employee.branch.branch_name})
                          </span>
                        )}
                      </div>
                    )}

                    {movement.from_status && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="font-medium">Status Change:</span>
                        <span>{movement.from_status.name}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{movement.to_status?.name || 'Unknown'}</span>
                      </div>
                    )}

                    {movement.repair && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Wrench className="w-3.5 h-3.5" />
                        <span className="font-medium">Repair Vendor:</span>
                        <span>{movement.repair.vendor?.company_name || 'Unknown'}</span>
                      </div>
                    )}

                    {movement.reason && (
                      <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Reason: </span>
                          <span>{movement.reason}</span>
                        </div>
                      </div>
                    )}

                    {movement.remarks && movement.remarks !== movement.reason && (
                      <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Notes: </span>
                          <span>{movement.remarks}</span>
                        </div>
                      </div>
                    )}

                    {movement.performed_by && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <User className="w-3 h-3" />
                        <span>Performed by: {movement.performed_by.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

EmployeeAssetHistory.propTypes = {
  movements: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  statistics: PropTypes.object,
}

export default EmployeeAssetHistory
