<?php

declare(strict_types=1);

namespace App\Support;

class PiiSanitizer
{
    /**
     * Keys whose values must be completely redacted ([REDACTED]).
     */
    protected const REDACTED_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'secret',
        'secret_token',
        'api_key',
        'access_token',
        'refresh_token',
        'authorization',
        'cvv',
        'cvc',
        'pin',
        'auth_token',
        'otp',
    ];

    /**
     * Keys representing phone numbers to be masked.
     */
    protected const PHONE_KEYS = [
        'phone',
        'phone_number',
        'telepon',
        'no_hp',
        'nomor_hp',
        'customer_phone',
        'mobile',
    ];

    /**
     * Keys representing email addresses to be masked.
     */
    protected const EMAIL_KEYS = [
        'email',
        'customer_email',
        'user_email',
    ];

    /**
     * Keys representing credit / debit card numbers.
     */
    protected const CARD_KEYS = [
        'card_number',
        'credit_card',
        'debit_card',
        'pan',
    ];

    /**
     * Mask phone number (e.g. 081234567890 -> 0812****7890).
     */
    public static function maskPhone(?string $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        $trimmed = trim($phone);
        if ($trimmed === '') {
            return '';
        }

        $len = strlen($trimmed);
        if ($len <= 4) {
            return str_repeat('*', $len);
        }

        if ($len <= 6) {
            return substr($trimmed, 0, 2).str_repeat('*', $len - 4).substr($trimmed, -2);
        }

        $prefixLen = str_starts_with($trimmed, '+') ? 5 : 4;
        $suffixLen = 4;
        $mask = str_repeat('*', 4);

        return substr($trimmed, 0, $prefixLen).$mask.substr($trimmed, -$suffixLen);
    }

    /**
     * Mask email username (e.g. johndoe@example.com -> j***e@example.com).
     */
    public static function maskEmail(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        $trimmed = trim($email);
        if ($trimmed === '') {
            return '';
        }

        if (! str_contains($trimmed, '@')) {
            return $trimmed;
        }

        [$user, $domain] = explode('@', $trimmed, 2);
        $len = strlen($user);

        if ($len <= 1) {
            $maskedUser = '*';
        } elseif ($len === 2) {
            $maskedUser = $user[0].'*';
        } else {
            $maskedUser = $user[0].'***'.$user[$len - 1];
        }

        return $maskedUser.'@'.$domain;
    }

    /**
     * Mask credit / debit card number according to PCI-DSS standard (e.g. 4111 **** **** 4444).
     */
    public static function maskCardNumber(?string $card): ?string
    {
        if ($card === null) {
            return null;
        }

        $digits = preg_replace('/\D/', '', $card);
        if (strlen($digits) < 8) {
            return str_repeat('*', strlen($card));
        }

        $first4 = substr($digits, 0, 4);
        $last4 = substr($digits, -4);

        return "{$first4} **** **** {$last4}";
    }

    /**
     * Recursively sanitize payload arrays by redacting secrets and masking PII.
     */
    public static function sanitizePayload(mixed $data): mixed
    {
        if (! is_array($data)) {
            return $data;
        }

        $sanitized = [];

        foreach ($data as $key => $value) {
            $lowerKey = strtolower((string) $key);

            if (is_array($value)) {
                $sanitized[$key] = self::sanitizePayload($value);

                continue;
            }

            if (in_array($lowerKey, self::REDACTED_KEYS, true)) {
                $sanitized[$key] = '[REDACTED]';

                continue;
            }

            if (in_array($lowerKey, self::PHONE_KEYS, true) && is_string($value)) {
                $sanitized[$key] = self::maskPhone($value);

                continue;
            }

            if (in_array($lowerKey, self::EMAIL_KEYS, true) && is_string($value)) {
                $sanitized[$key] = self::maskEmail($value);

                continue;
            }

            if (in_array($lowerKey, self::CARD_KEYS, true) && is_string($value)) {
                $sanitized[$key] = self::maskCardNumber($value);

                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }
}
