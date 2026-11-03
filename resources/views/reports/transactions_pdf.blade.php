<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buku Besar Transaksi Penjualan - {{ $tenant->name }}</title>
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
        <div><strong>Buku Besar Transaksi Kasir Siap Cetak / Simpan PDF</strong></div>
        <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
    </div>

    <div class="header">
        <div>
            <h1>{{ $tenant->name }}</h1>
            <p>Buku Catatan Transaksi & Mutasi Kasir Kas Resmi</p>
            <p>Tanggal Cetak: {{ now()->format('d M Y, H:i') }} | Total Transaksi: {{ $orders->count() }} Data</p>
        </div>
        <div class="badge">
            Dicetak oleh: {{ $userName }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No Invoice</th>
                <th>Tanggal & Jam</th>
                <th>Cabang</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Metode Bayar</th>
                <th>Status</th>
                <th class="text-right">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotalSum = 0; @endphp
            @forelse($orders as $order)
                @php $grandTotalSum += (float) $order->grand_total; @endphp
                <tr>
                    <td><strong>{{ $order->invoice_number }}</strong></td>
                    <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $order->outlet?->name ?? 'Cabang Utama' }}</td>
                    <td>{{ $order->cashier?->name ?? 'Kasir' }}</td>
                    <td>{{ $order->customer?->name ?? 'Pelanggan Toko' }}</td>
                    <td>{{ strtoupper($order->payment_method) }}</td>
                    <td><span style="font-size: 11px; padding: 2px 6px; background: #e2e8f0; border-radius: 4px;">{{ strtoupper($order->payment_status) }}</span></td>
                    <td class="text-right"><strong>Rp {{ number_format($order->grand_total, 0, ',', '.') }}</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Tidak ada riwayat transaksi ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="7">TOTAL SELURUH TRANSAKSI</td>
                <td class="text-right">Rp {{ number_format($grandTotalSum, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>

