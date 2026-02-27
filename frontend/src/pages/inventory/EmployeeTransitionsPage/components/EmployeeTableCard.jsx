import { motion } from 'framer-motion'
import { XCircle, ArrowRight } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { getWorkstation } from '../hooks/useTransitionState'

export function EmployeeTableCard({
  employee,
  isModified,
  isInExchange,
  modifications,
  transitionMode,
  branches,
  positions,
  loadingBranches,
  loadingPositions,
  onModify,
  onClear,
}) {
  const mod = modifications[employee.id]
  const { ws_branch_id, ws_position_id } = getWorkstation(employee)
  const currentBranchId   = mod?.to_branch_id   ?? ws_branch_id
  const currentPositionId = mod?.to_position_id ?? ws_position_id

  const getSelectClasses = (isModified, isChanged, isBranch) => {
    if (isModified && isChanged) {
      return isBranch
        ? 'border-teal-300 bg-teal-50 focus:ring-teal-500 font-medium'
        : 'border-blue-300 bg-blue-50 focus:ring-blue-500 font-medium'
    }
    return 'border-slate-300 bg-white focus:ring-slate-400'
  }

  const getCardBgClasses = () => {
    if (!isModified) return ''
    if (isInExchange) return 'bg-purple-50/30'
    return transitionMode === 'branch' ? 'bg-teal-50/20' : 'bg-blue-50/20'
  }

  const getAvatarClasses = () => {
    if (isModified) {
      if (isInExchange) return 'bg-gradient-to-br from-purple-500 to-purple-600'
      return transitionMode === 'branch'
        ? 'bg-gradient-to-br from-teal-500 to-teal-600'
        : 'bg-gradient-to-br from-blue-500 to-blue-600'
    }
    return 'bg-gradient-to-br from-slate-400 to-slate-500'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 bg-white transition-colors ${getCardBgClasses()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm ${getAvatarClasses()}`}>
            {employee.fullname?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{employee.fullname}</div>
            <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">
              📍 {branches.find(b => b.id === ws_branch_id)?.branch_name || employee.branch?.branch_name || 'No Branch'}
              {' • '}
              {positions.find(p => p.id === ws_position_id)?.title || employee.position?.title || 'No Position'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate italic">
              HR: {employee.branch?.branch_name || '-'} / {employee.position?.title || '-'}
            </div>
            {employee.assigned_assets?.length > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">
                {employee.assigned_assets.length} asset{employee.assigned_assets.length !== 1 ? 's' : ''} assigned
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge
            isModified={isModified}
            isInExchange={isInExchange}
            transitionMode={transitionMode}
            size="small"
          />
          {isModified && (
            <button
              onClick={() => onClear(employee.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded bg-white border border-red-100 transition-colors"
              title="Undo changes"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-3 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-slate-400" />
            Workstation Branch
          </label>
          <select
            value={currentBranchId}
            onChange={(e) => onModify(employee.id, 'to_branch_id', e.target.value, employee)}
            disabled={loadingBranches}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:border-transparent transition-colors ${
              getSelectClasses(isModified, currentBranchId !== ws_branch_id, transitionMode === 'branch')
            }`}
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-slate-400" />
            Workstation Position
          </label>
          <select
            value={currentPositionId}
            onChange={(e) => onModify(employee.id, 'to_position_id', e.target.value, employee)}
            disabled={loadingPositions}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:border-transparent transition-colors ${
              getSelectClasses(isModified, currentPositionId !== ws_position_id, transitionMode === 'branch')
            }`}
          >
            {positions.map(position => (
              <option key={position.id} value={position.id}>{position.title}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  )
}
