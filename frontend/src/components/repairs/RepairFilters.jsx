import PropTypes from 'prop-types'
import { Filter, X } from 'lucide-react'

function RepairFilters({ showFilters, filters, onChange, onClear, onToggle }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <button onClick={onToggle} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={onChange}
                placeholder="Asset, description, technician..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={onChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Repair">Under Repair</option>
                <option value="Completed">Completed</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Repair From</label>
              <input
                type="date"
                name="repair_date_from"
                value={filters.repair_date_from}
                onChange={onChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={onClear}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

RepairFilters.propTypes = {
  showFilters: PropTypes.bool.isRequired,
  filters: PropTypes.shape({
    asset_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vendor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    repair_date_from: PropTypes.string,
    repair_date_to: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default RepairFilters
