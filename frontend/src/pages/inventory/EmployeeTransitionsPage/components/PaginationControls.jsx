import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { PAGE_SIZES } from '../constants'

export function PaginationControls({ table }) {
  const { pageIndex, pageSize } = table.getState().pagination
  const filteredTotal = table.getFilteredRowModel().rows.length
  const rowStart = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const rowEnd = Math.min((pageIndex + 1) * pageSize, filteredTotal)

  if (filteredTotal === 0) return null

  return (
    <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
      <div className="text-sm text-slate-700">
        Showing <span className="font-semibold">{rowStart}</span> to{' '}
        <span className="font-semibold">{rowEnd}</span> of{' '}
        <span className="font-semibold">{filteredTotal}</span> entries
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
            table.setPageIndex(0)
          }}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {PAGE_SIZES.map(size => (
            <option key={size} value={size}>{size} per page</option>
          ))}
        </select>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-slate-700">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
