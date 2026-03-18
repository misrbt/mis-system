import { Building2, MapPin, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export function BeforePanel({
  branchStates,
  transitionMode,
  modifications,
  employeesInExchanges,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  return (
    <div className="p-4 space-y-6">
      {branchStates.map(({ branch, beforeState, outgoingEmployees, hasChanges }) => (
        <div
          key={branch.id}
          className={`rounded-lg border ${hasChanges ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}
        >
          {/* Branch header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-800">{branch.branch_name}</span>
              {outgoingEmployees.length > 0 && (
                <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                  <ArrowUpRight className="w-3 h-3" />
                  {outgoingEmployees.length} leaving
                </span>
              )}
            </div>
          </div>

          {/* Workstations */}
          <div className="p-3 space-y-2">
            {beforeState.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4">
                No workstations
              </div>
            ) : (
              beforeState.map(({ workstation, employee }) => {
                const isLeaving = employee && modifications[employee.id]?.to_workstation_id &&
                  modifications[employee.id].to_workstation_id !== workstation.id
                const isInExchange = employee && employeesInExchanges.has(employee.id)

                return (
                  <div
                    key={workstation.id}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg border
                      ${isLeaving
                        ? 'border-red-200 bg-red-50'
                        : isInExchange
                          ? 'border-purple-200 bg-purple-50'
                          : 'border-slate-100 bg-white'
                      }
                    `}
                  >
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${employee ? `text-${colorClass}-500` : 'text-slate-300'}`} />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700">
                        {workstation.position?.title || 'General'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {workstation.assets_count || 0} assets
                      </div>
                    </div>

                    {employee ? (
                      <div className={`
                        flex items-center gap-2 px-2 py-1 rounded
                        ${isLeaving
                          ? 'bg-red-100 text-red-700'
                          : isInExchange
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      `}>
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold
                          ${isLeaving
                            ? 'bg-red-500'
                            : isInExchange
                              ? 'bg-purple-500'
                              : 'bg-slate-400'
                          }
                        `}>
                          {employee.fullname?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm truncate max-w-[120px]">
                          {employee.fullname}
                        </span>
                        {isLeaving && <ArrowUpRight className="w-3 h-3 text-red-500" />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 text-slate-400">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Empty</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}

      {branchStates.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No branches with changes to display</p>
        </div>
      )}
    </div>
  )
}

export default BeforePanel
