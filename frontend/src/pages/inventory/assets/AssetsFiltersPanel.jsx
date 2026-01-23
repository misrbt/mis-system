import React from 'react'
import { Filter, X } from 'lucide-react'

const AssetsFiltersPanel = ({
  showFilters,
  viewMode,
  isFiltering,
  onCloseFilters,
  onOpenFilters,
  searchInput,
  onSearchInputChange,
  filters,
  onFilterChange,
  branches,
  categories,
  filterSubcategories,
  statusOptions,
  vendors,
  onClearFilters,
}) => {
  if (viewMode === 'pivot') {
    return null
  }

  return (
    <>
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Advanced </span>Filters
            </h3>
            <div className="flex items-center gap-2 sm:gap-3">
              {isFiltering && (
                <span className="text-xs text-slate-500 hidden xs:inline">Updating...</span>
              )}
              <button
                onClick={onCloseFilters}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Asset name, serial, brand..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
              <select
                name="branch_id"
                value={filters.branch_id}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
              <select
                name="subcategory_id"
                value={filters.subcategory_id}
                onChange={onFilterChange}
                disabled={!filters.category_id}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!filters.category_id
                    ? 'Select a category first'
                    : (filterSubcategories?.length === 0)
                      ? 'No subcategories'
                      : 'All Subcategories'}
                </option>
                {filterSubcategories?.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                name="status_id"
                value={filters.status_id}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {(statusOptions || []).map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
              <select
                name="vendor_id"
                value={filters.vendor_id}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Vendors</option>
                {(Array.isArray(vendors) ? vendors : []).map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purchase From
              </label>
              <input
                type="date"
                name="purchase_date_from"
                value={filters.purchase_date_from}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purchase To
              </label>
              <input
                type="date"
                name="purchase_date_to"
                value={filters.purchase_date_to}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {!showFilters && (
        <button
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 w-full sm:w-auto"
        >
          <Filter className="w-4 h-4" />
          Show Filters
        </button>
      )}
    </>
  )
}

export default React.memo(AssetsFiltersPanel)
