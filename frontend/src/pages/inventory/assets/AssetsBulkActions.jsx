import React from 'react'
import { Trash2 } from 'lucide-react'

const AssetsBulkActions = ({
  selectedCount,
  viewMode,
  onBulkDelete,
  onClearSelection,
}) => {
  if (!selectedCount || viewMode !== 'table') {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-blue-900 text-center xs:text-left">
          {selectedCount} asset(s) selected
        </span>
        <div className="flex flex-col xs:flex-row items-stretch gap-2">
          <button
            onClick={onBulkDelete}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-all flex-1 xs:flex-initial"
          >
            <Trash2 className="w-4 h-4" />
            <span className="whitespace-nowrap">Delete Selected</span>
          </button>
          <button
            onClick={onClearSelection}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex-1 xs:flex-initial"
          >
            <span className="whitespace-nowrap">Clear Selection</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetsBulkActions)
