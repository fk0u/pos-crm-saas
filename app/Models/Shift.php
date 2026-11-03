<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'user_id',
        'opened_at',
        'closed_at',
        'starting_cash',
        'cash_sales_total',
        'non_cash_sales_total',
        'cash_in_total',
        'cash_out_total',
        'expected_ending_cash',
        'actual_ending_cash',
        'difference',
        'status',
        'notes',
        'approved_by',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'starting_cash' => 'decimal:2',
        'cash_sales_total' => 'decimal:2',
        'non_cash_sales_total' => 'decimal:2',
        'cash_in_total' => 'decimal:2',
        'cash_out_total' => 'decimal:2',
        'expected_ending_cash' => 'decimal:2',
        'actual_ending_cash' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(ShiftMovement::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }
}
