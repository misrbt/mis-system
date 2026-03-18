import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react'

export function ExchangeSummaryPanel({
  exchanges,
  showPanel,
  onTogglePanel,
  employeesData,
  modifications,
  branches,
  positions,
}) {
  if (exchanges.length === 0) return null

  const totalEmployees = exchanges.reduce((acc, ex) => acc + ex.employees.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={onTogglePanel}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">
            {exchanges.length} Exchange{exchanges.length !== 1 ? 's' : ''} Detected
          </span>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            {totalEmployees} employees involved
          </span>
        </div>
        {showPanel
          ? <ChevronUp className="w-4 h-4 text-purple-500" />
          : <ChevronDown className="w-4 h-4 text-purple-500" />}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {exchanges.map((exchange, i) => (
                <div key={i} className="bg-white rounded-lg border border-purple-200 px-4 py-3">
                  <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                    {exchange.type}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {exchange.employees.map((empId, j) => {
                      const emp = employeesData.find(e => e.id === empId)
                      const mod = modifications[empId]
                      const destBranch = branches.find(b => b.id === mod?.to_branch_id)
                      const destPosition = positions.find(p => p.id === mod?.to_position_id)
                      return (
                        <div key={empId} className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="text-sm font-medium text-slate-900">{emp?.fullname}</div>
                            <div className="text-xs text-purple-600">
                              → {destBranch?.branch_name ?? '?'}
                              {destPosition && ` / ${destPosition.title}`}
                            </div>
                          </div>
                          {j < exchange.employees.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                    <ArrowRight className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <div className="text-xs text-purple-400 italic">back to start</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
