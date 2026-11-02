<?php

declare(strict_types=1);

namespace App\Domain\Crm\Actions;

use App\Models\Customer;

class DetermineCustomerTierAction
{
    /**
     * Determines tier based on RFM and spend metrics.
     * Tier thresholds:
     * - Platinum: Spend >= Rp 1.000.000 or visits >= 15
     * - Gold: Spend >= Rp 300.000 or visits >= 5
     * - Silver: Default for enrolled members
     */
    public function execute(Customer $customer): string
    {
        $spend = (float) $customer->total_spend;
        $visits = (int) $customer->visit_count;

        if ($spend >= 1000000 || $visits >= 15) {
            return 'Platinum';
        }

        if ($spend >= 300000 || $visits >= 5) {
            return 'Gold';
        }

        return 'Silver';
    }
}
