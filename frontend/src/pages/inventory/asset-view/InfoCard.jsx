function InfoCard({ label, value, icon }) {
  if (!value) return null

  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-base">{icon}</span>}
        <div className="text-xs font-medium text-slate-600">{label}</div>
      </div>
      <div className="text-sm font-semibold text-slate-900 truncate">{value}</div>
    </div>
  )
}

export default InfoCard
