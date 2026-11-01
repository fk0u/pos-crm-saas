<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'phone',
        'name',
        'loyalty_points',
        'total_spend',
        'visit_count',
        'last_visit_at',
    ];

    protected $casts = [
        'loyalty_points' => 'integer',
        'total_spend' => 'decimal:2',
        'visit_count' => 'integer',
        'last_visit_at' => 'datetime',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
