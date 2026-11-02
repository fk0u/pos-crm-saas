<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Crm\Actions\DetermineCustomerTierAction;
use App\Domain\Pos\DTOs\CartItemData;
use App\Domain\Pos\DTOs\CheckoutData;
use App\Models\Customer;
use PHPUnit\Framework\TestCase;

class DomainActionsTest extends TestCase
{
    public function test_determine_customer_tier_action(): void
    {
        $action = new DetermineCustomerTierAction;

        $silverCustomer = new Customer(['total_spend' => 50000, 'visit_count' => 1]);
        $this->assertSame('Silver', $action->execute($silverCustomer));

        $goldCustomer = new Customer(['total_spend' => 350000, 'visit_count' => 6]);
        $this->assertSame('Gold', $action->execute($goldCustomer));

        $platinumCustomer = new Customer(['total_spend' => 1200000, 'visit_count' => 20]);
        $this->assertSame('Platinum', $action->execute($platinumCustomer));
    }

    public function test_checkout_data_dto_parsing(): void
    {
        $dto = CheckoutData::fromArray([
            'outlet_id' => '00000000-0000-0000-0000-000000000001',
            'payment_method' => 'cash',
            'cash_tendered' => 100000,
            'items' => [
                ['product_id' => '00000000-0000-0000-0000-000000000002', 'quantity' => 2],
            ],
            'customer_phone' => '08123456789',
        ]);

        $this->assertSame('cash', $dto->paymentMethod);
        $this->assertEquals(100000.0, $dto->cashTendered);
        $this->assertCount(1, $dto->items);
        $this->assertInstanceOf(CartItemData::class, $dto->items[0]);
        $this->assertSame(2, $dto->items[0]->quantity);
        $this->assertSame('08123456789', $dto->customerPhone);
    }
}
