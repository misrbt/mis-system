# Comprehensive Audit Log & Monthly Expenses Tracking Implementation Plan

## Executive Summary

Implement a complete audit trail system and monthly expense tracking to provide full visibility into all IT asset changes, repair history, and financial tracking throughout the application.

---

## Current System Analysis

### ✅ Already Implemented

1. **Asset Movement Tracking (AssetMovement table)**
   - Tracks: created, assigned, transferred, returned, status_changed, repair_initiated, repair_completed, updated, disposed
   - Stores: from/to employees, statuses, branches, repair references
   - Audit fields: performed_by_user_id, movement_date, ip_address, user_agent, metadata
   - Relationships: Asset, Employees, Statuses, Branches, Repairs, Users

2. **Automatic Change Tracking (Observers)**
   - **AssetObserver**: Tracks assignment, status, category, vendor, brand, model changes
   - **RepairObserver**: Automatically logs repair_initiated and repair_completed
   - Stores old/new values in metadata field

3. **Movement API & Frontend**
   - API: getAssetHistory, getAssignmentHistory, getAssetStatistics
   - Components: AssetMovementTimeline, AssetAssignmentHistory
   - Timeline visualization with icons and color coding

4. **Basic Reporting**
   - Asset reports filtered by date range, branch
   - PDF/Excel export capabilities
   - Summary statistics (total cost, book value, depreciation)

### ❌ What's Missing (User Requirements)

1. **Comprehensive Field-Level Auditing**
   - Currently only tracks limited fields (assignment, status, category, vendor, brand, model)
   - **MISSING**: Cost changes, book_value changes, warranty_expiration, purchase_date, serial_number, asset_name, estimated_life, acq_cost, remarks, etc.
   - Need to track **ALL** field changes with before/after values

2. **Centralized Audit Log View**
   - No dedicated page to view ALL changes across ALL assets
   - No filtering by user, asset, date range, change type
   - No search functionality for audit history

3. **Monthly Expenses Tracking**
   - No way to view expenses by month/year
   - Cannot track:
     - Assets purchased in a specific month (based on purchase_date + acq_cost)
     - Repair costs incurred in a specific month
     - Monthly expense trends and analytics
   - No expense breakdown by category, branch, status

4. **Enhanced Audit Trail Details**
   - User wants to see examples like: "This IT asset was Functional in January but tagged as Defective in November"
   - Need clear before/after comparisons for status changes over time
   - Track which user made specific changes

---

## Implementation Plan

### Phase 1: Enhanced Comprehensive Audit Logging

#### 1.1 Database - Already Ready ✅
The `asset_movements` table already has everything needed:
- `metadata` JSON field for storing before/after values
- All necessary foreign keys and audit fields
- No migrations needed!

#### 1.2 Backend - Update AssetObserver

**File**: `backend/app/Observers/AssetObserver.php`

**Changes**:
1. **Track ALL asset field changes** (not just selected fields)
   - Add comprehensive field tracking in `updated()` method
   - Track: acq_cost, book_value, purchase_date, warranty_expiration, serial_number, asset_name, estimated_life, location, remarks, qr_code, barcode

2. **Store detailed before/after values**
   ```php
   'metadata' => [
       'field_changed' => 'acq_cost',
       'old_value' => 15000.00,
       'new_value' => 18000.00,
       'field_label' => 'Acquisition Cost'
   ]
   ```

3. **Add field labels for user-friendly display**
   - Map technical field names to readable labels
   - Example: 'acq_cost' → 'Acquisition Cost'

**Implementation Notes**:
- Define array of all trackable fields with labels
- Loop through fields to detect changes
- Create movement record for each field change (or group related changes)
- Include field type for proper formatting (currency, date, text, number)

#### 1.3 Backend - Create AuditLogController

**File**: `backend/app/Http/Controllers/AuditLogController.php`

**Endpoints**:
```php
GET  /audit-logs              // Get audit logs with filtering
GET  /audit-logs/assets/{id}  // Get all changes for specific asset
GET  /audit-logs/users/{id}   // Get all changes by specific user
GET  /audit-logs/export       // Export audit logs (Excel/PDF)
GET  /audit-logs/statistics   // Get audit statistics
```

**Filtering Capabilities**:
- By asset_id (single or multiple)
- By movement_type (created, updated, status_changed, etc.)
- By date range (movement_date)
- By user (performed_by_user_id)
- By field changed (from metadata)
- Search by asset name, serial number
- Sort by date, user, asset, type

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "asset": { "id": 45, "asset_name": "Dell Laptop", "serial_number": "DL12345" },
      "movement_type": "status_changed",
      "from_status": { "name": "Functional", "color": "#10b981" },
      "to_status": { "name": "Defective", "color": "#ef4444" },
      "performed_by": { "name": "John Doe", "username": "jdoe" },
      "movement_date": "2025-11-15T10:30:00Z",
      "reason": "Hardware failure detected",
      "remarks": "Screen not displaying",
      "metadata": { "field_changed": "status_id", ... },
      "ip_address": "192.168.1.100"
    }
  ],
  "meta": { "total": 1250, "page": 1, "per_page": 50 }
}
```

#### 1.4 Backend - Update API Routes

**File**: `backend/routes/api.php`

```php
// Audit Log routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/assets/{asset}', [AuditLogController::class, 'getAssetAuditLog']);
    Route::get('/audit-logs/users/{user}', [AuditLogController::class, 'getUserAuditLog']);
    Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
    Route::get('/audit-logs/statistics', [AuditLogController::class, 'statistics']);
});
```

#### 1.5 Frontend - Create AuditLogsPage

**File**: `frontend/src/pages/inventory/AuditLogsPage.jsx`

**Features**:
1. **Comprehensive Filter Panel**
   - Asset selector (autocomplete)
   - User selector (autocomplete)
   - Movement type multi-select
   - Date range picker (from/to)
   - Search box (asset name, serial number)

2. **Audit Log Table**
   - Columns: Date/Time, Asset, Change Type, From → To, Changed By, Reason, Details
   - Color-coded badges for movement types
   - Expandable rows to show full metadata
   - Before/After value comparison

3. **Timeline View Option**
   - Switch between table and timeline view
   - Visual timeline showing changes over time
   - Group by asset or by date

4. **Export Functionality**
   - Export filtered results to Excel/PDF
   - Include all metadata and details

**Example Display**:
```
┌──────────────────────────────────────────────────────────────────┐
│ Date/Time         │ Asset         │ Change        │ Changed By   │
├──────────────────────────────────────────────────────────────────┤
│ Nov 15, 2025 10:30│ Dell Laptop   │ Functional    │ John Doe     │
│                   │ (DL12345)     │    ↓          │              │
│                   │               │ Defective     │              │
│                   │ Reason: Hardware failure detected            │
├──────────────────────────────────────────────────────────────────┤
│ Jan 12, 2025 14:20│ HP Monitor    │ Cost Change   │ Jane Smith   │
│                   │ (HP98765)     │ ₱15,000       │              │
│                   │               │    ↓          │              │
│                   │               │ ₱18,000       │              │
│                   │ Reason: Price adjustment per vendor quote    │
└──────────────────────────────────────────────────────────────────┘
```

#### 1.6 Frontend - Create Audit Service

**File**: `frontend/src/services/auditLogService.js`

```javascript
export const auditLogService = {
  fetchAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
  fetchAssetAuditLog: (assetId) => apiClient.get(`/audit-logs/assets/${assetId}`),
  fetchUserAuditLog: (userId) => apiClient.get(`/audit-logs/users/${userId}`),
  exportAuditLogs: (params) => apiClient.get('/audit-logs/export', { params, responseType: 'blob' }),
  fetchStatistics: () => apiClient.get('/audit-logs/statistics'),
}
```

#### 1.7 Frontend - Add to Navigation

**File**: `frontend/src/routes/inventoryRoutes.jsx`

Add route:
```javascript
{
  path: 'audit-logs',
  element: <AuditLogsPage />,
}
```

**File**: `frontend/src/components/navbar/InventoryNavbar.jsx`

Add menu item with icon (ClipboardList or FileSearch).

---

### Phase 2: Monthly Expenses Tracking

#### 2.1 Backend - Create/Update DashboardController

**File**: `backend/app/Http/Controllers/DashboardController.php`

**New Endpoints**:
```php
GET  /dashboard/monthly-expenses    // Get expenses by month
GET  /dashboard/expense-trends      // Get expense trends over time
GET  /dashboard/expense-breakdown   // Breakdown by category/branch/status
```

**Monthly Expenses Logic**:

1. **Asset Acquisition Expenses** (by purchase_date)
   ```php
   // Assets purchased in selected month/year
   Asset::whereYear('purchase_date', $year)
        ->whereMonth('purchase_date', $month)
        ->sum('acq_cost')
   ```

2. **Repair Expenses** (by actual_return_date or repair_date)
   ```php
   // Repairs completed in selected month/year
   Repair::whereYear('actual_return_date', $year)
          ->whereMonth('actual_return_date', $month)
          ->sum('repair_cost')
   ```

3. **Combined Monthly Expense**
   ```php
   [
       'month' => 'January 2025',
       'asset_purchases' => [
           'count' => 15,
           'total_cost' => 450000.00,
           'by_category' => [...],
           'by_branch' => [...]
       ],
       'repairs' => [
           'count' => 8,
           'total_cost' => 35000.00,
           'by_vendor' => [...]
       ],
       'total_expenses' => 485000.00
   ]
   ```

**Endpoint Implementation**:
```php
public function getMonthlyExpenses(Request $request)
{
    $year = $request->input('year', date('Y'));
    $month = $request->input('month', date('m'));

    // Asset purchases
    $assetPurchases = Asset::with(['category', 'vendor', 'assignedEmployee.branch'])
        ->whereYear('purchase_date', $year)
        ->whereMonth('purchase_date', $month)
        ->get();

    // Repairs
    $repairs = Repair::with(['asset', 'vendor'])
        ->whereYear('actual_return_date', $year)
        ->whereMonth('actual_return_date', $month)
        ->get();

    // Calculate totals and breakdowns
    $data = [
        'period' => [
            'year' => $year,
            'month' => $month,
            'label' => date('F Y', mktime(0, 0, 0, $month, 1, $year))
        ],
        'asset_purchases' => [
            'count' => $assetPurchases->count(),
            'total_cost' => $assetPurchases->sum('acq_cost'),
            'by_category' => $this->groupByCategory($assetPurchases),
            'by_branch' => $this->groupByBranch($assetPurchases),
            'items' => $assetPurchases
        ],
        'repairs' => [
            'count' => $repairs->count(),
            'total_cost' => $repairs->sum('repair_cost'),
            'by_vendor' => $this->groupByVendor($repairs),
            'items' => $repairs
        ],
        'total_expenses' => $assetPurchases->sum('acq_cost') + $repairs->sum('repair_cost')
    ];

    return response()->json(['success' => true, 'data' => $data]);
}

public function getExpenseTrends(Request $request)
{
    // Get monthly expenses for the past 12 months
    $months = [];
    for ($i = 11; $i >= 0; $i--) {
        $date = now()->subMonths($i);
        $year = $date->year;
        $month = $date->month;

        $assetCost = Asset::whereYear('purchase_date', $year)
            ->whereMonth('purchase_date', $month)
            ->sum('acq_cost') ?? 0;

        $repairCost = Repair::whereYear('actual_return_date', $year)
            ->whereMonth('actual_return_date', $month)
            ->sum('repair_cost') ?? 0;

        $months[] = [
            'month' => $date->format('M Y'),
            'asset_expenses' => $assetCost,
            'repair_expenses' => $repairCost,
            'total_expenses' => $assetCost + $repairCost
        ];
    }

    return response()->json(['success' => true, 'data' => $months]);
}
```

#### 2.2 Backend - Update API Routes

**File**: `backend/routes/api.php`

```php
// Dashboard & Analytics routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/monthly-expenses', [DashboardController::class, 'getMonthlyExpenses']);
    Route::get('/dashboard/expense-trends', [DashboardController::class, 'getExpenseTrends']);
    Route::get('/dashboard/expense-breakdown', [DashboardController::class, 'getExpenseBreakdown']);
});
```

#### 2.3 Frontend - Create MonthlyExpensesPage

**File**: `frontend/src/pages/inventory/MonthlyExpensesPage.jsx`

**Features**:

1. **Month/Year Selector**
   - Dropdown for month selection
   - Dropdown for year selection (current year ± 5 years)
   - Quick select buttons: "This Month", "Last Month", "This Year"

2. **Expense Summary Cards**
   ```
   ┌─────────────────────┬─────────────────────┬─────────────────────┐
   │ Asset Purchases     │ Repair Costs        │ Total Expenses      │
   │ ₱450,000.00        │ ₱35,000.00          │ ₱485,000.00        │
   │ 15 assets           │ 8 repairs           │                     │
   └─────────────────────┴─────────────────────┴─────────────────────┘
   ```

3. **Expense Breakdown Charts**
   - Pie chart: Expenses by category
   - Bar chart: Expenses by branch
   - Line chart: 12-month expense trend

4. **Detailed Tables**
   - **Asset Purchases Table**: Date, Asset Name, Category, Cost, Assigned To
   - **Repairs Table**: Date, Asset, Vendor, Repair Cost, Status
   - Both tables sortable and filterable

5. **Export Options**
   - Export monthly expense report (Excel/PDF)
   - Include all breakdowns and charts

**Layout Example**:
```jsx
<div className="space-y-6">
  {/* Month/Year Selector */}
  <div className="bg-white rounded-lg shadow p-6">
    <h2>Select Period</h2>
    <div className="flex gap-4">
      <select>
        <option>January</option>
        <option>February</option>
        ...
      </select>
      <select>
        <option>2025</option>
        <option>2024</option>
        ...
      </select>
      <button>Load Expenses</button>
    </div>
  </div>

  {/* Summary Cards */}
  <div className="grid grid-cols-3 gap-4">
    <StatCard title="Asset Purchases" value={assetTotal} count={assetCount} />
    <StatCard title="Repair Costs" value={repairTotal} count={repairCount} />
    <StatCard title="Total Expenses" value={totalExpenses} />
  </div>

  {/* Charts */}
  <div className="grid grid-cols-2 gap-4">
    <PieChart data={expensesByCategory} title="Expenses by Category" />
    <BarChart data={expensesByBranch} title="Expenses by Branch" />
  </div>

  <LineChart data={monthlyTrends} title="12-Month Expense Trend" />

  {/* Detailed Tables */}
  <Tabs>
    <Tab label="Asset Purchases">
      <AssetPurchasesTable data={assetPurchases} />
    </Tab>
    <Tab label="Repairs">
      <RepairsTable data={repairs} />
    </Tab>
  </Tabs>
</div>
```

#### 2.4 Frontend - Create Dashboard Service

**File**: `frontend/src/services/dashboardService.js`

```javascript
export const dashboardService = {
  fetchMonthlyExpenses: (year, month) =>
    apiClient.get('/dashboard/monthly-expenses', { params: { year, month } }),

  fetchExpenseTrends: () =>
    apiClient.get('/dashboard/expense-trends'),

  fetchExpenseBreakdown: (year, month) =>
    apiClient.get('/dashboard/expense-breakdown', { params: { year, month } }),
}
```

#### 2.5 Frontend - Add to Navigation

**File**: `frontend/src/routes/inventoryRoutes.jsx`

```javascript
{
  path: 'monthly-expenses',
  element: <MonthlyExpensesPage />,
}
```

**File**: `frontend/src/components/navbar/InventoryNavbar.jsx`

Add menu item with DollarSign or TrendingUp icon.

#### 2.6 Optional - Add Charts Library

If not already installed:
```bash
npm install recharts
# or
npm install chart.js react-chartjs-2
```

---

### Phase 3: Enhanced Dashboard Integration

#### 3.1 Update HomePage Dashboard

**File**: `frontend/src/pages/inventory/home.jsx`

**Add New Widgets**:

1. **Recent Audit Activity Widget**
   - Show last 10 audit log entries
   - Quick link to full audit log page

2. **Monthly Expenses Widget**
   - Current month expenses summary
   - Comparison to previous month (% change)
   - Quick link to monthly expenses page

3. **Expense Trend Chart**
   - Small line chart showing 6-month trend
   - Click to view full expense analytics

**Example Addition**:
```jsx
{/* Recent Activity */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Recent Changes</h3>
  {recentAuditLogs.slice(0, 5).map(log => (
    <div key={log.id} className="flex items-center gap-3 py-2 border-b">
      <ActivityIcon type={log.movement_type} />
      <div>
        <p className="text-sm font-medium">{log.asset.asset_name}</p>
        <p className="text-xs text-gray-500">
          {log.description} • {formatDate(log.movement_date)}
        </p>
      </div>
    </div>
  ))}
  <Link to="/inventory/audit-logs" className="text-blue-600 text-sm mt-2">
    View All →
  </Link>
</div>

{/* This Month Expenses */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">This Month Expenses</h3>
  <div className="text-3xl font-bold text-emerald-600">
    ₱{monthlyExpenses.total_expenses.toLocaleString()}
  </div>
  <div className="flex items-center gap-2 mt-2">
    <TrendingUp className="w-4 h-4 text-green-500" />
    <span className="text-sm text-gray-600">
      {percentChange}% vs last month
    </span>
  </div>
  <Link to="/inventory/monthly-expenses" className="text-blue-600 text-sm mt-4 block">
    View Details →
  </Link>
</div>
```

---

## Implementation Checklist

### Phase 1: Enhanced Audit Logging
- [ ] Update AssetObserver to track ALL fields
- [ ] Add field labels mapping for user-friendly display
- [ ] Create AuditLogController with all endpoints
- [ ] Add audit log routes to api.php
- [ ] Create AuditLogsPage component
- [ ] Create auditLogService
- [ ] Add audit logs to navigation menu
- [ ] Test comprehensive field tracking
- [ ] Test filtering and search
- [ ] Test export functionality

### Phase 2: Monthly Expenses
- [ ] Create/update DashboardController
- [ ] Implement getMonthlyExpenses endpoint
- [ ] Implement getExpenseTrends endpoint
- [ ] Add dashboard routes to api.php
- [ ] Create MonthlyExpensesPage component
- [ ] Create dashboardService
- [ ] Install charting library (if needed)
- [ ] Implement expense summary cards
- [ ] Implement expense breakdown charts
- [ ] Implement detailed tables
- [ ] Add to navigation menu
- [ ] Test month/year selection
- [ ] Test expense calculations
- [ ] Test export functionality

### Phase 3: Dashboard Integration
- [ ] Add Recent Activity widget to home page
- [ ] Add Monthly Expenses widget to home page
- [ ] Add expense trend mini-chart
- [ ] Test dashboard widgets
- [ ] Verify all links work correctly

---

## Testing Scenarios

### Audit Log Testing
1. Change asset status from "Functional" to "Defective" → Verify audit log created with before/after values
2. Change asset cost from ₱15,000 to ₱18,000 → Verify cost change tracked
3. Transfer asset between employees → Verify transfer logged with reason
4. Filter audit logs by specific asset → Verify all changes shown
5. Filter by date range → Verify correct records returned
6. Export audit logs → Verify Excel/PDF contains all data

### Monthly Expenses Testing
1. Select current month → Verify correct assets and repairs shown
2. Select previous month → Verify historical data displayed
3. Compare totals with database → Verify calculations correct
4. View expense breakdown by category → Verify all categories included
5. View 12-month trend → Verify trend chart accurate
6. Export monthly report → Verify all data included

### User Scenario Testing
1. **Track status change over time**: "Asset was Functional in January, now Defective in November"
   - View audit log for asset
   - See status change entries with dates
   - Verify user who made change is recorded

2. **Track monthly expenses**: "What did we spend in March 2025?"
   - Go to Monthly Expenses page
   - Select March 2025
   - See breakdown of asset purchases and repairs
   - Verify total matches expected amount

3. **Find who changed asset cost**: "Who updated the cost of Dell Laptop DL12345?"
   - Go to Audit Logs page
   - Filter by asset "DL12345"
   - Filter by change type "updated"
   - See user who made cost change with timestamp

---

## File Structure

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuditLogController.php       [NEW]
│   │   └── DashboardController.php      [NEW or UPDATE]
│   └── Observers/
│       └── AssetObserver.php            [UPDATE]
└── routes/
    └── api.php                          [UPDATE]

frontend/
├── src/
│   ├── pages/inventory/
│   │   ├── AuditLogsPage.jsx           [NEW]
│   │   ├── MonthlyExpensesPage.jsx     [NEW]
│   │   └── home.jsx                    [UPDATE]
│   ├── services/
│   │   ├── auditLogService.js          [NEW]
│   │   └── dashboardService.js         [NEW]
│   ├── components/
│   │   ├── charts/                     [NEW if not exists]
│   │   │   ├── PieChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   └── LineChart.jsx
│   │   └── navbar/
│   │       └── InventoryNavbar.jsx     [UPDATE]
│   └── routes/
│       └── inventoryRoutes.jsx         [UPDATE]
```

---

## Success Criteria

### Audit Logging
✅ ALL field changes tracked automatically with before/after values
✅ User can view complete history of any asset
✅ User can filter audit logs by asset, user, date, change type
✅ User can see who made specific changes with timestamps
✅ User can export audit logs to Excel/PDF
✅ Example scenario works: "See asset status change from Functional (Jan) to Defective (Nov)"

### Monthly Expenses
✅ User can select any month/year to view expenses
✅ Expenses include both asset purchases and repair costs
✅ Breakdown by category, branch, vendor displayed
✅ 12-month trend chart shows expense patterns
✅ User can export monthly expense report
✅ Dashboard shows current month expenses at a glance

---

## Notes for Implementation

1. **Performance Considerations**:
   - Add pagination to audit logs (50-100 records per page)
   - Add database indexes on movement_date and asset_id (already exists)
   - Consider caching monthly expense calculations

2. **Data Integrity**:
   - Asset movements use soft deletes for tamper evidence
   - Store IP address and user agent for security audit
   - Metadata field allows future expansion without schema changes

3. **User Experience**:
   - Use color-coded badges for different movement types
   - Show clear before → after comparisons
   - Provide date range presets (This Month, Last Month, Last 3 Months)
   - Make all tables sortable and searchable

4. **Future Enhancements** (Optional):
   - Email notifications for significant changes
   - Scheduled monthly expense reports
   - Budget tracking and alerts
   - Predictive expense analytics
