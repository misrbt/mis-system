/**
 * Mobile card list component for CRUD pages
 * Provides responsive card view with search, sort, and pagination
 */

import { Search, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * @typedef {Object} MobileCardListProps
 * @property {Object} table - React Table instance
 * @property {string} globalFilter - Current search filter
 * @property {function(string): void} onGlobalFilterChange - Search filter change handler
 * @property {string} sortId - Current sort field
 * @property {boolean} sortDesc - Sort direction
 * @property {function(string): void} onSortFieldChange - Sort field change handler
 * @property {function(): void} onToggleSortDirection - Toggle sort direction
 * @property {Array<{ value: string, label: string }>} sortOptions - Available sort options
 * @property {function(Object): void} onEdit - Edit handler
 * @property {function(Object): void} onDelete - Delete handler
 * @property {function(Object): React.ReactNode} renderCard - Custom card renderer
 * @property {boolean} isLoading - Loading state
 * @property {string} searchPlaceholder - Search input placeholder
 * @property {string} emptyMessage - Message when no data
 */

function MobileCardList({
  table,
  globalFilter,
  onGlobalFilterChange,
  sortId,
  sortDesc,
  onSortFieldChange,
  onToggleSortDirection,
  sortOptions = [],
  onEdit,
  onDelete,
  renderCard,
  isLoading = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No records found.',
}) {
  const pagination = table.getState().pagination
  const filteredCount = globalFilter
    ? table.getFilteredRowModel().rows.length
    : table.getCoreRowModel().rows.length
  const start = filteredCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)

  return (
    <div className="space-y-3 sm:hidden">
      {/* Search and Sort Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {sortOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={sortId}
              onChange={(e) => onSortFieldChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sort by</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onToggleSortDirection}
              disabled={!sortId}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sortDesc ? 'Z-A' : 'A-Z'}
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
          Loading...
        </div>
      ) : filteredCount === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        table.getRowModel().rows.map((row) => {
          const record = row.original

          if (renderCard) {
            return (
              <div key={record.id}>
                {renderCard(record, { onEdit, onDelete })}
              </div>
            )
          }

          // Default card rendering
          return (
            <DefaultCard
              key={record.id}
              record={record}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        })
      )}

      {/* Pagination */}
      {!isLoading && filteredCount > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-3 space-y-2">
          <div className="text-xs text-slate-600 text-center">
            Showing {start} to {end} of {filteredCount} entries
          </div>
          <div className="flex items-center justify-between gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs text-slate-700 px-1">
                {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Default card component when no custom renderer is provided
 */
function DefaultCard({ record, onEdit, onDelete }) {
  // Try to find a display name from common fields
  const displayName = record.name || record.title || record.branch_name || record.company_name || record.fullname || `ID: ${record.id}`
  const subtitle = record.code || record.email || record.brak || null

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {displayName}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-1 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(record)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(record)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MobileCardList
