import { useDroppable } from '@dnd-kit/core'
import { Building2, Plus } from 'lucide-react'
import { WorkstationCard } from './WorkstationCard'
import { EmployeeChip } from './EmployeeChip'

export function BranchColumn({
  branch,
  workstations,
  employees,
  modifications,
  employeesInExchanges,
  transitionMode,
  positions,
  overId,
  onClear,
  getEmployeeState,
  onOpenCreateWorkstation,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `branch-${branch.id}`,
  })

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  // Get employees for each workstation
  const getWorkstationEmployees = (workstationId) => {
    return employees.filter(emp => {
      const state = getEmployeeState(emp)
      // Show employee at their target workstation (or current if no modification)
      return state.targetWorkstationId === workstationId
    })
  }

  // Get unassigned employees (those in this branch but not assigned to any workstation)
  const unassignedEmployees = employees.filter(emp => {
    const state = getEmployeeState(emp)
    return (
      state.targetBranchId === branch.id &&
      !state.targetWorkstationId &&
      !workstations.some(ws => getWorkstationEmployees(ws.id).includes(emp))
    )
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[280px] max-w-[320px] flex-shrink-0
        bg-slate-50 rounded-xl border-2 transition-colors
        ${isOver ? `border-${colorClass}-400 bg-${colorClass}-50/50` : 'border-slate-200'}
      `}
    >
      {/* Branch Header */}
      <div className={`px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">{branch.branch_name}</h3>
        </div>
        <p className="text-xs text-white/80 mt-1">
          {workstations.length} workstation{workstations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Workstations */}
      <div className="p-3 space-y-3">
        {/* Existing Workstations */}
        {workstations.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No workstations
          </div>
        ) : (
          workstations.map(ws => (
            <WorkstationCard
              key={ws.id}
              workstation={ws}
              employees={getWorkstationEmployees(ws.id)}
              modifications={modifications}
              employeesInExchanges={employeesInExchanges}
              transitionMode={transitionMode}
              positions={positions}
              overId={overId}
              onClear={onClear}
            />
          ))
        )}

        {/* Add New Workstation Button */}
        {onOpenCreateWorkstation && (
          <button
            onClick={() => onOpenCreateWorkstation(branch.id)}
            className={`
              w-full py-2.5 px-3 rounded-lg
              border-2 border-dashed transition-all
              border-${colorClass}-300 bg-${colorClass}-50/30
              hover:border-${colorClass}-400 hover:bg-${colorClass}-50
              flex items-center justify-center gap-2
              text-${colorClass}-600 hover:text-${colorClass}-700
              group
            `}
            title="Add new workstation"
          >
            <div className={`
              w-6 h-6 rounded-full bg-${colorClass}-500
              flex items-center justify-center
              group-hover:scale-110 transition-transform
            `}>
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-semibold">Add Workstation</span>
          </button>
        )}

        {/* Unassigned employees pool */}
        {unassignedEmployees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-300">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Unassigned in {branch.branch_name}
            </p>
            <p className="text-[10px] text-slate-400 mb-2">
              Drag to assign to a workstation
            </p>
            <div className="space-y-2">
              {unassignedEmployees.map(emp => (
                <EmployeeChip
                  key={emp.id}
                  employee={emp}
                  isModified={!!modifications[emp.id]}
                  isInExchange={employeesInExchanges.has(emp.id)}
                  transitionMode={transitionMode}
                  onClear={() => onClear(emp.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BranchColumn
