/**
 * Assets Section Header Component
 * Header for the assets section with count, total cost, and add button
 */

import React from 'react'
import { Package, Plus } from 'lucide-react'

const AssetsSectionHeader = ({
  assetCount,
  totalAcqCost,
  onAddClick
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            All Assets
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center w-fit px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
          </span>
          <span className="inline-flex items-center w-fit px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
            Total Acq. Cost: PHP {totalAcqCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm touch-manipulation"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden xs:inline">Add New Asset</span>
        <span className="xs:hidden">Add Asset</span>
      </button>
    </div>
  )
}

export default React.memo(AssetsSectionHeader)
