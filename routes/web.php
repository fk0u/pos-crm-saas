<?php

use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\PosTerminalController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

// Auth (session guard)
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// POS Terminal (Kasir)
Route::get('/pos', [PosTerminalController::class, 'index'])
    ->middleware('auth')
    ->name('pos.terminal');
