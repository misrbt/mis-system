import { X, MapPin, Building2 } from 'lucide-react'

export function ChainNode({
  detail,
  index,
  transitionMode,
  onRemove,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl border-2
      bg-white border-${colorClass}-200
    `}>
      {/* Index badge */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        bg-${colorClass}-500 text-white font-semibold text-sm
      `}>
        {index + 1}
      </div>

      {/* Employee info */}
      <div className="flex-1">
        <div className="font-medium text-slate-800">{detail.employee.fullname}</div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {detail.employee.branch?.branch_name}
          </span>
          {detail.workstation && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {detail.workstation.position?.title || 'Workstation'}
            </span>
          )}
        </div>
      </div>

      {/* Target indicator */}
      {detail.targetWorkstation && (
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Moving to</div>
          <div className={`text-xs font-medium text-${colorClass}-600`}>
            {detail.targetWorkstation.position?.title || 'Workstation'}
          </div>
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ChainNode
