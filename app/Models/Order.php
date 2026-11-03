<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'cashier_id',
        'customer_id',
        'invoice_number',
        'shift_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'cash_tendered',
        'change_amount',
        'points_earned',
        'points_redeemed',
        'payment_method',
        'payment_details',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'cash_tendered' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'points_earned' => 'integer',
        'points_redeemed' => 'integer',
        'payment_details' => 'array',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Allow resolving orders for public digital receipts and WhatsApp invoice redirection.
     */
    public function resolveRouteBinding($value, $field = null): ?Model
    {
        return $this->withoutGlobalScope(\App\Scopes\TenantScope::class)
            ->where($field ?? $this->getRouteKeyName(), $value)
            ->first();
    }
}
