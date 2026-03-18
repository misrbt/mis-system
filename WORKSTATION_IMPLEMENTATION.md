# Workstation-Based Asset Management Implementation

## Overview

This system implements a **hybrid workstation-based asset management** approach that distinguishes between:
- **Workstation Assets**: Physical equipment that stays at a desk/location (Desktop PC, Monitor, Printer, etc.)
- **Portable Assets**: Equipment that follows employees when they move (Laptops)

## ✅ Implementation Complete

### Changes Made

1. **Database Schema** ✅
   - Added `is_workstation_asset` boolean flag to `asset_category` table
   - Existing columns: `workstation_branch_id`, `workstation_position_id` on `assets` table

2. **Asset Categories Configuration** ✅
   - **Workstation Assets** (`is_workstation_asset = true`):
     - Desktop PC, Monitor, Printer, UPS, CCTV, Network Devices, Server, Peripherals, Storage, Store, Memory
   - **Portable Assets** (`is_workstation_asset = false`):
     - Laptops

3. **BranchTransitionService Logic** ✅
   - Loads workstation assets at destination locations
   - Reassigns workstation assets to incoming employees
   - Keeps portable assets with their current employee
   - Creates AssetMovement audit trail for all reassignments

4. **Helper Command** ✅
   - `php artisan assets:set-workstations` - Set workstation fields for existing assets

## How It Works

### Workstation Concept

```
Asset Physical Location (NEVER CHANGES):
├─ workstation_branch_id  ← Fixed to physical location
└─ workstation_position_id ← Fixed to desk/position

Asset Assignment (CHANGES with transitions):
└─ assigned_to_employee_id ← Changes to new employee at workstation

Asset Type:
└─ is_workstation_asset (from category) ← Determines behavior during transitions
```

### Example Scenario

**Initial State:**

```
Branch A - MIS Assistant Desk
├─ Desktop PC #1 (workstation_branch_id=Branch A, workstation_position_id=MIS Assistant)
├─ Monitor #1 (workstation_branch_id=Branch A, workstation_position_id=MIS Assistant)
└─ assigned_to: John

Branch B - MIS Assistant Desk
├─ Desktop PC #2 (workstation_branch_id=Branch B, workstation_position_id=MIS Assistant)
├─ Monitor #2 (workstation_branch_id=Branch B, workstation_position_id=MIS Assistant)
└─ assigned_to: Mary

John also has:
└─ Laptop #1 (is_workstation_asset=false, assigned_to=John)
```

**After John moves from Branch A → Branch B:**

```
Branch A - MIS Assistant Desk
├─ Desktop PC #1 (unchanged location, now UNASSIGNED)
├─ Monitor #1 (unchanged location, now UNASSIGNED)

Branch B - MIS Assistant Desk
├─ Desktop PC #2 (unchanged location, assigned to: John)
├─ Monitor #2 (unchanged location, assigned to: John)

John now has:
├─ Desktop PC #2 (inherited from Branch B workstation)
├─ Monitor #2 (inherited from Branch B workstation)
└─ Laptop #1 (followed John from Branch A)
```

### Key Benefits

✅ **Physical Reality**: Assets stay at their physical location
✅ **Efficient Transitions**: No physical moving of equipment needed
✅ **Position-Based**: Different positions have different equipment setups
✅ **Audit Trail**: Complete tracking of who used which workstation
✅ **Flexible**: Portable assets (laptops) can follow employees

## Setup for Existing Data

Your existing assets need `workstation_branch_id` and `workstation_position_id` set to use this feature.

### Step 1: Preview Changes

```bash
# See what would be updated (dry run)
php artisan assets:set-workstations --dry-run --workstation-only
```

### Step 2: Apply Workstation Fields

```bash
# Apply to workstation assets only (recommended)
php artisan assets:set-workstations --workstation-only

# Or apply to all assets
php artisan assets:set-workstations
```

This command sets:
- `workstation_branch_id` = Employee's current branch
- `workstation_position_id` = Employee's current position

### Step 3: Verify Results

```bash
# Check assets with workstation fields
php artisan tinker

>>> \App\Models\Asset::whereNotNull('workstation_branch_id')
>>>     ->with(['workstationBranch', 'workstationPosition', 'category'])
>>>     ->get(['id', 'asset_name', 'workstation_branch_id', 'workstation_position_id'])
>>>     ->toArray();
```

## Usage

### Branch Transition (with Exchange Detection)

When multiple employees swap positions, they'll be automatically detected as exchanges and marked with purple badges.

**API Endpoint:**
```
POST /api/employees/branch-transition

{
  "transitions": [
    {
      "employee_id": 1,
      "to_branch_id": 2,
      "to_position_id": 3
    },
    {
      "employee_id": 2,
      "to_branch_id": 1,
      "to_position_id": 3
    }
  ],
  "remarks": "Quarterly rotation"
}
```

**Behavior:**
- ✅ Employees swap locations
- ✅ Each employee gets the workstation assets at their new desk
- ✅ Each employee keeps their portable assets (laptops)
- ✅ AssetMovement records created with type `branch_transition`

### Employee Transition (Individual Moves)

Individual employee moves without exchange requirements.

**API Endpoint:**
```
POST /api/employees/employee-transition

{
  "transitions": [
    {
      "employee_id": 1,
      "to_branch_id": 2,
      "to_position_id": 3
    }
  ],
  "remarks": "Promotion"
}
```

**Behavior:**
- ✅ Employee moves to new branch/position
- ✅ Employee inherits workstation assets at new desk
- ✅ Employee keeps portable assets
- ✅ Old workstation assets become unassigned (if no replacement)

## Asset Movement Tracking

All asset reassignments during transitions are tracked in the `asset_movements` table:

```php
movement_type: 'branch_transition' or 'returned'
from_employee_id: Previous owner
to_employee_id: New owner
from_branch_id: Employee's old branch
to_branch_id: Employee's new branch
metadata: {
  batch_id: "uuid",
  transition_type: "workstation_based",
  asset_category: "Desktop PC",
  workstation_branch_id: 2,
  workstation_position_id: 3
}
```

## Important Notes

### ✅ Assets DO NOT physically move
- `workstation_branch_id` and `workstation_position_id` NEVER change during transitions
- Only `assigned_to_employee_id` changes

### ✅ Two types of assets
- **Workstation Assets**: Stay at desk, reassigned to incoming employee
- **Portable Assets**: Follow employee when they move

### ✅ Automatic Exchange Detection
- System detects when 2+ employees swap positions
- UI shows purple badges for exchanges
- No special logic needed - works automatically

### ✅ Audit Trail
- Every asset reassignment creates an AssetMovement record
- Batch ID links all movements in a single transition
- Complete history of who used which workstation

## Testing

### Manual Test Scenario

1. Create two employees at different branches
2. Assign workstation assets (Desktop PC, Monitor) to their workstations
3. Execute a branch transition to swap them
4. Verify:
   - ✅ Employees swapped branches
   - ✅ Each employee has assets from their NEW workstation
   - ✅ Workstation fields on assets unchanged
   - ✅ AssetMovement records created

### Unit Tests

Unit tests exist at `tests/Unit/Services/BranchTransitionServiceTest.php` but require test database setup:
- Test: Employee moving to empty workstation gets assets
- Test: Employee swap exchanges assets correctly
- Test: Circular rotation reassigns assets correctly
- Test: Returns correct result structure

## Frontend Integration

The frontend Employee Transitions page already supports this feature:
- Info banner explains that workstation assets stay at their location
- Exchange detection shows purple badges
- Success message shows: "X employees moved, Y workstation assets reassigned"
- Assets page shows workstation information for each asset

## Files Modified

### Backend
- ✅ `database/migrations/2026_02_26_013952_add_is_workstation_asset_to_asset_category_table.php`
- ✅ `app/Models/AssetCategory.php` - Added `is_workstation_asset` field
- ✅ `app/Services/BranchTransitionService.php` - Implemented workstation logic
- ✅ `app/Http/Controllers/EmployeeController.php` - Updated success message
- ✅ `app/Console/Commands/SetAssetWorkstations.php` - Helper command

### Database
- ✅ `asset_category.is_workstation_asset` column added
- ✅ Asset categories configured with correct flags

## Next Steps

1. **Set Workstation Fields**:
   ```bash
   php artisan assets:set-workstations --workstation-only
   ```

2. **Test a Transition**:
   - Go to Employee Transitions page
   - Select two employees to swap
   - Execute transition
   - Verify workstation assets were reassigned

3. **Train Users**:
   - Explain the difference between workstation and portable assets
   - Show how branch transitions work
   - Demonstrate that physical assets don't move

## Troubleshooting

### Assets not reassigning during transition?
- Check if `workstation_branch_id` and `workstation_position_id` are set
- Verify asset category has `is_workstation_asset = true`
- Check that assets exist at the destination workstation

### Portable assets being reassigned?
- Verify asset category has `is_workstation_asset = false`
- Laptops should be marked as portable assets

### Can't see workstation information?
- Run migration: `php artisan migrate`
- Set workstation fields: `php artisan assets:set-workstations`

## Support

For questions or issues:
1. Check this documentation
2. Review the code comments in `BranchTransitionService.php`
3. Check the unit tests for expected behavior examples
4. Verify database schema matches documentation
