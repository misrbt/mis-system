import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { getWorkstation } from '../hooks/useTransitionState'

export function EmployeeTableRow({
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

  const getRowBgClasses = () => {
    if (!isModified) return ''
    if (isInExchange) return 'bg-purple-50/50'
    return transitionMode === 'branch' ? 'bg-teal-50/30' : 'bg-blue-50/30'
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
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`hover:bg-slate-50 transition-colors ${getRowBgClasses()}`}
    >
      {/* Employee */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${getAvatarClasses()}`}>
            {employee.fullname?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{employee.fullname}</div>
            {employee.assigned_assets?.length > 0 && (
              <div className="text-xs text-slate-500">
                {employee.assigned_assets.length} asset{employee.assigned_assets.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Current Workstation Branch */}
      <td className="px-6 py-4 text-sm">
        <div className="text-slate-800 font-medium">
          {branches.find(b => b.id === ws_branch_id)?.branch_name
            || employee.branch?.branch_name || '-'}
        </div>
        <div className="text-xs text-slate-400 italic mt-0.5">
          HR: {employee.branch?.branch_name || '-'}
        </div>
      </td>

      {/* Current Workstation Position */}
      <td className="px-6 py-4 text-sm">
        <div className="text-slate-800 font-medium">
          {positions.find(p => p.id === ws_position_id)?.title
            || employee.position?.title || '-'}
        </div>
        <div className="text-xs text-slate-400 italic mt-0.5">
          HR: {employee.position?.title || '-'}
        </div>
      </td>

      {/* Destination Branch */}
      <td className="px-6 py-4">
        <select
          value={currentBranchId}
          onChange={(e) => onModify(employee.id, 'to_branch_id', e.target.value, employee)}
          disabled={loadingBranches}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            getSelectClasses(isModified, currentBranchId !== ws_branch_id, transitionMode === 'branch')
          }`}
        >
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
          ))}
        </select>
      </td>

      {/* Destination Position */}
      <td className="px-6 py-4">
        <select
          value={currentPositionId}
          onChange={(e) => onModify(employee.id, 'to_position_id', e.target.value, employee)}
          disabled={loadingPositions}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            getSelectClasses(isModified, currentPositionId !== ws_position_id, transitionMode === 'branch')
          }`}
        >
          {positions.map(position => (
            <option key={position.id} value={position.id}>{position.title}</option>
          ))}
        </select>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-center">
        <StatusBadge
          isModified={isModified}
          isInExchange={isInExchange}
          transitionMode={transitionMode}
        />
      </td>

      {/* Action */}
      <td className="px-6 py-4 text-center">
        {isModified && (
          <button
            onClick={() => onClear(employee.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Undo changes"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </td>
    </motion.tr>
  )
}
