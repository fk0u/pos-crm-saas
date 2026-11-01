<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OwnerDashboardController;
use App\Http\Controllers\Api\PosController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes: SaaS POS, CRM & Owner Monitoring
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // POS Terminal Endpoints
    Route::prefix('pos')->group(function () {
        Route::get('/products', [PosController::class, 'getProducts']);
        Route::post('/checkout', [PosController::class, 'checkout']);
    });

    // CRM & Customer Loyalty Endpoints
    Route::prefix('crm')->group(function () {
        Route::get('/customer/lookup', [CustomerController::class, 'lookup']);
    });

    // Owner Central Live Monitoring Endpoints
    Route::prefix('owner')->group(function () {
        Route::get('/live-metrics', [OwnerDashboardController::class, 'getLiveMetrics']);
    });
});
