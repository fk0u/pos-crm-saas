# SaaS POS + CRM + Central Sales Monitoring

> **Multi-Tenant Point of Sale & Real-time Business Monitoring Platform for Indonesian SMEs (UMKM)**  
> Built with **Laravel 11**, **PostgreSQL**, **Tailwind CSS**, and **Laravel Reverb**.

---

## 📌 Project Overview
Platform SaaS terpadu yang menggabungkan:
1. **POS Kasir Cepat & Responsif**: Operasional kasir toko/outlet, multi-metode pembayaran, barcode scan, thermal printing.
2. **CRM & Member Retention**: Database pelanggan berbasis Nomor WhatsApp, loyalty points, histori transaksi, segmentasi pelanggan.
3. **Owner HQ Live Monitoring**: Dashboard real-time (WebSockets) untuk pemilik bisnis memantau penjualan multi-cabang tanpa refresh.
4. **Multi-Tenancy Engine**: Isolasi data per tenant menggunakan PostgreSQL row-level isolation via `TenantScope` otomatis.

---

## 🛠 Tech Stack
- **Backend & Web:** Laravel 11 (PHP 8.2+)
- **Database:** PostgreSQL 16+
- **Real-time WebSockets:** Laravel Reverb
- **Frontend / UI:** Inertia.js (Vue 3 / React) + Tailwind CSS + Lucide Icons
- **Queue & Cache:** Redis
- **Auth & Permissions:** Laravel Fortify / Breeze + Spatie Permission

---

## ⚡ Quick Start (Otomatisasi Starter Project)
Cukup jalankan script otomatisasi setup satu baris:
```bash
./setup.sh
```
Script di atas otomatis melakukan:
1. Pengecekan runtime PHP & Composer.
2. Generate file `.env` dengan konfigurasi PostgreSQL `pos_saas_db`.
3. Instalasi seluruh dependency PHP via Composer.
4. Generate application key (`APP_KEY`).
5. Eksekusi database migration & seeder demo akun.

---

## 🔑 Akun Demo (Bawaan Seeder)
* **Owner (Pemilik Toko)**: `owner@kopikawan.com` / `password123`
* **Kasir (Outlet Samarinda)**: `kasir@kopikawan.com` / `password123`

---

## 📡 Starter API Endpoints
Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/pos/products` | Katalog produk aktif kasir (search by name, SKU, barcode) |
| `POST` | `/pos/checkout` | Transaksi penjualan, auto-deduct stok, auto-kalkulasi CRM poin |
| `GET` | `/crm/customer/lookup?phone={no_wa}` | Lookup data member & poin loyalitas pelanggan via WhatsApp |
| `GET` | `/owner/live-metrics` | Live sales ticker omzet hari ini, AOV, dan komparasi cabang |

---

## 👥 Core Team & Co-Authors
Lihat detail alur kerja dan distribusi peran di [`TEAM.md`](TEAM.md).
