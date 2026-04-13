<?php

use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetComponentController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetMovementController;
use App\Http\Controllers\AssetSubcategoryController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\OfficeToolController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\RepairController;
use App\Http\Controllers\ReplenishmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportSignatoryController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SoftwareLicenseController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\WorkstationController;
use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

// Public authentication routes with rate limiting
// Limit to 5 requests per minute for login/register to prevent brute force
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Heavy operations with stricter rate limiting (10 requests per minute)
Route::middleware(['throttle:10,1'])->group(function () {
    // QR Code generation - heavy operations
    Route::post('assets/generate-qr-codes', [AssetController::class, 'generateAllQRCodes']);
    Route::post('assets/{id}/generate-qr-code', [AssetController::class, 'generateQRCode']);
    Route::post('asset-components/{id}/generate-qr-code', [AssetComponentController::class, 'generateQRCode']);
    Route::post('asset-components/{id}/generate-barcode', [AssetComponentController::class, 'generateBarcode']);
    Route::post('asset-components/{id}/generate-codes', [AssetComponentController::class, 'generateCodes']);

    // Report exports - heavy operations
    Route::post('reports/assets/export', [ReportController::class, 'exportAssets']);
    Route::get('audit-logs/export', [AuditLogController::class, 'export']);

    // QR Code test endpoint - generates a test QR code to verify API configuration
    Route::post('qr-code/test', function (\Illuminate\Http\Request $request) {
        $data = $request->input('data', 'TEST-QR-CODE-123');

        $qrCode = \App\Services\QRCodeMonkeyService::generate($data, [
            'size' => $request->input('size', 300),
        ]);

        if ($qrCode) {
            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'data' => [
                    'qr_code' => $qrCode,
                    'encoded_data' => $data,
                    'config' => [
                        'body' => 'square',
                        'eye' => 'frame0',
                        'eyeBall' => 'ball0',
                        'bodyColor' => '#000000',
                        'bgColor' => '#FFFFFF',
                    ],
                ],
            ]);
        }

        $error = \App\Services\QRCodeMonkeyService::getLastError();

        return response()->json([
            'success' => false,
            'message' => 'Failed to generate QR code',
            'error' => $error,
        ], 500);
    });
});

// Protected routes (require authentication + rate limiting: 60 requests per minute)
Route::middleware(['throttle:60,1'])->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // User endpoint
    Route::get('/user', function () {
        $user = request()->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                ],
            ],
        ]);
    });

    // User Management routes
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // Branch routes
    Route::apiResource('branches', BranchController::class);

    // Section routes
    Route::apiResource('sections', SectionController::class);

    // Position routes
    Route::apiResource('positions', PositionController::class);

    // Status routes
    Route::apiResource('statuses', StatusController::class);

    // Vendor routes
    Route::apiResource('vendors', VendorController::class);

    // Equipment routes
    Route::get('equipment/{id}/assignments', [EquipmentController::class, 'getAssignments']);
    Route::apiResource('equipment', EquipmentController::class);

    // Asset Category routes
    Route::apiResource('asset-categories', AssetCategoryController::class);

    // Asset Subcategory routes
    Route::get('asset-categories/{categoryId}/subcategories', [AssetSubcategoryController::class, 'getByCategory']);
    Route::apiResource('asset-subcategories', AssetSubcategoryController::class);

    // Employee routes
    Route::post('employees/branch-transition', [EmployeeController::class, 'branchTransition']);
    Route::post('employees/employee-transition', [EmployeeController::class, 'employeeTransition']);
    Route::get('employees/{id}/asset-history', [EmployeeController::class, 'getAssetHistory']);
    Route::get('employees/{id}/workstations', [EmployeeController::class, 'getWorkstations']);
    Route::apiResource('employees', EmployeeController::class);

    // Workstation routes
    Route::get('workstations/by-branch/{branchId}', [WorkstationController::class, 'byBranch']);
    Route::get('workstations/{id}/assets', [WorkstationController::class, 'assets']);
    Route::get('workstations/{id}/employees', [WorkstationController::class, 'employees']);
    Route::post('workstations/{id}/assign-employee', [WorkstationController::class, 'assignEmployee']);
    Route::post('workstations/{id}/unassign-employee', [WorkstationController::class, 'unassignEmployee']);
    Route::post('workstations/{id}/assign-asset', [WorkstationController::class, 'assignAsset']);
    Route::post('workstations/{id}/transfer-asset', [WorkstationController::class, 'transferAsset']);
    Route::apiResource('workstations', WorkstationController::class);

    // Asset routes (QR generation moved to heavy operations group above)
    Route::delete('employees/{id}/assets', [AssetController::class, 'destroyByEmployee']);
    Route::post('assets/bulk-delete', [AssetController::class, 'bulkDelete']);
    Route::patch('assets/{id}/update-field', [AssetController::class, 'updateField']);
    Route::patch('assets/{id}/status', [AssetController::class, 'updateStatus']);
    Route::get('assets/totals', [AssetController::class, 'totals']);
    Route::get('assets/track', [AssetController::class, 'track']);

    Route::apiResource('assets', AssetController::class);

    // Asset Component routes (for Desktop PC components)
    Route::prefix('assets/{assetId}/components')->group(function () {
        Route::get('/', [AssetComponentController::class, 'index']);
        Route::post('/', [AssetComponentController::class, 'store']);
    });
    Route::prefix('asset-components')->group(function () {
        Route::get('/', [AssetComponentController::class, 'all']); // Get all components
        Route::get('/{id}', [AssetComponentController::class, 'show']);
        Route::get('/{id}/movements', [AssetComponentController::class, 'movements']); // Get component movements
        Route::put('/{id}', [AssetComponentController::class, 'update']);
        Route::delete('/{id}', [AssetComponentController::class, 'destroy']);
        Route::post('/{id}/transfer', [AssetComponentController::class, 'transfer']);
        // QR generation moved to heavy operations group above
    });

    // Repair routes
    Route::get('repairs/dashboard-summary', [RepairController::class, 'dashboardSummary']);
    Route::get('repairs/reminders', [RepairController::class, 'getReminders']);
    Route::get('repairs/{id}/remarks', [RepairController::class, 'getRemarks']);
    Route::post('repairs/{id}/remarks', [RepairController::class, 'addRemark']);
    Route::patch('repairs/{id}/status', [RepairController::class, 'updateStatus']);
    Route::get('repairs/{id}/job-order', [RepairController::class, 'downloadJobOrder']);
    Route::get('repairs/statistics', [RepairController::class, 'statistics']);
    Route::apiResource('repairs', RepairController::class);

    // Report routes (export moved to heavy operations group above)
    Route::prefix('reports')->group(function () {
        Route::get('/assets', [ReportController::class, 'getAssetReport']);
    });

    // Report Signatory routes
    Route::get('report-signatories', [ReportSignatoryController::class, 'show']);
    Route::post('report-signatories', [ReportSignatoryController::class, 'save']);

    // ============================================================
    // Dashboard Routes - Performance Optimized
    // ============================================================
    // Routes are organized by performance tier for optimal caching
    // and rate limiting strategies. Always prefer /initial endpoint
    // for page loads to minimize API requests.
    // ============================================================
    Route::prefix('dashboard')->group(function () {
        // ========================================
        // PRIMARY ENDPOINT - Use for initial page load
        // Combines multiple endpoints into one response
        // Response time: 300-500ms (cached), 800-1200ms (cold)
        // ========================================
        Route::get('/initial', [DashboardController::class, 'getInitialData'])
            ->name('dashboard.initial')
            ->middleware('cache.headers:private;max_age=60'); // Browser cache 1 min

        // ========================================
        // LIGHT ENDPOINTS (Fast: <100ms)
        // For specific widget updates or real-time data
        // Cache: 60 seconds (route + browser)
        // Rate limit: 60 requests/minute (inherited)
        // ========================================
        Route::middleware(['cache.headers:public;max_age=60', 'cache.response:60'])->group(function () {
            // Dashboard statistics - Total counts and key metrics
            Route::get('/statistics', [DashboardController::class, 'getStatistics'])
                ->name('dashboard.statistics');

            // Asset status distribution for pie charts
            Route::get('/status-distribution', [DashboardController::class, 'getAssetStatusDistribution'])
                ->name('dashboard.status-distribution');

            // Recent activity feed (last 10 movements)
            Route::get('/recent-activity', [DashboardController::class, 'getRecentActivity'])
                ->name('dashboard.recent-activity');

            // Assets requiring attention (warranty expiring, maintenance due)
            Route::get('/assets-needing-attention', [DashboardController::class, 'getAssetsNeedingAttention'])
                ->name('dashboard.assets-attention');

            // Under repair assets list
            Route::get('/under-repair-assets', [DashboardController::class, 'getUnderRepairAssets'])
                ->name('dashboard.under-repair');

            // Asset acquisition trend over time
            Route::get('/asset-trend', [DashboardController::class, 'getAssetTrend'])
                ->name('dashboard.asset-trend');
        });

        // ========================================
        // HEAVY ENDPOINTS (Slower: 200-500ms)
        // Complex aggregations and multi-table joins
        // Cache: 300 seconds (route + browser)
        // Rate limit: 30 requests/minute (stricter)
        // ========================================
        Route::middleware(['throttle:30,1', 'cache.response:300'])->group(function () {
            // Branch-level statistics with monthly trends (expensive query)
            Route::get('/branch-statistics', [DashboardController::class, 'getBranchStatistics'])
                ->name('dashboard.branch-statistics')
                ->middleware('cache.headers:private;max_age=300');

            // Detailed expense breakdown by category/branch/vendor
            Route::get('/expense-breakdown', [DashboardController::class, 'getExpenseBreakdown'])
                ->name('dashboard.expense-breakdown')
                ->middleware('cache.headers:private;max_age=300');

            // Monthly expenses for current year (acquisitions + repairs)
            Route::get('/monthly-expenses', [DashboardController::class, 'getMonthlyExpenses'])
                ->name('dashboard.monthly-expenses')
                ->middleware('cache.headers:public;max_age=300');

            // Yearly expenses comparison (last 3 years)
            Route::get('/yearly-expenses', [DashboardController::class, 'getYearlyExpenses'])
                ->name('dashboard.yearly-expenses')
                ->middleware('cache.headers:public;max_age=300');

            // Expense trends for specific period (year/month)
            Route::get('/expense-trends', [DashboardController::class, 'getExpenseTrends'])
                ->name('dashboard.expense-trends')
                ->middleware('cache.headers:private;max_age=300');
        });
    });

    // Audit Log routes (export moved to heavy operations group above)
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/statistics', [AuditLogController::class, 'statistics']);
        Route::get('/assets/{asset}', [AuditLogController::class, 'getAssetAuditLog']);
        Route::get('/users/{user}', [AuditLogController::class, 'getUserAuditLog']);
    });

    // Asset Movement routes
    Route::prefix('assets/{id}/movements')->group(function () {
        Route::get('/history', [AssetMovementController::class, 'getAssetHistory']);
        Route::get('/assignments', [AssetMovementController::class, 'getAssignmentHistory']);
        Route::get('/statistics', [AssetMovementController::class, 'getAssetStatistics']);
        Route::post('/transfer', [AssetMovementController::class, 'transferAsset']);
        Route::post('/return', [AssetMovementController::class, 'returnAsset']);
        Route::post('/update-status', [AssetMovementController::class, 'updateStatus']);
    });

    // Bulk transfer route (outside the {id} prefix)
    Route::post('assets/movements/bulk-transfer', [AssetMovementController::class, 'bulkTransfer']);

    // Software License routes
    Route::post('software-licenses/bulk-delete', [SoftwareLicenseController::class, 'bulkDelete']);
    Route::apiResource('software-licenses', SoftwareLicenseController::class);

    // Office Tool routes
    Route::post('office-tools/bulk-delete', [OfficeToolController::class, 'bulkDelete']);
    Route::apiResource('office-tools', OfficeToolController::class);

    // Replenishment routes
    Route::post('replenishments/{id}/assign-workstation', [ReplenishmentController::class, 'assignToEmployee']);
    Route::post('replenishments/{id}/assign-employee', [ReplenishmentController::class, 'assignToEmployee']); // Legacy alias
    Route::post('replenishments/{id}/assign-branch', [ReplenishmentController::class, 'assignToBranch']);
    Route::post('replenishments/{id}/remove-assignment', [ReplenishmentController::class, 'removeAssignment']);
    Route::apiResource('replenishments', ReplenishmentController::class);
});
