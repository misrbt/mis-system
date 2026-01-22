import AddAssetModal from "../../../components/asset-view/AddAssetModal";
import DeleteConfirmModal from "../../../components/asset-view/DeleteConfirmModal";
import BulkTransferModal from "./BulkTransferModal";
import CodeModal from "./CodeModal";
import EditAssetModal from "./EditAssetModal";
import RemarksModal from "./RemarksModal";
import VendorModal from "./VendorModal";
import RepairFormModal from "../../../components/RepairFormModal";

function AssetViewModals({ controller, isEmployeeView }) {
  const {
    codeModal,
    remarksModal,
    showAddModal,
    addFormData,
    categories,
    addSubcategories,
    editSubcategories,
    vendors,
    statuses,
    equipmentOptions,
    components,
    showDeleteModal,
    deleteTarget,
    showEditModal,
    editModalData,
    editFormData,
    isVendorModalOpen,
    vendorFormData,
    isBulkTransferModalOpen,
    selectedAssets,
    employeeSearch,
    filteredEmployees,
    isLoadingEmployees,
    employees,
    selectedEmployeeId,
    handleDownloadCode,
    handlePrintCode,
    setCodeModal,
    setRemarksModal,
    setShowAddModal,
    handleAddInputChange,
    generateSerialNumber,
    generateComponentSerialNumber,
    handleAddAsset,
    handleComponentAdd,
    handleComponentRemove,
    handleComponentChange,
    openVendorModal,
    handleVendorInputChange,
    handleCreateVendor,
    setIsVendorModalOpen,
    handleSubmitBulkTransfer,
    setEmployeeSearch,
    setSelectedEmployeeId,
    closeBulkTransferModal,
    closeDeleteModal,
    confirmDelete,
    handleCancelEdit,
    handleInputChange,
    handleSaveEdit,
    addAssetPending,
    vendorPending,
    bulkTransferPending,
    updateAssetPending,
    deleteAssetPending,
    isRepairModalOpen,
    repairModalAsset,
    closeRepairModal,
  } = controller;

  return (
    <>
      <CodeModal
        codeModal={codeModal}
        onClose={() => setCodeModal(null)}
        onDownload={handleDownloadCode}
        onPrint={handlePrintCode}
      />

      {isEmployeeView && (
        <>
          <RemarksModal
            remarksModal={remarksModal}
            onClose={() => setRemarksModal(null)}
          />

          <AddAssetModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            formData={addFormData}
            onInputChange={handleAddInputChange}
            categories={categories}
            subcategories={addSubcategories}
            equipmentOptions={equipmentOptions}
            vendors={vendors}
            statuses={statuses}
            onGenerateSerial={generateSerialNumber}
            onGenerateComponentSerial={generateComponentSerialNumber}
            onSubmit={handleAddAsset}
            isPending={addAssetPending}
            components={components}
            onComponentAdd={handleComponentAdd}
            onComponentRemove={handleComponentRemove}
            onComponentChange={handleComponentChange}
            onAddVendor={openVendorModal}
          />

          <VendorModal
            isOpen={isVendorModalOpen}
            vendorFormData={vendorFormData}
            onClose={() => setIsVendorModalOpen(false)}
            onChange={handleVendorInputChange}
            onSubmit={handleCreateVendor}
            isPending={vendorPending}
          />

          <BulkTransferModal
            isOpen={isBulkTransferModalOpen}
            onClose={closeBulkTransferModal}
            selectedAssets={selectedAssets}
            employeeSearch={employeeSearch}
            onEmployeeSearchChange={(value) => {
              setEmployeeSearch(value);
              setSelectedEmployeeId("");
            }}
            filteredEmployees={filteredEmployees}
            isLoadingEmployees={isLoadingEmployees}
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={(employeeId, fullname) => {
              setSelectedEmployeeId(employeeId);
              setEmployeeSearch(fullname);
            }}
            onSubmit={() => handleSubmitBulkTransfer(selectedEmployeeId)}
            isSubmitting={bulkTransferPending}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            assetName={deleteTarget?.name}
            isPending={deleteAssetPending}
          />

          <EditAssetModal
            isOpen={showEditModal}
            data={editModalData}
            categories={categories}
            subcategories={editSubcategories}
            statuses={statuses}
            vendors={vendors}
            equipmentOptions={equipmentOptions}
            formData={editFormData}
            onClose={handleCancelEdit}
            onChange={(field, value) => handleInputChange(field, value)}
            onSave={handleSaveEdit}
            isPending={updateAssetPending}
          />

          <RepairFormModal
            isOpen={isRepairModalOpen}
            onClose={closeRepairModal}
            asset={repairModalAsset}
          />
        </>
      )}
    </>
  );
}

export default AssetViewModals;
