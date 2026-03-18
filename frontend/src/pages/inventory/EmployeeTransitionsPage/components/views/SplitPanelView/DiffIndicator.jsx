import { ArrowRightLeft, RefreshCw, Users } from 'lucide-react'

export function DiffIndicator({
  totalChanges,
  exchangeCount,
  transitionMode,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  if (totalChanges === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Users className="w-4 h-4" />
        <span className="text-sm">No pending changes</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${colorClass}-100`}>
        <ArrowRightLeft className={`w-4 h-4 text-${colorClass}-600`} />
        <span className={`text-sm font-medium text-${colorClass}-700`}>
          {totalChanges} transition{totalChanges !== 1 ? 's' : ''}
        </span>
      </div>

      {exchangeCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100">
          <RefreshCw className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {exchangeCount} in exchange{exchangeCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default DiffIndicator
