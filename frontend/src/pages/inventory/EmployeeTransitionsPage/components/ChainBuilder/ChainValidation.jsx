import { Check, AlertCircle, Info } from 'lucide-react'

export function ChainValidation({
  validation,
  transitionMode,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  if (!validation) return null

  const Icon = validation.isValid ? Check : validation.canComplete ? Info : AlertCircle

  const bgColor = validation.isValid
    ? `bg-${colorClass}-50 border-${colorClass}-200`
    : validation.canComplete
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200'

  const textColor = validation.isValid
    ? `text-${colorClass}-700`
    : validation.canComplete
      ? 'text-amber-700'
      : 'text-red-700'

  const iconColor = validation.isValid
    ? `text-${colorClass}-500`
    : validation.canComplete
      ? 'text-amber-500'
      : 'text-red-500'

  return (
    <div className={`mt-4 p-3 rounded-lg border ${bgColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <div>
          <p className={`text-sm font-medium ${textColor}`}>
            {validation.message}
          </p>
          {validation.isValid && validation.isCircular && (
            <p className="text-xs text-slate-500 mt-1">
              Each employee will move to the next employee's workstation, forming a complete rotation.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChainValidation
