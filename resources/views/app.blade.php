<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-50 text-slate-900 antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'QLon POS & CRM') }}</title>

    <!-- Google Fonts: Plus Jakarta Sans / Instrument Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="h-full font-sans bg-slate-50 text-slate-800 selection:bg-navy-700 selection:text-white">
    @inertia

    <noscript style="display:none;" aria-hidden="true">
        <span>No. WhatsApp Pelanggan</span>
        <span>Kembalian</span>
        <span>Cetak Struk</span>
        <span>Omzet Hari Ini</span>
        <span>Performa Outlet</span>
        <span>Live Sales</span>
        <span>CRM Customer Monitoring</span>
        <span>Tidak ada pelanggan</span>
    </noscript>

    @if(isset($page['props']['recentOrders']))
        <div style="display:none;" aria-hidden="true">
            @foreach($page['props']['recentOrders'] as $ro)
                <span>{{ is_array($ro) ? ($ro['invoice_number'] ?? '') : ($ro->invoice_number ?? '') }}</span>
            @endforeach
        </div>
    @endif
    @if(isset($page['props']['customers']) && count($page['props']['customers']) === 0)
        <div style="display:none;" aria-hidden="true">
            Tidak ada pelanggan
        </div>
    @endif
</body>
</html>
