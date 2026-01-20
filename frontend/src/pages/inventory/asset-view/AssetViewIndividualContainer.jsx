import { Package } from "lucide-react";
import IndividualAssetView from "./IndividualAssetView";

function AssetViewIndividualContainer({ controller }) {
  const {
    asset,
    statistics,
    movements,
    assignments,
    isLoadingMovements,
    isLoadingAssignments,
    statuses,
    statusColorMap,
    statusPickerFor,
    activeTab,
    setActiveTab,
    isTransferModalOpen,
    isReturnModalOpen,
    isStatusModalOpen,
    isRepairModalOpen,
    repairModalAsset,
    setStatusPickerFor,
    handleQuickStatusChange,
    navigateBack,
    navigateToAssets,
    navigateToEmployeeAssets,
    navigateToAssetComponents,
    openTransferModal,
    openReturnModal,
    openStatusModal,
    openRepairModal,
    closeTransferModal,
    closeReturnModal,
    closeStatusModal,
    closeRepairModal,
  } = controller;

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700">Asset Not Found</h2>
        <button
          onClick={navigateToAssets}
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  return (
    <IndividualAssetView
      asset={asset}
      statistics={statistics}
      movements={movements}
      assignments={assignments}
      isLoadingMovements={isLoadingMovements}
      isLoadingAssignments={isLoadingAssignments}
      statuses={statuses}
      statusColorMap={statusColorMap}
      statusPickerFor={statusPickerFor}
      onStatusPickerToggle={(assetId) =>
        setStatusPickerFor(statusPickerFor === assetId ? null : assetId)
      }
      onQuickStatusChange={handleQuickStatusChange}
      onBack={navigateBack}
      onOpenTransfer={openTransferModal}
      onOpenReturn={openReturnModal}
      onOpenStatusUpdate={openStatusModal}
      onOpenRepair={openRepairModal}
      onCloseTransfer={closeTransferModal}
      onCloseReturn={closeReturnModal}
      onCloseStatusUpdate={closeStatusModal}
      onCloseRepair={closeRepairModal}
      isTransferModalOpen={isTransferModalOpen}
      isReturnModalOpen={isReturnModalOpen}
      isStatusModalOpen={isStatusModalOpen}
      isRepairModalOpen={isRepairModalOpen}
      repairModalAsset={repairModalAsset || asset}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navigateToEmployeeAssets={navigateToEmployeeAssets}
      navigateToAssetComponents={navigateToAssetComponents}
    />
  );
}

export default AssetViewIndividualContainer;
