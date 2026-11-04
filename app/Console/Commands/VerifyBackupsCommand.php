<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class VerifyBackupsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:backup-verify {--filename= : Nama berkas snapshot spesifik untuk diverifikasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifikasi integritas arsip cadangan (SHA-256 Checksum) sesuai standar ISO 22301';

    public function handle(BackupService $backupService): int
    {
        $this->info('Memulai verifikasi integritas cadangan data QLon Enterprise (ISO 22301)...');

        $targetFile = $this->option('filename');

        if ($targetFile) {
            $result = $backupService->verifyBackupIntegrity($targetFile);
            if ($result['is_valid']) {
                $this->info("✓ {$targetFile}: VALID (SHA-256: {$result['sha256']})");

                return Command::SUCCESS;
            }

            $this->error("✗ {$targetFile}: GAGAL ({$result['status']} - {$result['message']})");

            return Command::FAILURE;
        }

        $backups = $backupService->listBackups();
        if (empty($backups)) {
            $this->warn('Tidak ada berkas backup yang tersimpan di storage.');

            return Command::SUCCESS;
        }

        $rows = [];
        $hasFailure = false;

        foreach ($backups as $backup) {
            $check = $backupService->verifyBackupIntegrity($backup['filename']);
            if (! $check['is_valid']) {
                $hasFailure = true;
            }

            $rows[] = [
                $backup['filename'],
                $backup['size'],
                $backup['created_at'],
                substr($check['sha256'] ?? $backup['sha256'], 0, 16).'...',
                $check['is_valid'] ? '✓ VALID' : '✗ '.$check['status'],
            ];
        }

        $this->table(['Nama Berkas', 'Ukuran', 'Dibuat Pada', 'SHA-256', 'Status Integritas'], $rows);

        if ($hasFailure) {
            $this->error('Ditemukan satu atau lebih arsip backup yang korup atau tidak valid.');

            return Command::FAILURE;
        }

        $this->info('Semua arsip backup terverifikasi valid dan utuh.');

        return Command::SUCCESS;
    }
}
