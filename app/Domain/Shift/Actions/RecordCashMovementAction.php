<?php

declare(strict_types=1);

namespace App\Domain\Shift\Actions;

use App\Domain\Audit\Actions\RecordAuditLogAction;
use App\Models\Shift;
use App\Models\ShiftMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordCashMovementAction
{
    public function __construct(
        private readonly RecordAuditLogAction $recordAuditLog = new RecordAuditLogAction,
    ) {}

    public function execute(Shift $shift, User $user, string $type, float $amount, string $reason): ShiftMovement
    {
        if (! $shift->isOpen()) {
            throw ValidationException::withMessages([
                'shift' => 'Tidak dapat melakukan pergerakan kas pada shift yang sudah ditutup.',
            ]);
        }

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal pergerakan kas harus lebih besar dari 0.',
            ]);
        }

        if (! in_array($type, ['cash_in', 'cash_out'], true)) {
            throw ValidationException::withMessages([
                'type' => 'Tipe pergerakan kas hanya boleh cash_in atau cash_out.',
            ]);
        }

        return DB::transaction(function () use ($shift, $user, $type, $amount, $reason) {
            $movement = ShiftMovement::create([
                'shift_id' => $shift->id,
                'tenant_id' => $shift->tenant_id,
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $amount,
                'reason' => $reason,
            ]);

            if ($type === 'cash_in') {
                $shift->increment('cash_in_total', $amount);
            } else {
                $shift->increment('cash_out_total', $amount);
            }

            $expected = (float) $shift->starting_cash
                + (float) $shift->cash_sales_total
                + (float) $shift->cash_in_total
                - (float) $shift->cash_out_total;

            $shift->update(['expected_ending_cash' => $expected]);

            $this->recordAuditLog->execute(
                tenantId: $shift->tenant_id,
                userId: $user->id,
                action: 'cash_movement',
                details: [
                    'shift_id' => $shift->id,
                    'type' => $type,
                    'amount' => $amount,
                    'reason' => $reason,
                ],
            );

            return $movement;
        });
    }
}
