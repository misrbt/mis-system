import EmployeeAssetsView from "./EmployeeAssetsView";

function AssetViewEmployeeContainer({ controller }) {
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
    statuses,
    vendors,
    statusColorMap,
    isLoadingHistory,
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
    navigateToAssets,
  } = controller;

  // Show loading state while employee data is fetching
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <EmployeeAssetsView
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
      onAddClick={openAddModal}
      isPending={isPending}
      isLoadingHistory={isLoadingHistory}
      navigateBack={navigateToAssets}
    />
  );
}

export default AssetViewEmployeeContainer;
