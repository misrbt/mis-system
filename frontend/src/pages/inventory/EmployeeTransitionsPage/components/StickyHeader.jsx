import { ArrowLeft, RefreshCw, Save, RotateCw } from 'lucide-react'
import { TRANSITION_MODE_CONFIG } from '../constants'

export function StickyHeader({
  transitionMode,
  modifiedCount,
  exchanges,
  onReset,
  onClear,
  onSubmit,
  isPending,
  onOpenChainBuilder,
}) {
  const config = TRANSITION_MODE_CONFIG[transitionMode]
  const ThemeIcon = config.icon
  const isBranch = transitionMode === 'branch'

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={onReset}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mt-1 sm:mt-0"
              title="Change mode"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow flex-shrink-0 ${
                isBranch
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                <ThemeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {config.title}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-[200px] sm:max-w-none">
                  {config.headerSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-12 sm:ml-0">
            <div className="text-sm w-full sm:w-auto mb-2 sm:mb-0">
              <span className={`font-bold text-lg ${isBranch ? 'text-teal-600' : 'text-blue-600'}`}>
                {modifiedCount}
              </span>
              <span className="text-slate-600 ml-1">modified</span>
              {isBranch && exchanges.length > 0 && (
                <span className="inline-block">
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="font-bold text-purple-600 text-lg">{exchanges.length}</span>
                  <span className="text-slate-600 ml-1">
                    exchange{exchanges.length !== 1 ? 's' : ''}
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {onOpenChainBuilder && (
                <button
                  onClick={onOpenChainBuilder}
                  className={`hidden sm:flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    isBranch
                      ? 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100'
                      : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Build rotation chains for multi-employee swaps"
                >
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  Chain
                </button>
              )}
              <button
                onClick={onClear}
                disabled={modifiedCount === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4 inline mr-1.5" />
                Clear
              </button>
              <button
                onClick={onSubmit}
                disabled={modifiedCount === 0 || isPending}
                className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all whitespace-nowrap ${
                  isBranch ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4 inline mr-1.5" />
                {isPending ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
