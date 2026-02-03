import React from 'react'
import {
  BarChart3,
  LayoutGrid,
  Plus,
  Table2,
  Package,
  Users,
} from 'lucide-react'

const AssetsHeaderBar = ({
  viewMode,
  onViewModeChange,
  onAddAsset,
  onViewEmployees,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">IT Asset Inventory</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-1.5">
          Track and manage all company assets with ease
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Tab selection and view mode buttons */}
        <div className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
          {/* Tab: Assets */}
          <button
            onClick={() => onTabChange('inventory')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Asset inventory"
          >
            <Package className="w-4 h-4" />
            <span>Assets</span>
          </button>

          {/* Tab: Equipment */}
          <button
            onClick={() => onTabChange('assignments')}
            className={`inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === 'assignments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Equipment assignments"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Equipment</span>
          </button>

          {/* Divider */}
          {activeTab === 'inventory' && (
            <>
              <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1"></div>

              {/* View Mode: Table */}
              <button
                onClick={() => onViewModeChange('table')}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Table view"
              >
                <Table2 className="w-4 h-4" />
                <span>Table</span>
              </button>

              {/* View Mode: Cards (mobile) */}
              <button
                onClick={() => onViewModeChange('cards')}
                className={`inline-flex sm:hidden items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'cards'
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </button>

              {/* View Mode: Pivot */}
              <button
                onClick={() => onViewModeChange('pivot')}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  viewMode === 'pivot'
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Pivot view"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Pivot</span>
              </button>
            </>
          )}
        </div>

        {/* Add Asset button */}
        <button
          onClick={onAddAsset}
          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>

        {/* View Employees button */}
        <button
          onClick={onViewEmployees}
          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
        >
          <Users className="w-4 h-4" />
          <span>View Employees</span>
        </button>
      </div>
    </div>
  )
}

export default React.memo(AssetsHeaderBar)
