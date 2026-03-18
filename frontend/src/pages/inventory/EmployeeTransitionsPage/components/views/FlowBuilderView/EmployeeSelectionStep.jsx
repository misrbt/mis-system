import { useState, useMemo } from 'react'
import { Search, CheckSquare, Square, Users, Filter } from 'lucide-react'

export function EmployeeSelectionStep({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  transitionMode,
  branches,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('')

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = !searchTerm ||
        emp.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.branch?.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.title?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBranch = !branchFilter || emp.branch_id === parseInt(branchFilter)

      return matchesSearch && matchesBranch
    })
  }, [employees, searchTerm, branchFilter])

  const allSelected = filteredEmployees.length > 0 &&
    filteredEmployees.every(e => selectedEmployees.has(e.id))

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Select Employees</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Choose which employees to include in this transition batch
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full bg-${colorClass}-100 text-${colorClass}-700 text-sm font-medium`}>
            {selectedEmployees.size} selected
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${colorClass}-500`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className={`px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${colorClass}-500`}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onSelectAll}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              ${allSelected
                ? `bg-${colorClass}-100 text-${colorClass}-700`
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }
              transition-colors
            `}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="max-h-[400px] overflow-auto">
        {filteredEmployees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900">No employees found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => {
              const isSelected = selectedEmployees.has(emp.id)

              return (
                <button
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp.id)}
                  className={`
                    w-full flex items-center gap-4 px-6 py-3 text-left
                    transition-colors
                    ${isSelected ? `bg-${colorClass}-50` : 'hover:bg-slate-50'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    transition-colors
                    ${isSelected
                      ? `bg-${colorClass}-500 border-${colorClass}-500`
                      : 'border-slate-300'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                    ${isSelected ? `bg-${colorClass}-500` : 'bg-slate-400'}
                  `}>
                    {emp.fullname?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{emp.fullname}</div>
                    <div className="text-sm text-slate-500">
                      {emp.branch?.branch_name} - {emp.position?.title}
                    </div>
                  </div>

                  {emp.assigned_assets?.length > 0 && (
                    <div className="text-xs text-slate-400">
                      {emp.assigned_assets.length} asset{emp.assigned_assets.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeSelectionStep
