<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OwnerDashboardController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\SessionSecurityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes: SaaS POS, CRM & Owner Monitoring
|--------------------------------------------------------------------------
| Semua endpoint POS/CRM/Owner diproteksi middleware `auth` (session kasir
| atau token). Tidak ada endpoint yang bisa ditembak publik tanpa sesi.
*/

// Public Session & CSRF Sync Endpoints (Session Guarded)
Route::prefix('v1/session')->group(function (): void {
    Route::get('/csrf-token', [SessionSecurityController::class, 'refreshCsrf']);
});

Route::prefix('v1')->middleware(['auth'])->group(function (): void {
    // Advanced Session & Security Lifecycle Endpoints
    Route::prefix('session')->group(function (): void {
        Route::get('/status', [SessionSecurityController::class, 'status']);
        Route::post('/heartbeat', [SessionSecurityController::class, 'heartbeat']);
        Route::post('/rotate', [SessionSecurityController::class, 'rotateSession']);
        Route::post('/refresh-csrf', [SessionSecurityController::class, 'refreshCsrf']);
    });

    // POS Terminal & Shift Control Endpoints
    Route::prefix('pos')->group(function (): void {
        Route::get('/products', [PosController::class, 'getProducts']);
        Route::post('/checkout', [PosController::class, 'checkout']);
        Route::get('/shift/active', [PosController::class, 'getActiveShift']);
        Route::post('/shift/open', [PosController::class, 'openShift']);
        Route::post('/shift/close', [PosController::class, 'closeShift']);
        Route::post('/shift/movement', [PosController::class, 'cashMovement']);
    });

    // CRM & Customer Loyalty Endpoints
    Route::prefix('crm')->group(function (): void {
        Route::get('/customer/lookup', [CustomerController::class, 'lookup']);
    });

    // Owner Central Live Monitoring Endpoints
    Route::prefix('owner')->group(function (): void {
        Route::get('/live-metrics', [OwnerDashboardController::class, 'getLiveMetrics']);
    });
});
