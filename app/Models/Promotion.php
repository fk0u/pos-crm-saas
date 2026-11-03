<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'type', // percentage | fixed
        'value',
        'min_order_amount',
        'max_discount_amount',
        'quota',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'quota' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Calculate discount amount for a given subtotal.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if (! $this->is_active) {
            return 0.0;
        }

        if ($this->starts_at && now()->lt($this->starts_at)) {
            return 0.0;
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return 0.0;
        }

        if ($this->used_count >= $this->quota) {
            return 0.0;
        }

        if ($subtotal < (float) $this->min_order_amount) {
            return 0.0;
        }

        if ($this->type === 'percentage') {
            $discount = round(($subtotal * (float) $this->value) / 100, 2);
            if ($this->max_discount_amount && (float) $this->max_discount_amount > 0) {
                $discount = min($discount, (float) $this->max_discount_amount);
            }

            return $discount;
        }

        return min((float) $this->value, $subtotal);
    }
}

