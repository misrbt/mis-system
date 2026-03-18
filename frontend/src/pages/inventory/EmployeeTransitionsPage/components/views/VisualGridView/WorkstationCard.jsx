import { useDroppable } from '@dnd-kit/core'
import { MapPin, Package, User } from 'lucide-react'
import { EmployeeChip } from './EmployeeChip'

export function WorkstationCard({
  workstation,
  employees,
  modifications,
  employeesInExchanges,
  transitionMode,
  positions,
  overId,
  onClear,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `workstation-${workstation.id}`,
  })

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'
  const isDropTarget = overId === `workstation-${workstation.id}`
  const isEmpty = employees.length === 0
  const isOccupied = employees.length > 0

  const positionTitle = positions.find(p => p.id === workstation.position_id)?.title || 'General'

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-lg border-2 transition-all duration-200
        ${isDropTarget
          ? `border-${colorClass}-400 bg-${colorClass}-50 shadow-lg`
          : isOver
            ? 'border-slate-300 bg-slate-100'
            : 'border-slate-200 bg-white'
        }
        ${isEmpty ? 'border-dashed' : ''}
      `}
    >
      {/* Workstation header */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${isOccupied ? `text-${colorClass}-500` : 'text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-800">{positionTitle}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Package className="w-3 h-3" />
            <span>{workstation.assets_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Employee slot */}
      <div className="p-2 min-h-[60px]">
        {isEmpty ? (
          <div className={`
            flex items-center justify-center h-[44px] rounded
            border border-dashed transition-colors
            ${isDropTarget
              ? `border-${colorClass}-300 bg-${colorClass}-50`
              : 'border-slate-200 bg-slate-50'
            }
          `}>
            <span className="text-xs text-slate-400">
              {isDropTarget ? 'Drop here' : 'Empty'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map(emp => (
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
        )}
      </div>
    </div>
  )
}

export default WorkstationCard
