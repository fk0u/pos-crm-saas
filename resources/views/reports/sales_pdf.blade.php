<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Resmi Penjualan & Pajak - {{ $tenant->name }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            font-size: 13px;
            background: #fff;
        }
        .header {
            border-bottom: 2px solid #0f2b5c;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .header h1 {
            color: #0f2b5c;
            margin: 0 0 6px 0;
            font-size: 22px;
            font-weight: 700;
        }
        .header p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
        }
        .badge {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            text-align: right;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            border-radius: 8px;
        }
        .metric-card .title {
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .metric-card .value {
            color: #0f2b5c;
            font-size: 16px;
            font-weight: 700;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 2px solid #cbd5e1;
            font-size: 12px;
        }
        td {
            padding: 9px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
        }
        .text-right {
            text-align: right;
        }
        .total-row td {
            font-weight: 700;
            background: #f8fafc;
            border-top: 2px solid #94a3b8;
        }
        .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .signature-box {
            text-align: center;
            width: 200px;
        }
        .signature-line {
            border-top: 1px solid #94a3b8;
            margin-top: 60px;
            padding-top: 6px;
            font-weight: 600;
        }
        .no-print-bar {
            background: #0f2b5c;
            color: #fff;
            padding: 12px 24px;
            margin: -24px -24px 24px -24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn-print {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
        }
        @media print {
            .no-print-bar {
                display: none !important;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-bar">
        <div><strong>Dokumen Laporan Resmi Siap Cetak / Simpan PDF</strong> (Gunakan menu cetak browser atau Ctrl+P / Cmd+P)</div>
        <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
    </div>

    <div class="header">
        <div>
            <h1>{{ $tenant->name }}</h1>
            <p>Laporan Resmi Penjualan, Penerimaan Kas & Rekapitulasi Pajak PB1</p>
            <p>Periode: <strong>{{ $periodLabel }}</strong> | Tanggal Cetak: {{ now()->format('d M Y, H:i') }}</p>
        </div>
        <div class="badge">
            Status: RESMI & FINAL<br>
            Dicetak oleh: {{ $userName }}
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="title">Total Penjualan Kotor</div>
            <div class="value">Rp {{ number_format($summary['gross_sales'], 0, ',', '.') }}</div>
        </div>
        <div class="metric-card">
            <div class="title">Total Diskon Diberikan</div>
            <div class="value">Rp {{ number_format($summary['total_discounts'], 0, ',', '.') }}</div>
        </div>
        <div class="metric-card">
            <div class="title">Total Pajak PB1 Terkumpul</div>
            <div class="value">Rp {{ number_format($summary['total_tax'], 0, ',', '.') }}</div>
        </div>
        <div class="metric-card">
            <div class="title">Total Transaksi Selesai</div>
            <div class="value">{{ number_format($summary['total_orders']) }} Pesanan</div>
        </div>
    </div>

    <h3 style="color: #0f2b5c; margin-bottom: 12px; font-size: 14px;">Rincian Transaksi Penjualan</h3>
    <table>
        <thead>
            <tr>
                <th>No Invoice</th>
                <th>Tanggal & Jam</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Metode Bayar</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Diskon</th>
                <th class="text-right">Pajak</th>
                <th class="text-right">Total Akhir</th>
            </tr>
        </thead>
        <tbody>
            @forelse($orders as $order)
                <tr>
                    <td><strong>{{ $order->invoice_number }}</strong></td>
                    <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $order->cashier?->name ?? 'Kasir' }}</td>
                    <td>{{ $order->customer?->name ?? 'Umum' }}</td>
                    <td>{{ strtoupper($order->payment_method) }}</td>
                    <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($order->discount_amount, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($order->tax_amount, 0, ',', '.') }}</td>
                    <td class="text-right"><strong>Rp {{ number_format($order->grand_total, 0, ',', '.') }}</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" style="text-align: center; color: #64748b; padding: 20px;">Tidak ada transaksi pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="5">RINGKASAN TOTAL PENJUALAN</td>
                <td class="text-right">Rp {{ number_format($summary['total_subtotal'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($summary['total_discounts'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($summary['total_tax'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($summary['gross_sales'], 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <div class="signature-box">
            <div>Dibuat oleh,</div>
            <div class="signature-line">{{ $userName }}<br><small style="color:#64748b;">Kasir / Bagian Operasional</small></div>
        </div>
        <div class="signature-box">
            <div>Disetujui oleh,</div>
            <div class="signature-line">Pemilik Usaha / Manajemen<br><small style="color:#64748b;">{{ $tenant->name }}</small></div>
        </div>
    </div>
</body>
</html>

