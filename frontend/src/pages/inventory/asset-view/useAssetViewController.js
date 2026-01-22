import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import apiClient from "../../../services/apiClient";
import { useAssetDropdownData } from "../../../hooks/useAssetDropdownData";
import { useAssetQueryInvalidation } from "../../../hooks/useAssetQueryInvalidation";
import { buildSerialNumber } from "../../../utils/assetSerial";
import { fetchEmployeeAssetHistory } from "../../../services/employeeAssetHistoryService";

export default function useAssetViewController({ id, employeeId }) {
  const isAssetView = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invalidateAssetRelatedQueries } = useAssetQueryInvalidation();

  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const [statusPickerFor, setStatusPickerFor] = useState(null);
  const [showCodesFor, setShowCodesFor] = useState({});
  const [codeModal, setCodeModal] = useState(null);
  const [remarksModal, setRemarksModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const serialGenRef = useRef(null);
  const [addFormData, setAddFormData] = useState({
    asset_name: "",
    asset_category_id: "",
    subcategory_id: "",
    brand: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    acq_cost: "",
    waranty_expiration_date: "",
    estimate_life: "",
    vendor_id: "",
    remarks: "",
    specifications: {},
    assigned_to_employee_id: "",
  });
  const [components, setComponents] = useState([]);

  // Movement tracking state (for individual asset view)
  const [activeTab, setActiveTab] = useState("timeline");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairModalAssetId, setRepairModalAssetId] = useState(null);

  // Employee view tab state
  const [employeeViewTab, setEmployeeViewTab] = useState("assets");

  // Vendor creation state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    company_name: "",
    contact_no: "",
    address: "",
  });

  // Multi-select state for bulk operations
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isBulkTransferModalOpen, setIsBulkTransferModalOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Fetch single asset details (when viewing individual asset)
  const { data: assetData, isLoading: isLoadingAsset } = useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${id}`);
      return response.data;
    },
    enabled: isAssetView,
  });

  const asset = assetData?.data;

  // Fetch employee details (when viewing employee's assets or from asset's assignment)
  const actualEmployeeId = employeeId || asset?.assigned_to_employee_id;
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", actualEmployeeId],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${actualEmployeeId}`);
      return response.data;
    },
    enabled: !!actualEmployeeId,
  });

  const employee = employeeData?.data;

  // Fetch asset for repair modal (when opened from cards view quick status change)
  const { data: repairModalAssetData } = useQuery({
    queryKey: ["asset", repairModalAssetId],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${repairModalAssetId}`);
      return response.data;
    },
    enabled:
      !!repairModalAssetId && isRepairModalOpen && repairModalAssetId !== id,
  });

  const repairModalAsset = repairModalAssetData?.data;

  // Fetch all assets assigned to this employee
  const { data: employeeAssetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["employeeAssets", actualEmployeeId],
    queryFn: async () => {
      const response = await apiClient.get("/assets", {
        params: { assigned_to_employee_id: actualEmployeeId },
      });
      return response.data;
    },
    enabled: !!actualEmployeeId,
  });

  const employeeAssets = useMemo(
    () =>
      Array.isArray(employeeAssetsData?.data) ? employeeAssetsData.data : [],
    [employeeAssetsData]
  );
  const totalEmployeeAcqCost = useMemo(() => {
    return employeeAssets.reduce((sum, assetItem) => {
      const value = Number(assetItem?.acq_cost);
      if (Number.isNaN(value)) return sum;
      return sum + value;
    }, 0);
  }, [employeeAssets]);

  // Fetch employee asset history
  const { data: employeeHistoryData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["employee-asset-history", actualEmployeeId],
    queryFn: async () => {
      const response = await fetchEmployeeAssetHistory(actualEmployeeId);
      return response.data;
    },
    enabled: !!actualEmployeeId && employeeViewTab === "history",
  });

  const employeeHistory = employeeHistoryData?.data || [];
  const employeeHistoryStats = employeeHistoryData?.statistics || {};

  // Fetch dropdown data using custom hook (consolidated)
  const {
    categories,
    statuses,
    vendors,
    equipment,
    statusColorMap,
    isLoading: isLoadingDropdowns,
  } = useAssetDropdownData();

  // Fetch subcategories for add form (based on selected category)
  const { data: addSubcategoriesData } = useQuery({
    queryKey: ["asset-subcategories", addFormData.asset_category_id],
    queryFn: async () => {
      if (!addFormData.asset_category_id) return [];
      const response = await apiClient.get(`/asset-categories/${addFormData.asset_category_id}/subcategories`);
      return Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!addFormData.asset_category_id,
  });

  const addSubcategories = addSubcategoriesData || [];

  // Fetch subcategories for edit form (based on selected category)
  const { data: editSubcategoriesData } = useQuery({
    queryKey: ["asset-subcategories", editFormData.asset_category_id],
    queryFn: async () => {
      if (!editFormData.asset_category_id) return [];
      const response = await apiClient.get(`/asset-categories/${editFormData.asset_category_id}/subcategories`);
      return Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!editFormData.asset_category_id,
  });

  const editSubcategories = editSubcategoriesData || [];

  const equipmentOptions = useMemo(
    () =>
      (Array.isArray(equipment) ? equipment : []).map((eq) => ({
        id: eq.id,
        name: `${eq.brand} ${eq.model}`.trim(),
        brand: eq.brand,
        model: eq.model,
        asset_category_id: eq.asset_category_id,
        subcategory_id: eq.subcategory_id,
        category_name: eq.category?.name,
        subcategory_name: eq.subcategory?.name,
      })),
    [equipment]
  );

  const resolveEquipmentId = (brand, model) => {
    const match = equipmentOptions.find(
      (eq) => eq.brand === brand && eq.model === model
    );
    return match?.id || null;
  };

  // Fetch employees for bulk transfer
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await apiClient.get("/employees");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const employees = useMemo(() => employeesData?.data || [], [employeesData?.data]);

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;

    // Trim and normalize search input (case-insensitive, no extra spaces)
    const searchTrimmed = employeeSearch.trim();
    if (!searchTrimmed) return employees;

    const searchLower = searchTrimmed.toLowerCase();

    return employees.filter((employee) => {
      // Search across multiple fields with null-safe checks
      const fullnameLower = employee.fullname?.toLowerCase() || '';
      const firstnameLower = employee.firstname?.toLowerCase() || '';
      const lastnameLower = employee.lastname?.toLowerCase() || '';
      const branchLower = employee.branch?.branch_name?.toLowerCase() || '';
      const positionLower = employee.position?.position_name?.toLowerCase() || '';
      const emailLower = employee.email?.toLowerCase() || '';

      return (
        fullnameLower.includes(searchLower) ||
        firstnameLower.includes(searchLower) ||
        lastnameLower.includes(searchLower) ||
        branchLower.includes(searchLower) ||
        positionLower.includes(searchLower) ||
        emailLower.includes(searchLower)
      );
    });
  }, [employees, employeeSearch]);

  const isLoading =
    isLoadingAsset ||
    isLoadingEmployee ||
    isLoadingAssets ||
    isLoadingDropdowns;

  // Movement tracking queries (for individual asset view)
  const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
    queryKey: ["asset-movements", id],
    queryFn: async () =>
      (await apiClient.get(`/assets/${id}/movements/history`)).data,
    enabled: isAssetView && !!id,
  });

  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["asset-assignments", id],
    queryFn: async () =>
      (await apiClient.get(`/assets/${id}/movements/assignments`)).data,
    enabled: isAssetView && !!id,
  });

  const { data: statisticsData } = useQuery({
    queryKey: ["asset-statistics", id],
    queryFn: async () =>
      (await apiClient.get(`/assets/${id}/movements/statistics`)).data,
    enabled: isAssetView && !!id,
  });

  const movements = movementsData?.data || [];
  const assignments = assignmentsData?.data || [];
  const statistics = statisticsData?.data || {};

  const updateAssetMutation = useMutation({
    mutationFn: async ({ assetId, data }) => {
      const response = await apiClient.put(`/assets/${assetId}`, data);
      return response.data;
    },
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId);
      setEditingAssetId(null);
      setEditFormData({});
      setShowEditModal(false);
      setEditModalData(null);

      Swal.fire({
        icon: "success",
        title: "Asset Updated",
        text: "Asset has been updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) => {
      if (!assetId) {
        throw new Error("Invalid asset id");
      }
      const numericId = Number(assetId);
      try {
        const compsRes = await apiClient.get(`/assets/${numericId}/components`);
        const comps = compsRes.data?.data || [];
        if (Array.isArray(comps) && comps.length) {
          await Promise.allSettled(
            comps.map((comp) =>
              apiClient.delete(`/asset-components/${comp.id}`)
            )
          );
        }
      } catch (err) {
        console.warn("Component cleanup before asset delete failed", err);
      }

      const response = await apiClient.delete(`/assets/${numericId}`);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId),
        queryClient.invalidateQueries({
          queryKey: ["employeeAssets", actualEmployeeId],
        }),
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
      ]);

      if (id) {
        navigate("/inventory/assets");
      }

      setSelectedAssets((prev) =>
        deleteTarget?.id
          ? prev.filter((assetId) => assetId !== deleteTarget.id)
          : prev
      );
      setShowDeleteModal(false);
      setDeleteTarget(null);

      Swal.fire({
        icon: "success",
        title: "Asset Deleted",
        text: "Asset has been deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const deleteErrorMessage =
        (error &&
          error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Failed to delete asset";

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: deleteErrorMessage,
        confirmButtonText: "OK",
      });
    },
  });

  const addAssetMutation = useMutation({
    mutationFn: async (data) => {
      console.log("Creating asset with data:", data);
      const response = await apiClient.post("/assets", data);
      console.log("Asset creation response:", response.data);
      return response.data;
    },
    onSuccess: async (data) => {
      console.log("Asset created successfully:", data);
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId);

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Asset created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowAddModal(false);
      setComponents([]);
      setAddFormData({
        asset_name: "",
        asset_category_id: "",
        subcategory_id: "",
        brand: "",
        model: "",
        serial_number: "",
        purchase_date: "",
        acq_cost: "",
        waranty_expiration_date: "",
        estimate_life: "",
        vendor_id: "",
        remarks: "",
        specifications: {},
        assigned_to_employee_id: "",
      });
    },
    onError: (error) => {
      const hasResponse = error && error.response && error.response.data;
      const errorData = hasResponse ? error.response.data : null;
      const errorMessage =
        (errorData &&
          errorData.errors &&
          Object.values(errorData.errors).flat().join("\n")) ||
        (errorData && errorData.message) ||
        error.message ||
        "Failed to create asset";

      Swal.fire({
        icon: "error",
        title: "Error Creating Asset",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: (data) => apiClient.post("/vendors", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["vendors"]);
      setIsVendorModalOpen(false);
      setVendorFormData({
        company_name: "",
        contact_no: "",
        address: "",
      });
      if (response.data?.data?.id) {
        setAddFormData((prev) => ({
          ...prev,
          vendor_id: response.data.data.id,
        }));
      }
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Vendor created successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const errorData =
        error && error.response && error.response.data
          ? error.response.data
          : null;
      const errorMessage =
        (errorData && errorData.message) ||
        error.message ||
        "Failed to create vendor";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    },
  });

  const bulkTransferMutation = useMutation({
    mutationFn: async ({ assetIds, employeeId: targetEmployeeId }) => {
      const response = await apiClient.post("/assets/movements/bulk-transfer", {
        asset_ids: assetIds,
        to_employee_id: targetEmployeeId,
        reason: "Bulk transfer",
        remarks: `Transferred ${assetIds.length} asset(s) in bulk operation`,
      });
      return response.data;
    },
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId);
      setIsBulkTransferModalOpen(false);
      setSelectedAssets([]);
      setEmployeeSearch("");
      setSelectedEmployeeId("");
      Swal.fire({
        icon: "success",
        title: "Assets Transferred",
        text: "Selected assets have been transferred successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      const errorData =
        error && error.response && error.response.data
          ? error.response.data
          : null;
      const errorMessage =
        (errorData && errorData.message) ||
        error.message ||
        "Failed to transfer assets";
      Swal.fire({
        icon: "error",
        title: "Transfer Failed",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    },
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const handleEditClick = (empAsset) => {
    if (viewMode === "table") {
      setEditModalData(empAsset);
      setEditFormData({
        asset_name: empAsset.asset_name || "",
        asset_category_id: empAsset.asset_category_id || "",
        subcategory_id: empAsset.subcategory_id || "",
        equipment_id: empAsset.equipment_id || "",
        brand: empAsset.brand || empAsset.equipment?.brand || "",
        model: empAsset.model || empAsset.equipment?.model || "",
        serial_number: empAsset.serial_number || "",
        purchase_date: formatDateForInput(empAsset.purchase_date),
        acq_cost: empAsset.acq_cost || "",
        waranty_expiration_date: formatDateForInput(
          empAsset.waranty_expiration_date
        ),
        estimate_life: empAsset.estimate_life || "",
        vendor_id: empAsset.vendor_id || "",
        status_id: empAsset.status_id || "",
        remarks: empAsset.remarks || "",
        specifications: empAsset.specifications || {},
        assigned_to_employee_id: empAsset.assigned_to_employee_id || "",
      });
      setShowEditModal(true);
    } else {
      setEditingAssetId(empAsset.id);
      setEditFormData({
        asset_name: empAsset.asset_name || "",
        asset_category_id: empAsset.asset_category_id || "",
        subcategory_id: empAsset.subcategory_id || "",
        equipment_id: empAsset.equipment_id || "",
        brand: empAsset.brand || empAsset.equipment?.brand || "",
        model: empAsset.model || empAsset.equipment?.model || "",
        serial_number: empAsset.serial_number || "",
        purchase_date: formatDateForInput(empAsset.purchase_date),
        acq_cost: empAsset.acq_cost || "",
        waranty_expiration_date: formatDateForInput(
          empAsset.waranty_expiration_date
        ),
        estimate_life: empAsset.estimate_life || "",
        vendor_id: empAsset.vendor_id || "",
        status_id: empAsset.status_id || "",
        remarks: empAsset.remarks || "",
        specifications: empAsset.specifications || {},
        assigned_to_employee_id: empAsset.assigned_to_employee_id || "",
      });
    }
  };

  const handleSaveEdit = () => {
    const normalizedEditData = {
      ...editFormData,
      asset_category_id: editFormData.asset_category_id
        ? Number(editFormData.asset_category_id)
        : null,
      subcategory_id: editFormData.subcategory_id
        ? Number(editFormData.subcategory_id)
        : null,
      vendor_id: editFormData.vendor_id ? Number(editFormData.vendor_id) : null,
      status_id: editFormData.status_id ? Number(editFormData.status_id) : null,
      assigned_to_employee_id: editFormData.assigned_to_employee_id
        ? Number(editFormData.assigned_to_employee_id)
        : null,
    };
    if (editModalData) {
      const equipmentId = resolveEquipmentId(editFormData.brand, editFormData.model);
      updateAssetMutation.mutate({
        assetId: editModalData.id,
        data: {
          ...normalizedEditData,
          equipment_id: equipmentId,
        },
      });
    } else if (editingAssetId) {
      const equipmentId = resolveEquipmentId(editFormData.brand, editFormData.model);
      updateAssetMutation.mutate({
        assetId: editingAssetId,
        data: {
          ...normalizedEditData,
          equipment_id: equipmentId,
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAssetId(null);
    setEditFormData({});
    setShowEditModal(false);
    setEditModalData(null);
  };

  const handleDeleteAsset = (assetId, assetName) => {
    setDeleteTarget({ id: assetId, name: assetName });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteAssetMutation.mutate(deleteTarget.id);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear subcategory when category changes
      if (field === 'asset_category_id') {
        newData.subcategory_id = '';
      }

      // Auto-generate asset name when relevant fields change
      if (['asset_category_id', 'subcategory_id', 'brand', 'model'].includes(field)) {
        // Find category and subcategory names
        const categoryName = categories?.find(cat => cat.id == newData.asset_category_id)?.name || '';
        const subcategoryName = editSubcategories?.find(sub => sub.id == newData.subcategory_id)?.name || '';

        // Build asset name from parts (filter out empty strings)
        const parts = [categoryName, subcategoryName, newData.brand, newData.model]
          .map(part => part?.trim())
          .filter(part => part);

        const generatedName = parts.join(' ');
        if (generatedName) {
          newData.asset_name = generatedName;
        }
      }

      return newData;
    });
  };

  const handleAddInputChange = (field, value) => {
    setAddFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear subcategory when category changes
      if (field === 'asset_category_id') {
        newData.subcategory_id = '';
      }

      const categoryName = categories?.find(cat => cat.id == newData.asset_category_id)?.name || '';
      const subcategoryName = addSubcategories?.find(sub => sub.id == newData.subcategory_id)?.name || '';

      // Auto-generate asset name when relevant fields change
      if (['asset_category_id', 'subcategory_id', 'brand', 'model'].includes(field)) {
        // Build asset name from parts (filter out empty strings)
        const parts = [categoryName, subcategoryName, newData.brand, newData.model]
          .map(part => part?.trim())
          .filter(part => part);

        const generatedName = parts.join(' ');
        if (generatedName) {
          newData.asset_name = generatedName;
        }
      }

      if (field === 'asset_category_id') {
        const lowerCategoryName = categoryName.toLowerCase();
        const isMonitorCategory = lowerCategoryName.includes('monitor') || lowerCategoryName.includes('display');
        const refreshRate = newData.specifications?.refresh_rate;
        const hasRefreshRate = refreshRate !== undefined && refreshRate !== null && refreshRate !== '';

        if (isMonitorCategory && !hasRefreshRate) {
          newData.specifications = {
            ...(newData.specifications || {}),
            refresh_rate: 60,
          };
        }
      }

      return newData;
    });
  };

  const handleComponentAdd = () => {
    const defaultStatus =
      statuses.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('functional')
      )?.id ??
      statuses.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('working')
      )?.id ??
      statuses.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('functional')
      )?.value ??
      statuses.find((status) =>
        (status.name || status.label || '').toLowerCase().includes('working')
      )?.value ??
      "";
    setComponents((prev) => [
      ...prev,
      {
        id: Date.now(),
        component_type: "system_unit",
        component_name: "",
        brand: "",
        model: "",
        serial_number: "",
        status_id: defaultStatus,
        acq_cost: "",
        remarks: "",
      },
    ]);
  };

  const handleComponentRemove = (componentId) => {
    setComponents((prev) => prev.filter((c) => c.id !== componentId));
  };

  const handleComponentChange = (componentId, field, value) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, [field]: value } : c))
    );
  };

  const generateSerialNumber = () => {
    const selectedCategory = categories.find(
      (cat) => cat.id == addFormData.asset_category_id
    );

    const categoryCode =
      selectedCategory?.code ||
      selectedCategory?.name?.substring(0, 3).toUpperCase() ||
      "AST";
    if (!serialGenRef.current) {
      serialGenRef.current = {
        categoryCode,
        serialNumber: buildSerialNumber(categoryCode),
      };
    }
    if (serialGenRef.current?.categoryCode !== categoryCode) {
      serialGenRef.current = {
        categoryCode,
        serialNumber: buildSerialNumber(categoryCode),
      };
    }

    setAddFormData((prev) => ({
      ...prev,
      serial_number: serialGenRef.current.serialNumber,
    }));
  };

  const generateComponentSerialNumber = (componentId) => {
    const serialNumber = buildSerialNumber("COMP");
    setComponents((prev) =>
      prev.map((c) =>
        c.id === componentId ? { ...c, serial_number: serialNumber } : c
      )
    );
  };

  const handleAddAsset = () => {
    if (!addFormData.asset_name || !addFormData.asset_category_id) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in asset name and category",
      });
      return;
    }

    const dataToSubmit = {
      ...addFormData,
      assigned_to_employee_id: actualEmployeeId || null,
      asset_category_id: addFormData.asset_category_id
        ? Number(addFormData.asset_category_id)
        : null,
      subcategory_id: addFormData.subcategory_id
        ? Number(addFormData.subcategory_id)
        : null,
      equipment_id: resolveEquipmentId(addFormData.brand, addFormData.model),
      vendor_id: addFormData.vendor_id ? Number(addFormData.vendor_id) : null,
      acq_cost: addFormData.acq_cost ? Number(addFormData.acq_cost) : null,
      estimate_life: addFormData.estimate_life
        ? Number(addFormData.estimate_life)
        : null,
      components: components.filter((c) => c.component_name.trim() !== ""),
    };
    addAssetMutation.mutate(dataToSubmit);
  };

  const openAddModal = () => {
    if (!actualEmployeeId) {
      Swal.fire({
        icon: "warning",
        title: "No Employee Selected",
        text: "Cannot add asset without an employee assignment",
      });
      return;
    }

    serialGenRef.current = null;
    setAddFormData({
      asset_name: "",
      asset_category_id: "",
      subcategory_id: "",
      brand: "",
      model: "",
      serial_number: "",
      purchase_date: "",
      acq_cost: "",
      waranty_expiration_date: "",
      estimate_life: "",
      vendor_id: "",
      remarks: "",
      specifications: {},
      assigned_to_employee_id: actualEmployeeId,
    });
    setComponents([]);
    setShowAddModal(true);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ assetId, statusId }) => {
      const response = await apiClient.patch(`/assets/${assetId}/status`, {
        status_id: statusId,
      });
      return { ...response.data, assetId, statusId };
    },
    onSuccess: async (data) => {
      const { assetId, statusId } = data;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["asset", id] }),
        queryClient.invalidateQueries({
          queryKey: ["employeeAssets", actualEmployeeId],
        }),
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
      ]);

      const selectedStatus = statuses.find((s) => s.id === statusId);

      if (selectedStatus?.name === "Under Repair") {
        setTimeout(() => {
          setRepairModalAssetId(assetId);
          setIsRepairModalOpen(true);
        }, 3000);
      }

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1200,
        showConfirmButton: false,
      });

      setStatusPickerFor(null);
    },
    onError: (error) => {
      const errorMessage =
        (error &&
          error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Failed to update status";
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
      });
      setStatusPickerFor(null);
    },
  });

  const handleQuickStatusChange = (assetId, statusId) => {
    if (!statusId) return;
    const numericStatusId = Number(statusId);
    if (Number.isNaN(numericStatusId)) return;
    updateStatusMutation.mutate({ assetId, statusId: numericStatusId });
  };

  const openVendorModal = () => {
    setIsVendorModalOpen(true);
  };

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateVendor = (e) => {
    e.preventDefault();
    createVendorMutation.mutate(vendorFormData);
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = (assets) => {
    if (selectedAssets.length === assets?.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets?.map((assetItem) => assetItem.id) || []);
    }
  };

  const handleBulkTransfer = () => {
    if (selectedAssets.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Assets Selected",
        text: "Please select at least one asset to transfer",
      });
      return;
    }
    setIsBulkTransferModalOpen(true);
  };

  const handleSubmitBulkTransfer = (targetEmployeeId) => {
    if (!targetEmployeeId) {
      Swal.fire({
        icon: "warning",
        title: "No Employee Selected",
        text: "Please select an employee to transfer the assets to",
      });
      return;
    }
    bulkTransferMutation.mutate({
      assetIds: selectedAssets,
      employeeId: targetEmployeeId,
    });
  };

  const closeBulkTransferModal = () => {
    setIsBulkTransferModalOpen(false);
    setEmployeeSearch("");
    setSelectedEmployeeId("");
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleDownloadCode = () => {
    if (!codeModal?.src) return;
    const link = document.createElement("a");
    link.href = codeModal.src;
    link.download = `${codeModal.title || "code"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCode = () => {
    if (!codeModal?.src) return;
    const printWindow = window.open("", "_blank", "width=600,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${codeModal.title || "Code"}</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            img { max-width: 90vw; max-height: 90vh; }
          </style>
        </head>
        <body>
          <img src="${codeModal.src}" alt="${codeModal.title || "Code"}" />
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const navigateBack = () => navigate(-1);
  const navigateToAssets = () => navigate("/inventory/assets");
  const navigateToAsset = (assetId) => navigate(`/inventory/assets/${assetId}`);
  const navigateToEmployeeAssets = (empId) =>
    navigate(`/inventory/employees/${empId}/assets`);
  const navigateToAssetComponents = (assetId) =>
    navigate(`/inventory/assets/${assetId}/components`);

  const openTransferModal = () => setIsTransferModalOpen(true);
  const closeTransferModal = () => setIsTransferModalOpen(false);
  const openReturnModal = () => setIsReturnModalOpen(true);
  const closeReturnModal = () => setIsReturnModalOpen(false);
  const openStatusModal = () => setIsStatusModalOpen(true);
  const closeStatusModal = () => setIsStatusModalOpen(false);
  const openRepairModal = () => setIsRepairModalOpen(true);
  const closeRepairModal = () => {
    setIsRepairModalOpen(false);
    setRepairModalAssetId(null);
  };

  const isPending =
    updateAssetMutation.isPending || deleteAssetMutation.isPending;

  return {
    isAssetView,
    asset,
    employee,
    employeeAssets,
    totalEmployeeAcqCost,
    employeeHistory,
    employeeHistoryStats,
    categories,
    addSubcategories,
    editSubcategories,
    statuses,
    vendors,
    equipmentOptions,
    statusColorMap,
    employees,
    filteredEmployees,
    movements,
    assignments,
    statistics,
    actualEmployeeId,
    isLoading,
    isLoadingMovements,
    isLoadingAssignments,
    isLoadingHistory,
    isLoadingEmployees,
    viewMode,
    setViewMode,
    employeeViewTab,
    setEmployeeViewTab,
    activeTab,
    setActiveTab,
    editingAssetId,
    editFormData,
    showAddModal,
    showDeleteModal,
    deleteTarget,
    statusPickerFor,
    showCodesFor,
    codeModal,
    remarksModal,
    showEditModal,
    editModalData,
    addFormData,
    components,
    isTransferModalOpen,
    isReturnModalOpen,
    isStatusModalOpen,
    isRepairModalOpen,
    repairModalAsset,
    isVendorModalOpen,
    vendorFormData,
    selectedAssets,
    isBulkTransferModalOpen,
    employeeSearch,
    selectedEmployeeId,
    setShowAddModal,
    setShowDeleteModal,
    setDeleteTarget,
    setStatusPickerFor,
    setShowCodesFor,
    setCodeModal,
    setRemarksModal,
    setShowEditModal,
    setEditModalData,
    setAddFormData,
    setComponents,
    setIsVendorModalOpen,
    setVendorFormData,
    setSelectedAssets,
    setIsBulkTransferModalOpen,
    setEmployeeSearch,
    setSelectedEmployeeId,
    setRepairModalAssetId,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteAsset,
    confirmDelete,
    handleInputChange,
    handleAddInputChange,
    handleComponentAdd,
    handleComponentRemove,
    handleComponentChange,
    generateSerialNumber,
    generateComponentSerialNumber,
    handleAddAsset,
    openAddModal,
    handleQuickStatusChange,
    openVendorModal,
    handleVendorInputChange,
    handleCreateVendor,
    handleSelectAsset,
    handleSelectAll,
    handleBulkTransfer,
    handleSubmitBulkTransfer,
    closeBulkTransferModal,
    closeDeleteModal,
    handleDownloadCode,
    handlePrintCode,
    navigateBack,
    navigateToAssets,
    navigateToAsset,
    navigateToEmployeeAssets,
    navigateToAssetComponents,
    openTransferModal,
    closeTransferModal,
    openReturnModal,
    closeReturnModal,
    openStatusModal,
    closeStatusModal,
    openRepairModal,
    closeRepairModal,
    isPending,
    addAssetPending: addAssetMutation.isPending,
    bulkTransferPending: bulkTransferMutation.isPending,
    vendorPending: createVendorMutation.isPending,
    updateAssetPending: updateAssetMutation.isPending,
    deleteAssetPending: deleteAssetMutation.isPending,
  };
}
