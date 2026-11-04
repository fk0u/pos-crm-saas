<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class SystemBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qlon:backup {--type=auto : Tipe backup (auto/manual)} {--keep=3 : Jumlah hari retensi penyimpanan backup}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Melakukan auto backup snapshot database QLon SaaS dan rotasi retensi 3 hari terakhir';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $type = (string) $this->option('type') ?: 'auto';
        $keepDays = (int) $this->option('keep') ?: 3;

        $this->info("Menjalankan backup snapshot sistem QLon ({$type})...");

        try {
            $prunedCount = $backupService->pruneOldBackups($keepDays);
            if ($prunedCount > 0) {
                $this->line("Membersihkan {$prunedCount} berkas backup lama (retensi {$keepDays} hari).");
            }

            $backup = $backupService->createBackup($type);

            $this->info("Backup berhasil dibuat:");
            $this->table(
                ['File', 'Ukuran', 'Waktu Dibuat', 'Tipe'],
                [[$backup['filename'], $backup['size'], $backup['created_at'], $backup['type']]]
            );

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Gagal melakukan backup: {$e->getMessage()}");

            return Command::FAILURE;
        }
    }
}
