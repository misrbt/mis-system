function StatsCard({ title, value, icon: Icon, color = 'blue', trend, trendValue }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600'
  }

  const bgClass = colorClasses[color] || colorClasses.blue

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 bg-gradient-to-br ${bgClass} rounded-lg flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default StatsCard
