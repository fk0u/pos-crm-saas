<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    public const TIER_CORE = 'core';
    public const TIER_ESSENTIAL = 'essential';
    public const TIER_FULL = 'full';

    public const MODULE_POS_CASHIER = 'pos_cashier';
    public const MODULE_PRODUCTS = 'products_simple';
    public const MODULE_SALES_REPORT = 'sales_report_basic';
    public const MODULE_INVENTORY = 'inventory_stock';
    public const MODULE_CASHFLOW = 'cashflow_shift';
    public const MODULE_STAFF = 'staff_management';
    public const MODULE_PROMOTIONS = 'promotions_coupons';
    public const MODULE_CRM = 'customer_crm';
    public const MODULE_MULTI_OUTLET = 'multi_outlet';
    public const MODULE_KITCHEN_DISPLAY = 'kitchen_display';
    public const MODULE_ONLINE_ORDERING = 'online_ordering';
    public const MODULE_FINANCE = 'finance_profit_loss';
    public const MODULE_ACCOUNTING_REPORTS = 'reports_accounting';
    public const MODULE_DEVELOPER_API = 'developer_api';

    public const PACKAGE_MODULES = [
        self::TIER_CORE => [
            self::MODULE_POS_CASHIER,
            self::MODULE_PRODUCTS,
            self::MODULE_SALES_REPORT,
        ],
        self::TIER_ESSENTIAL => [
            self::MODULE_POS_CASHIER,
            self::MODULE_PRODUCTS,
            self::MODULE_SALES_REPORT,
            self::MODULE_INVENTORY,
            self::MODULE_CASHFLOW,
            self::MODULE_STAFF,
            self::MODULE_PROMOTIONS,
            self::MODULE_CRM,
            self::MODULE_MULTI_OUTLET,
        ],
        self::TIER_FULL => [
            self::MODULE_POS_CASHIER,
            self::MODULE_PRODUCTS,
            self::MODULE_SALES_REPORT,
            self::MODULE_INVENTORY,
            self::MODULE_CASHFLOW,
            self::MODULE_STAFF,
            self::MODULE_PROMOTIONS,
            self::MODULE_CRM,
            self::MODULE_MULTI_OUTLET,
            self::MODULE_KITCHEN_DISPLAY,
            self::MODULE_ONLINE_ORDERING,
            self::MODULE_FINANCE,
            self::MODULE_ACCOUNTING_REPORTS,
            self::MODULE_DEVELOPER_API,
        ],
    ];

    protected $fillable = [
        'name',
        'subdomain',
        'logo_url',
        'phone',
        'is_active',
        'subscription_tier',
        'custom_modules',
        'max_outlets',
        'max_staff',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'custom_modules' => 'array',
        'max_outlets' => 'integer',
        'max_staff' => 'integer',
    ];

    /**
     * Get human-friendly label for current subscription tier in simple neutral language.
     */
    public function getTierLabel(): string
    {
        return match ($this->subscription_tier) {
            self::TIER_CORE => 'Paket Dasar (Core)',
            self::TIER_FULL => 'Paket Solusi Lengkap (Full Solution)',
            default => 'Paket Menengah (Essential)',
        };
    }

    /**
     * Get list of all active modules for this tenant (package modules + custom add-on modules).
     *
     * @return array<string>
     */
    public function getEnabledModules(): array
    {
        $tier = $this->subscription_tier ?? self::TIER_ESSENTIAL;
        $base = self::PACKAGE_MODULES[$tier] ?? self::PACKAGE_MODULES[self::TIER_ESSENTIAL];
        $custom = is_array($this->custom_modules) ? $this->custom_modules : [];

        return array_values(array_unique(array_merge($base, $custom)));
    }

    /**
     * Check if a specific feature module is enabled for this tenant.
     */
    public function hasModule(string $module): bool
    {
        return in_array($module, $this->getEnabledModules(), true);
    }

    /**
     * Check if tenant is allowed to register an additional outlet/branch.
     */
    public function canAddOutlet(): bool
    {
        if ($this->subscription_tier === self::TIER_FULL) {
            return true;
        }

        $currentCount = $this->outlets()->count();
        $limit = $this->max_outlets ?: ($this->subscription_tier === self::TIER_CORE ? 1 : 3);

        return $currentCount < $limit;
    }

    /**
     * Check if tenant is allowed to register an additional staff user.
     */
    public function canAddStaff(): bool
    {
        if ($this->subscription_tier === self::TIER_FULL) {
            return true;
        }

        $currentCount = $this->users()->count();
        $limit = $this->max_staff ?: ($this->subscription_tier === self::TIER_CORE ? 2 : 10);

        return $currentCount < $limit;
    }

    public function outlets(): HasMany
    {
        return $this->hasMany(Outlet::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
