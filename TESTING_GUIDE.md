# Workstation-Based Asset Management - Testing Guide

## ✅ Setup Complete

The workstation-based asset management system has been successfully integrated into both backend and frontend. Here's how to test it:

## 🚀 Quick Start

### 1. Start the Servers

```bash
# From the project root (mis-system/)
npm run dev
```

This will start:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173

### 2. Login to the System

Navigate to http://localhost:5173 and login with your credentials.

## 📋 Test Scenarios

### Test 1: View Workstations

**Purpose:** Verify workstation data is properly displayed

**Steps:**
1. Navigate to **Inventory → Workstations** (http://localhost:5173/inventory/workstations)
2. You should see workstations grouped by Branch and Position
3. Each workstation should display:
   - Branch name and Position title
   - Currently assigned employee (if any)
   - List of assets at that workstation
   - Total acquisition cost

**Expected Result:** You should see workstations at:
- Head Office - MIS Assistant (3 workstation assets + 1 laptop)
- Head Office - MIS Supervisor (3 workstation assets)
- Head Office - Compliance Specialist (2 workstation assets)
- Jasaan Branch - General Bookkeeper (7 workstation assets)

### Test 2: Simple Employee Move (Single Branch Transition)

**Purpose:** Test workstation asset reassignment when one employee moves

**Scenario:** Move Deserie (MIS Assistant) from Head Office to Jasaan Branch

**Steps:**
1. Navigate to **Inventory → Employee Transitions**
2. Click **Branch Transition** mode
3. Find employee: **Deserie Imy C. Quidet**
   - Current: Head Office - MIS Assistant
   - Has: 3 workstation assets (Desktop PC, Printer, Memory) + 1 laptop
4. Click **Modify** on Deserie's row
5. Change:
   - Destination Branch: **Jasaan Branch**
   - Destination Position: **General Bookkeeper**
6. Click **Save** (green checkmark)
7. Scroll down and click **Execute Transition** button
8. Confirm the transition

**Expected Result:**
- Success message shows: "1 employee transitioned successfully"
- Message shows: "3 workstation assets reassigned to new employees"
- Explanation: "Desktop PCs, monitors, and other fixed equipment now belong to incoming employees"
- Note: "Portable assets (laptops) remain with their owners"

**Verification:**
1. Go to **Inventory → Workstations**
2. Check **Head Office - MIS Assistant** workstation:
   - Should show **NO assigned employee** (vacated)
   - Workstation assets should be **unassigned**
3. Check **Jasaan Branch - General Bookkeeper** workstation:
   - Should show **Deserie** as assigned employee
   - Deserie should have **inherited the 7 workstation assets** that were there
4. Go to **Inventory → Assets** and filter by Deserie:
   - She should still have her **laptop** (portable asset)
   - She should have the **7 workstation assets from Jasaan Branch**
   - She should NOT have the old Head Office workstation assets

### Test 3: Employee Swap (Exchange Detection)

**Purpose:** Test automatic exchange detection and asset swapping

**Scenario:** Swap Bryan (MIS Supervisor @ Head Office) with Jeprey (General Bookkeeper @ Jasaan Branch)

**Steps:**
1. Navigate to **Inventory → Employee Transitions**
2. Click **Branch Transition** mode
3. Modify **Bryan Abelos**:
   - Change Destination Branch: **Jasaan Branch**
   - Change Destination Position: **General Bookkeeper**
   - Click Save
4. Modify **Jeprey S. Bulawan**:
   - Change Destination Branch: **Head Office**
   - Change Destination Position: **MIS Supervisor**
   - Click Save
5. Notice the **purple "Exchange" badges** appear on both employees
6. A purple panel should appear at the top showing "1 Exchange Detected"
7. Click **Execute Transition**
8. Confirm

**Expected Result:**
- Success message: "2 employees transitioned successfully"
- "10 workstation assets reassigned" (3 from Head Office + 7 from Jasaan)
- Exchange was automatically detected and marked

**Verification:**
1. **Bryan** should now be at Jasaan Branch with the 7 workstation assets that were there
2. **Jeprey** should now be at Head Office with the 3 workstation assets that were there
3. Both employees swapped locations AND assets
4. Check **Asset Movements** page to see the audit trail

### Test 4: Employee with Laptop Move

**Purpose:** Verify portable assets (laptops) follow employees

**Scenario:** If you moved Deserie in Test 2, she should still have her laptop

**Steps:**
1. Go to **Inventory → Assets**
2. Filter by Category: **Laptops**
3. Find Deserie's laptop

**Expected Result:**
- Laptop should still be assigned to **Deserie**
- Laptop has `is_workstation_asset = false` in its category
- When Deserie moved, the laptop moved with her

### Test 5: Workstation Page Functionality

**Purpose:** Verify the workstation list page works correctly

**Steps:**
1. Navigate to **Inventory → Workstations**
2. Test the filters:
   - Filter by Branch (dropdown)
   - Search for employee names
   - Search for position names
3. Click on a workstation card to expand details
4. Click "View Assets" to see assets at that workstation

**Expected Result:**
- All workstations with assets are displayed
- Filters work correctly
- Asset counts are accurate
- Clicking links navigates to correct pages

## 🔍 Verification Checklist

After running the tests, verify:

- [ ] Workstation fields are set on assets (`workstation_branch_id`, `workstation_position_id`)
- [ ] Asset categories have `is_workstation_asset` flag set correctly
- [ ] Desktop PCs, Monitors, Printers = `is_workstation_asset = true`
- [ ] Laptops = `is_workstation_asset = false`
- [ ] Branch transitions show correct asset reassignment counts
- [ ] Success messages display workstation asset information
- [ ] Workstation page displays all workstations correctly
- [ ] Asset movements are created with `movement_type = 'branch_transition'`
- [ ] Portable assets (laptops) stay with employees when they move
- [ ] Workstation assets get reassigned to incoming employees
- [ ] Exchange detection works (purple badges appear for swaps)

## 🐛 Troubleshooting

### No workstation assets reassigning?

**Check:**
1. Do assets have `workstation_branch_id` and `workstation_position_id` set?
   ```bash
   php artisan tinker
   >>> \App\Models\Asset::whereNotNull('workstation_branch_id')->count()
   ```

2. If count is 0, run:
   ```bash
   php artisan assets:set-workstations --workstation-only
   ```

### Assets not showing on workstation page?

**Check:**
1. Make sure asset categories have `is_workstation_asset` flag:
   ```bash
   php artisan tinker
   >>> \App\Models\AssetCategory::all(['name', 'is_workstation_asset'])
   ```

2. Verify assets have both workstation fields set:
   ```bash
   php artisan tinker
   >>> \App\Models\Asset::whereNotNull('workstation_branch_id')
   >>>   ->whereNotNull('workstation_position_id')
   >>>   ->count()
   ```

### Success message shows "0 workstation assets reassigned"?

**Possible causes:**
1. Assets don't have workstation fields set → Run `php artisan assets:set-workstations`
2. Employee is moving to an empty workstation (no assets there)
3. All assets at destination workstation are portable (laptops)

### Frontend shows errors?

**Check:**
1. Backend is running: http://localhost:8000
2. Frontend is running: http://localhost:5173
3. Check browser console for errors (F12)
4. Check backend logs: `backend/storage/logs/laravel.log`

## 📊 Database Verification Queries

### Check workstation setup:

```sql
-- See all workstations with their assets
SELECT
  b.branch_name,
  p.title as position,
  e.fullname as employee,
  a.asset_name,
  ac.name as category,
  ac.is_workstation_asset
FROM assets a
LEFT JOIN branch b ON a.workstation_branch_id = b.id
LEFT JOIN position p ON a.workstation_position_id = p.id
LEFT JOIN employee e ON a.assigned_to_employee_id = e.id
LEFT JOIN asset_category ac ON a.asset_category_id = ac.id
WHERE a.workstation_branch_id IS NOT NULL
ORDER BY b.branch_name, p.title, a.asset_name;
```

### Check asset categories:

```sql
SELECT name, is_workstation_asset
FROM asset_category
ORDER BY name;
```

### Check recent asset movements:

```sql
SELECT
  am.movement_type,
  a.asset_name,
  e_from.fullname as from_employee,
  e_to.fullname as to_employee,
  b_from.branch_name as from_branch,
  b_to.branch_name as to_branch,
  am.movement_date
FROM asset_movements am
LEFT JOIN assets a ON am.asset_id = a.id
LEFT JOIN employee e_from ON am.from_employee_id = e_from.id
LEFT JOIN employee e_to ON am.to_employee_id = e_to.id
LEFT JOIN branch b_from ON am.from_branch_id = b_from.id
LEFT JOIN branch b_to ON am.to_branch_id = b_to.id
WHERE am.movement_type = 'branch_transition'
ORDER BY am.movement_date DESC
LIMIT 20;
```

## 🎯 Success Criteria

The implementation is working correctly if:

1. ✅ Employees can transition between branches
2. ✅ Workstation assets (Desktop PC, Monitor, etc.) are automatically reassigned to incoming employees
3. ✅ Portable assets (Laptops) stay with their employees when they move
4. ✅ Asset workstation locations (`workstation_branch_id`, `workstation_position_id`) never change
5. ✅ Success messages show accurate workstation asset reassignment counts
6. ✅ Workstation page displays all workstations with their assets
7. ✅ Exchange detection works for employee swaps
8. ✅ Asset movements are created for audit trail
9. ✅ No errors in console or backend logs
10. ✅ UI messages explain what happened clearly

## 📝 Notes

- **Workstation assets** = Desktop PCs, Monitors, Printers, UPS, etc. (stay at desk)
- **Portable assets** = Laptops (follow employee)
- Physical asset locations NEVER change during transitions
- Only the `assigned_to_employee_id` changes
- Complete audit trail is maintained in `asset_movements` table
- Exchange detection is automatic - no manual marking needed

## 🆘 Need Help?

- Review: `WORKSTATION_IMPLEMENTATION.md` for detailed implementation docs
- Check: Backend logs at `backend/storage/logs/laravel.log`
- Check: Browser console (F12) for frontend errors
- Run: `php artisan tinker` for database inspection
- Test API directly: http://localhost:8000/api/employees/branch-transition
