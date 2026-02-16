import React, { useState } from 'react'
import {
  BarChart3,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Hash,
  Layers,
  Grid3x3,
} from 'lucide-react'

const DIMENSION_LABELS = {
  category: 'Category',
  status: 'Status',
  branch: 'Branch',
  vendor: 'Vendor',
  employee: 'Employee',
}

const AGG_LABELS = {
  count: 'Count of Assets',
  sum_book_value: 'Total Book Value',
  sum_acq_cost: 'Total Acquisition Cost',
  avg_book_value: 'Average Book Value',
  avg_estimate_life: 'Average Estimated Life',
}

const getCellIntensity = (value, maxValue) => {
  if (!value || !maxValue) return 0
  return Math.min(value / maxValue, 1)
}

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
  const [showConfig, setShowConfig] = useState(true)

  const dimLabel = (key) => DIMENSION_LABELS[key] || key

  return (
    <div className="space-y-4">
      {/* Pivot Configuration — Collapsible */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => setShowConfig((p) => !p)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors rounded-t-lg"
        >
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Pivot Configuration
          </h3>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onExport() }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRefresh() }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
            {showConfig ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {showConfig && (
          <div className="px-4 sm:px-6 pb-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Row Dimension
                </label>
                <select
                  value={pivotConfig.rowDimension}
                  onChange={(e) => onPivotConfigChange('rowDimension', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="category">Category</option>
                  <option value="status">Status</option>
                  <option value="branch">Branch</option>
                  <option value="vendor">Vendor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Column Dimension
                </label>
                <select
                  value={pivotConfig.columnDimension}
                  onChange={(e) => onPivotConfigChange('columnDimension', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="status">Status</option>
                  <option value="category">Category</option>
                  <option value="branch">Branch</option>
                  <option value="vendor">Vendor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Aggregation
                </label>
                <select
                  value={pivotConfig.aggregation}
                  onChange={(e) => onPivotConfigChange('aggregation', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="count">Count</option>
                  <option value="sum_book_value">Sum — Book Value</option>
                  <option value="sum_acq_cost">Sum — Acquisition Cost</option>
                  <option value="avg_book_value">Average — Book Value</option>
                  <option value="avg_estimate_life">Average — Estimated Life</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Options
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
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

            {/* Mobile export buttons */}
            <div className="flex sm:hidden items-center gap-2 mt-3">
              <button
                onClick={onExport}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={onRefresh}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {/* Descriptive summary bar */}
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <Grid3x3 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                <strong className="text-slate-800">{AGG_LABELS[pivotConfig.aggregation]}</strong>{' '}
                grouped by <strong className="text-blue-700">{dimLabel(pivotConfig.rowDimension)}</strong> (rows)
                × <strong className="text-blue-700">{dimLabel(pivotConfig.columnDimension)}</strong> (columns)
                {pivotData && ` · ${pivotData.rowKeys.length} rows × ${pivotData.columnKeys.length} columns`}
              </span>
            </div>
          </div>
        )}
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
            No data available for the selected configuration. Try adjusting your filters or configuration.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider border-r border-slate-700 sticky left-0 bg-slate-800 z-10">
                    {dimLabel(pivotConfig.rowDimension)}
                  </th>
                  {pivotData.columnKeys.map((colKey) => (
                    <th
                      key={colKey}
                      className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider border-r border-slate-700"
                      title={colKey}
                    >
                      <span className="block truncate max-w-[100px] sm:max-w-[140px]">{colKey}</span>
                    </th>
                  ))}
                  {pivotConfig.showTotals && (
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider bg-blue-900 border-l-2 border-blue-700">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pivotData.rowKeys.map((rowKey, rowIndex) => {
                  const rowTotal = pivotData.rowTotals[rowKey] || 0

                  return (
                    <tr
                      key={rowKey}
                      className={`transition-colors hover:bg-blue-50/40 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-800 border-r border-slate-200 sticky left-0 bg-inherit z-10 whitespace-nowrap">
                        <span className="block truncate max-w-[160px] sm:max-w-none" title={rowKey}>
                          {rowKey}
                        </span>
                      </td>
                      {pivotData.columnKeys.map((colKey) => {
                        const value = pivotData.data[rowKey][colKey]
                        const hasValue = value !== undefined && value !== null && value !== 0
                        const intensity = getCellIntensity(value, pivotData.maxCellValue)

                        return (
                          <td
                            key={`${rowKey}-${colKey}`}
                            className={`px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center border-r border-slate-100 tabular-nums ${
                              hasValue ? 'text-slate-800 font-medium' : 'text-slate-300'
                            }`}
                            style={
                              hasValue
                                ? {
                                    backgroundColor: `rgba(59, 130, 246, ${0.04 + intensity * 0.18})`,
                                  }
                                : undefined
                            }
                          >
                            {hasValue ? formatPivotValue(value) : '—'}
                          </td>
                        )
                      })}
                      {pivotConfig.showTotals && (
                        <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-center text-blue-900 bg-blue-50 border-l-2 border-blue-200 tabular-nums">
                          {formatPivotValue(rowTotal)}
                        </td>
                      )}
                    </tr>
                  )
                })}

                {/* Totals Row */}
                {pivotConfig.showTotals && (
                  <tr className="bg-slate-800 font-bold">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white border-r border-slate-700 sticky left-0 bg-slate-800 z-10">
                      Total
                    </td>
                    {pivotData.columnKeys.map((colKey) => {
                      const colTotal = pivotData.colTotals[colKey] || 0
                      return (
                        <td
                          key={`total-${colKey}`}
                          className="px-2 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-center text-slate-200 border-r border-slate-700 tabular-nums"
                        >
                          {formatPivotValue(colTotal)}
                        </td>
                      )
                    })}
                    <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-center text-white bg-blue-800 border-l-2 border-blue-600 tabular-nums">
                      {formatPivotValue(pivotData.grandTotal)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {pivotData && pivotData.rowKeys.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Total Assets</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900">{assetsCount || 0}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium truncate">
                {dimLabel(pivotConfig.rowDimension)}s
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">{pivotData.rowKeys.length}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Grid3x3 className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium truncate">
                {dimLabel(pivotConfig.columnDimension)}s
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600">{pivotData.columnKeys.length}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Data Points</div>
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {pivotData.rowKeys.length * pivotData.columnKeys.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(AssetsPivotView)
