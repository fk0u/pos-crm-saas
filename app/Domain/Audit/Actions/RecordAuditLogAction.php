<?php

declare(strict_types=1);

namespace App\Domain\Audit\Actions;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class RecordAuditLogAction
{
    /**
     * @param  array<string, mixed>|null  $details
     */
    public function execute(string $tenantId, ?string $userId, string $action, ?array $details = null): AuditLog
    {
        return AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'action' => $action,
            'details' => $details,
            'ip_address' => Request::ip(),
        ]);
    }
}
