# Automatic Status Assignment Based on Purchase Date

## Summary
The status field has been removed from the employee asset view forms. Instead, the backend automatically assigns the status based on the purchase date:

- **New** - If purchase date is within the last 1 month
- **Functional** - If purchase date is older than 1 month

## Changes Made

### Frontend Changes

#### 1. `frontend/src/pages/inventory/asset-view/AssetViewModals.jsx`

**Add Asset Modal (Employee View)**
- Set `showStatus={false}` - Status field is now hidden
- Changed title from "Asset Status & Notes" to "Remarks & Notes"
- Changed subtitle to "Additional information about the asset"

**Edit Asset Modal (Employee View)**
- Set `showStatus={false}` - Status field is now hidden
- Changed title from "Asset Status & Notes" to "Remarks & Notes"
- Changed subtitle to "Additional information about the asset"

### Backend Changes

#### 1. `backend/app/Http/Controllers/AssetController.php`

**Store Method (Lines 284-306)**
- Already had automatic status assignment logic
- Status is auto-assigned based on purchase date:
  ```php
  $purchaseDate = Carbon::parse($request->purchase_date);
  $today = Carbon::today();
  $oneMonthAgo = $today->copy()->subMonth();

  if ($purchaseDate->lessThan($oneMonthAgo)) {
      $statusName = 'Functional';
  } else {
      $statusName = 'New';
  }
  ```

**Update Method (Lines 458-552)**
- Updated validation: Changed `status_id` from `required` to `nullable`
- Enhanced auto-assignment logic:
  - Auto-assigns status when `status_id` is not provided
  - Auto-updates status when purchase_date changes
  - Only auto-assigns if current status is "New" or "Functional" (preserves manual statuses like "Under Repair", "Disposed", etc.)

## Status Assignment Rules

### Create Asset
```
Purchase Date = Today               → Status = "New"
Purchase Date = 15 days ago         → Status = "New"
Purchase Date = 1 month + 1 day ago → Status = "Functional"
Purchase Date = 1 year ago          → Status = "Functional"
```

### Update Asset
The system will auto-update status ONLY if:
1. No `status_id` is provided in the request (employee view), OR
2. The `purchase_date` is being changed (any view)

AND the current status is "New" or "Functional"

**Manual statuses are preserved:**
- If status is "Under Repair", "Disposed", "Lost", etc. → Status will NOT be auto-changed
- This prevents overriding intentional manual status updates

## Behavior by Context

### Employee Assets Page (`/inventory/employees/:id/assets`)
**Add Asset:**
- ✅ Status field is hidden
- ✅ Backend auto-assigns: "New" or "Functional"
- ✅ User doesn't need to select status

**Edit Asset:**
- ✅ Status field is hidden
- ✅ Backend preserves or auto-updates based on purchase date
- ✅ Manual statuses (like "Under Repair") are preserved

### Main Assets Page (`/inventory/assets`)
**Add Asset:**
- ✅ Status field is visible (unchanged)
- ✅ User can manually select status
- ✅ Manual selection overrides auto-assignment

**Edit Asset:**
- ✅ Status field is visible (unchanged)
- ✅ User can manually change status
- ✅ Manual changes are preserved

## Testing

### Test 1: Create Asset with Today's Date
```
1. Go to /inventory/employees/3/assets
2. Click "Add Asset"
3. Set purchase_date = today
4. Submit
5. ✅ Status should be "New"
```

### Test 2: Create Asset with Old Date
```
1. Go to /inventory/employees/3/assets
2. Click "Add Asset"
3. Set purchase_date = 2 months ago
4. Submit
5. ✅ Status should be "Functional"
```

### Test 3: Edit Asset - Change Purchase Date
```
1. Edit an asset with status "New"
2. Change purchase_date to 3 months ago
3. Save
4. ✅ Status should automatically change to "Functional"
```

### Test 4: Manual Status Preserved
```
1. In main assets page, set an asset status to "Under Repair"
2. Edit the asset from employee view
3. Change other fields (not purchase date)
4. Save
5. ✅ Status should remain "Under Repair"
```

## Database

The system expects two statuses to exist in the `status` table:
- **Name: "New"** - For newly purchased assets
- **Name: "Functional"** - For older assets in working condition

If these don't exist, the controller will auto-create them with basic descriptions.

## Notes

- The 1-month threshold is calculated from today's date
- The logic uses `lessThan()` comparison, so exactly 1 month old = "New", 1 month + 1 day = "Functional"
- Status auto-assignment only affects "New" and "Functional" statuses
- Other statuses like "Under Repair", "Disposed", "Lost" are never auto-changed
- This ensures intentional status changes by admins are preserved
