<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domain\Crm\Actions\LookupCustomerAction;
use App\Domain\Pos\Actions\ProcessCheckoutAction;
use App\Domain\Pos\DTOs\CheckoutData;
use App\Domain\Shift\Actions\CloseShiftAction;
use App\Domain\Shift\Actions\OpenShiftAction;
use App\Domain\Shift\Actions\RecordCashMovementAction;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosController extends Controller
{
    public function __construct(
        private readonly ProcessCheckoutAction $checkoutAction = new ProcessCheckoutAction,
        private readonly OpenShiftAction $openShiftAction = new OpenShiftAction,
        private readonly CloseShiftAction $closeShiftAction = new CloseShiftAction,
        private readonly RecordCashMovementAction $recordCashMovement = new RecordCashMovementAction,
        private readonly LookupCustomerAction $lookupCustomer = new LookupCustomerAction,
    ) {}

    /**
     * Get active products for the POS terminal.
     */
    public function getProducts(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereLike('name', "%{$search}%")
                    ->orWhereLike('sku', "%{$search}%")
                    ->orWhereLike('barcode', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('name')->get(),
        ]);
    }

    /**
     * Process checkout transaction.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'outlet_id' => 'nullable|uuid',
            'shift_id' => 'nullable|uuid',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'points_redeemed' => 'nullable|integer|min:0',
            'payment_method' => 'required|string|in:cash,qris,bank_transfer,debit,split,card,transfer',
            'cash_tendered' => 'nullable|numeric',
            'payment_details' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $checkoutData = CheckoutData::fromArray($validated);
        $result = $this->checkoutAction->execute($request->user(), $checkoutData);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diproses',
            'data' => $result,
        ], 201);
    }

    /**
     * Get active shift for the cashier.
     */
    public function getActiveShift(Request $request): JsonResponse
    {
        $user = $request->user();
        $shift = $user->activeShift();

        return response()->json([
            'success' => true,
            'data' => $shift ? [
                'id' => $shift->id,
                'outlet_id' => $shift->outlet_id,
                'opened_at' => $shift->opened_at->toIso8601String(),
                'starting_cash' => (float) $shift->starting_cash,
                'cash_sales_total' => (float) $shift->cash_sales_total,
                'non_cash_sales_total' => (float) $shift->non_cash_sales_total,
                'cash_in_total' => (float) $shift->cash_in_total,
                'cash_out_total' => (float) $shift->cash_out_total,
                'expected_ending_cash' => (float) $shift->expected_ending_cash,
            ] : null,
        ]);
    }

    /**
     * Open a new cashier shift.
     */
    public function openShift(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'outlet_id' => 'nullable|uuid',
            'starting_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $outlet = $this->checkoutAction->resolveOutlet($user, $validated['outlet_id'] ?? null);

        $shift = $this->openShiftAction->execute(
            user: $user,
            outletId: $outlet->id,
            startingCash: (float) $validated['starting_cash'],
            notes: $validated['notes'] ?? null,
        );

        return response()->json([
            'success' => true,
            'message' => 'Shift kasir berhasil dibuka',
            'data' => $shift,
        ], 201);
    }

    /**
     * Close the cashier shift (X/Z Report reconciliation).
     */
    public function closeShift(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'shift_id' => 'nullable|uuid',
            'actual_ending_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'supervisor_pin' => 'nullable|string',
        ]);

        $shift = null;
        if (! empty($validated['shift_id'])) {
            $shift = Shift::where('tenant_id', $user->tenant_id)->find($validated['shift_id']);
        } else {
            $shift = $user->activeShift();
        }

        if (! $shift) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ditemukan shift aktif yang dapat ditutup.',
            ], 404);
        }

        $closedShift = $this->closeShiftAction->execute(
            shift: $shift,
            actualEndingCash: (float) $validated['actual_ending_cash'],
            notes: $validated['notes'] ?? null,
            approvedBy: $user->canManage() ? $user : null,
        );

        return response()->json([
            'success' => true,
            'message' => 'Shift kasir berhasil ditutup',
            'data' => $closedShift,
        ]);
    }

    /**
     * Record cash in / cash out drawer movement.
     */
    public function cashMovement(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'shift_id' => 'nullable|uuid',
            'type' => 'required|string|in:cash_in,cash_out',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $shift = ! empty($validated['shift_id'])
            ? Shift::where('tenant_id', $user->tenant_id)->find($validated['shift_id'])
            : $user->activeShift();

        if (! $shift) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada shift aktif untuk mencatat pergerakan kas.',
            ], 404);
        }

        $movement = $this->recordCashMovement->execute(
            shift: $shift,
            user: $user,
            type: $validated['type'],
            amount: (float) $validated['amount'],
            reason: $validated['reason'],
        );

        return response()->json([
            'success' => true,
            'message' => 'Pergerakan kas berhasil dicatat',
            'data' => $movement,
        ], 201);
    }
}
