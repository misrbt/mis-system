import DeleteConfirmModal from "../../../components/asset-view/DeleteConfirmModal";
import BulkTransferModal from "./BulkTransferModal";
import CodeModal from "./CodeModal";
import AssetFormModal from "../../../components/asset-view/AssetFormModal";
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
    editComponents,
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
    handleEditComponentAdd,
    handleEditComponentRemove,
    handleEditComponentChange,
    generateEditComponentSerialNumber,
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
    branchOptions,
    positionOptions,
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

          <AssetFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Create New Asset"
            submitLabel="Create Asset"
            formData={addFormData}
            onInputChange={handleAddInputChange}
            categories={categories}
            subcategories={addSubcategories}
            equipmentOptions={equipmentOptions}
            vendorOptions={vendors}
            employeeOptions={employees}
            statusOptions={statuses}
            branchOptions={branchOptions}
            positionOptions={positionOptions}
            showStatus={true}
            showBookValue={false}
            assignmentTitle="Assigned Employee"
            assignmentSubtitle="Initial Employee Assignment"
            usePlaceholders={true}
            onGenerateSerial={generateSerialNumber}
            onGenerateComponentSerial={generateComponentSerialNumber}
            onSubmit={handleAddAsset}
            isSubmitting={addAssetPending}
            components={components}
            onComponentAdd={handleComponentAdd}
            onComponentRemove={handleComponentRemove}
            onComponentChange={handleComponentChange}
            onAddVendor={openVendorModal}
            isEditMode={false}
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

          <AssetFormModal
            isOpen={showEditModal}
            data={editModalData}
            title="Edit Asset Details"
            submitLabel="Save Changes"
            categories={categories}
            subcategories={editSubcategories}
            statusOptions={statuses}
            vendorOptions={vendors}
            employeeOptions={employees}
            equipmentOptions={equipmentOptions}
            branchOptions={branchOptions}
            positionOptions={positionOptions}
            formData={editFormData}
            onClose={handleCancelEdit}
            onInputChange={(field, value) => handleInputChange(field, value)}
            usePlaceholders={false}
            showStatus={true}
            showBookValue={true}
            assignmentTitle="Assigned Employee"
            assignmentSubtitle="Current employee holding this asset"
            onSubmit={handleSaveEdit}
            isSubmitting={updateAssetPending}
            components={editComponents}
            onComponentAdd={handleEditComponentAdd}
            onComponentRemove={handleEditComponentRemove}
            onComponentChange={handleEditComponentChange}
            onGenerateComponentSerial={generateEditComponentSerialNumber}
            isEditMode={true}
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
