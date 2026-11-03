<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\InvoiceController;
use App\Http\Controllers\Web\LegalController;
use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\PosTerminalController;
use App\Http\Controllers\Web\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

// Legal & Policies (Terms of Service & Privacy Policy)
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');

// Auth (session guard & onboarding)
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register'])->middleware('throttle:10,1');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// Owner Central Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');
Route::get('/dashboard/recent', [DashboardController::class, 'recentSales'])
    ->middleware('auth')
    ->name('dashboard.recent');

// POS Terminal (Kasir)
Route::get('/pos', [PosTerminalController::class, 'index'])
    ->middleware('auth')
    ->name('pos.terminal');

// Invoices & Thermal Receipts
Route::get('/invoices/{order}/receipt', [InvoiceController::class, 'receipt'])
    ->name('invoices.receipt');
Route::get('/invoices/{order}/whatsapp', [InvoiceController::class, 'sendWhatsApp'])
    ->name('invoices.whatsapp');
