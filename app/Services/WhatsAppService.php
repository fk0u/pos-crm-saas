<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;

class WhatsAppService
{
    /**
     * Generate structured transaction receipt message for WhatsApp (Meta/wa.me compatible).
     */
    public function generateReceiptMessage(Order $order): string
    {
        $order->load([
            'items.product' => fn ($q) => $q->withoutGlobalScopes(),
            'customer' => fn ($q) => $q->withoutGlobalScopes(),
            'outlet' => fn ($q) => $q->withoutGlobalScopes(),
            'cashier' => fn ($q) => $q->withoutGlobalScopes(),
            'tenant' => fn ($q) => $q->withoutGlobalScopes(),
        ]);

        $tenantName = $order->tenant?->name ?? 'QLon Cloud POS';
        $outletName = $order->outlet?->name ?? 'Outlet Utama';
        $outletAddress = $order->outlet?->address ?? '';
        $outletPhone = $order->outlet?->phone ?? '';
        $cashierName = $order->cashier?->name ?? 'Kasir';
        $customerName = $order->customer?->name ?? 'Pelanggan Umum';

        $receiptUrl = url("/invoices/{$order->id}/receipt");

        $lines = [];
        $lines[] = "*[{$tenantName} - NOTA TRANSAKSI]*";
        $lines[] = '=================================';
        $lines[] = "*Outlet:* {$outletName}";
        if ($outletAddress) {
            $lines[] = "*Alamat:* {$outletAddress}";
        }
        if ($outletPhone) {
            $lines[] = "*Kontak:* {$outletPhone}";
        }
        $lines[] = '---------------------------------';
        $lines[] = "*No. Nota:* {$order->invoice_number}";
        $lines[] = '*Tanggal:* ' . ($order->created_at ? $order->created_at->format('d/m/Y H:i') : date('d/m/Y H:i'));
        $lines[] = "*Pelanggan:* {$customerName}";
        $lines[] = "*Kasir:* {$cashierName}";
        $lines[] = '---------------------------------';
        $lines[] = '*RINCIAN PESANAN:*';

        foreach ($order->items as $idx => $item) {
            $n = $idx + 1;
            $productName = $item->product?->name ?? 'Produk';
            $qty = $item->quantity;
            $unitPrice = number_format((float) $item->unit_selling_price, 0, ',', '.');
            $subtotal = number_format((float) $item->subtotal, 0, ',', '.');

            $lines[] = "{$n}. *{$productName}*";
            $lines[] = "   {$qty}x @ Rp {$unitPrice} = Rp {$subtotal}";
        }

        $lines[] = '---------------------------------';
        $lines[] = 'Subtotal : Rp ' . number_format((float) $order->subtotal, 0, ',', '.');

        if ((float) $order->discount_amount > 0) {
            $lines[] = 'Diskon   : -Rp ' . number_format((float) $order->discount_amount, 0, ',', '.');
        }
        if ((float) $order->tax_amount > 0) {
            $lines[] = 'Pajak    : +Rp ' . number_format((float) $order->tax_amount, 0, ',', '.');
        }

        $lines[] = '*TOTAL    : Rp ' . number_format((float) $order->grand_total, 0, ',', '.') . '*';

        if ($order->cash_tendered !== null) {
            $lines[] = 'Bayar    : Rp ' . number_format((float) $order->cash_tendered, 0, ',', '.');
            if ((float) $order->change_amount > 0) {
                $lines[] = 'Kembalian: Rp ' . number_format((float) $order->change_amount, 0, ',', '.');
            }
        }

        $lines[] = '---------------------------------';
        $lines[] = '*Metode Bayar:* ' . strtoupper($order->payment_method);
        $lines[] = '*Status:* ' . ($order->payment_status === 'paid' ? '[LUNAS]' : '[' . strtoupper($order->payment_status) . ']');

        if ($order->points_earned > 0) {
            $lines[] = "*Loyalty Poin:* +{$order->points_earned} Poin CRM";
        }

        $lines[] = '=================================';
        $lines[] = '*STRUK DIGITAL RESMI:*';
        $lines[] = "> {$receiptUrl}";
        $lines[] = '=================================';
        $lines[] = "Terima kasih telah berbelanja di {$tenantName}! 🙏";

        return implode("\n", $lines);
    }

    /**
     * Generate normalized, RFC 3986 rawurlencode WhatsApp wa.me URL.
     */
    public function generateWhatsAppUrl(string $phone, string $message): string
    {
        $normalizedPhone = $this->normalizePhoneNumber($phone);
        $normalizedMessage = str_replace(["\r\n", "\r"], "\n", $message);
        $encodedMessage = rawurlencode($normalizedMessage);

        return "https://wa.me/{$normalizedPhone}?text={$encodedMessage}";
    }

    /**
     * Normalize phone number to international Indonesian format (628...).
     */
    public function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        if (!str_starts_with($phone, '62') && !empty($phone)) {
            $phone = '62' . $phone;
        }

        return $phone;
    }
}
