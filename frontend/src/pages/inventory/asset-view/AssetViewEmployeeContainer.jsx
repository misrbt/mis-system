import EmployeeAssetsView from "./EmployeeAssetsView";
import { useSearchParams } from "react-router-dom";

function AssetViewEmployeeContainer({ controller }) {
  const [searchParams] = useSearchParams();
  const highlightedAssetId = searchParams.get("highlight") ? Number(searchParams.get("highlight")) : null;

  const {
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
    statusPickerFor,
    setStatusPickerFor,
    showCodesFor,
    setShowCodesFor,
    categories,
    editSubcategories,
    statuses,
    vendors,
    statusColorMap,
    isLoadingHistory,
    isLoadingEmployee,
    isPending,
    handleSelectAll,
    handleSelectAsset,
    handleBulkTransfer,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleInputChange,
    handleDeleteAsset,
    handleQuickStatusChange,
    openAddModal,
    setCodeModal,
    setRemarksModal,
    navigateToAsset,
    navigateToAssetComponents,
    navigateBack,
    navigateToWorkstations,
    editComponents,
    handleEditComponentAdd,
    handleEditComponentRemove,
    handleEditComponentChange,
    generateEditComponentSerialNumber,
  } = controller;

  // Show loading state while employee data is fetching
  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Show error state if employee failed to load
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 text-lg font-medium mb-2">Employee not found</p>
          <p className="text-slate-400 text-sm mb-4">The employee data could not be loaded.</p>
          <button
            onClick={() => navigateToWorkstations()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Workstations
          </button>
        </div>
      </div>
    );
  }

  return (
    <EmployeeAssetsView
      highlightedAssetId={highlightedAssetId}
      employee={employee}
      employeeAssets={employeeAssets}
      totalEmployeeAcqCost={totalEmployeeAcqCost}
      employeeHistory={employeeHistory}
      employeeHistoryStats={employeeHistoryStats}
      employeeViewTab={employeeViewTab}
      setEmployeeViewTab={setEmployeeViewTab}
      viewMode={viewMode}
      setViewMode={setViewMode}
      selectedAssets={selectedAssets}
      editingAssetId={editingAssetId}
      editFormData={editFormData}
      equipmentOptions={controller.equipmentOptions}
      onSelectAll={handleSelectAll}
      onSelectAsset={handleSelectAsset}
      onBulkTransfer={handleBulkTransfer}
      statusPickerFor={statusPickerFor}
      setStatusPickerFor={setStatusPickerFor}
      showCodesFor={showCodesFor}
      setShowCodesFor={setShowCodesFor}
      categories={categories}
      editSubcategories={editSubcategories}
      statuses={statuses}
      vendors={vendors}
      statusColorMap={statusColorMap}
      onEditClick={handleEditClick}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onInputChange={(field, value) => handleInputChange(field, value)}
      onDeleteClick={(assetId, assetName) =>
        handleDeleteAsset(assetId, assetName)
      }
      onQuickStatusChange={handleQuickStatusChange}
      onCodeView={(code) => setCodeModal(code)}
      onRemarksView={(asset) =>
        setRemarksModal({
          asset_name: asset.asset_name,
          remarks: asset.remarks,
        })
      }
      navigateToAsset={navigateToAsset}
      navigateToAssetComponents={navigateToAssetComponents}
      onAddClick={openAddModal}
      isPending={isPending}
      isLoadingHistory={isLoadingHistory}
      navigateBack={() => (window.history.length > 1 ? navigateBack() : navigateToWorkstations())}
      editComponents={editComponents}
      onEditComponentAdd={handleEditComponentAdd}
      onEditComponentRemove={handleEditComponentRemove}
      onEditComponentChange={handleEditComponentChange}
      onGenerateEditComponentSerial={generateEditComponentSerialNumber}
    />
  );
}

export default AssetViewEmployeeContainer;
