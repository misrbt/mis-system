/**
 * Asset Table View Component
 * Displays assets in a table layout with inline editing
 * Code-split for better performance and maintainability
 */

import React from 'react'
import AssetTableRow from './AssetTableRow'
import AssetEmptyState from './AssetEmptyState'

const AssetTableView = ({
  assets,
  statuses,
  statusColorMap,
  statusPickerFor,
  totalEmployeeAcqCost,
  onEditClick,
  onDeleteClick,
  onQuickStatusChange,
  onStatusPickerToggle,
  onCodeView,
  onCardClick,
  onAddClick,
  onRemarksView,
  isPending,
}) => {
  // Empty state
  if (assets.length === 0) {
    return <AssetEmptyState onAddClick={onAddClick} />
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Brand & Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Serial #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Warranty Exp.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Est. Life (Yrs)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Acq. Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Book Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  QR/Barcode
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider sticky right-0 bg-gradient-to-r from-slate-50 to-slate-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.map((asset) => (
                <AssetTableRow
                  key={asset.id}
                  asset={asset}
                  statusColorMap={statusColorMap}
                  showStatusPicker={statusPickerFor === asset.id}
                  totalEmployeeAcqCost={totalEmployeeAcqCost}
                  statuses={statuses}
                  onEdit={() => onEditClick(asset)}
                  onDelete={() => onDeleteClick(asset.id, asset.asset_name)}
                  onStatusChange={(statusId) => {
                    onQuickStatusChange(asset.id, statusId)
                    onStatusPickerToggle(null)
                  }}
                  onStatusPickerToggle={() => onStatusPickerToggle(statusPickerFor === asset.id ? null : asset.id)}
                  onCodeView={onCodeView}
                  onRemarksView={() => onRemarksView?.(asset)}
                  onRowClick={() => onCardClick?.(asset.id)}
                  isPending={isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetTableView)
