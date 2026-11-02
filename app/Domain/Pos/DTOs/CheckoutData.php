<?php

declare(strict_types=1);

namespace App\Domain\Pos\DTOs;

readonly class CheckoutData
{
    /**
     * @param  array<int, CartItemData>  $items
     * @param  array<string, mixed>|null  $paymentDetails
     */
    public function __construct(
        public array $items,
        public string $paymentMethod,
        public ?string $outletId = null,
        public ?string $shiftId = null,
        public ?string $customerPhone = null,
        public ?string $customerName = null,
        public float $discountAmount = 0.0,
        public float $taxAmount = 0.0,
        public int $pointsRedeemed = 0,
        public ?float $cashTendered = null,
        public ?array $paymentDetails = null,
        public ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        $items = array_map(
            fn (array $item) => CartItemData::fromArray($item),
            $data['items'] ?? []
        );

        $rawMethod = (string) ($data['payment_method'] ?? 'cash');
        $paymentMethod = match ($rawMethod) {
            'card' => 'debit',
            'transfer' => 'bank_transfer',
            default => $rawMethod,
        };

        return new self(
            items: $items,
            paymentMethod: $paymentMethod,
            outletId: isset($data['outlet_id']) ? (string) $data['outlet_id'] : null,
            shiftId: isset($data['shift_id']) ? (string) $data['shift_id'] : null,
            customerPhone: isset($data['customer_phone']) ? (string) $data['customer_phone'] : null,
            customerName: isset($data['customer_name']) ? (string) $data['customer_name'] : null,
            discountAmount: (float) ($data['discount_amount'] ?? 0.0),
            taxAmount: (float) ($data['tax_amount'] ?? 0.0),
            pointsRedeemed: (int) ($data['points_redeemed'] ?? 0),
            cashTendered: isset($data['cash_tendered']) ? (float) $data['cash_tendered'] : null,
            paymentDetails: isset($data['payment_details']) && is_array($data['payment_details']) ? $data['payment_details'] : null,
            notes: isset($data['notes']) ? (string) $data['notes'] : null,
        );
    }
}
