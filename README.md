# SaaS POS + CRM + Central Sales Monitoring

> **Multi-Tenant Point of Sale & Real-time Business Monitoring Platform for Indonesian SMEs (UMKM)**  
> Built with **Laravel 11**, **PostgreSQL**, **Tailwind CSS**, and **Laravel Reverb**.

---

## 📌 Project Overview
Platform SaaS terpadu yang menggabungkan:
1. **POS Kasir Cepat & Responsif**: Operasional kasir toko/outlet, multi-metode pembayaran, barcode scan, thermal printing.
2. **CRM & Member Retention**: Database pelanggan berbasis Nomor WhatsApp, loyalty points, histori transaksi, segmentasi RFM.
3. **Owner HQ Live Monitoring**: Dashboard real-time (WebSockets) untuk pemilik bisnis memantau penjualan multi-cabang tanpa refresh.
4. **Multi-Tenancy Engine**: Isolasi data per tenant menggunakan PostgreSQL row-level isolation dengan arsitektur single-database yang efisien dan terukur.

---

## 🛠 Tech Stack
- **Backend & Web:** Laravel 11 (PHP 8.2+)
- **Database:** PostgreSQL 16+
- **Real-time WebSockets:** Laravel Reverb
- **Frontend / UI:** Inertia.js (Vue 3 / React) + Tailwind CSS + Lucide Icons
- **Queue & Cache:** Redis
- **Auth & Permissions:** Laravel Breeze / Fortify + Spatie Laravel-Permission

---

## 📁 Repository Structure
```
pos-crm-saas/
├── docs/                      # PRD, PSD, dan PDF Perencanaan Proyek
│   ├── PRD_PSD_PLANNING_DOCUMENT.md
│   └── POS_CRM_SaaS_PRD_PSD_Planning.pdf
├── app/                       # Application Core Logic
│   ├── Models/                # Tenant, User, Outlet, Product, Order, Customer, etc.
│   ├── Scopes/                # TenantScope for PostgreSQL data isolation
│   └── Events/                # OrderCreated, LiveSalesUpdated (Broadcast)
├── database/
│   └── migrations/            # PostgreSQL Schema Migrations
└── routes/                    # API & Web routes
```

---

## 🚀 Getting Started (Day 1 Kickoff)
1. **Clone & Setup:**
   ```bash
   git clone <repo-url>
   cd pos-crm-saas
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. **Database Config (`.env`):**
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=pos_saas_db
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```
3. **Migrate & Seed:**
   ```bash
   php artisan migrate
   ```

---

## 📄 Documentation
Dokumen perencanaan lengkap (PRD & PSD) tersedia di folder `docs/`:
- [PRD & PSD Planning Document (Markdown)](docs/PRD_PSD_PLANNING_DOCUMENT.md)
- [PRD & PSD Planning Document (PDF)](docs/POS_CRM_SaaS_PRD_PSD_Planning.pdf)
