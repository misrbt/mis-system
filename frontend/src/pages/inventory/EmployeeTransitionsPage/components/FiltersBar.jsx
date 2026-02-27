import { Filter } from 'lucide-react'

export function FiltersBar({
  transitionMode,
  globalFilter,
  branchFilter,
  showModifiedOnly,
  branches,
  hasFilters,
  filteredTotal,
  rowStart,
  rowEnd,
  onGlobalFilterChange,
  onBranchFilterChange,
  onToggleModifiedOnly,
  onClearFilters,
  onPageReset,
}) {
  const isBranch = transitionMode === 'branch'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className={`w-5 h-5 ${isBranch ? 'text-teal-600' : 'text-blue-600'}`} />
          <span className="text-sm font-semibold text-slate-900">Filters</span>
        </div>

        <div className="flex-1 flex items-center gap-3 flex-wrap">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder="Search employees, branches, positions..."
              className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent ${
                isBranch ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => {
              onBranchFilterChange(e.target.value)
              onPageReset()
            }}
            className={`px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent ${
              isBranch ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
            }`}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
            ))}
          </select>

          {/* Show Modified Only */}
          <button
            onClick={() => {
              onToggleModifiedOnly()
              onPageReset()
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showModifiedOnly
                ? isBranch
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {showModifiedOnly ? 'Show All' : 'Modified Only'}
          </button>

          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{rowStart}–{rowEnd}</span> of{' '}
          <span className="font-semibold text-slate-900">{filteredTotal}</span>
        </div>
      </div>
    </div>
  )
}
