import { useMemo } from 'react'
import {
  User, UserX, Activity, Wrench, Edit, Trash2,
  Plus, CircleDot, Calendar, Clock, MapPin, MessageSquare,
  QrCode, Database
} from 'lucide-react'

const iconMap = {
  Plus,
  User,
  UserX,
  Activity,
  Wrench,
  Edit,
  Trash2,
  CircleDot,
  QrCode,
  Database,
  MessageSquare,
}

const colorClasses = {
  green: 'bg-green-100 text-green-600 border-green-200',
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  purple: 'bg-purple-100 text-purple-600 border-purple-200',
  orange: 'bg-orange-100 text-orange-600 border-orange-200',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  red: 'bg-red-100 text-red-600 border-red-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
  yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
}

function AssetMovementTimeline({ movements, loading = false }) {
  const sortedMovements = useMemo(() => {
    if (!movements) return []
    return [...movements].sort((a, b) =>
      new Date(b.movement_date) - new Date(a.movement_date)
    )
  }, [movements])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!sortedMovements.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CircleDot className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No movement history available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      {/* Timeline items */}
      <div className="space-y-6">
        {sortedMovements.map((movement) => {
          const IconComponent = iconMap[movement.icon] || CircleDot
          const colorClass = colorClasses[movement.color] || colorClasses.slate
          const movementDate = new Date(movement.movement_date)

          return (
            <div key={movement.id} className="relative flex gap-4 group">
              {/* Icon */}
              <div className={`
                relative z-10 flex items-center justify-center
                w-10 h-10 rounded-full border-2
                ${colorClass}
                transition-transform group-hover:scale-110
              `}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {movement.description}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {movementDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {movementDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Movement type badge */}
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${colorClass}
                    `}>
                      {movement.movement_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mt-3">
                    {/* From/To Employee */}
                    {(movement.from_employee || movement.to_employee) && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>
                          {movement.from_employee && (
                            <span className="text-gray-600">
                              From: <strong>{movement.from_employee.fullname}</strong>
                              {movement.from_employee.branch && (
                                <span className="text-gray-500">
                                  {' '}({movement.from_employee.branch.branch_name})
                                </span>
                              )}
                            </span>
                          )}
                          {movement.from_employee && movement.to_employee && (
                            <span className="mx-2 text-gray-400">→</span>
                          )}
                          {movement.to_employee && (
                            <span className="text-gray-600">
                              To: <strong>{movement.to_employee.fullname}</strong>
                              {movement.to_employee.branch && (
                                <span className="text-gray-500">
                                  {' '}({movement.to_employee.branch.branch_name})
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Status change */}
                    {(movement.from_status || movement.to_status) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span>
                          {movement.from_status && (
                            <span className="text-gray-600">
                              From: <strong>{movement.from_status.name}</strong>
                            </span>
                          )}
                          {movement.from_status && movement.to_status && (
                            <span className="mx-2 text-gray-400">→</span>
                          )}
                          {movement.to_status && (
                            <span className="text-gray-600">
                              To: <strong>{movement.to_status.name}</strong>
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Repair info */}
                    {movement.repair && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Vendor: <strong>{movement.repair.vendor?.company_name || 'N/A'}</strong>
                          {movement.repair.repair_cost && (
                            <span className="ml-2">
                              Cost: <strong>₱{parseFloat(movement.repair.repair_cost).toLocaleString()}</strong>
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Reason */}
                    {movement.reason && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                        <div className="flex items-start gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-blue-900">Reason:</span>
                            <p className="text-blue-800 mt-0.5">{movement.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {movement.remarks && (
                      <div className="text-sm text-gray-600 italic">
                        Note: {movement.remarks}
                      </div>
                    )}

                    {/* Performed by */}
                    {movement.performed_by && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        Performed by: {movement.performed_by.name}
                        {movement.ip_address && ` • IP: ${movement.ip_address}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssetMovementTimeline
