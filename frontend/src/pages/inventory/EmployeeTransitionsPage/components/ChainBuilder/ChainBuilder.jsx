import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, AlertCircle, ArrowRight, RotateCw, Trash2, Search, Sparkles } from 'lucide-react'
import { ChainNode } from './ChainNode'
import { ChainLink } from './ChainLink'
import { ChainValidation } from './ChainValidation'

export function ChainBuilder({
  isOpen,
  onClose,
  chainNodes,
  chainDetails,
  validation,
  suggestedEmployees,
  employeesData,
  transitionMode,
  onAddToChain,
  onRemoveFromChain,
  onReorderChain,
  onClearChain,
  onApplyChain,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  // Filter available employees
  const availableEmployees = useMemo(() => {
    return employeesData
      .filter(e => !chainNodes.includes(e.id))
      .filter(e => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
          e.fullname?.toLowerCase().includes(term) ||
          e.branch?.branch_name?.toLowerCase().includes(term) ||
          e.position?.title?.toLowerCase().includes(term)
        )
      })
      .slice(0, 20)
  }, [employeesData, chainNodes, searchTerm])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RotateCw className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Chain Builder</h2>
                  <p className="text-sm text-white/80">Create rotation chains for multi-employee swaps</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
            {/* Chain visualization */}
            <div className="flex-1 p-6 overflow-auto border-b lg:border-b-0 lg:border-r border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Rotation Chain</h3>

              {chainDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <RotateCw className="w-12 h-12 mb-3" />
                  <p className="text-sm">Add employees to build a rotation chain</p>
                  <p className="text-xs mt-1">Each employee moves to the next one's workstation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chainDetails.map((detail, index) => (
                    <div key={detail.employee.id}>
                      <ChainNode
                        detail={detail}
                        index={index}
                        transitionMode={transitionMode}
                        onRemove={() => onRemoveFromChain(detail.employee.id)}
                      />
                      {index < chainDetails.length - 1 && (
                        <ChainLink
                          from={detail}
                          to={chainDetails[index + 1]}
                          transitionMode={transitionMode}
                        />
                      )}
                    </div>
                  ))}

                  {/* Closing link (back to first) */}
                  {chainDetails.length >= 2 && (
                    <>
                      <ChainLink
                        from={chainDetails[chainDetails.length - 1]}
                        to={chainDetails[0]}
                        transitionMode={transitionMode}
                        isClosing
                      />
                      <div className={`text-center text-xs text-${colorClass}-600 font-medium py-2`}>
                        Loop completes back to {chainDetails[0].employee.fullname}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Validation status */}
              <ChainValidation
                validation={validation}
                transitionMode={transitionMode}
              />
            </div>

            {/* Employee selection panel */}
            <div className="w-full lg:w-80 flex flex-col bg-slate-50">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employees..."
                    className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${colorClass}-500`}
                  />
                </div>
              </div>

              {/* Suggestions */}
              {suggestedEmployees.length > 0 && !searchTerm && (
                <div className="p-4 border-b border-slate-200 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">Suggested</span>
                  </div>
                  <div className="space-y-1">
                    {suggestedEmployees.slice(0, 3).map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => onAddToChain(emp.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-semibold">
                            {emp.fullname?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-slate-700">{emp.fullname}</span>
                        </div>
                        <Plus className="w-4 h-4 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available employees list */}
              <div className="flex-1 overflow-auto p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  {searchTerm ? 'Search results' : 'All employees'}
                </p>
                <div className="space-y-1">
                  {availableEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => onAddToChain(emp.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-semibold">
                          {emp.fullname?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="text-slate-700">{emp.fullname}</div>
                          <div className="text-xs text-slate-500">
                            {emp.branch?.branch_name} - {emp.position?.title}
                          </div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                  {availableEmployees.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No employees found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClearChain}
              disabled={chainNodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chain
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={onApplyChain}
                disabled={!validation.canComplete}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  bg-${colorClass}-600 text-white hover:bg-${colorClass}-700
                `}
              >
                <Check className="w-4 h-4" />
                Apply Chain
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChainBuilder
