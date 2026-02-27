# Workstation Auto-Populate Fix

## Issue
When creating an asset from the employee's asset page (`/inventory/employees/:id/assets`), the workstation branch and position fields were not being automatically populated, even though the asset was being assigned to a specific employee with known branch and position information.

## Solution
Modified the `openAddModal` function in `useAssetViewController.js` to automatically populate the workstation fields based on the employee's branch and position when opening the add asset modal from an employee's page.

## Changes Made

### File: `frontend/src/pages/inventory/asset-view/useAssetViewController.js`

**Before:**
```javascript
const openAddModal = () => {
  if (!actualEmployeeId) {
    Swal.fire({
      icon: "warning",
      title: "No Employee Selected",
      text: "Cannot add asset without an employee assignment",
    });
    return;
  }

  // Do not reset form data to allow persistence if accidentally closed
  // Just ensure the employee ID is correct
  setAddFormData(prev => ({
    ...prev,
    assigned_to_employee_id: actualEmployeeId
  }));
  setShowAddModal(true);
};
```

**After:**
```javascript
const openAddModal = () => {
  if (!actualEmployeeId) {
    Swal.fire({
      icon: "warning",
      title: "No Employee Selected",
      text: "Cannot add asset without an employee assignment",
    });
    return;
  }

  // Do not reset form data to allow persistence if accidentally closed
  // Just ensure the employee ID is correct and auto-populate workstation fields
  setAddFormData(prev => ({
    ...prev,
    assigned_to_employee_id: actualEmployeeId,
    workstation_branch_id: employee?.branch_id || prev.workstation_branch_id || "",
    workstation_position_id: employee?.position_id || prev.workstation_position_id || "",
  }));
  setShowAddModal(true);
};
```

## Behavior

### Employee Assets Page (`/inventory/employees/:id/assets`)
- ✅ **Auto-populates** workstation branch and position based on the employee's branch and position
- ✅ Employee's branch_id → workstation_branch_id
- ✅ Employee's position_id → workstation_position_id
- ✅ User can still manually change these values if needed

### Main Assets Page (`/inventory/assets`)
- ✅ **Manual input required** - no auto-population
- ✅ User must manually select workstation branch and position
- ✅ Existing behavior unchanged

## Testing
To test this fix:
1. Navigate to `/inventory/employees/3/assets` (or any employee ID)
2. Click "Add Asset" button
3. Verify that:
   - "Workstation Branch" field is pre-filled with the employee's branch
   - "Workstation Position" field is pre-filled with the employee's position
   - Both fields can still be manually changed if needed
4. Create the asset and verify the workstation fields are saved correctly

## Related Changes
This fix works in conjunction with the backend changes made to `AssetController.php` that ensure workstation fields are properly validated and saved to the database.
