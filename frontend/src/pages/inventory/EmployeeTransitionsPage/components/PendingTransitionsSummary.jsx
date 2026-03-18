import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Users, ArrowRight, MapPin, Building2, Briefcase, Shuffle, XCircle } from 'lucide-react'

export function PendingTransitionsSummary({
  modifications,
  employeesData,
  branches,
  positions,
  workstations,
  employeesInExchanges,
  transitionMode,
  showPanel,
  onTogglePanel,
  onClearOne,
}) {
  const modifiedEmployees = Object.entries(modifications).map(([employeeId, mod]) => {
    const employee = employeesData.find(e => e.id === parseInt(employeeId))
    if (!employee) return null

    const currentWorkstation = employee.workstations?.[0]
    const ws_branch_id = currentWorkstation?.branch_id ?? employee.branch?.id
    const ws_position_id = currentWorkstation?.position_id ?? employee.position?.id

    const currentBranch = branches.find(b => b.id === ws_branch_id)
    const currentPosition = positions.find(p => p.id === ws_position_id)
    const newBranch = branches.find(b => b.id === mod.to_branch_id)
    const newPosition = positions.find(p => p.id === mod.to_position_id)
    const newWorkstation = workstations.find(ws => ws.id === mod.to_workstation_id)

    const isInExchange = employeesInExchanges.has(employee.id)
    const isBranchChanged = mod.to_branch_id !== ws_branch_id
    const isPositionChanged = mod.to_position_id !== ws_position_id
    const isWorkstationChanged = mod.to_workstation_id !== currentWorkstation?.id

    return {
      employee,
      currentBranch,
      currentPosition,
      currentWorkstation,
      newBranch,
      newPosition,
      newWorkstation,
      isInExchange,
      isBranchChanged,
      isPositionChanged,
      isWorkstationChanged,
    }
  }).filter(Boolean)

  const modifiedCount = modifiedEmployees.length
  const exchangeCount = modifiedEmployees.filter(m => m.isInExchange).length
  const regularCount = modifiedCount - exchangeCount

  const isBranch = transitionMode === 'branch'

  if (modifiedCount === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={onTogglePanel}
        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
          isBranch ? 'bg-gradient-to-r from-teal-50 to-white' : 'bg-gradient-to-r from-blue-50 to-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
            isBranch
              ? 'bg-gradient-to-br from-teal-500 to-teal-600'
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-slate-900">
              Pending Transitions Summary
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {regularCount} regular transition{regularCount !== 1 ? 's' : ''}
              {exchangeCount > 0 && (
                <span className="text-purple-600 font-medium">
                  {' • '}
                  {exchangeCount} exchange{exchangeCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        {showPanel ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                {modifiedEmployees.map(({
                  employee,
                  currentBranch,
                  currentPosition,
                  currentWorkstation,
                  newBranch,
                  newPosition,
                  newWorkstation,
                  isInExchange,
                  isBranchChanged,
                  isPositionChanged,
                  isWorkstationChanged,
                }) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isInExchange
                        ? 'bg-purple-50/50 border-purple-200'
                        : isBranch
                          ? 'bg-teal-50/30 border-teal-200'
                          : 'bg-blue-50/30 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Employee Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ${
                            isInExchange
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                              : isBranch
                                ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                                : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {employee.fullname?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {employee.fullname}
                            </div>
                            {isInExchange && (
                              <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                                <Shuffle className="w-3 h-3" />
                                Part of Exchange
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Transition Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Current State */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Current
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2 text-xs">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-slate-700">
                                    {currentBranch?.branch_name || 'No Branch'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-slate-700">
                                    {currentPosition?.title || 'No Position'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-slate-700">
                                    {currentWorkstation?.position?.title || 'No Workstation'}
                                  </span>
                                  {currentWorkstation && (
                                    <span className="text-slate-500 ml-1">
                                      ({currentWorkstation.assets_count || 0} assets)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:flex items-center justify-center">
                            <ArrowRight className={`w-6 h-6 ${
                              isInExchange
                                ? 'text-purple-400'
                                : isBranch
                                  ? 'text-teal-400'
                                  : 'text-blue-400'
                            }`} />
                          </div>

                          {/* Mobile Arrow */}
                          <div className="md:hidden flex justify-center -my-1">
                            <ArrowRight className={`w-5 h-5 rotate-90 ${
                              isInExchange
                                ? 'text-purple-400'
                                : isBranch
                                  ? 'text-teal-400'
                                  : 'text-blue-400'
                            }`} />
                          </div>

                          {/* New State */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              New Destination
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2 text-xs">
                                <Building2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                                  isBranchChanged
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`} />
                                <div>
                                  <span className={`font-semibold ${
                                    isBranchChanged ? 'text-emerald-700' : 'text-slate-700'
                                  }`}>
                                    {newBranch?.branch_name || 'No Branch'}
                                  </span>
                                  {isBranchChanged && (
                                    <span className="text-emerald-600 ml-1.5 text-xs">✓ Changed</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs">
                                <Briefcase className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                                  isPositionChanged
                                    ? 'text-blue-600'
                                    : 'text-slate-400'
                                }`} />
                                <div>
                                  <span className={`font-semibold ${
                                    isPositionChanged ? 'text-blue-700' : 'text-slate-700'
                                  }`}>
                                    {newPosition?.title || 'No Position'}
                                  </span>
                                  {isPositionChanged && (
                                    <span className="text-blue-600 ml-1.5 text-xs">✓ Changed</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs">
                                <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                                  isWorkstationChanged
                                    ? 'text-purple-600'
                                    : 'text-slate-400'
                                }`} />
                                <div>
                                  <span className={`font-semibold ${
                                    isWorkstationChanged ? 'text-purple-700' : 'text-slate-700'
                                  }`}>
                                    {newWorkstation?.position?.title || 'No Workstation'}
                                  </span>
                                  {newWorkstation && (
                                    <span className="text-slate-500 ml-1">
                                      ({newWorkstation.assets_count || 0} assets)
                                    </span>
                                  )}
                                  {isWorkstationChanged && (
                                    <span className="text-purple-600 ml-1.5 text-xs">✓ Changed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clear Button */}
                      <button
                        onClick={() => onClearOne(employee.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove from pending transitions"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info Message */}
              <div className={`mt-4 p-3 rounded-lg border ${
                isBranch
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs ${
                  isBranch ? 'text-teal-800' : 'text-blue-800'
                }`}>
                  💡 <strong>Tip:</strong> You can continue modifying more employees in the table below.
                  All changes will be executed together when you click the <strong>Execute</strong> button.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
