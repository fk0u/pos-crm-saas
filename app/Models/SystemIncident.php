<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemIncident extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'system_incidents';

    protected $fillable = [
        'id',
        'tenant_id',
        'user_id',
        'user_name',
        'user_email',
        'user_role',
        'url',
        'route_name',
        'method',
        'status_code',
        'error_type',
        'message',
        'file',
        'line',
        'trace_summary',
        'ip_address',
        'user_agent',
        'severity',
        'status',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
    ];

    protected $casts = [
        'status_code' => 'integer',
        'line' => 'integer',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unresolved incidents.
     */
    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', ['open', 'investigating']);
    }
}

