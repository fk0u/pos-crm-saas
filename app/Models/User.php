<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use BelongsToTenant, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'name',
        'email',
        'password',
        'role', // 'superadmin', 'owner', 'manager', 'cashier'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    public function isDeveloper(): bool
    {
        return $this->role === 'developer';
    }

    public function canManage(): bool
    {
        return in_array($this->role, ['owner', 'manager', 'developer', 'superadmin'], true);
    }

    public function activeShift(): ?Shift
    {
        return Shift::where('tenant_id', $this->tenant_id)
            ->where('user_id', $this->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();
    }
}
