/**
 * Asset Empty State Component
 * Displays when no assets are found
 */

import React from 'react'
import { Package, Plus } from 'lucide-react'

const AssetEmptyState = ({ onAddClick }) => {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
      <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assets Found</h3>
      <p className="text-slate-600 mb-6">This employee has no assets assigned yet.</p>
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          Add First Asset
        </button>
      )}
    </div>
  )
}

export default React.memo(AssetEmptyState)
