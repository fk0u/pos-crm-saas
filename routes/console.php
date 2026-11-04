<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto Backup Harian QLon SaaS (Setiap hari pukul 01:00 AM)
// Menjaga retensi maksimal 3 hari terakhir secara otomatis
Schedule::command('qlon:backup --type=auto --keep=3')
    ->dailyAt('01:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/backup.log'));

