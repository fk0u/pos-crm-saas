<?php

declare(strict_types=1);

namespace App\Domain\Shift\Actions;

use App\Domain\Audit\Actions\RecordAuditLogAction;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CloseShiftAction
{
    public function __construct(
        private readonly RecordAuditLogAction $recordAuditLog = new RecordAuditLogAction,
    ) {}

    public function execute(
        Shift $shift,
        float $actualEndingCash,
        ?string $notes = null,
        ?User $approvedBy = null,
    ): Shift {
        if (! $shift->isOpen()) {
            throw ValidationException::withMessages([
                'shift' => 'Shift ini sudah dalam status ditutup.',
            ]);
        }

        $expectedEnding = (float) $shift->starting_cash
            + (float) $shift->cash_sales_total
            + (float) $shift->cash_in_total
            - (float) $shift->cash_out_total;

        $difference = $actualEndingCash - $expectedEnding;

        $shift->update([
            'closed_at' => now(),
            'expected_ending_cash' => $expectedEnding,
            'actual_ending_cash' => $actualEndingCash,
            'difference' => $difference,
            'status' => 'closed',
            'notes' => $notes ?: $shift->notes,
            'approved_by' => $approvedBy?->id,
        ]);

        if (abs($difference) > 0.01) {
            $this->recordAuditLog->execute(
                tenantId: $shift->tenant_id,
                userId: $shift->user_id,
                action: 'shift_discrepancy',
                details: [
                    'shift_id' => $shift->id,
                    'expected' => $expectedEnding,
                    'actual' => $actualEndingCash,
                    'difference' => $difference,
                    'approved_by' => $approvedBy?->name,
                ],
            );
        }

        $this->recordAuditLog->execute(
            tenantId: $shift->tenant_id,
            userId: $shift->user_id,
            action: 'shift_close',
            details: [
                'shift_id' => $shift->id,
                'starting_cash' => (float) $shift->starting_cash,
                'cash_sales' => (float) $shift->cash_sales_total,
                'actual_ending' => $actualEndingCash,
                'difference' => $difference,
            ],
        );

        return $shift->fresh();
    }
}
