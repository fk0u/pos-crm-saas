<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class BackupIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected BackupService $backupService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->backupService = app(BackupService::class);
    }

    public function test_creating_backup_generates_sha256_checksum_file(): void
    {
        $backup = $this->backupService->createBackup('test_integrity');

        $this->assertFileExists($backup['path']);
        $checksumFile = $backup['path'].'.sha256';
        $this->assertFileExists($checksumFile);

        $expectedHash = hash_file('sha256', $backup['path']);
        $actualHash = trim(File::get($checksumFile));

        $this->assertEquals($expectedHash, $actualHash);
        $this->assertNotEmpty($backup['sha256']);
        $this->assertEquals($expectedHash, $backup['sha256']);

        // Clean up
        File::delete($backup['path']);
        File::delete($checksumFile);
    }

    public function test_verify_backup_integrity_detects_intact_and_corrupted_files(): void
    {
        $backup = $this->backupService->createBackup('test_verify');
        $filename = $backup['filename'];

        // 1. Intact verification should pass
        $intactResult = $this->backupService->verifyBackupIntegrity($filename);
        $this->assertTrue($intactResult['is_valid']);
        $this->assertEquals('VALID', $intactResult['status']);

        // 2. Corrupt file content
        File::append($backup['path'], "\n-- CORRUPTED DATA INJECTION");

        $corruptResult = $this->backupService->verifyBackupIntegrity($filename);
        $this->assertFalse($corruptResult['is_valid']);
        $this->assertEquals('CHECKSUM_MISMATCH', $corruptResult['status']);

        // Clean up
        File::delete($backup['path']);
        File::delete($backup['path'].'.sha256');
    }

    public function test_restore_aborts_if_checksum_mismatch(): void
    {
        $backup = $this->backupService->createBackup('test_restore_mismatch');
        $filename = $backup['filename'];

        // Tamper with file
        File::append($backup['path'], "\n-- TAMPERED");

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('korup');

        try {
            $this->backupService->restoreBackup($filename);
        } finally {
            File::delete($backup['path']);
            File::delete($backup['path'].'.sha256');
        }
    }

    public function test_artisan_backup_verify_command(): void
    {
        $backup = $this->backupService->createBackup('test_command');

        $this->artisan('system:backup-verify')
            ->assertExitCode(0);

        File::delete($backup['path']);
        File::delete($backup['path'].'.sha256');
    }
}
