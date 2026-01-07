# AssetViewPage.jsx Refactoring Plan

## Executive Summary

**Current State:** 2,276-line "god component" with mixed responsibilities
**Target State:** ~600-line orchestrator with 6-8 specialized components
**Estimated Reduction:** 70-75% file size reduction
**Timeline:** Phased approach with 7 incremental steps
**Risk Level:** Low (all refactoring maintains exact functionality and UI)

---

## Critical Issues Identified

### 1. Code Duplication (Severity: HIGH)
- **Code Modal duplicated** - Lines 574-657 AND 1000-1084 (170 duplicate lines)
- **Query invalidation duplicated** - Same 9 queries invalidated in 4 mutations (30 calls)
- **Status picker pattern** - Repeated in 3 different locations
- **Edit form field pattern** - Repeated 40+ times across cards and table views

### 2. Single Responsibility Violation (Severity: HIGH)
The component handles 10 different responsibilities:
1. Individual asset detailed view with movement tracking
2. Employee assets list management (cards + table views)
3. Asset CRUD operations (create, read, update, delete)
4. Status management with repair integration
5. QR code/barcode display and printing
6. Form state management (edit + add forms)
7. Modal orchestration (6 different modals)
8. View mode switching (cards vs table)
9. Serial number generation
10. Data fetching coordination (10 queries)

### 3. Excessive State Management (Severity: MEDIUM)
- 12+ useState hooks in one component
- Form state split between 2 objects (editFormData, addFormData)
- 5+ modal visibility states
- Complex interdependencies between state variables

### 4. Large Inline JSX Blocks (Severity: HIGH)
| Section | Lines | Should Be |
|---------|-------|-----------|
| Cards View | 505 | AssetCardsView.jsx |
| Table View | 347 | AssetTableView.jsx |
| Individual Asset View | 377 | AssetDetailView.jsx |
| Add Modal | 199 | AddAssetModal.jsx |
| Code Modal (x2) | 170 | CodeDisplayModal.jsx |

---

## Refactoring Strategy

### Phase 1: Extract Utilities & Hooks (Low Risk)
Extract reusable utilities and custom hooks to reduce duplication and improve testability.

### Phase 2: Extract Simple Components (Low Risk)
Start with simple, self-contained components like modals that have clear boundaries.

### Phase 3: Extract Complex View Components (Medium Risk)
Extract large view sections (cards, table) into separate components with proper prop drilling.

### Phase 4: Optimize & Clean Up (Low Risk)
Remove duplication, consolidate state, and improve overall structure.

---

## Detailed Refactoring Steps

### STEP 1: Extract Utility Functions ✅ (LOW RISK)

**File:** `frontend/src/utils/assetFormatters.js`

**Purpose:** Centralize formatting logic used throughout the component

**Functions to Extract:**
```javascript
// Date formatting (used 5+ times)
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Currency formatting (used 8+ times)
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  })
}

// Compact currency (for large numbers)
export const formatCompactCurrency = (amount) => {
  const value = Number(amount) || 0
  if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}k`
  return formatCurrency(value)
}

// Array response normalization (already exists but move here)
export const normalizeArrayResponse = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

// Status color helper
export const getStatusColor = (statusId, statusColorMap) => {
  return statusColorMap[statusId] || '#64748b'
}

// Warranty status checker
export const getWarrantyStatus = (expirationDate) => {
  if (!expirationDate) return { status: 'no-warranty', label: 'No Warranty', color: 'gray' }

  const expiry = new Date(expirationDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return { status: 'expired', label: 'Expired', color: 'red' }
  if (daysUntilExpiry <= 30) return { status: 'expiring-soon', label: 'Expiring Soon', color: 'orange' }
  return { status: 'active', label: 'Active', color: 'green' }
}
```

**Impact:**
- Eliminates 30+ inline formatting calls
- Improves testability (pure functions)
- Ensures consistency across the app
- Reusable in other components

---

### STEP 2: Extract Custom Hooks ✅ (LOW RISK)

#### Hook 1: `useAssetDropdownData.js`

**File:** `frontend/src/hooks/useAssetDropdownData.js`

**Purpose:** Consolidate dropdown data queries (categories, statuses, vendors)

```javascript
import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import { normalizeArrayResponse } from '../utils/assetFormatters'

export const useAssetDropdownData = () => {
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: statusesData, isLoading: isLoadingStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: vendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
    staleTime: 5 * 60 * 1000,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const statuses = Array.isArray(statusesData) ? statusesData : []
  const vendors = Array.isArray(vendorsData) ? vendorsData : []

  const statusColorMap = statuses.reduce((acc, s) => {
    acc[s.id] = s.color || '#64748b'
    return acc
  }, {})

  return {
    categories,
    statuses,
    vendors,
    statusColorMap,
    isLoading: isLoadingCategories || isLoadingStatuses || isLoadingVendors,
  }
}
```

**Impact:**
- Removes 60 lines from main component
- Reusable across AssetPage, RepairsPage, etc.
- Centralized caching strategy

#### Hook 2: `useAssetForm.js`

**File:** `frontend/src/hooks/useAssetForm.js`

**Purpose:** Manage form state and validation for both edit and add forms

```javascript
import { useState } from 'react'
import Swal from 'sweetalert2'

const INITIAL_FORM_STATE = {
  asset_name: '',
  asset_category_id: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  acq_cost: '',
  waranty_expiration_date: '',
  estimate_life: '',
  vendor_id: '',
  remarks: '',
  assigned_to_employee_id: '',
}

export const useAssetForm = (initialData = INITIAL_FORM_STATE) => {
  const [formData, setFormData] = useState(initialData)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMultipleChanges = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const resetForm = (data = INITIAL_FORM_STATE) => {
    setFormData(data)
  }

  const validateForm = () => {
    const requiredFields = [
      { field: 'asset_name', label: 'Asset Name' },
      { field: 'asset_category_id', label: 'Category' },
      { field: 'purchase_date', label: 'Purchase Date' },
      { field: 'acq_cost', label: 'Acquisition Cost' },
    ]

    for (const { field, label } of requiredFields) {
      if (!formData[field]) {
        Swal.fire({
          title: 'Validation Error',
          text: `${label} is required`,
          icon: 'error',
          confirmButtonColor: '#3b82f6',
        })
        return false
      }
    }

    // Validate acquisition cost is a number
    if (isNaN(Number(formData.acq_cost)) || Number(formData.acq_cost) <= 0) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Acquisition cost must be a valid positive number',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
      })
      return false
    }

    return true
  }

  return {
    formData,
    handleChange,
    handleMultipleChanges,
    resetForm,
    validateForm,
    setFormData,
  }
}
```

**Impact:**
- Consolidates editFormData and addFormData into one reusable hook
- Centralizes validation logic
- Removes 30+ lines of state management code

#### Hook 3: `useQueryInvalidation.js`

**File:** `frontend/src/hooks/useQueryInvalidation.js`

**Purpose:** Consolidate query invalidation logic (DRY principle)

```javascript
import { useQueryClient } from '@tanstack/react-query'

export const useAssetQueryInvalidation = () => {
  const queryClient = useQueryClient()

  const invalidateAssetRelatedQueries = async (assetId, employeeId, actualEmployeeId) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employee', actualEmployeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employeeAssets', employeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employeeAssets', actualEmployeeId] }),
      queryClient.invalidateQueries({ queryKey: ['assets'] }),
      queryClient.invalidateQueries({ queryKey: ['asset-movements', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['asset-assignments', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['asset-statistics', assetId] }),
    ])
  }

  return { invalidateAssetRelatedQueries }
}
```

**Impact:**
- Removes 22 duplicate lines across 4 mutations
- Single source of truth for invalidation logic
- Easier to maintain when adding new queries

---

### STEP 3: Extract CodeDisplayModal Component ✅ (LOW RISK)

**File:** `frontend/src/components/CodeDisplayModal.jsx`

**Purpose:** Eliminate 170 lines of duplicate code modal JSX

```javascript
import React from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Printer } from 'lucide-react'

const CodeDisplayModal = ({ isOpen, onClose, code, title, type }) => {
  if (!isOpen || !code) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = code.src
    link.download = `${code.asset_name}_${type}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${type === 'qr' ? 'QR Code' : 'Barcode'}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .print-container { text-align: center; }
            img { max-width: 400px; margin: 20px 0; }
            h2 { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>${code.asset_name}</h2>
            <img src="${code.src}" alt="${type === 'qr' ? 'QR Code' : 'Barcode'}" />
            <p>${type === 'qr' ? 'QR Code' : 'Barcode'}: ${code.serial_number}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {title || (type === 'qr' ? 'QR Code' : 'Barcode')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white border border-slate-200 rounded-lg p-8 mb-6 flex flex-col items-center">
            <img
              src={code.src}
              alt={type === 'qr' ? 'QR Code' : 'Barcode'}
              className="max-w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-slate-900">{code.asset_name}</p>
              <p className="text-xs text-slate-600 mt-1">
                {type === 'qr' ? 'QR Code' : 'Barcode'}: {code.serial_number}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default React.memo(CodeDisplayModal)
```

**Usage in AssetViewPage.jsx:**
```javascript
import CodeDisplayModal from '../../components/CodeDisplayModal'

// Replace both duplicate modal blocks with:
<CodeDisplayModal
  isOpen={!!codeModal}
  onClose={() => setCodeModal(null)}
  code={codeModal}
  title={codeModal?.asset_name}
  type={codeModal?.type}
/>
```

**Impact:**
- Eliminates 170 duplicate lines
- Reusable across other components (RepairsPage, etc.)
- Easier to maintain (single source of truth)
- Better performance with React.memo

---

### STEP 4: Extract AssetCardsView Component ✅ (MEDIUM RISK)

**File:** `frontend/src/components/asset-view/AssetCardsView.jsx`

**Purpose:** Extract 505-line cards view into dedicated component

**Props Interface:**
```javascript
interface AssetCardsViewProps {
  assets: Asset[]
  editingAssetId: number | null
  editFormData: object
  categories: Category[]
  statuses: Status[]
  vendors: Vendor[]
  statusColorMap: object
  statusPickerFor: number | null
  showCodesFor: object
  onEditClick: (asset) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onInputChange: (field, value) => void
  onDeleteClick: (asset) => void
  onQuickStatusChange: (assetId, newStatusId) => void
  onStatusPickerToggle: (assetId) => void
  onCodeToggle: (assetId, type) => void
  onCodeView: (code, type) => void
}
```

**Component Structure:**
```javascript
import React from 'react'
import { Edit, Trash2, Save, X, QrCode, Barcode, /* ... */ } from 'lucide-react'
import { formatDate, formatCurrency, getWarrantyStatus } from '../../utils/assetFormatters'

const AssetCard = ({
  asset,
  isEditing,
  editFormData,
  categories,
  statuses,
  vendors,
  statusColorMap,
  showStatusPicker,
  showCodes,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onStatusChange,
  onStatusPickerToggle,
  onCodeToggle,
  onCodeView,
}) => {
  // Card rendering logic here
  // Extract from lines 1150-1655
}

const AssetCardsView = React.memo(({ assets, /* ...props */ }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map(asset => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isEditing={editingAssetId === asset.id}
          editFormData={editFormData}
          categories={categories}
          statuses={statuses}
          vendors={vendors}
          statusColorMap={statusColorMap}
          showStatusPicker={statusPickerFor === asset.id}
          showCodes={showCodesFor[asset.id]}
          onEdit={() => onEditClick(asset)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onChange={onInputChange}
          onDelete={() => onDeleteClick(asset)}
          onStatusChange={(statusId) => onQuickStatusChange(asset.id, statusId)}
          onStatusPickerToggle={() => onStatusPickerToggle(asset.id)}
          onCodeToggle={(type) => onCodeToggle(asset.id, type)}
          onCodeView={onCodeView}
        />
      ))}
    </div>
  )
})

export default AssetCardsView
```

**Impact:**
- Removes 505 lines from main component
- Better separation of concerns
- Easier to test card rendering
- Can reuse in other employee views

---

### STEP 5: Extract AssetTableView Component ✅ (MEDIUM RISK)

**File:** `frontend/src/components/asset-view/AssetTableView.jsx`

**Purpose:** Extract 347-line table view into dedicated component

**Props Interface:**
```javascript
interface AssetTableViewProps {
  assets: Asset[]
  editingAssetId: number | null
  editFormData: object
  categories: Category[]
  statuses: Status[]
  vendors: Vendor[]
  statusColorMap: object
  onEditClick: (asset) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onInputChange: (field, value) => void
  onDeleteClick: (asset) => void
}
```

**Component Structure:**
```javascript
import React from 'react'
import { Edit, Trash2, Save, X } from 'lucide-react'
import { formatDate, formatCurrency } from '../../utils/assetFormatters'

const TableRow = ({
  asset,
  isEditing,
  editFormData,
  categories,
  statuses,
  vendors,
  statusColorMap,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
}) => {
  // Row rendering logic with inline editing
}

const AssetTableView = React.memo(({ assets, /* ...props */ }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Asset Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
            {/* ... other headers */}
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {assets.map(asset => (
            <TableRow
              key={asset.id}
              asset={asset}
              isEditing={editingAssetId === asset.id}
              editFormData={editFormData}
              categories={categories}
              statuses={statuses}
              vendors={vendors}
              statusColorMap={statusColorMap}
              onEdit={() => onEditClick(asset)}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              onChange={onInputChange}
              onDelete={() => onDeleteClick(asset)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default AssetTableView
```

**Impact:**
- Removes 347 lines from main component
- Cleaner table logic
- Easier to add column sorting/filtering
- Performance optimization with React.memo

---

### STEP 6: Extract AddAssetModal Component ✅ (LOW RISK)

**File:** `frontend/src/components/asset-view/AddAssetModal.jsx`

**Purpose:** Extract 199-line add modal into dedicated component

**Component Structure:**
```javascript
import React from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, RefreshCw } from 'lucide-react'
import { useAssetForm } from '../../hooks/useAssetForm'
import { buildSerialNumber } from '../../utils/assetSerial'

const AddAssetModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  vendors,
}) => {
  const { formData, handleChange, resetForm, validateForm } = useAssetForm()

  const handleGenerateSerial = async () => {
    try {
      const response = await apiClient.get('/assets')
      const assets = response.data.data || []
      const serial = buildSerialNumber(formData.asset_category_id, categories, assets)
      handleChange('serial_number', serial)
    } catch (error) {
      console.error('Error generating serial:', error)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    await onSubmit(formData)
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add New Asset</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* All form fields */}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Add Asset
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default React.memo(AddAssetModal)
```

**Impact:**
- Removes 199 lines from main component
- Reusable in AssetsPage
- Cleaner form validation
- Improved UX with hook-based state

---

### STEP 7: Final Refactored AssetViewPage.jsx ✅ (INTEGRATION)

**New Structure (~600 lines):**

```javascript
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { /* ... icons ... */ } from 'lucide-react'
import Swal from 'sweetalert2'

// Custom Hooks
import { useAssetForm } from '../../hooks/useAssetForm'
import { useAssetDropdownData } from '../../hooks/useAssetDropdownData'
import { useAssetQueryInvalidation } from '../../hooks/useQueryInvalidation'

// Components
import CodeDisplayModal from '../../components/CodeDisplayModal'
import AssetCardsView from '../../components/asset-view/AssetCardsView'
import AssetTableView from '../../components/asset-view/AssetTableView'
import AddAssetModal from '../../components/asset-view/AddAssetModal'
import AssetMovementTimeline from '../../components/AssetMovementTimeline'
import TransferAssetModal from '../../components/TransferAssetModal'
import ReturnAssetModal from '../../components/ReturnAssetModal'
import StatusUpdateModal from '../../components/StatusUpdateModal'
import RepairFormModal from '../../components/RepairFormModal'

// Utils
import apiClient from '../../services/apiClient'
import { formatCurrency, formatDate } from '../../utils/assetFormatters'

function AssetViewPage() {
  const { id, employeeId } = useParams()
  const navigate = useNavigate()
  const { invalidateAssetRelatedQueries } = useAssetQueryInvalidation()

  // Dropdown data (consolidated)
  const { categories, statuses, vendors, statusColorMap, isLoading: isLoadingDropdowns } = useAssetDropdownData()

  // Form state (consolidated with hook)
  const editForm = useAssetForm()
  const [editingAssetId, setEditingAssetId] = useState(null)

  // View state
  const [viewMode, setViewMode] = useState('cards')
  const [activeTab, setActiveTab] = useState('timeline')

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [codeModal, setCodeModal] = useState(null)
  const [statusPickerFor, setStatusPickerFor] = useState(null)
  const [showCodesFor, setShowCodesFor] = useState({})

  // Movement modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false)
  const [repairModalAssetId, setRepairModalAssetId] = useState(null)

  // Determine view mode
  const isAssetView = !!id

  // Data queries
  const { data: assetData, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}`)).data,
    enabled: isAssetView,
  })

  const asset = assetData?.data

  const actualEmployeeId = employeeId || asset?.assigned_to_employee_id
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', actualEmployeeId],
    queryFn: async () => (await apiClient.get(`/employees/${actualEmployeeId}`)).data,
    enabled: !!actualEmployeeId,
  })

  const { data: employeeAssetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['employeeAssets', actualEmployeeId],
    queryFn: async () => (await apiClient.get('/assets', {
      params: { assigned_to_employee_id: actualEmployeeId }
    })).data,
    enabled: !!actualEmployeeId,
  })

  const employeeAssets = Array.isArray(employeeAssetsData?.data) ? employeeAssetsData.data : []
  const employee = employeeData?.data

  // Movement tracking queries (for individual asset view)
  const { data: movementsData } = useQuery({
    queryKey: ['asset-movements', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/movements/history`)).data,
    enabled: isAssetView && !!id,
  })

  const { data: assignmentsData } = useQuery({
    queryKey: ['asset-assignments', id],
    queryFn: async () => (await apiClient.get(`/assets/${id}/movements/assignments`)).data,
    enabled: isAssetView && !!id,
  })

  const movements = movementsData?.data || []
  const assignments = assignmentsData?.data || []

  // Mutations (with consolidated invalidation)
  const updateAssetMutation = useMutation({
    mutationFn: async ({ assetId, data }) =>
      (await apiClient.put(`/assets/${assetId}`, data)).data,
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)
      setEditingAssetId(null)
      editForm.resetForm()
    },
  })

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) => (await apiClient.delete(`/assets/${assetId}`)).data,
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)
      setShowDeleteModal(false)
      Swal.fire('Deleted!', 'Asset has been deleted.', 'success')
    },
  })

  const addAssetMutation = useMutation({
    mutationFn: async (data) => (await apiClient.post('/assets', data)).data,
    onSuccess: async () => {
      await invalidateAssetRelatedQueries(id, employeeId, actualEmployeeId)
      setShowAddModal(false)
      Swal.fire('Success!', 'Asset added successfully', 'success')
    },
  })

  // Event handlers
  const handleEditClick = (asset) => {
    setEditingAssetId(asset.id)
    editForm.setFormData(asset)
  }

  const handleSaveEdit = async () => {
    if (!editForm.validateForm()) return
    await updateAssetMutation.mutateAsync({
      assetId: editingAssetId,
      data: editForm.formData
    })
  }

  const handleCancelEdit = () => {
    setEditingAssetId(null)
    editForm.resetForm()
  }

  const handleDeleteClick = (asset) => {
    setDeleteTarget({ id: asset.id, name: asset.asset_name })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    await deleteAssetMutation.mutateAsync(deleteTarget.id)
  }

  const handleCodeView = (asset, type) => {
    setCodeModal({
      src: type === 'qr' ? asset.qr_code : asset.barcode,
      asset_name: asset.asset_name,
      serial_number: asset.serial_number,
      type,
    })
  }

  const isLoading = isLoadingAsset || isLoadingEmployee || isLoadingAssets || isLoadingDropdowns

  // Render individual asset view
  if (isAssetView && asset) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Individual asset view with movement tracking */}
        {/* ... simplified rendering ... */}

        {/* Modals */}
        <TransferAssetModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          asset={asset}
        />
        <ReturnAssetModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          asset={asset}
        />
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          asset={asset}
        />
        <RepairFormModal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          asset={asset}
        />
        <CodeDisplayModal
          isOpen={!!codeModal}
          onClose={() => setCodeModal(null)}
          code={codeModal}
          type={codeModal?.type}
        />
      </div>
    )
  }

  // Render employee assets list view
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header with view toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {employee?.first_name} {employee?.last_name}'s Assets
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('cards')}>Cards</button>
          <button onClick={() => setViewMode('table')}>Table</button>
          <button onClick={() => setShowAddModal(true)}>Add Asset</button>
        </div>
      </div>

      {/* Asset List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : viewMode === 'cards' ? (
        <AssetCardsView
          assets={employeeAssets}
          editingAssetId={editingAssetId}
          editFormData={editForm.formData}
          categories={categories}
          statuses={statuses}
          vendors={vendors}
          statusColorMap={statusColorMap}
          statusPickerFor={statusPickerFor}
          showCodesFor={showCodesFor}
          onEditClick={handleEditClick}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onInputChange={editForm.handleChange}
          onDeleteClick={handleDeleteClick}
          onStatusPickerToggle={(assetId) => setStatusPickerFor(
            statusPickerFor === assetId ? null : assetId
          )}
          onCodeToggle={(assetId, type) => setShowCodesFor(prev => ({
            ...prev,
            [assetId]: prev[assetId] === type ? null : type
          }))}
          onCodeView={handleCodeView}
        />
      ) : (
        <AssetTableView
          assets={employeeAssets}
          editingAssetId={editingAssetId}
          editFormData={editForm.formData}
          categories={categories}
          statuses={statuses}
          vendors={vendors}
          statusColorMap={statusColorMap}
          onEditClick={handleEditClick}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onInputChange={editForm.handleChange}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {/* Modals */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(data) => addAssetMutation.mutateAsync(data)}
        categories={categories}
        vendors={vendors}
      />

      <CodeDisplayModal
        isOpen={!!codeModal}
        onClose={() => setCodeModal(null)}
        code={codeModal}
        type={codeModal?.type}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete {deleteTarget?.name}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetViewPage
```

**Impact:**
- Main file reduced to ~600 lines (73% reduction)
- Clear separation of concerns
- Reusable components
- Easier to test and maintain

---

## Testing Strategy

### 1. Manual Testing Checklist
After each refactoring step, verify:

- [ ] Individual asset view displays correctly
- [ ] Employee asset list displays correctly
- [ ] Cards view renders all assets
- [ ] Table view renders all assets
- [ ] View toggle (cards ↔ table) works
- [ ] Edit asset (inline in cards/table) works
- [ ] Save edited asset persists changes
- [ ] Cancel edit discards changes
- [ ] Delete asset shows confirmation
- [ ] Delete asset removes from list
- [ ] Add asset modal opens
- [ ] Add asset form validation works
- [ ] Add asset creates new record
- [ ] Serial number generation works
- [ ] QR code display modal works
- [ ] Barcode display modal works
- [ ] Download QR/barcode works
- [ ] Print QR/barcode works
- [ ] Status quick change works
- [ ] Repair modal integration works
- [ ] Transfer asset modal works
- [ ] Return asset modal works
- [ ] Movement timeline displays
- [ ] Assignment history displays
- [ ] All modals close properly
- [ ] No console errors
- [ ] No visual regressions

### 2. Automated Testing (Future)
After refactoring, components are ready for:
- Unit tests for hooks (`useAssetForm`, `useAssetDropdownData`)
- Unit tests for utilities (`formatDate`, `formatCurrency`)
- Component tests for extracted components
- Integration tests for full flows

---

## Risk Mitigation

### Low Risk Steps (Do First)
1. Extract utilities (Step 1) - Pure functions, easy to test
2. Extract custom hooks (Step 2) - Isolated logic
3. Extract CodeDisplayModal (Step 3) - Self-contained component

### Medium Risk Steps (Do Carefully)
4. Extract AssetCardsView (Step 4) - Large component with props
5. Extract AssetTableView (Step 5) - Complex inline editing
6. Extract AddAssetModal (Step 6) - Form state management

### Safe Rollback Plan
- Create backup: `AssetViewPage_backup.jsx` before starting
- Commit after each successful step
- Test thoroughly after each extraction

---

## Migration Timeline

### Week 1: Foundation
- Day 1: Extract utilities (Step 1)
- Day 2: Extract hooks (Step 2)
- Day 3: Extract CodeDisplayModal (Step 3)
- Day 4-5: Testing & bug fixes

### Week 2: Components
- Day 1-2: Extract AssetCardsView (Step 4)
- Day 3-4: Extract AssetTableView (Step 5)
- Day 5: Extract AddAssetModal (Step 6)

### Week 3: Integration & Testing
- Day 1-2: Integrate all components (Step 7)
- Day 3-4: Comprehensive testing
- Day 5: Documentation & cleanup

---

## Expected Benefits

### Code Quality
- ✅ 73% file size reduction (2,276 → 600 lines)
- ✅ 170 duplicate lines eliminated
- ✅ Better separation of concerns
- ✅ Improved testability

### Developer Experience
- ✅ Easier to find code
- ✅ Faster to add features
- ✅ Clearer component boundaries
- ✅ Better code navigation

### Maintainability
- ✅ Single responsibility components
- ✅ Reusable hooks and utilities
- ✅ Consolidated invalidation logic
- ✅ Consistent formatting

### Performance
- ✅ React.memo on extracted components
- ✅ Better re-render optimization
- ✅ Smaller component trees

---

## Conclusion

This refactoring plan transforms a 2,276-line "god component" into a clean, maintainable architecture with:
- **8 new files** (6 components + 2 hooks)
- **~1,700 lines moved** to specialized components
- **170 duplicate lines eliminated**
- **0 functionality changes** - UI remains identical
- **0 breaking changes** - All features work exactly the same

**The result:** A professional, scalable codebase that's easy to maintain, test, and extend.

---

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Ready for Implementation
