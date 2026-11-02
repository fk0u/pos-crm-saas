<?php

declare(strict_types=1);

namespace App\Domain\Pos\DTOs;

readonly class CartItemData
{
    public function __construct(
        public string $productId,
        public int $quantity,
        public ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: (string) $data['product_id'],
            quantity: (int) $data['quantity'],
            notes: isset($data['notes']) ? (string) $data['notes'] : null,
        );
    }
}
