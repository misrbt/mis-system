import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * Reusable KPI Card Component
 * Displays key metrics with icon, value, and trend
 */
const DashboardCard = ({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  color = 'blue',
  isMonetary = false,
  onClick,
  headerAction,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-50 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  const iconBgClass = colorClasses[color] || colorClasses.blue

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBgClass} rounded-lg p-3`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {headerAction && <div className="flex items-center">{headerAction}</div>}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trendUp !== null && (
              <>
                {trendUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </>
            )}
            <p
              className={`text-xs font-medium ${
                trendUp === null
                  ? 'text-slate-600'
                  : trendUp
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              {trend}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(DashboardCard)
