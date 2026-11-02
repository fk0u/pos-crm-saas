<?php

declare(strict_types=1);

namespace App\Domain\Crm\Actions;

use App\Models\Customer;

class LookupCustomerAction
{
    public function __construct(
        private readonly DetermineCustomerTierAction $determineTier = new DetermineCustomerTierAction,
    ) {}

    /**
     * Look up a customer by phone within tenant.
     *
     * @return array<string, mixed>|null
     */
    public function execute(string $tenantId, string $phone): ?array
    {
        // Sanitize phone number (remove spaces, dashes)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone) ?? '';

        $customer = Customer::where('tenant_id', $tenantId)
            ->where(function ($query) use ($cleanPhone, $phone) {
                $query->where('phone', $cleanPhone)
                    ->orWhere('phone', $phone);

                // Allow search with leading 0 or 62
                if (str_starts_with($cleanPhone, '0')) {
                    $query->orWhere('phone', '62'.substr($cleanPhone, 1));
                } elseif (str_starts_with($cleanPhone, '62')) {
                    $query->orWhere('phone', '0'.substr($cleanPhone, 2));
                }
            })
            ->first();

        if (! $customer) {
            return null;
        }

        return [
            'id' => $customer->id,
            'phone' => $customer->phone,
            'name' => $customer->name,
            'loyalty_points' => (int) $customer->loyalty_points,
            'total_spend' => (float) $customer->total_spend,
            'visit_count' => (int) $customer->visit_count,
            'tier' => $this->determineTier->execute($customer),
            'last_visit_at' => $customer->last_visit_at?->toIso8601String(),
        ];
    }
}
