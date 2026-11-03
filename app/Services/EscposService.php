<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;

class EscposService
{
    /**
     * Generate ESC/POS byte string for 58mm (32 chars) or 80mm (48 chars) thermal printers.
     */
    public function generateEscpos(Order $order, int $width = 32): string
    {
        $order->load([
            'items.product' => fn ($q) => $q->withoutGlobalScopes(),
            'customer' => fn ($q) => $q->withoutGlobalScopes(),
            'outlet' => fn ($q) => $q->withoutGlobalScopes(),
            'cashier' => fn ($q) => $q->withoutGlobalScopes(),
            'tenant' => fn ($q) => $q->withoutGlobalScopes(),
        ]);

        $ESC = "\x1b";
        $GS  = "\x1d";

        $raw = '';
        $raw .= $ESC . "@";        // Init printer
        $raw .= $ESC . "t\x00";    // Char code table: PC437

        // 1. Header (Centered)
        $raw .= $ESC . "a\x01";    // Center
        $raw .= $ESC . "E\x01";    // Bold ON
        $raw .= $GS  . "!\x11";    // Double size
        $tenantName = strtoupper($order->tenant?->name ?? 'QLON POS');
        $raw .= "{$tenantName}\n";
        $raw .= $GS  . "!\x00";    // Normal size
        $raw .= $ESC . "E\x00";    // Bold OFF

        $outletName = $order->outlet?->name ?? 'Outlet Utama';
        $raw .= "[ {$outletName} ]\n";
        if ($order->outlet?->address) {
            $raw .= "{$order->outlet->address}\n";
        }
        if ($order->outlet?->phone) {
            $raw .= "Telp: {$order->outlet->phone}\n";
        }

        $div = str_repeat('-', $width);
        $raw .= "{$div}\n";

        // 2. Meta Info (Left aligned)
        $raw .= $ESC . "a\x00";
        $raw .= "No. Nota : {$order->invoice_number}\n";
        $dateStr = $order->created_at ? $order->created_at->format('d/m/Y H:i') : date('d/m/Y H:i');
        $raw .= "Waktu    : {$dateStr}\n";
        $custName = $order->customer?->name ?? 'Pelanggan Umum';
        $raw .= "Kasir    : " . ($order->cashier?->name ?? 'Kasir') . "\n";
        $raw .= "Customer : {$custName}\n";
        $raw .= "{$div}\n";

        // 3. Items list
        foreach ($order->items as $item) {
            $name = $item->product?->name ?? 'Item';
            $qty = (int) $item->quantity;
            $price = number_format((float) $item->unit_selling_price, 0, ',', '.');
            $sub = number_format((float) $item->subtotal, 0, ',', '.');

            $raw .= "{$name}\n";
            $qtyLine = "  {$qty} x {$price}";
            $pad = max(1, $width - strlen($qtyLine) - strlen($sub));
            $raw .= $qtyLine . str_repeat(' ', $pad) . "{$sub}\n";
        }

        $raw .= "{$div}\n";

        // 4. Totals
        $subtotal = number_format((float) $order->subtotal, 0, ',', '.');
        $total = number_format((float) $order->grand_total, 0, ',', '.');

        $raw .= $this->twoColumns('Subtotal', $subtotal, $width);

        if ((float) $order->discount_amount > 0) {
            $disc = '-' . number_format((float) $order->discount_amount, 0, ',', '.');
            $raw .= $this->twoColumns('Diskon', $disc, $width);
        }
        if ((float) $order->tax_amount > 0) {
            $tax = '+' . number_format((float) $order->tax_amount, 0, ',', '.');
            $raw .= $this->twoColumns('Pajak', $tax, $width);
        }

        $raw .= $ESC . "E\x01"; // Bold ON
        $raw .= $this->twoColumns('TOTAL', "Rp {$total}", $width);
        $raw .= $ESC . "E\x00"; // Bold OFF

        if ($order->cash_tendered !== null) {
            $paid = number_format((float) $order->cash_tendered, 0, ',', '.');
            $change = number_format((float) $order->change_amount, 0, ',', '.');
            $raw .= $this->twoColumns('Tunai', $paid, $width);
            $raw .= $this->twoColumns('Kembali', $change, $width);
        }

        $raw .= $this->twoColumns('Metode', strtoupper($order->payment_method), $width);
        if ($order->points_earned > 0) {
            $raw .= $this->twoColumns('Poin CRM', "+{$order->points_earned}", $width);
        }

        $raw .= "{$div}\n";

        // 5. Footer
        $raw .= $ESC . "a\x01"; // Center
        $raw .= "Terima kasih atas kunjungan Anda!\n";
        $raw .= "Simpan struk ini sebagai bukti pembayaran.\n\n\n";

        // 6. Paper Cut
        $raw .= $GS . "V\x41\x03"; // Full cut with feed

        return $raw;
    }

    /**
     * Generate plain text representation for simulator or basic text printers.
     */
    public function generatePlainText(Order $order, int $width = 32): string
    {
        $order->load([
            'items.product' => fn ($q) => $q->withoutGlobalScopes(),
            'customer' => fn ($q) => $q->withoutGlobalScopes(),
            'outlet' => fn ($q) => $q->withoutGlobalScopes(),
            'cashier' => fn ($q) => $q->withoutGlobalScopes(),
            'tenant' => fn ($q) => $q->withoutGlobalScopes(),
        ]);

        $tenantName = strtoupper($order->tenant?->name ?? 'QLON POS');
        $outletName = $order->outlet?->name ?? 'Outlet Utama';
        $div = str_repeat('-', $width);

        $lines = [];
        $lines[] = str_pad($tenantName, $width, ' ', STR_PAD_BOTH);
        $lines[] = str_pad("[ {$outletName} ]", $width, ' ', STR_PAD_BOTH);
        if ($order->outlet?->address) {
            $lines[] = str_pad($order->outlet->address, $width, ' ', STR_PAD_BOTH);
        }
        $lines[] = $div;

        $lines[] = "No. Nota : {$order->invoice_number}";
        $lines[] = "Waktu    : " . ($order->created_at ? $order->created_at->format('d/m/Y H:i') : date('d/m/Y H:i'));
        $lines[] = "Kasir    : " . ($order->cashier?->name ?? 'Kasir');
        $lines[] = "Customer : " . ($order->customer?->name ?? 'Pelanggan Umum');
        $lines[] = $div;

        foreach ($order->items as $item) {
            $lines[] = $item->product?->name ?? 'Item';
            $qty = (int) $item->quantity;
            $price = number_format((float) $item->unit_selling_price, 0, ',', '.');
            $sub = number_format((float) $item->subtotal, 0, ',', '.');
            $qtyLine = "  {$qty} x {$price}";
            $pad = max(1, $width - strlen($qtyLine) - strlen($sub));
            $lines[] = $qtyLine . str_repeat(' ', $pad) . $sub;
        }

        $lines[] = $div;
        $total = number_format((float) $order->grand_total, 0, ',', '.');
        $lines[] = str_pad("TOTAL", $width - strlen("Rp {$total}")) . "Rp {$total}";

        if ($order->cash_tendered !== null) {
            $paid = number_format((float) $order->cash_tendered, 0, ',', '.');
            $change = number_format((float) $order->change_amount, 0, ',', '.');
            $lines[] = str_pad("Bayar", $width - strlen($paid)) . $paid;
            $lines[] = str_pad("Kembalian", $width - strlen($change)) . $change;
        }

        $lines[] = str_pad("Metode", $width - strlen($order->payment_method)) . strtoupper($order->payment_method);
        if ($order->points_earned > 0) {
            $lines[] = str_pad("Poin CRM", $width - strlen("+{$order->points_earned}")) . "+{$order->points_earned}";
        }

        $lines[] = $div;
        $lines[] = str_pad("Terima Kasih!", $width, ' ', STR_PAD_BOTH);

        return implode("\n", $lines) . "\n";
    }

    private function twoColumns(string $left, string $right, int $width): string
    {
        $pad = max(1, $width - strlen($left) - strlen($right));
        return $left . str_repeat(' ', $pad) . "{$right}\n";
    }
}
