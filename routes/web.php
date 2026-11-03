<?php

use App\Http\Controllers\Web\CashflowController;
use App\Http\Controllers\Web\CustomerController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DelegationTokenController;
use App\Http\Controllers\Web\DeveloperHubController;
use App\Http\Controllers\Web\HelpController;
use App\Http\Controllers\Web\InvoiceController;
use App\Http\Controllers\Web\LegalController;
use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\PosTerminalController;
use App\Http\Controllers\Web\ProductController;
use App\Http\Controllers\Web\RegisterController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\SuperadminController;
use App\Http\Controllers\Web\SupportChatController;
use App\Http\Controllers\Web\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

// Legal & Policies (Terms of Service & Privacy Policy)
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/help', [HelpController::class, 'index'])->name('help.index');
Route::get('/bantuan', fn () => redirect()->route('help.index'))->name('bantuan');

// Auth (session guard & onboarding)
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register'])->middleware('throttle:10,1');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// Protected SaaS App Routes
Route::middleware(['auth'])->group(function (): void {
    // 1. Dasbor
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/recent', [DashboardController::class, 'recentSales'])->name('dashboard.recent');

    // 2. Kasir (alias /pos) - All roles can access
    Route::get('/kasir', [PosTerminalController::class, 'index'])->name('kasir');
    Route::get('/pos', [PosTerminalController::class, 'index'])->name('pos.terminal');

    // 3. Katalog Produk - Protected by RBAC (superadmin, developer, owner, manager)
    Route::middleware(['role:superadmin,developer,owner,manager'])->group(function (): void {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/katalog', fn () => redirect()->route('products.index'))->name('katalog');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{id}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('/products/{id}/adjust-stock', [ProductController::class, 'adjustStock'])->name('products.adjust_stock');
    });

    // 4. Transaksi
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transaksi', fn () => redirect()->route('transactions.index'))->name('transaksi');
    Route::post('/transactions/{id}/refund', [TransactionController::class, 'refund'])->name('transactions.refund');
    Route::get('/transactions/export', [TransactionController::class, 'export'])->name('transactions.export');

    // 5. Arus Kas
    Route::get('/cashflow', [CashflowController::class, 'index'])->name('cashflow.index');
    Route::get('/arus-kas', fn () => redirect()->route('cashflow.index'))->name('arus_kas');
    Route::post('/cashflow/movement', [CashflowController::class, 'movement'])->name('cashflow.movement');
    Route::post('/cashflow/close-shift', [CashflowController::class, 'closeShift'])->name('cashflow.close_shift');

    // 6. Pelanggan CRM
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/pelanggan', fn () => redirect()->route('customers.index'))->name('pelanggan');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{id}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::post('/customers/{id}/adjust-points', [CustomerController::class, 'adjustPoints'])->name('customers.adjust_points');

    // 7. Laporan - Protected by RBAC (superadmin, developer, owner, manager)
    Route::middleware(['role:superadmin,developer,owner,manager'])->group(function (): void {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/laporan', fn () => redirect()->route('reports.index'))->name('laporan');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // 8. Pusat Bantuan & Layanan CS Realtime (Delegation Tokens)
    Route::post('/help/delegation-tokens', [DelegationTokenController::class, 'store'])->name('help.delegation.store');
    Route::delete('/help/delegation-tokens/{id}', [DelegationTokenController::class, 'destroy'])->name('help.delegation.destroy');

    // 9. Real-time CS Live Chat API
    Route::get('/api/support/conversation', [SupportChatController::class, 'getActiveConversation']);
    Route::post('/api/support/message', [SupportChatController::class, 'sendMessage']);

    // 10. Semi-PaaS Developer Hub (developer, owner, superadmin)
    Route::middleware(['role:developer,owner,superadmin'])->group(function (): void {
        Route::get('/developer', [DeveloperHubController::class, 'index'])->name('developer.index');
        Route::post('/developer/api-keys', [DeveloperHubController::class, 'createKey'])->name('developer.keys.store');
        Route::delete('/developer/api-keys/{id}', [DeveloperHubController::class, 'destroyKey'])->name('developer.keys.destroy');
        Route::post('/developer/webhooks', [DeveloperHubController::class, 'createWebhook'])->name('developer.webhooks.store');
        Route::post('/developer/webhooks/{id}/test', [DeveloperHubController::class, 'testWebhook'])->name('developer.webhooks.test');
        Route::delete('/developer/webhooks/{id}', [DeveloperHubController::class, 'destroyWebhook'])->name('developer.webhooks.destroy');
    });

    // 11. Superadmin Sovereign Control Center (superadmin only)
    Route::middleware(['role:superadmin'])->group(function (): void {
        Route::get('/superadmin', [SuperadminController::class, 'index'])->name('superadmin.dashboard');
        Route::post('/superadmin/claim-token', [SuperadminController::class, 'claimToken'])->name('superadmin.claim_token');
        Route::post('/superadmin/exit-delegation', [SuperadminController::class, 'exitDelegation'])->name('superadmin.exit_delegation');
        Route::post('/superadmin/tenants/{id}/toggle-status', [SuperadminController::class, 'toggleTenantStatus'])->name('superadmin.tenants.toggle_status');
        Route::post('/superadmin/tickets/{id}/reply', [SuperadminController::class, 'replySupportTicket'])->name('superadmin.tickets.reply');
        Route::post('/superadmin/tickets/{id}/resolve', [SuperadminController::class, 'resolveSupportTicket'])->name('superadmin.tickets.resolve');
    });
});

// Invoices & Thermal Receipts (Publicly viewable by customers receiving WhatsApp/Print link)
Route::get('/invoices/{order}/receipt', [InvoiceController::class, 'receipt'])->name('invoices.receipt');
Route::get('/invoices/{order}/whatsapp', [InvoiceController::class, 'sendWhatsApp'])->name('invoices.whatsapp');
