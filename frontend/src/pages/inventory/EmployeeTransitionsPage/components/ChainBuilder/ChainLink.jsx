import { ArrowDown, RotateCcw } from 'lucide-react'

export function ChainLink({
  from,
  to,
  transitionMode,
  isClosing = false,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  return (
    <div className="flex items-center justify-center py-2">
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full
        ${isClosing ? 'bg-purple-100 text-purple-600' : `bg-${colorClass}-50 text-${colorClass}-600`}
      `}>
        {isClosing ? (
          <RotateCcw className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">
          {isClosing ? 'Completes loop' : 'moves to'}
        </span>
      </div>
    </div>
  )
}

export default ChainLink
