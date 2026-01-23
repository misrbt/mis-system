import React from 'react'
import {
  BarChart3,
  LayoutGrid,
  Plus,
  RefreshCw,
  Table2,
  Users,
} from 'lucide-react'

const AssetsHeaderBar = ({
  viewMode,
  onViewModeChange,
  onRefresh,
  onAddAsset,
  onViewEmployees,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">IT Asset Inventory</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-1.5">
          Track and manage all company assets with ease
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        {/* View mode and refresh buttons row */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1 flex-1 sm:flex-initial sm:ml-auto">
            <button
              onClick={() => onViewModeChange('table')}
              className={`hidden sm:inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
              <span className="xs:inline">Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial sm:hidden ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="xs:inline">Cards</span>
            </button>
            <button
              onClick={() => onViewModeChange('pivot')}
              className={`hidden sm:inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial ${
                viewMode === 'pivot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Pivot view"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="xs:inline">Pivot</span>
            </button>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Action buttons row */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 lg:gap-4">
          <button
            onClick={onAddAsset}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
          <button
            onClick={onViewEmployees}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
          >
            <Users className="w-4 h-4" />
            <span>View Employees</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetsHeaderBar)
