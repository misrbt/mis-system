import { ArrowLeft, ArrowRight, History, LayoutGrid, Package, Table } from 'lucide-react'
import EmployeeHeader from '../../components/asset-view/EmployeeHeader'
import AssetsSectionHeader from '../../components/asset-view/AssetsSectionHeader'
import AssetCardsView from '../../components/asset-view/AssetCardsView'
import AssetTableView from '../../components/asset-view/AssetTableView'
import EmployeeAssetHistory from '../../components/employee/EmployeeAssetHistory'

function EmployeeAssetsView({
  employee,
  employeeAssets,
  totalEmployeeAcqCost,
  employeeHistory,
  employeeHistoryStats,
  employeeViewTab,
  setEmployeeViewTab,
  viewMode,
  setViewMode,
  selectedAssets,
  editingAssetId,
  editFormData,
  onSelectAll,
  onSelectAsset,
  onBulkTransfer,
  statusPickerFor,
  setStatusPickerFor,
  showCodesFor,
  setShowCodesFor,
  categories,
  statuses,
  vendors,
  statusColorMap,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onInputChange,
  onDeleteClick,
  onQuickStatusChange,
  onCodeView,
  onRemarksView,
  navigateToAsset,
  onAddClick,
  isPending,
  isLoadingHistory,
  navigateBack,
}) {
  return (
    <div className="space-y-6 pb-6 sm:pb-0">
      <div className="flex items-center justify-between mb-4 md:mb-0">
        <button
          onClick={navigateBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Back to Assets</span>
          <span className="font-medium sm:hidden">Back</span>
        </button>
      </div>

      <EmployeeHeader employee={employee} />

      <div className="mt-6 sm:mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setEmployeeViewTab('assets')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 border-b-2 transition-colors whitespace-nowrap touch-manipulation font-medium ${
                employeeViewTab === 'assets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm sm:text-base">My Assets</span>
              {employeeAssets.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {employeeAssets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setEmployeeViewTab('history')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 border-b-2 transition-colors whitespace-nowrap touch-manipulation font-medium ${
                employeeViewTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm sm:text-base">Asset History</span>
            </button>
          </div>

          {employeeViewTab === 'assets' && (
            <>
              {employeeAssets.length > 0 ? (
                <>
                  <AssetsSectionHeader
                    assetCount={employeeAssets.length}
                    totalAcqCost={totalEmployeeAcqCost}
                    onAddClick={onAddClick}
                  />

                  <div className="hidden sm:flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                        viewMode === 'cards'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Cards</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                        viewMode === 'table'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Table</span>
                    </button>
                  </div>

                  {viewMode === 'cards' && selectedAssets && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAssets.length === employeeAssets?.length && employeeAssets?.length > 0}
                          onChange={() => onSelectAll(employeeAssets)}
                          className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {selectedAssets.length > 0
                            ? `${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} selected`
                            : 'Select All'}
                        </span>
                      </div>
                      {selectedAssets.length > 0 && (
                        <button
                          onClick={onBulkTransfer}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Bulk Transfer
                        </button>
                      )}
                    </div>
                  )}

                  {viewMode === 'cards' && (
                    <AssetCardsView
                      assets={employeeAssets}
                      editingAssetId={editingAssetId}
                      editFormData={editFormData}
                      categories={categories}
                      statuses={statuses}
                      vendors={vendors}
                      statusColorMap={statusColorMap}
                      statusPickerFor={statusPickerFor}
                      showCodesFor={showCodesFor}
                      selectedAssets={selectedAssets}
                      onSelectAsset={onSelectAsset}
                      onEditClick={onEditClick}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onInputChange={onInputChange}
                      onDeleteClick={onDeleteClick}
                      onQuickStatusChange={onQuickStatusChange}
                      onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
                      onCodeToggle={(assetId, type) => setShowCodesFor((prev) => ({ ...prev, [assetId]: prev[assetId] === type ? null : type }))}
                      onCodeView={onCodeView}
                      onCardClick={navigateToAsset}
                      isPending={isPending}
                    />
                  )}

                  {viewMode === 'table' && (
                    <AssetTableView
                      assets={employeeAssets}
                      categories={categories}
                      statuses={statuses}
                      vendors={vendors}
                      statusColorMap={statusColorMap}
                      statusPickerFor={statusPickerFor}
                      totalEmployeeAcqCost={totalEmployeeAcqCost}
                      onEditClick={onEditClick}
                      onDeleteClick={onDeleteClick}
                      onQuickStatusChange={onQuickStatusChange}
                      onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
                      onCodeView={onCodeView}
                      onRemarksView={onRemarksView}
                      onCardClick={navigateToAsset}
                      onAddClick={onAddClick}
                      isPending={isPending}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No assets assigned</p>
                  <p className="text-gray-400 text-sm mt-1">This employee doesn't have any assets assigned yet</p>
                  <button
                    onClick={onAddClick}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign First Asset
                  </button>
                </div>
              )}
            </>
          )}

          {employeeViewTab === 'history' && (
            <div className="mt-4">
              <EmployeeAssetHistory
                movements={employeeHistory}
                loading={isLoadingHistory}
                statistics={employeeHistoryStats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeAssetsView
