import React from 'react'
import {
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react'

const AssetsPivotView = ({
  isLoading,
  pivotData,
  pivotConfig,
  onPivotConfigChange,
  onExport,
  onRefresh,
  assetsCount,
  formatPivotValue,
}) => {
  return (
    <div className="space-y-4">
      {/* Pivot Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Pivot Table </span>Configuration
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onExport}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-all"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Export </span>CSV
            </button>
            <button
              onClick={onRefresh}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Row Dimension */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Row Dimension
            </label>
            <select
              value={pivotConfig.rowDimension}
              onChange={(e) => onPivotConfigChange('rowDimension', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="category">Category</option>
              <option value="status">Status</option>
              <option value="branch">Branch</option>
              <option value="vendor">Vendor</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Column Dimension */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Column Dimension
            </label>
            <select
              value={pivotConfig.columnDimension}
              onChange={(e) => onPivotConfigChange('columnDimension', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="status">Status</option>
              <option value="category">Category</option>
              <option value="branch">Branch</option>
              <option value="vendor">Vendor</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Aggregation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Aggregation
            </label>
            <select
              value={pivotConfig.aggregation}
              onChange={(e) => onPivotConfigChange('aggregation', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="count">Count</option>
              <option value="sum_book_value">Sum - Book Value</option>
              <option value="sum_acq_cost">Sum - Acquisition Cost</option>
              <option value="avg_book_value">Average - Book Value</option>
              <option value="avg_estimate_life">Average - Estimated Life</option>
            </select>
          </div>

          {/* Show Totals Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={pivotConfig.showTotals}
                onChange={(e) => onPivotConfigChange('showTotals', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Show Totals</span>
            </label>
          </div>
        </div>

        {/* Aggregation Description */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Current View:</strong> Showing{' '}
            <span className="font-semibold">
              {pivotConfig.aggregation === 'count'
                ? 'count of assets'
                : pivotConfig.aggregation === 'sum_book_value'
                  ? 'total book value'
                  : pivotConfig.aggregation === 'sum_acq_cost'
                    ? 'total acquisition cost'
                    : pivotConfig.aggregation === 'avg_book_value'
                      ? 'average book value'
                      : 'average estimated life'}
            </span>{' '}
            grouped by{' '}
            <span className="font-semibold">{pivotConfig.rowDimension}</span> (rows) and{' '}
            <span className="font-semibold">{pivotConfig.columnDimension}</span> (columns)
          </p>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading pivot data...</span>
            </div>
          </div>
        ) : !pivotData || pivotData.rowKeys.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No data available for the selected configuration. Try adjusting your filters or
            configuration.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider border-r-2 border-slate-300 sticky left-0 bg-slate-100 z-10">
                    {pivotConfig.rowDimension}
                  </th>
                  {pivotData.columnKeys.map((colKey) => (
                    <th
                      key={colKey}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200"
                    >
                      <span className="block truncate max-w-[100px] sm:max-w-none">{colKey}</span>
                    </th>
                  ))}
                  {pivotConfig.showTotals && (
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border-l-2 border-blue-300">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pivotData.rowKeys.map((rowKey, rowIndex) => {
                  const rowTotal = pivotData.columnKeys.reduce(
                    (sum, colKey) => sum + (pivotData.data[rowKey][colKey] || 0),
                    0
                  )

                  return (
                    <tr
                      key={rowKey}
                      className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 border-r-2 border-slate-300 sticky left-0 bg-inherit z-10">
                        <span className="block truncate max-w-[120px] sm:max-w-none">{rowKey}</span>
                      </td>
                      {pivotData.columnKeys.map((colKey) => {
                        const value = pivotData.data[rowKey][colKey]
                        const hasValue = value !== undefined && value !== null && value !== 0

                        return (
                          <td
                            key={`${rowKey}-${colKey}`}
                            className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center border-r border-slate-200 ${
                              hasValue
                                ? 'text-slate-900 font-medium bg-green-50'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatPivotValue(value)}
                          </td>
                        )
                      })}
                      {pivotConfig.showTotals && (
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-center text-blue-900 bg-blue-50 border-l-2 border-blue-300">
                          {formatPivotValue(rowTotal)}
                        </td>
                      )}
                    </tr>
                  )
                })}

                {/* Totals Row */}
                {pivotConfig.showTotals && (
                  <tr className="bg-blue-100 border-t-2 border-blue-300 font-bold">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-900 border-r-2 border-blue-300 sticky left-0 bg-blue-100 z-10">
                      Total
                    </td>
                    {pivotData.columnKeys.map((colKey) => {
                      const colTotal = pivotData.rowKeys.reduce(
                        (sum, rowKey) => sum + (pivotData.data[rowKey][colKey] || 0),
                        0
                      )

                      return (
                        <td
                          key={`total-${colKey}`}
                          className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-blue-900 border-r border-blue-200"
                        >
                          {formatPivotValue(colTotal)}
                        </td>
                      )
                    })}
                    {pivotConfig.showTotals && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-blue-900 bg-blue-200 border-l-2 border-blue-400">
                        {formatPivotValue(
                          pivotData.rowKeys.reduce(
                            (sum, rowKey) =>
                              sum +
                              pivotData.columnKeys.reduce(
                                (rowSum, colKey) =>
                                  rowSum + (pivotData.data[rowKey][colKey] || 0),
                                0
                              ),
                            0
                          )
                        )}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pivot Stats Summary */}
      {pivotData && pivotData.rowKeys.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-slate-600 mb-1">Total Assets</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {assetsCount || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
              Unique {pivotConfig.rowDimension}s
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{pivotData.rowKeys.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
              Unique {pivotConfig.columnDimension}s
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {pivotData.columnKeys.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-slate-600 mb-1">Data Points</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {pivotData.rowKeys.length * pivotData.columnKeys.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(AssetsPivotView)
