import { motion } from 'framer-motion'
import { XCircle, ArrowRight, MapPin, Package, Building2, AlertTriangle, Plus } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { OccupiedWorkstationExchange } from './OccupiedWorkstationExchange'
import { getWorkstation } from '../hooks/useTransitionState'

export function EmployeeTableCard({
  employee,
  employeesData,
  isModified,
  isInExchange,
  modifications,
  transitionMode,
  branches,
  positions,
  workstations,
  loadingBranches,
  loadingPositions,
  loadingWorkstations,
  onModify,
  onClear,
  onOpenCreateWorkstation,
}) {
  const mod = modifications[employee.id]
  const { ws_branch_id, ws_position_id } = getWorkstation(employee)

  // Get current workstation
  const currentWorkstation = employee.workstations?.[0]
  const currentWorkstationId = currentWorkstation?.id
  const selectedWorkstationId = mod?.to_workstation_id ?? currentWorkstationId ?? ''

  // In employee mode, lock to current branch. In branch mode, allow all branches.
  const availableWorkstations = transitionMode === 'employee'
    ? workstations.filter(ws => ws.branch_id === ws_branch_id)
    : workstations

  // Categorize workstations
  const currentWs = availableWorkstations.find(ws => ws.id === currentWorkstationId)
  const availableWs = availableWorkstations.filter(ws => !ws.employee && ws.id !== currentWorkstationId)
  const occupiedWs = availableWorkstations.filter(ws => ws.employee && ws.employee.id !== employee.id)

  // Check if selected workstation is occupied
  const selectedWorkstation = selectedWorkstationId ? workstations.find(ws => ws.id === parseInt(selectedWorkstationId)) : null
  const isSelectedOccupied = selectedWorkstation?.employee && selectedWorkstation.employee.id !== employee.id
  const occupyingEmployee = isSelectedOccupied ? selectedWorkstation.employee : null

  // Handler for creating exchange
  const handleCreateExchange = (occupyingEmployeeId, destinationWorkstationId) => {
    const occupyingEmp = employeesData?.find(e => e.id === occupyingEmployeeId)
    if (!occupyingEmp) return

    const destinationWs = workstations.find(ws => ws.id === destinationWorkstationId)
    if (!destinationWs) return

    const { ws_branch_id: occEmpBranchId, ws_position_id: occEmpPositionId } = getWorkstation(occupyingEmp)

    // CRITICAL: Set workstation_id FIRST for unassigned employees
    onModify(occupyingEmployeeId, 'to_workstation_id', destinationWorkstationId, occupyingEmp)
    onModify(occupyingEmployeeId, 'to_branch_id', destinationWs.branch_id, occupyingEmp)
    onModify(occupyingEmployeeId, 'to_position_id', destinationWs.position_id || occEmpPositionId, occupyingEmp)
  }

  // When workstation changes, update branch and position
  const handleWorkstationChange = (workstationId) => {
    const ws = workstations.find(w => w.id === parseInt(workstationId))
    if (ws) {
      // CRITICAL: Set workstation_id FIRST for unassigned employees
      onModify(employee.id, 'to_workstation_id', workstationId, employee)
      onModify(employee.id, 'to_branch_id', ws.branch_id, employee)
      onModify(employee.id, 'to_position_id', ws.position_id || ws_position_id, employee)
    } else {
      // Clear selection - order doesn't matter here since we're clearing
      onModify(employee.id, 'to_workstation_id', '', employee)
      onModify(employee.id, 'to_branch_id', ws_branch_id, employee)
      onModify(employee.id, 'to_position_id', ws_position_id, employee)
    }
  }

  const getCardBgClasses = () => {
    if (!isModified) return 'bg-white'
    if (isInExchange) return 'bg-purple-50/50'
    return transitionMode === 'branch' ? 'bg-teal-50/50' : 'bg-blue-50/50'
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

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 border-b border-slate-100 ${getCardBgClasses()}`}
    >
      {/* Header - Employee info and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${getAvatarClasses()}`}>
            {employee.fullname?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{employee.fullname}</div>
            <div className="text-xs text-slate-500">
              {employee.assigned_assets?.length || 0} asset{employee.assigned_assets?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            isModified={isModified}
            isInExchange={isInExchange}
            transitionMode={transitionMode}
          />
          {isModified && (
            <button
              onClick={() => onClear(employee.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Undo changes"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Current Workstation */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Current Workstation</div>
        {currentWorkstation ? (
          <div className="bg-slate-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-800">
                {branches.find(b => b.id === currentWorkstation.branch_id)?.branch_name || '-'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">
                {currentWorkstation.position?.title || 'General'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Package className="w-3 h-3" />
              <span>{currentWorkstation.assets_count || 0} assets</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-sm italic">No workstation assigned</div>
        )}
      </div>

      <div className="flex items-center justify-center py-2">
        <ArrowRight className="w-5 h-5 text-slate-300" />
      </div>

      {/* New Workstation Selector */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase mb-1.5">
          <ArrowRight className="w-3 h-3 inline mr-1" />
          New Workstation
        </div>
        <div className="flex gap-2">
          <select
            value={selectedWorkstationId}
            onChange={(e) => handleWorkstationChange(e.target.value)}
            disabled={loadingWorkstations}
            className={`flex-1 px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              isModified
                ? `border-${colorClass}-300 bg-${colorClass}-50 focus:ring-${colorClass}-500 font-medium`
                : 'border-slate-300 bg-white focus:ring-slate-400'
            }`}
          >
          <option value="">-- Select Workstation --</option>

          {/* Current Workstation */}
          {currentWs && (
            <optgroup label="📍 Current Assignment">
              <option value={currentWs.id}>
                {branches.find(b => b.id === currentWs.branch_id)?.branch_name} - {currentWs.position?.title || 'General'}
              </option>
            </optgroup>
          )}

          {/* Available Workstations */}
          {availableWs.length > 0 && (
            <optgroup label="✓ Available Workstations">
              {availableWs.map(ws => (
                <option key={ws.id} value={ws.id}>
                  {branches.find(b => b.id === ws.branch_id)?.branch_name} - {ws.position?.title || 'General'}
                </option>
              ))}
            </optgroup>
          )}

          {/* Occupied Workstations */}
          {occupiedWs.length > 0 && (
            <optgroup label="⚠ Occupied (will create exchange)">
              {occupiedWs.map(ws => (
                <option key={ws.id} value={ws.id}>
                  {branches.find(b => b.id === ws.branch_id)?.branch_name} - {ws.position?.title || 'General'} • {ws.employee.fullname}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {onOpenCreateWorkstation && (
          <button
            onClick={onOpenCreateWorkstation}
            type="button"
            className="px-3 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-300 hover:border-blue-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Create new workstation"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

        {/* Mode restriction notice */}
        {transitionMode === 'employee' && (
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
            <AlertTriangle className="w-3 h-3" />
            <span>Employee mode: only workstations in {branches.find(b => b.id === ws_branch_id)?.branch_name}</span>
          </div>
        )}

        {/* Branch change indicator */}
        {transitionMode === 'branch' && selectedWorkstation && selectedWorkstation.branch_id !== ws_branch_id && (
          <div className="text-xs text-teal-600 font-medium mt-2">
            ✓ Moving to {branches.find(b => b.id === selectedWorkstation.branch_id)?.branch_name}
          </div>
        )}

        {/* Interactive Exchange Builder */}
        {isSelectedOccupied && (
          <div className="mt-3">
            <OccupiedWorkstationExchange
              occupyingEmployee={occupyingEmployee}
              currentEmployee={employee}
              selectedWorkstation={selectedWorkstation}
              availableWorkstations={workstations}
              transitionMode={transitionMode}
              onCreateExchange={handleCreateExchange}
              isPartOfExchange={!!modifications[occupyingEmployee.id]}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
