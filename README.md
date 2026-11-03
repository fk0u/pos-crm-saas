# QLon - SaaS POS + CRM + Central Sales Monitoring

> **Multi-Tenant Point of Sale & Real-time Business Monitoring Platform for Indonesian SMEs (UMKM)**  
> Built with **Laravel 13**, **PHP 8.5+**, **Inertia.js (Vue 3)**, **Tailwind CSS v4**, and **Action-Domain Modular Clean Architecture**.

---

## Project Overview
Platform SaaS terpadu generasi baru yang menggabungkan:
1. **POS Kasir Cepat & Responsif**: Operasional kasir berbasis Inertia.js + Vue 3, multi-metode pembayaran (Tunai dengan kalkulator uang pas & kembalian, QRIS dinamis, Debit EDC, Split bill), barcode scan auto-reader, pencetakan struk thermal, dan pengiriman e-struk WhatsApp instan.
2. **Shift & Cash Drawer Control (X/Z Reports)**: Kontrol laci kasir, modal awal kasir (cash float), pencatatan pergerakan kas masuk/keluar (*petty cash*), blind cash count closing, kalkulasi otomatis selisih kas (*over/short*), dan otorisasi supervisor.
3. **Frictionless CRM & Member Retention**: Database pelanggan WhatsApp-first, akumulasi poin otomatis (1 poin per Rp 10.000 belanja), penukaran poin langsung di kasir (1 poin = Rp 100), segmentasi tiering RFM (*Silver, Gold, Platinum*).
4. **Owner HQ Live Monitoring & Profit Tracking**: Dashboard real-time untuk pemilik bisnis memantau omzet live, perbandingan performa multi-cabang, kalkulasi Laba Kotor (Gross Profit) dan Margin % terhadap HPP/COGS, top 10 best-seller, dan audit log supervisor tanpa refresh halaman.
5. **Multi-Tenancy & Security Architecture**: Isolasi data per tenant menggunakan PostgreSQL row-level isolation via `TenantScope` otomatis, serta audit log permanen untuk void, refund, diskon abnormal, dan selisih kas.

---

## Tech Stack
- **Backend Framework:** Laravel 13 (`laravel/framework: ^13.39`) on **PHP 8.5+**
- **Architecture Pattern:** Action-Domain Pattern / Modular Clean Architecture (`app/Domain/Pos`, `app/Domain/Crm`, `app/Domain/Shift`, `app/Domain/Audit`)
- **Frontend / UI:** Inertia.js Vue 3 SPA + Tailwind CSS v4 + Lucide Icons + Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*)
- **Database:** PostgreSQL 16+ & SQLite (Dual-driver support)
- **Real-time WebSockets:** Laravel Reverb (dengan live polling fallback 10s)
- **Testing & Quality:** PHPUnit 12 (100% Passing test suite) & Laravel Pint PSR-12 code styling

---

## Modular Clean Architecture (`app/Domain/`)
Sistem telah dipisahkan menjadi domain actions dan DTOs yang terstruktur rapi:
```
app/
├── Domain/
│   ├── Audit/
│   │   └── Actions/RecordAuditLogAction.php
│   ├── Crm/
│   │   ├── Actions/DetermineCustomerTierAction.php
│   │   ├── Actions/LookupCustomerAction.php
│   │   └── DTOs/CustomerData.php
│   ├── Pos/
│   │   ├── Actions/ProcessCheckoutAction.php
│   │   ├── DTOs/CartItemData.php
│   │   └── DTOs/CheckoutData.php
│   └── Shift/
│       ├── Actions/CloseShiftAction.php
│       ├── Actions/OpenShiftAction.php
│       └── Actions/RecordCashMovementAction.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/ (PosController, CustomerController, OwnerDashboardController)
│   │   └── Web/ (LoginController, PosTerminalController, DashboardController)
│   └── Middleware/ (SetTenantContext, HandleInertiaRequests)
└── Services/
    └── SalesMetricsService.php
```

---

## Quick Start (Setup & Jalankan)

1. **Install Dependency & Migrasi:**
```bash
composer install
npm install
touch database/database.sqlite
php artisan migrate:fresh --seed --force
npm run build
```

2. **Jalankan Development Server:**
```bash
php artisan serve
```
Kunjungi: `http://localhost:8000`

---

## Akun Demo (Bawaan Seeder)
* **Owner (Pemilik Toko)**: `owner@kopikawan.com` / `password123`  
  *(Akses penuh Owner HQ Live Dashboard, analitik finansial, laba kotor HPP, audit log)*
* **Kasir (Outlet Samarinda)**: `kasir@kopikawan.com` / `password123`  
  *(Akses terminal kasir cepat, buka/tutup shift, transaksi pembayaran)*

---

## API Endpoints (v1)
Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/pos/products` | Katalog produk aktif kasir (search by name, SKU, barcode) |
| `POST` | `/pos/checkout` | Transaksi penjualan, lock stok pesimistik, kalkulasi poin CRM & shift |
| `GET` | `/pos/shift/active` | Cek status shift aktif kasir yang sedang login |
| `POST` | `/pos/shift/open` | Buka shift kasir baru dengan modal awal laci (*cash float*) |
| `POST` | `/pos/shift/close` | Tutup shift kasir, blind count uang fisik, kalkulasi selisih kas X/Z |
| `POST` | `/pos/shift/movement` | Catat pergerakan kas laci (*cash_in* / *cash_out*) |
| `GET` | `/crm/customer/lookup?phone={no_wa}` | Lookup data member, status tier (*Silver/Gold/Platinum*), dan saldo poin WA |
| `GET` | `/owner/live-metrics` | Live metrics omzet, gross profit, margin %, komparasi cabang, dan order feed |

---

## Core Team & Co-Authors
Lihat detail alur kerja dan distribusi peran di [`TEAM.md`](TEAM.md).
