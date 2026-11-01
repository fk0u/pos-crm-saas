<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OwnerDashboardController;
use App\Http\Controllers\Api\PosController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes: SaaS POS, CRM & Owner Monitoring
|--------------------------------------------------------------------------
| Semua endpoint POS/CRM/Owner diproteksi middleware `auth` (session kasir
| atau token). Tidak ada endpoint yang bisa ditembak publik tanpa sesi.
*/

Route::prefix('v1')->middleware(['auth'])->group(function (): void {
    // POS Terminal Endpoints
    Route::prefix('pos')->group(function (): void {
        Route::get('/products', [PosController::class, 'getProducts']);
        Route::post('/checkout', [PosController::class, 'checkout']);
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
