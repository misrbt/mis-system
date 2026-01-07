# AssetViewPage.jsx Integration Plan

## ✅ Completed So Far

### 1. Imports Updated ✅
- Added: CodeDisplayModal, AssetCardsView, AssetTableView
- Added: useAssetDropdownData, useAssetQueryInvalidation hooks
- Removed: normalizeArrayResponse (now in utils)

### 2. Hooks Integrated ✅
- `useAssetDropdownData()` - Replaced 3 separate queries (~30 lines saved)
- `useAssetQueryInvalidation()` - Added and used in mutations (~22 lines saved)

### 3. Mutations Optimized ✅
- updateAssetMutation: Now uses `invalidateAssetRelatedQueries()`
- deleteAssetMutation: Now uses `invalidateAssetRelatedQueries()`
- addAssetMutation: Now uses `invalidateAssetRelatedQueries()`

**Lines saved so far:** ~52 lines

---

## 🎯 Next Step: Replace View Components

### Large Replacement Needed:

**Lines 1119-1594: Cards View (475 lines)**
```javascript
// CURRENT (475 lines of inline JSX)
{viewMode === 'cards' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {employeeAssets.map((empAsset) => {
      // 470+ lines of card rendering...
    })}
  </div>
)}

// REPLACE WITH (10 lines)
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
    onEditClick={(asset) => { setEditingAssetId(asset.id); setEditFormData(asset) }}
    onSaveEdit={() => handleSaveEdit()}
    onCancelEdit={() => { setEditingAssetId(null); setEditFormData({}) }}
    onInputChange={(field, value) => handleInputChange(field, value)}
    onDeleteClick={(assetId, assetName) => handleDeleteAsset(assetId, assetName)}
    onQuickStatusChange={(assetId, statusId) => handleQuickStatusChange(assetId, statusId)}
    onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
    onCodeToggle={(assetId, type) => setShowCodesFor(prev => ({ ...prev, [assetId]: prev[assetId] === type ? null : type }))}
    onCodeView={(code) => setCodeModal(code)}
    isPending={updateAssetMutation.isPending || deleteAssetMutation.isPending}
  />
)}
```

**Lines 1596-1942: Table View (346 lines)**
```javascript
// CURRENT (346 lines of inline table JSX)
{viewMode === 'table' && (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          {/* 340+ lines of table rendering... */}
        </table>
      </div>
    </div>
  </div>
)}

// REPLACE WITH (10 lines)
{viewMode === 'table' && (
  <AssetTableView
    assets={employeeAssets}
    editingAssetId={editingAssetId}
    editFormData={editFormData}
    categories={categories}
    statuses={statuses}
    vendors={vendors}
    statusColorMap={statusColorMap}
    statusPickerFor={statusPickerFor}
    totalEmployeeAcqCost={totalEmployeeAcqCost}
    onEditClick={(asset) => { setEditingAssetId(asset.id); setEditFormData(asset) }}
    onSaveEdit={() => handleSaveEdit()}
    onCancelEdit={() => { setEditingAssetId(null); setEditFormData({}) }}
    onInputChange={(field, value) => handleInputChange(field, value)}
    onDeleteClick={(assetId, assetName) => handleDeleteAsset(assetId, assetName)}
    onQuickStatusChange={(assetId, statusId) => handleQuickStatusChange(assetId, statusId)}
    onStatusPickerToggle={(assetId) => setStatusPickerFor(statusPickerFor === assetId ? null : assetId)}
    onAddClick={() => openAddModal()}
    isPending={updateAssetMutation.isPending || deleteAssetMutation.isPending}
  />
)}
```

**Total lines to replace:** 821 lines → ~20 lines
**Lines saved:** ~800 lines

---

## 📊 Expected Final Result

### Before Integration:
- AssetViewPage.jsx: **2,276 lines**
- Inline cards view: 475 lines
- Inline table view: 346 lines
- Inline dropdown queries: 30 lines
- Inline invalidation: 22 lines

### After Full Integration:
- AssetViewPage.jsx: **~1,400 lines** (38% reduction)
- Uses AssetCardsView component
- Uses AssetTableView component
- Uses useAssetDropdownData hook
- Uses useAssetQueryInvalidation hook

**Total Reduction:** ~876 lines (38%)

---

## ✅ Safety Checklist

Before proceeding with the replacement:

- ✅ All extracted components created and code-split
- ✅ All hooks created and tested
- ✅ Imports added correctly
- ✅ Hooks integrated successfully
- ✅ Mutations updated successfully
- ✅ No console errors so far

**Ready to proceed:** YES

---

## 🚀 Proceed?

The next step will replace 821 lines of inline code with 20 lines using our extracted components.

**This replacement will:**
- ✅ Maintain exact same functionality
- ✅ Maintain exact same UI/styling
- ✅ Reduce file size significantly
- ✅ Improve maintainability
- ✅ Enable better code splitting

**Would you like me to proceed with this replacement?**

If yes, I'll make the edit in one operation to replace both views.
