<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\PiiSanitizer;
use PHPUnit\Framework\TestCase;

class PiiSanitizerTest extends TestCase
{
    public function test_mask_phone_masks_middle_digits(): void
    {
        $this->assertEquals('0812****7890', PiiSanitizer::maskPhone('081234567890'));
        $this->assertEquals('+6281****7890', PiiSanitizer::maskPhone('+6281234567890'));
        $this->assertEquals('08**34', PiiSanitizer::maskPhone('081234'));
        $this->assertNull(PiiSanitizer::maskPhone(null));
        $this->assertEquals('', PiiSanitizer::maskPhone(''));
    }

    public function test_mask_email_masks_username(): void
    {
        $this->assertEquals('j***e@example.com', PiiSanitizer::maskEmail('johndoe@example.com'));
        $this->assertEquals('a*@qlon.id', PiiSanitizer::maskEmail('ab@qlon.id'));
        $this->assertNull(PiiSanitizer::maskEmail(null));
        $this->assertEquals('', PiiSanitizer::maskEmail(''));
        $this->assertEquals('invalid-email', PiiSanitizer::maskEmail('invalid-email'));
    }

    public function test_mask_card_number_preserves_only_first_and_last_four(): void
    {
        $this->assertEquals('4111 **** **** 4444', PiiSanitizer::maskCardNumber('4111222233334444'));
        $this->assertEquals('4111 **** **** 1234', PiiSanitizer::maskCardNumber('4111-5555-6666-1234'));
        $this->assertNull(PiiSanitizer::maskCardNumber(null));
    }

    public function test_sanitize_payload_recursively_redacts_secrets_and_masks_pii(): void
    {
        $input = [
            'username' => 'budi_santoso',
            'password' => 'RahasiaSuper123!',
            'api_key' => 'live_sk_9999999999',
            'phone' => '081234567890',
            'email' => 'budi.santoso@gmail.com',
            'card_number' => '4111222233334444',
            'customer' => [
                'name' => 'Dewi Lestari',
                'no_hp' => '085712345678',
                'email' => 'dewi@example.com',
                'secret_token' => 'xyz-auth-token',
            ],
            'meta' => [
                'order_id' => 'ORD-123',
                'amount' => 50000,
            ],
        ];

        $sanitized = PiiSanitizer::sanitizePayload($input);

        // Secrets should be [REDACTED]
        $this->assertEquals('[REDACTED]', $sanitized['password']);
        $this->assertEquals('[REDACTED]', $sanitized['api_key']);
        $this->assertEquals('[REDACTED]', $sanitized['customer']['secret_token']);

        // PII should be masked
        $this->assertEquals('0812****7890', $sanitized['phone']);
        $this->assertEquals('b***o@gmail.com', $sanitized['email']);
        $this->assertEquals('4111 **** **** 4444', $sanitized['card_number']);
        $this->assertEquals('0857****5678', $sanitized['customer']['no_hp']);
        $this->assertEquals('d***i@example.com', $sanitized['customer']['email']);

        // Safe fields should be untouched
        $this->assertEquals('budi_santoso', $sanitized['username']);
        $this->assertEquals('Dewi Lestari', $sanitized['customer']['name']);
        $this->assertEquals('ORD-123', $sanitized['meta']['order_id']);
        $this->assertEquals(50000, $sanitized['meta']['amount']);
    }
}
