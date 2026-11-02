<?php

declare(strict_types=1);

namespace App\Domain\Shift\Actions;

use App\Domain\Audit\Actions\RecordAuditLogAction;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class OpenShiftAction
{
    public function __construct(
        private readonly RecordAuditLogAction $recordAuditLog = new RecordAuditLogAction,
    ) {}

    public function execute(User $user, string $outletId, float $startingCash, ?string $notes = null): Shift
    {
        $existing = Shift::where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'shift' => 'Anda masih memiliki shift aktif yang belum ditutup.',
            ]);
        }

        $shift = Shift::create([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $outletId,
            'user_id' => $user->id,
            'opened_at' => now(),
            'starting_cash' => $startingCash,
            'expected_ending_cash' => $startingCash,
            'status' => 'open',
            'notes' => $notes,
        ]);

        $this->recordAuditLog->execute(
            tenantId: $user->tenant_id,
            userId: $user->id,
            action: 'shift_open',
            details: [
                'shift_id' => $shift->id,
                'outlet_id' => $outletId,
                'starting_cash' => $startingCash,
            ],
        );

        return $shift;
    }
}
