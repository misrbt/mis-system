<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\EmployeeController;

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

    // Asset Category routes
    Route::apiResource('asset-categories', AssetCategoryController::class);

    // Employee routes
    Route::apiResource('employees', EmployeeController::class);

    // Asset routes
    Route::delete('employees/{id}/assets', [AssetController::class, 'destroyByEmployee']);
    Route::post('assets/bulk-delete', [AssetController::class, 'bulkDelete']);
    Route::patch('assets/{id}/update-field', [AssetController::class, 'updateField']);
    Route::apiResource('assets', AssetController::class);
});
