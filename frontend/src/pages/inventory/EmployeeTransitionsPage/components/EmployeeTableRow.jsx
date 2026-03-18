import { motion } from 'framer-motion'
import { XCircle, MapPin, Package, Building2, AlertTriangle, Plus } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { OccupiedWorkstationExchange } from './OccupiedWorkstationExchange'
import { getWorkstation } from '../hooks/useTransitionState'
import { useEffect } from 'react'

export function EmployeeTableRow({
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

  // Get current workstation from employee data
  const currentWorkstation = employee.workstations?.[0]
  const currentWorkstationId = currentWorkstation?.id

  // Selected workstation (either modified or current)
  const selectedWorkstationId = mod?.to_workstation_id ?? currentWorkstationId ?? ''

  // Get branch for filtering workstations
  const currentBranchId = mod?.to_branch_id ?? ws_branch_id

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

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

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
            <div className="text-xs text-slate-500">
              {employee.assigned_assets?.length || 0} asset{employee.assigned_assets?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </td>

      {/* Current Workstation */}
      <td className="px-6 py-4 text-sm">
        {currentWorkstation ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-800">
                {branches.find(b => b.id === currentWorkstation.branch_id)?.branch_name || '-'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">
                {currentWorkstation.position?.title || 'General'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Package className="w-3 h-3" />
              <span>{currentWorkstation.assets_count || 0} assets</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-sm italic">
            No workstation assigned
          </div>
        )}
      </td>

      {/* New Workstation Selector */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={selectedWorkstationId}
              onChange={(e) => handleWorkstationChange(e.target.value)}
              disabled={loadingWorkstations}
              className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
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
                  {branches.find(b => b.id === currentWs.branch_id)?.branch_name} - {currentWs.position?.title || 'General'} ({currentWs.assets_count || 0} assets)
                </option>
              </optgroup>
            )}

            {/* Available Workstations */}
            {availableWs.length > 0 && (
              <optgroup label="✓ Available Workstations">
                {availableWs.map(ws => (
                  <option key={ws.id} value={ws.id}>
                    {branches.find(b => b.id === ws.branch_id)?.branch_name} - {ws.position?.title || 'General'} ({ws.assets_count || 0} assets)
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
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-300 hover:border-blue-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Create new workstation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xl:inline">New</span>
            </button>
          )}
        </div>

          {/* Mode restriction notice */}
          {transitionMode === 'employee' && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Employee mode: only workstations in {branches.find(b => b.id === ws_branch_id)?.branch_name}</span>
            </div>
          )}

          {/* Branch change indicator */}
          {transitionMode === 'branch' && selectedWorkstation && selectedWorkstation.branch_id !== ws_branch_id && (
            <div className="text-xs text-teal-600 font-medium">
              ✓ Moving to {branches.find(b => b.id === selectedWorkstation.branch_id)?.branch_name}
            </div>
          )}

          {/* Interactive Exchange Builder */}
          {isSelectedOccupied && (
            <OccupiedWorkstationExchange
              occupyingEmployee={occupyingEmployee}
              currentEmployee={employee}
              selectedWorkstation={selectedWorkstation}
              availableWorkstations={workstations}
              transitionMode={transitionMode}
              onCreateExchange={handleCreateExchange}
              isPartOfExchange={!!modifications[occupyingEmployee.id]}
            />
          )}
        </div>
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
