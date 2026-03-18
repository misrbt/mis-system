import { Shuffle, AlertCircle, Check } from 'lucide-react'

export function StatusBadge({ isModified, isInExchange, transitionMode, size = 'default' }) {
  const sizeClasses = {
    default: 'text-xs px-2 py-1',
    small: 'text-[10px] px-2 py-1',
  }

  if (!isModified) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 rounded-full whitespace-nowrap ${sizeClasses[size]}`}>
        <Check className="w-3 h-3" />
        Same
      </span>
    )
  }

  if (isInExchange) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-100 rounded-full whitespace-nowrap ${sizeClasses[size]}`}>
        <Shuffle className="w-3 h-3" />
        Exchange
      </span>
    )
  }

  const colorClasses = transitionMode === 'branch'
    ? 'text-teal-700 bg-teal-100'
    : 'text-blue-700 bg-blue-100'

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap ${colorClasses} ${sizeClasses[size]}`}>
      <AlertCircle className="w-3 h-3" />
      Modified
    </span>
  )
}
