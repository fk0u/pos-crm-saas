<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\PiiSanitizer;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use BelongsToTenant, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'action',
        'details',
        'ip_address',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    /**
     * Mutator to ensure audit log details are sanitized against secrets and PII (ISO 27701).
     */
    public function setDetailsAttribute($value): void
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->attributes['details'] = json_encode(PiiSanitizer::sanitizePayload($decoded));

                return;
            }
        } elseif (is_array($value)) {
            $this->attributes['details'] = json_encode(PiiSanitizer::sanitizePayload($value));

            return;
        }

        $this->attributes['details'] = $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
