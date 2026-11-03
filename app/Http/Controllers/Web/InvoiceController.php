<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\EscposService;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly WhatsAppService $whatsAppService,
        private readonly EscposService $escposService,
    ) {}

    /**
     * Render the 58mm / 80mm thermal receipt page.
     */
    public function receipt(Order $order): View
    {
        $order->loadMissing(['items.product', 'customer', 'outlet', 'cashier', 'tenant']);

        $escposRaw = $this->escposService->generateEscpos($order, 32);
        $escposPlainText = $this->escposService->generatePlainText($order, 32);
        $escposBase64 = base64_encode($escposRaw);

        return view('invoices.receipt', [
            'order' => $order,
            'escposBase64' => $escposBase64,
            'escposPlainText' => $escposPlainText,
        ]);
    }

    /**
     * Redirect to WhatsApp with structured receipt message.
     */
    public function sendWhatsApp(Order $order, Request $request): RedirectResponse
    {
        $order->loadMissing(['items.product', 'customer', 'outlet', 'cashier', 'tenant']);

        $phone = $request->query('phone') ?? $order->customer?->phone;

        if (!$phone) {
            return redirect()->back()->with('error', 'Nomor WhatsApp pelanggan tidak ditemukan.');
        }

        $message = $this->whatsAppService->generateReceiptMessage($order);
        $url = $this->whatsAppService->generateWhatsAppUrl($phone, $message);

        return redirect()->away($url);
    }
}
