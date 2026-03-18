import { ArrowRight, Building2, MapPin, XCircle, RefreshCw, CheckCircle } from 'lucide-react'

export function ReviewStep({
  pendingTransitions,
  transitionMode,
  onClear,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  const exchangeCount = pendingTransitions.filter(t => t.isInExchange).length
  const regularCount = pendingTransitions.length - exchangeCount

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900">Review & Confirm</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Review all pending transitions before executing
        </p>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-6 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${colorClass}-100`}>
            <CheckCircle className={`w-4 h-4 text-${colorClass}-600`} />
            <span className={`text-sm font-medium text-${colorClass}-700`}>
              {pendingTransitions.length} transition{pendingTransitions.length !== 1 ? 's' : ''}
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
      </div>

      {/* Transitions list */}
      <div className="max-h-[350px] overflow-auto divide-y divide-slate-100">
        {pendingTransitions.map(transition => (
          <div
            key={transition.employee.id}
            className={`px-6 py-4 ${transition.isInExchange ? 'bg-purple-50/50' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* Employee */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                  ${transition.isInExchange ? 'bg-purple-500' : `bg-${colorClass}-500`}
                `}>
                  {transition.employee.fullname?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{transition.employee.fullname}</div>
                  {transition.isInExchange && (
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <RefreshCw className="w-3 h-3" />
                      <span>Part of exchange</span>
                    </div>
                  )}
                </div>
              </div>

              {/* From */}
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                  <Building2 className="w-3 h-3" />
                  <span>{transition.from.branch?.branch_name || '-'}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{transition.from.workstation?.position?.title || 'No workstation'}</span>
                </div>
              </div>

              <ArrowRight className={`w-5 h-5 ${transition.isInExchange ? 'text-purple-400' : `text-${colorClass}-400`}`} />

              {/* To */}
              <div className="flex-1 text-sm">
                <div className={`flex items-center gap-1 font-medium ${transition.isInExchange ? 'text-purple-700' : `text-${colorClass}-700`} mb-0.5`}>
                  <Building2 className="w-3 h-3" />
                  <span>{transition.to.branch?.branch_name || '-'}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${transition.isInExchange ? 'text-purple-600' : `text-${colorClass}-600`}`}>
                  <MapPin className="w-3 h-3" />
                  <span>{transition.to.workstation?.position?.title || 'No workstation'}</span>
                </div>
              </div>

              {/* Clear button */}
              <button
                onClick={() => onClear(transition.employee.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from batch"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingTransitions.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No transitions pending. Go back to assign destinations.
          </p>
        </div>
      )}

      {/* Instructions */}
      {pendingTransitions.length > 0 && (
        <div className={`px-6 py-4 border-t border-slate-100 bg-${colorClass}-50`}>
          <p className={`text-sm text-${colorClass}-700`}>
            When you're ready, click the <strong>Execute Transition</strong> button in the header to process all changes.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewStep
