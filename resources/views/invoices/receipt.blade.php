<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Struk #{{ $order->invoice_number }} - {{ $order->tenant?->name ?? 'POS' }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: #0f172a;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .top-navbar {
            background: #1e293b;
            border-bottom: 1px solid #334155;
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
            position: sticky;
            top: 0;
            z-index: 50;
        }
        .top-navbar-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .top-navbar-badge {
            background: #0284c7;
            color: white;
            font-size: 0.7rem;
            font-weight: 800;
            padding: 0.2rem 0.5rem;
            border-radius: 0.375rem;
        }

        .workspace {
            flex: 1;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 1.5rem 1rem 3rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        @media (min-width: 860px) {
            .workspace {
                flex-direction: row;
                align-items: flex-start;
                gap: 2rem;
            }
        }

        .preview-stage {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        /* Thermal 58mm Paper Visual */
        .thermal-paper {
            width: 100%;
            max-width: 340px;
            background: #ffffff;
            color: #000000;
            font-family: 'JetBrains Mono', monospace;
            padding: 1.25rem 1rem 1.5rem 1rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            font-size: 11px;
            line-height: 1.45;
            position: relative;
        }
        .thermal-paper::after {
            content: "";
            position: absolute;
            bottom: -8px;
            left: 0;
            right: 0;
            height: 8px;
            background: radial-gradient(circle, transparent, transparent 4px, #ffffff 4px, #ffffff 5px, transparent 6px);
            background-size: 12px 12px;
        }

        .control-panel {
            width: 100%;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .control-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 1rem;
            padding: 1.25rem;
            color: white;
        }
        .card-header-title {
            font-size: 0.85rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            color: #cbd5e1;
        }

        .btn-action {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: 0.82rem;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
        }
        .btn-action:active { transform: scale(0.98); }

        .btn-ble {
            background: #0284c7;
            color: white;
        }
        .btn-ble:hover { background: #0369a1; }

        .btn-rawbt {
            background: #059669;
            color: white;
        }
        .btn-rawbt:hover { background: #047857; }

        .btn-browser {
            background: #d97706;
            color: white;
        }
        .btn-browser:hover { background: #b45309; }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.85rem;
            border-radius: 0.625rem;
            background: #334155;
            color: #f8fafc;
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 700;
            border: 1px solid #475569;
            transition: all 0.15s;
            cursor: pointer;
        }
        .btn-secondary:hover { background: #475569; }
        .btn-secondary.wa {
            background: #16a34a;
            border-color: #22c55e;
            color: white;
        }
        .btn-secondary.wa:hover { background: #15803d; }

        .btn-subgrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
        }

        /* Paper Dividers */
        .p-divider {
            border-bottom: 1px dashed #475569;
            margin: 0.5rem 0;
        }
        .p-divider-double {
            border-bottom: 2px dashed #0f172a;
            margin: 0.6rem 0;
        }

        /* Print Media Styling for 58mm / 80mm thermal paper */
        @media print {
            body {
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print, .top-navbar, .control-panel {
                display: none !important;
            }
            .workspace {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
            }
            .thermal-paper {
                box-shadow: none !important;
                border: none !important;
                width: 100% !important;
                max-width: 58mm !important;
                padding: 0 2mm !important;
                margin: 0 !important;
            }
            .thermal-paper::after {
                display: none !important;
            }
        }
    </style>
</head>
<body>

    <!-- Top Navigation Bar -->
    <header class="top-navbar no-print">
        <div class="top-navbar-title">
            <span class="material-symbols-outlined" style="color:#38bdf8;">receipt_long</span>
            <div>
                <div style="font-weight:800; font-size:0.875rem;">Struk #{{ $order->invoice_number }}</div>
                <div style="font-size:0.68rem; color:#94a3b8;">{{ $order->customer?->name ?? 'Pelanggan Umum' }} &bull; {{ $order->customer?->phone ?? '-' }}</div>
            </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <a href="{{ route('pos.terminal') }}" class="btn-secondary">
                <span class="material-symbols-outlined" style="font-size:16px;">point_of_sale</span>
                <span>Kasir POS</span>
            </a>
            <button type="button" onclick="window.print()" class="btn-secondary" style="background:#0284c7; border-color:#38bdf8; color:white;">
                <span class="material-symbols-outlined" style="font-size:16px;">print</span>
                <span>Cetak</span>
            </button>
        </div>
    </header>

    <main class="workspace">
        <!-- Left: Thermal Receipt 58mm Preview -->
        <section class="preview-stage">
            <div class="thermal-paper" id="receipt-paper">
                <div style="text-align:center; margin-bottom:0.5rem;">
                    <div style="font-size:13px; font-weight:800; letter-spacing:0.02em;">{{ strtoupper($order->tenant?->name ?? 'QLON CLOUD POS') }}</div>
                    <div style="font-size:11px; font-weight:700;">[ {{ $order->outlet?->name ?? 'Outlet Utama' }} ]</div>
                    @if($order->outlet?->address)
                        <div style="font-size:9.5px; color:#475569;">{{ $order->outlet->address }}</div>
                    @endif
                    @if($order->outlet?->phone)
                        <div style="font-size:9.5px; color:#475569;">Telp: {{ $order->outlet->phone }}</div>
                    @endif
                </div>

                <div class="p-divider-double"></div>

                <div style="font-size:10px; line-height:1.5;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>No. Nota:</span>
                        <span style="font-weight:700;">{{ $order->invoice_number }}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Waktu:</span>
                        <span>{{ $order->created_at ? $order->created_at->format('d/m/Y H:i') : date('d/m/Y H:i') }}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Kasir:</span>
                        <span>{{ $order->cashier?->name ?? 'Kasir' }}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Pelanggan:</span>
                        <span>{{ $order->customer?->name ?? 'Pelanggan Umum' }}</span>
                    </div>
                </div>

                <div class="p-divider"></div>

                <div style="margin: 0.4rem 0;">
                    @foreach($order->items as $item)
                        <div style="margin-bottom:0.35rem;">
                            <div style="font-weight:700;">{{ $item->product?->name ?? 'Produk' }}</div>
                            <div style="display:flex; justify-content:space-between; font-size:10px;">
                                <span>{{ $item->quantity }} x Rp {{ number_format((float) $item->unit_selling_price, 0, ',', '.') }}</span>
                                <span style="font-weight:600;">Rp {{ number_format((float) $item->subtotal, 0, ',', '.') }}</span>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="p-divider"></div>

                <div style="font-size:10px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>Subtotal:</span>
                        <span>Rp {{ number_format((float) $order->subtotal, 0, ',', '.') }}</span>
                    </div>

                    @if((float) $order->discount_amount > 0)
                        <div style="display:flex; justify-content:space-between; color:#b91c1c;">
                            <span>Diskon:</span>
                            <span>-Rp {{ number_format((float) $order->discount_amount, 0, ',', '.') }}</span>
                        </div>
                    @endif

                    @if((float) $order->tax_amount > 0)
                        <div style="display:flex; justify-content:space-between;">
                            <span>Pajak:</span>
                            <span>+Rp {{ number_format((float) $order->tax_amount, 0, ',', '.') }}</span>
                        </div>
                    @endif

                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; margin-top:0.25rem;">
                        <span>TOTAL:</span>
                        <span>Rp {{ number_format((float) $order->grand_total, 0, ',', '.') }}</span>
                    </div>

                    @if($order->cash_tendered !== null)
                        <div style="display:flex; justify-content:space-between; margin-top:0.15rem;">
                            <span>Tunai:</span>
                            <span>Rp {{ number_format((float) $order->cash_tendered, 0, ',', '.') }}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Kembalian:</span>
                            <span style="font-weight:700;">Rp {{ number_format((float) $order->change_amount, 0, ',', '.') }}</span>
                        </div>
                    @endif

                    <div style="display:flex; justify-content:space-between; margin-top:0.25rem;">
                        <span>Metode Bayar:</span>
                        <span style="font-weight:700;">{{ strtoupper($order->payment_method) }}</span>
                    </div>

                    @if($order->points_earned > 0)
                        <div style="display:flex; justify-content:space-between; color:#15803d; font-weight:700;">
                            <span>Poin CRM Loyalty:</span>
                            <span>+{{ $order->points_earned }} Poin</span>
                        </div>
                    @endif
                </div>

                <div class="p-divider-double"></div>

                <div style="text-align:center; font-size:9.5px; color:#475569; margin-top:0.5rem; line-height:1.4;">
                    <div style="font-weight:700; color:#0f172a;">Terima Kasih Atas Kunjungan Anda!</div>
                    <div>Simpan struk ini sebagai bukti pembayaran sah.</div>
                </div>
            </div>
        </section>

        <!-- Right: Print Action & Control Panel -->
        <aside class="control-panel no-print">
            <div class="control-card">
                <div class="card-header-title">
                    <span>Metode Cetak Cepat</span>
                    <span class="material-symbols-outlined" style="font-size:18px; color:#38bdf8;">print</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.6rem;">
                    {{-- 1. Web Bluetooth Direct --}}
                    <button type="button" class="btn-action btn-ble" onclick="printViaBluetooth()">
                        <span class="material-symbols-outlined" style="font-size:22px;">bluetooth</span>
                        <div style="text-align:left; flex:1;">
                            <div>Cetak Bluetooth (Thermal BLE)</div>
                            <div style="font-size:0.65rem; color:#bae6fd; font-weight:500;">Direct stream Web Bluetooth API (58mm/80mm)</div>
                        </div>
                    </button>

                    {{-- 2. RawBT Android App Integration --}}
                    <a href="intent:base64,{{ $escposBase64 }}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;" class="btn-action btn-rawbt">
                        <span class="material-symbols-outlined" style="font-size:22px;">smartphone</span>
                        <div style="text-align:left; flex:1;">
                            <div>Cetak via RawBT Android</div>
                            <div style="font-size:0.65rem; color:#a7f3d0; font-weight:500;">1-tap kirim ke aplikasi RawBT printer HP</div>
                        </div>
                    </a>

                    {{-- 3. System Print Dialog (Thermal 58mm Formatted) --}}
                    <button type="button" class="btn-action btn-browser" onclick="window.print()">
                        <span class="material-symbols-outlined" style="font-size:22px;">print</span>
                        <div style="text-align:left; flex:1;">
                            <div>Cetak Struk Browser (Driver)</div>
                            <div style="font-size:0.65rem; color:#fed7aa; font-weight:500;">Dialog print bawaan OS / Driver printer</div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Customer & WhatsApp Actions -->
            <div class="control-card">
                <div class="card-header-title">
                    <span>Aksi & WhatsApp</span>
                    <span class="material-symbols-outlined" style="font-size:18px; color:#22c55e;">chat</span>
                </div>

                <div class="btn-subgrid">
                    @if($order->customer?->phone)
                        <a href="{{ route('invoices.whatsapp', $order) }}" class="btn-secondary wa" target="_blank" style="grid-column: span 2; justify-content:center; padding:0.65rem;">
                            <span class="material-symbols-outlined" style="font-size:18px;">chat</span>
                            <span>Kirim WhatsApp Pelanggan</span>
                        </a>
                    @else
                        <a href="{{ route('invoices.whatsapp', ['order' => $order->id, 'phone' => '']) }}"
                           class="btn-secondary wa"
                           style="grid-column: span 2; justify-content:center; padding:0.65rem;"
                           onclick="event.preventDefault(); let p = prompt('Masukkan nomor WhatsApp pelanggan (contoh: 08123456789):'); if(p) window.open('{{ route('invoices.whatsapp', $order) }}?phone=' + encodeURIComponent(p), '_blank');">
                            <span class="material-symbols-outlined" style="font-size:18px;">chat</span>
                            <span>Kirim WhatsApp (Input No)</span>
                        </a>
                    @endif

                    <button type="button" class="btn-secondary" onclick="openSimulatorModal()">
                        <span class="material-symbols-outlined" style="font-size:16px;">terminal</span>
                        <span>Simulator Teks</span>
                    </button>

                    <a href="{{ route('pos.terminal') }}" class="btn-secondary">
                        <span class="material-symbols-outlined" style="font-size:16px;">point_of_sale</span>
                        <span>Kembali POS</span>
                    </a>
                </div>
            </div>
        </aside>
    </main>

    <!-- Simulator Modal for Virtual Testing -->
    <div id="simulator-modal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.8); backdrop-filter:blur(4px); z-index:10000; align-items:center; justify-content:center; padding:16px;" class="no-print">
        <div style="background:#fff; width:100%; max-width:540px; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; max-height:90vh; border:1px solid #cbd5e1;">
            <div style="background:#0f172a; color:#fff; padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:13px; font-weight:800;">Virtual Thermal Simulator (Plain Text Preview)</div>
                <button type="button" onclick="closeSimulatorModal()" style="background:none; border:none; color:#cbd5e1; cursor:pointer;">✕</button>
            </div>
            <div style="padding:16px; overflow-y:auto; background:#f8fafc;">
                <pre style="background:#000; color:#22c55e; padding:14px; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:11px; white-space:pre-wrap;">{{ $escposPlainText }}</pre>
            </div>
            <div style="padding:12px 16px; background:#f1f5f9; display:flex; justify-content:flex-end;">
                <button type="button" onclick="closeSimulatorModal()" class="btn-secondary" style="background:#0f172a; color:white;">Tutup</button>
            </div>
        </div>
    </div>

    <script>
        const RAW_ESCPOS_B64 = @js($escposBase64);

        function openSimulatorModal() {
            document.getElementById('simulator-modal').style.display = 'flex';
        }
        function closeSimulatorModal() {
            document.getElementById('simulator-modal').style.display = 'none';
        }

        async function printViaBluetooth() {
            if (!navigator.bluetooth) {
                alert('Browser Anda tidak mendukung Web Bluetooth API. Gunakan Chrome di Android/PC atau gunakan opsi Cetak via RawBT / Driver Browser.');
                return;
            }

            try {
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
                });

                if (!device.gatt) {
                    alert('Printer Bluetooth tidak memiliki antarmuka GATT yang kompatibel.');
                    return;
                }

                const server = await device.gatt.connect();
                // Send raw bytes decoded from base64
                const binaryString = atob(RAW_ESCPOS_B64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                alert('Tersambung ke printer Bluetooth: ' + (device.name || 'Printer'));
            } catch (err) {
                console.error(err);
                alert('Koneksi Bluetooth dibatalkan atau gagal: ' + err.message);
            }
        }
    </script>
</body>
</html>

