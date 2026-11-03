<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Berita Acara Shift #{{ substr($shift->id, 0, 8) }} - {{ $shift->tenant?->name ?? 'QLon POS' }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            min-height: 100vh;
            padding: 24px 16px;
        }

        .no-print {
            max-width: 680px;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 12px;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.15s ease;
        }
        .btn-primary { background: #0f2b5c; color: #ffffff; }
        .btn-primary:hover { background: #163a75; }
        .btn-secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
        .btn-secondary:hover { background: #f8fafc; }

        .report-card {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            padding: 36px 32px;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
        }

        .header {
            text-align: center;
            border-bottom: 2px dashed #cbd5e1;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 900;
            color: #0f2b5c;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }
        .header p {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }
        .header .doc-type {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 12px;
            background: #e0f2fe;
            color: #0369a1;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .meta-grid {
            display: grid;
            grid-cols: 2;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
            font-size: 12px;
            background: #f8fafc;
            border-radius: 14px;
            padding: 16px;
            border: 1px solid #f1f5f9;
        }
        .meta-item { display: flex; flex-direction: column; }
        .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
        .meta-val { font-weight: 700; color: #1e293b; margin-top: 2px; }

        .money-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 24px;
        }
        .money-table th {
            text-align: left;
            padding: 10px 12px;
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            color: #475569;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .money-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .money-table .amount {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
        }
        .money-table tr.highlight {
            background: #f8fafc;
            font-weight: 800;
        }
        .money-table tr.total-row {
            border-top: 2px solid #0f2b5c;
            border-bottom: 2px solid #0f2b5c;
            font-size: 14px;
            font-weight: 900;
            color: #0f2b5c;
        }

        .badge-status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .badge-pass { background: #dcfce7; color: #15803d; }
        .badge-over { background: #dbeafe; color: #1d4ed8; }
        .badge-short { background: #ffe4e6; color: #be123c; }

        .section-title {
            font-size: 12px;
            font-weight: 800;
            color: #0f2b5c;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 20px 0 10px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .movements-list {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 28px;
        }
        .movements-list th {
            text-align: left;
            padding: 8px 10px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
        }
        .movements-list td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
        }

        .signatures {
            margin-top: 36px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            text-align: center;
            page-break-inside: avoid;
        }
        .sig-box {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 110px;
        }
        .sig-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .sig-line { border-bottom: 1px solid #94a3b8; margin: 0 24px; padding-bottom: 4px; font-weight: 800; font-size: 12px; color: #1e293b; }

        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }

        @media print {
            body { background: #ffffff; padding: 0; }
            .no-print { display: none !important; }
            .report-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
        }
    </style>
</head>
<body>

    <div class="no-print">
        <a href="/cashflow" class="btn btn-secondary">
            &larr; Kembali ke Arus Kas
        </a>
        <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">
                Cetak / Simpan PDF
            </button>
        </div>
    </div>

    <div class="report-card">
        <div class="header">
            <h1>{{ $shift->tenant?->name ?? 'QLon POS System' }}</h1>
            <p>{{ $shift->outlet?->name ?? 'Outlet Utama' }} - {{ $shift->outlet?->address ?? 'Pusat Operasional' }}</p>
            <span class="doc-type">Berita Acara Rekonsiliasi Kasir &amp; Laci (Z-Report)</span>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <span class="meta-label">Nomor ID Shift</span>
                <span class="meta-val" style="font-family: monospace;">{{ $shift->id }}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Status Shift</span>
                <span class="meta-val">
                    @if($shift->status === 'closed')
                        <span class="badge-status badge-pass">Tutup (Selesai)</span>
                    @else
                        <span class="badge-status badge-over">Sedang Berjalan (Open)</span>
                    @endif
                </span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Kasir Bertugas</span>
                <span class="meta-val">{{ $shift->user?->name ?? 'Kasir Umum' }}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Disetujui / Diterima Oleh</span>
                <span class="meta-val">{{ $shift->approver?->name ?? 'Owner / Supervisor' }}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Waktu Buka Shift</span>
                <span class="meta-val">{{ $shift->opened_at ? $shift->opened_at->format('d/m/Y H:i:s') : '-' }}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Waktu Tutup Shift</span>
                <span class="meta-val">{{ $shift->closed_at ? $shift->closed_at->format('d/m/Y H:i:s') : 'Masih Berjalan' }}</span>
            </div>
        </div>

        <div class="section-title">
            <span>Rekapitulasi Arus Kas Laci</span>
            <span style="font-size: 11px; font-weight: normal; color: #64748b;">Mata Uang: IDR (Rp)</span>
        </div>

        <table class="money-table">
            <thead>
                <tr>
                    <th>Komponen Kasir</th>
                    <th style="text-align: right;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Modal Awal Uang Kembalian (Starting Float)</td>
                    <td class="amount">Rp {{ number_format((float)$shift->starting_cash, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Penjualan Tunai (Cash Sales)</td>
                    <td class="amount" style="color: #16a34a;">+ Rp {{ number_format((float)$shift->cash_sales_total, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Kas Masuk Laci (Topup / Refund Masuk)</td>
                    <td class="amount" style="color: #0284c7;">+ Rp {{ number_format((float)$shift->cash_in_total, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Pengeluaran Kas (Petty Cash Operasional Toko)</td>
                    <td class="amount" style="color: #e11d48;">- Rp {{ number_format((float)$shift->cash_out_total, 0, ',', '.') }}</td>
                </tr>
                <tr class="highlight total-row">
                    <td>Estimasi Saldo Kas Fisik (Expected Ending Cash)</td>
                    <td class="amount">Rp {{ number_format((float)$shift->expected_ending_cash, 0, ',', '.') }}</td>
                </tr>
                @if($shift->status === 'closed')
                <tr>
                    <td><strong>Kas Fisik Riil Hasil Hitung (Actual Count)</strong></td>
                    <td class="amount" style="font-size: 14px;"><strong>Rp {{ number_format((float)$shift->actual_ending_cash, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td>
                        <strong>Status Selisih Kas (Discrepancy)</strong><br>
                        <small style="color: #64748b;">Perbedaan antara fisik laci dan kalkulasi sistem</small>
                    </td>
                    <td class="amount">
                        @php $diff = (float)($shift->difference ?? 0); @endphp
                        @if(abs($diff) < 0.01)
                            <span class="badge-status badge-pass">SEIMBANG (Rp 0)</span>
                        @elseif($diff > 0)
                            <span class="badge-status badge-over">+ Rp {{ number_format($diff, 0, ',', '.') }} (LEBIH)</span>
                        @else
                            <span class="badge-status badge-short">- Rp {{ number_format(abs($diff), 0, ',', '.') }} (KURANG)</span>
                        @endif
                    </td>
                </tr>
                @endif
                <tr style="background: #fafafa;">
                    <td style="color: #64748b;">Informasi Tambahan: Penjualan Non-Tunai (QRIS / EDC)</td>
                    <td class="amount" style="color: #64748b;">Rp {{ number_format((float)$shift->non_cash_sales_total, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        @if($shift->notes)
        <div style="margin-bottom: 24px; padding: 12px 16px; background: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 12px; color: #713f12;">
            <strong>Catatan Petugas:</strong> {{ $shift->notes }}
        </div>
        @endif

        @if($shift->movements && $shift->movements->count() > 0)
        <div class="section-title">
            <span>Rincian Pengeluaran &amp; Mutasi Kas Laci (Petty Cash Log)</span>
            <span style="font-size: 11px; font-weight: normal; color: #64748b;">{{ $shift->movements->count() }} Transaksi</span>
        </div>

        <table class="movements-list">
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th>Keperluan / Alasan</th>
                    <th style="text-align: right;">Nominal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($shift->movements as $m)
                <tr>
                    <td style="font-family: monospace; font-size: 11px;">{{ $m->created_at->format('H:i') }}</td>
                    <td>
                        @if($m->type === 'cash_in')
                            <span style="color: #16a34a; font-weight: 700;">[+] Kas Masuk</span>
                        @else
                            <span style="color: #e11d48; font-weight: 700;">[-] Kas Keluar</span>
                        @endif
                    </td>
                    <td>{{ $m->reason }}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700;">
                        Rp {{ number_format((float)$m->amount, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="signatures">
            <div class="sig-box">
                <span class="sig-title">Diserahkan Oleh (Kasir)</span>
                <span class="sig-line">{{ $shift->user?->name ?? 'Kasir' }}</span>
            </div>
            <div class="sig-box">
                <span class="sig-title">Diterima &amp; Diverifikasi Oleh</span>
                <span class="sig-line">{{ $shift->approver?->name ?? 'Supervisor / Owner' }}</span>
            </div>
        </div>

        <div class="footer">
            Dokumen Berita Acara Rekonsiliasi Kasir dicetak secara otomatis dari Platform QLon SaaS POS &bull; Timestamp: {{ now()->format('d/m/Y H:i:s') }}
        </div>
    </div>

</body>
</html>

