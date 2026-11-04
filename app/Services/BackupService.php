<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\ShiftMovement;
use App\Models\SupportDelegationToken;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Models\SystemIncident;
use App\Models\Tenant;
use App\Models\User;
use App\Scopes\TenantScope;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class BackupService
{
    protected string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (! File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Get the list of all models and their tables included in the backup.
     */
    public function getBackupEntities(): array
    {
        return [
            'tenants' => Tenant::class,
            'outlets' => Outlet::class,
            'users' => User::class,
            'products' => Product::class,
            'customers' => Customer::class,
            'shifts' => Shift::class,
            'shift_movements' => ShiftMovement::class,
            'orders' => Order::class,
            'order_items' => OrderItem::class,
            'audit_logs' => AuditLog::class,
            'support_tickets' => SupportTicket::class,
            'support_messages' => SupportMessage::class,
            'support_delegation_tokens' => SupportDelegationToken::class,
            'system_incidents' => SystemIncident::class,
        ];
    }

    /**
     * List all available backups with metadata, sorted newest first.
     */
    public function listBackups(): array
    {
        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $filename = $file->getFilename();
            if (! str_ends_with($filename, '.sql') && ! str_ends_with($filename, '.zip')) {
                continue;
            }

            $sizeBytes = $file->getSize();
            $mtime = $file->getMTime();
            $date = Carbon::createFromTimestamp($mtime);

            $isAuto = str_contains($filename, '_auto_');
            $type = $isAuto ? 'Otomatis (Jadwal 01:00)' : 'Manual (Snapshot Superadmin)';

            $sha256File = $file->getPathname().'.sha256';
            $sha256 = File::exists($sha256File) ? trim(File::get($sha256File)) : hash_file('sha256', $file->getPathname());
            $integrity = $this->verifyBackupIntegrity($filename);

            $backups[] = [
                'filename' => $filename,
                'path' => $file->getPathname(),
                'sha256' => $sha256,
                'sha256_short' => substr($sha256, 0, 12).'...',
                'integrity_verified' => $integrity['is_valid'],
                'integrity_status' => $integrity['status'],
                'size' => $this->formatBytes($sizeBytes),
                'size_bytes' => $sizeBytes,
                'created_at' => $date->format('d M Y, H:i:s'),
                'time_ago' => $date->diffForHumans(),
                'type' => $type,
                'is_auto' => $isAuto,
                'extension' => $file->getExtension(),
            ];
        }

        usort($backups, fn ($a, $b) => filemtime($b['path']) <=> filemtime($a['path']));

        return $backups;
    }

    /**
     * Delete backups older than specified days (Default: 3 days retention policy).
     */
    public function pruneOldBackups(int $keepDays = 3): int
    {
        $cutoff = Carbon::now()->subDays($keepDays)->getTimestamp();
        $deletedCount = 0;

        foreach (File::files($this->backupDir) as $file) {
            if ($file->getMTime() < $cutoff) {
                File::delete($file->getPathname());
                $deletedCount++;
            }
        }

        return $deletedCount;
    }

    /**
     * Create a full SQL snapshot backup file.
     */
    public function createBackup(string $type = 'manual'): array
    {
        // 1. Enforce 3-day retention policy first
        $this->pruneOldBackups(3);

        $timestamp = Carbon::now()->format('Y-m-d_His');
        $filename = "qlon_backup_{$type}_{$timestamp}.sql";
        $filePath = "{$this->backupDir}/{$filename}";

        $pdo = DB::connection()->getPdo();
        $prefix = DB::getTablePrefix();

        $sql = "-- =======================================================\n";
        $sql .= "-- QLon Enterprise POS & CRM SaaS Backup Snapshot\n";
        $sql .= "-- Snapshot Created: ".Carbon::now()->toIso8601String()."\n";
        $sql .= "-- Type: {$type}\n";
        $sql .= "-- Retention Policy: 3 Days Max Rolling Archive\n";
        $sql .= "-- Database Prefix: '{$prefix}'\n";
        $sql .= "-- =======================================================\n\n";

        if (DB::getDriverName() === 'mysql') {
            $sql .= "SET FOREIGN_KEY_CHECKS=0;\n";
            $sql .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n\n";
        }

        foreach ($this->getBackupEntities() as $tableKey => $modelClass) {
            /** @var \Illuminate\Database\Eloquent\Model $model */
            $model = new $modelClass();
            $tableName = $model->getTable();
            $realTable = $prefix.$tableName;

            // Retrieve all rows without any tenant isolation filter
            $rows = $modelClass::withoutGlobalScope(TenantScope::class)->get();

            $sql .= "-- -------------------------------------------------------\n";
            $sql .= "-- Table structure & data for table `{$realTable}` ({$rows->count()} records)\n";
            $sql .= "-- -------------------------------------------------------\n";

            if ($rows->isEmpty()) {
                $sql .= "-- (No records in {$realTable})\n\n";

                continue;
            }

            foreach ($rows as $row) {
                $attributes = $row->getAttributes();
                $columns = array_keys($attributes);

                $quotedColumns = array_map(fn ($col) => "`{$col}`", $columns);
                $escapedValues = array_map(function ($val) use ($pdo) {
                    if (is_null($val)) {
                        return 'NULL';
                    }
                    if (is_bool($val)) {
                        return $val ? '1' : '0';
                    }

                    return $pdo->quote((string) $val);
                }, array_values($attributes));

                $colsStr = implode(', ', $quotedColumns);
                $valsStr = implode(', ', $escapedValues);

                $sql .= "INSERT INTO `{$realTable}` ({$colsStr}) VALUES ({$valsStr});\n";
            }

            $sql .= "\n";
        }

        if (DB::getDriverName() === 'mysql') {
            $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        }

        File::put($filePath, $sql);
        $sha256 = hash_file('sha256', $filePath);
        File::put("{$filePath}.sha256", $sha256);

        // Record audit trail if user is authenticated
        if (Auth::check()) {
            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => Auth::user()?->tenant_id ?? Tenant::first()?->id,
                'user_id' => Auth::id(),
                'action' => 'backup.created',
                'details' => json_encode([
                    'filename' => $filename,
                    'sha256' => $sha256,
                    'size' => $this->formatBytes(filesize($filePath)),
                    'type' => $type,
                ]),
                'ip_address' => request()->ip(),
            ]);
        }

        return [
            'filename' => $filename,
            'path' => $filePath,
            'sha256' => $sha256,
            'size' => $this->formatBytes(filesize($filePath)),
            'created_at' => Carbon::now()->format('d M Y, H:i:s'),
            'type' => $type,
        ];
    }

    /**
     * Verify the integrity of a backup file using SHA-256 (ISO 22301 standard).
     */
    public function verifyBackupIntegrity(string $filename): array
    {
        $safeFilename = basename($filename);
        $filePath = "{$this->backupDir}/{$safeFilename}";

        if (! File::exists($filePath)) {
            return [
                'filename' => $safeFilename,
                'is_valid' => false,
                'status' => 'FILE_NOT_FOUND',
                'message' => "Berkas '{$safeFilename}' tidak ditemukan.",
            ];
        }

        $size = filesize($filePath);
        if ($size === 0) {
            return [
                'filename' => $safeFilename,
                'is_valid' => false,
                'status' => 'EMPTY_FILE',
                'message' => "Berkas '{$safeFilename}' kosong (0 bytes).",
            ];
        }

        $currentHash = hash_file('sha256', $filePath);
        $checksumPath = "{$filePath}.sha256";

        if (File::exists($checksumPath)) {
            $expectedHash = trim(File::get($checksumPath));
            if (! hash_equals($expectedHash, $currentHash)) {
                return [
                    'filename' => $safeFilename,
                    'is_valid' => false,
                    'status' => 'CHECKSUM_MISMATCH',
                    'current_hash' => $currentHash,
                    'expected_hash' => $expectedHash,
                    'message' => "Checksum SHA-256 tidak cocok. Berkas backup korup atau telah dimodifikasi.",
                ];
            }
        } else {
            File::put($checksumPath, $currentHash);
        }

        return [
            'filename' => $safeFilename,
            'is_valid' => true,
            'status' => 'VALID',
            'sha256' => $currentHash,
            'message' => "Integritas berkas terverifikasi valid (SHA-256).",
        ];
    }

    /**
     * Restore system data from a backup SQL file.
     */
    public function restoreBackup(string $filename): array
    {
        // Path traversal protection
        $safeFilename = basename($filename);
        $filePath = "{$this->backupDir}/{$safeFilename}";

        if (! File::exists($filePath)) {
            throw new \RuntimeException("Berkas backup '{$safeFilename}' tidak ditemukan.");
        }

        // Integrity Verification before restoration (ISO 22301)
        $integrity = $this->verifyBackupIntegrity($safeFilename);
        if (! $integrity['is_valid']) {
            throw new \RuntimeException("Berkas backup korup atau tidak valid ({$integrity['status']}: {$integrity['message']}). Pemulihan dibatalkan demi keamanan sistem.");
        }

        $sql = File::get($filePath);

        DB::beginTransaction();
        try {
            if (DB::getDriverName() === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
            }

            // Truncate all QLon tables in reverse dependency order
            $entities = array_reverse($this->getBackupEntities());
            $prefix = DB::getTablePrefix();
            foreach ($entities as $modelClass) {
                $tableName = (new $modelClass())->getTable();
                DB::table($tableName)->delete();
            }

            // Execute SQL backup statements
            DB::unprepared($sql);

            if (DB::getDriverName() === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }

            DB::commit();

            if (Auth::check()) {
                AuditLog::create([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => Auth::user()?->tenant_id ?? Tenant::first()?->id,
                    'user_id' => Auth::id(),
                    'action' => 'backup.restored',
                    'details' => json_encode(['restored_from' => $safeFilename]),
                    'ip_address' => request()->ip(),
                ]);
            }

            return [
                'status' => 'success',
                'message' => "Sistem berhasil dipulihkan dari snapshot '{$safeFilename}'.",
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Backup Restore Failed: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Export data into requested format (SQL, CSV ZIP, XLSX Excel-compatible).
     * Supports platform-wide export (Superadmin) or tenant-specific takeout.
     */
    public function exportData(string $format, ?string $tenantId = null): array
    {
        $timestamp = Carbon::now()->format('Y-m-d_His');
        $tenantPrefix = $tenantId ? "tenant_{$tenantId}_" : 'qlon_platform_';

        if ($format === 'sql') {
            $filename = "{$tenantPrefix}data_{$timestamp}.sql";
            $filePath = storage_path("app/backups/{$filename}");

            $backupData = $this->createBackup('export');
            File::copy($backupData['path'], $filePath);

            return [
                'path' => $filePath,
                'filename' => $filename,
                'mime' => 'application/sql',
            ];
        }

        if ($format === 'csv' || $format === 'xlsx') {
            $zipFilename = "{$tenantPrefix}data_takeout_{$timestamp}.zip";
            $zipPath = storage_path("app/backups/{$zipFilename}");

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Gagal membuat arsip ZIP export.');
            }

            foreach ($this->getBackupEntities() as $key => $modelClass) {
                /** @var \Illuminate\Database\Eloquent\Builder $query */
                $query = $modelClass::withoutGlobalScope(TenantScope::class);

                if ($tenantId && in_array('tenant_id', (new $modelClass())->getFillable())) {
                    $query->where('tenant_id', $tenantId);
                }

                $rows = $query->get();
                if ($rows->isEmpty()) {
                    continue;
                }

                $csvHandle = fopen('php://temp', 'r+');
                // Write UTF-8 BOM for Microsoft Excel compatibility
                fwrite($csvHandle, "\xEF\xBB\xBF");

                // Headers
                $headers = array_keys($rows->first()->getAttributes());
                fputcsv($csvHandle, $headers, ',', '"', '\\');

                // Rows
                foreach ($rows as $row) {
                    $formattedRow = array_map(function ($value) {
                        if (is_array($value) || is_object($value)) {
                            return json_encode($value, JSON_UNESCAPED_UNICODE);
                        }

                        return (string) $value;
                    }, array_values($row->getAttributes()));

                    fputcsv($csvHandle, $formattedRow, ',', '"', '\\');
                }

                rewind($csvHandle);
                $csvContent = stream_get_contents($csvHandle);
                fclose($csvHandle);

                $csvName = $format === 'xlsx' ? "{$key}_excel.csv" : "{$key}.csv";
                $zip->addFromString($csvName, $csvContent);
            }

            // Add Readme / Manifest
            $manifest = "QLON SAAS ENTERPRISE DATA TAKEOUT ARCHIVE\n";
            $manifest .= "Generated At: ".Carbon::now()->toIso8601String()."\n";
            $manifest .= "Target Scope: ".($tenantId ? "Tenant ID {$tenantId}" : 'Full Platform Enterprise')."\n";
            $manifest .= "Data Portability Standard: GDPR & UU PDP Compliant\n";
            $manifest .= "Format: Multi-entity CSV (UTF-8 BOM Excel-ready)\n";
            $manifest .= "Included Tables: ".implode(', ', array_keys($this->getBackupEntities()))."\n";
            $zip->addFromString('README_TAKEOUT.txt', $manifest);

            $zip->close();

            return [
                'path' => $zipPath,
                'filename' => $zipFilename,
                'mime' => 'application/zip',
            ];
        }

        throw new \InvalidArgumentException("Format ekspor '{$format}' tidak didukung. Pilih 'sql', 'csv', atau 'xlsx'.");
    }

    /**
     * Format bytes to readable human string.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }
}
