<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetSubcategoryController;
use App\Http\Controllers\AssetComponentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RepairController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AssetMovementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SoftwareLicenseController;
use App\Http\Controllers\OfficeToolController;

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

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
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
                ]
            ]
        ]);
    });

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
    Route::apiResource('equipment', EquipmentController::class);

    // Asset Category routes
    Route::apiResource('asset-categories', AssetCategoryController::class);

    // Asset Subcategory routes
    Route::get('asset-categories/{categoryId}/subcategories', [AssetSubcategoryController::class, 'getByCategory']);
    Route::apiResource('asset-subcategories', AssetSubcategoryController::class);

    // Employee routes
    Route::get('employees/{id}/asset-history', [EmployeeController::class, 'getAssetHistory']);
    Route::apiResource('employees', EmployeeController::class);

    // Asset routes
    Route::delete('employees/{id}/assets', [AssetController::class, 'destroyByEmployee']);
    Route::post('assets/bulk-delete', [AssetController::class, 'bulkDelete']);
    Route::patch('assets/{id}/update-field', [AssetController::class, 'updateField']);
    Route::patch('assets/{id}/status', [AssetController::class, 'updateStatus']);
    Route::post('assets/generate-qr-codes', [AssetController::class, 'generateAllQRCodes']);
    Route::post('assets/{id}/generate-qr-code', [AssetController::class, 'generateQRCode']);
    Route::get('assets/totals', [AssetController::class, 'totals']);

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
        Route::post('/{id}/generate-qr-code', [AssetComponentController::class, 'generateQRCode']);
    });

    // Repair routes
    Route::get('repairs/{id}/remarks', [RepairController::class, 'getRemarks']);
    Route::post('repairs/{id}/remarks', [RepairController::class, 'addRemark']);
    Route::patch('repairs/{id}/status', [RepairController::class, 'updateStatus']);
    Route::get('repairs/{id}/job-order', [RepairController::class, 'downloadJobOrder']);
    Route::get('repairs/statistics', [RepairController::class, 'statistics']);
    Route::apiResource('repairs', RepairController::class);

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::get('/assets', [ReportController::class, 'getAssetReport']);
        Route::post('/assets/export', [ReportController::class, 'exportAssets']);
    });

    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/statistics', [DashboardController::class, 'getStatistics']);
        Route::get('/status-distribution', [DashboardController::class, 'getAssetStatusDistribution']);
        Route::get('/asset-trend', [DashboardController::class, 'getAssetTrend']);
        Route::get('/assets-needing-attention', [DashboardController::class, 'getAssetsNeedingAttention']);
        Route::get('/recent-activity', [DashboardController::class, 'getRecentActivity']);
        Route::get('/monthly-expenses', [DashboardController::class, 'getMonthlyExpenses']);
        Route::get('/yearly-expenses', [DashboardController::class, 'getYearlyExpenses']);
        Route::get('/expense-trends', [DashboardController::class, 'getExpenseTrends']);
        Route::get('/expense-breakdown', [DashboardController::class, 'getExpenseBreakdown']);
        Route::get('/branch-statistics', [DashboardController::class, 'getBranchStatistics']);
    });

    // Audit Log routes
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/statistics', [AuditLogController::class, 'statistics']);
        Route::get('/export', [AuditLogController::class, 'export']);
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
});
