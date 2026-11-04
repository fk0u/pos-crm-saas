<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuditLogPiiTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_log_automatically_redacts_secrets_and_masks_pii(): void
    {
        $tenant = Tenant::create([
            'name' => 'Test Tenant',
            'subdomain' => 'tenant-'.Str::random(6),
            'plan' => 'standard',
            'status' => 'active',
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $log = AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'customer.created',
            'details' => [
                'name' => 'Budi',
                'phone' => '081234567890',
                'email' => 'budi@example.com',
                'password' => 'superSecretPassword',
                'api_key' => 'secret_api_key_123',
                'card_number' => '4111222233334444',
            ],
            'ip_address' => '127.0.0.1',
        ]);

        $savedLog = AuditLog::find($log->id);
        $details = $savedLog->details;

        $this->assertEquals('[REDACTED]', $details['password']);
        $this->assertEquals('[REDACTED]', $details['api_key']);
        $this->assertEquals('0812****7890', $details['phone']);
        $this->assertEquals('b***i@example.com', $details['email']);
        $this->assertEquals('4111 **** **** 4444', $details['card_number']);
        $this->assertEquals('Budi', $details['name']);
    }
}
