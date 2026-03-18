import { motion } from 'framer-motion'
import { X, Trash2, Building2, MapPin, Briefcase } from 'lucide-react'
import { useState } from 'react'

export function BulkSelectionBar({
  selectedCount,
  transitionMode,
  branches,
  positions,
  workstations,
  onClearSelection,
  onBulkClear,
  onBulkAssign,
}) {
  const [showBranchSelect, setShowBranchSelect] = useState(false)
  const [showPositionSelect, setShowPositionSelect] = useState(false)

  const isBranch = transitionMode === 'branch'
  const colorClass = isBranch ? 'teal' : 'blue'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-${colorClass}-50 border border-${colorClass}-200 rounded-xl p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold text-${colorClass}-800`}>
            {selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className={`p-1.5 rounded-lg text-${colorClass}-600 hover:bg-${colorClass}-100 transition-colors`}
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk assign branch (only in branch mode) */}
          {isBranch && (
            <div className="relative">
              <button
                onClick={() => setShowBranchSelect(!showBranchSelect)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white border border-${colorClass}-200 text-${colorClass}-700 hover:bg-${colorClass}-50 transition-colors`}
              >
                <Building2 className="w-4 h-4" />
                Assign Branch
              </button>
              {showBranchSelect && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        onBulkAssign('to_branch_id', branch.id)
                        setShowBranchSelect(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                    >
                      {branch.branch_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bulk assign position */}
          <div className="relative">
            <button
              onClick={() => setShowPositionSelect(!showPositionSelect)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white border border-${colorClass}-200 text-${colorClass}-700 hover:bg-${colorClass}-50 transition-colors`}
            >
              <Briefcase className="w-4 h-4" />
              Assign Position
            </button>
            {showPositionSelect && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
                {positions.map(position => (
                  <button
                    key={position.id}
                    onClick={() => {
                      onBulkAssign('to_position_id', position.id)
                      setShowPositionSelect(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    {position.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear modifications for selected */}
          <button
            onClick={onBulkClear}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Changes
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default BulkSelectionBar
