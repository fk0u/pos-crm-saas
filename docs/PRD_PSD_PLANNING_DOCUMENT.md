# DOKUMEN PERENCANAAN SISTEM: PRD & PSD
# Multi-Tenant SaaS POS + CRM + Central Sales Monitoring
**Target Platform:** UMKM Indonesia (Retail & F&B)  
**Tech Stack:** Laravel 11, PostgreSQL, Laravel Reverb, Inertia.js / Tailwind CSS  
**Versi:** 1.0 (Production Blueprint)  
**Penyusun:** Tim Arsitektur & Perencanaan Sistem (Bevy CTO & Sekretaris)  
**Status:** Approved for Implementation  

---

## DAFTAR ISI
1. [BAGIAN I: PRODUCT REQUIREMENT DOCUMENT (PRD)](#bagian-i-product-requirement-document-prd)
   - 1.1 Latar Belakang & Pernyataan Masalah
   - 1.2 Tujuan Produk & Target Pengguna (User Persona)
   - 1.3 Ruang Lingkup Produk (In-Scope vs Out-of-Scope)
   - 1.4 Spesifikasi Fitur Fungsional
   - 1.5 Kebutuhan Non-Fungsional & Metrik Keberhasilan
2. [BAGIAN II: PRODUCT SPECIFICATION DOCUMENT (PSD)](#bagian-ii-product-specification-document-psd)
   - 2.1 Arsitektur Sistem & Komponen
   - 2.2 Strategi Multi-Tenancy & Isolasi Data (PostgreSQL)
   - 2.3 Skema Database Lengkap (Data Dictionary & DDL)
   - 2.4 Arsitektur Real-time Monitoring (Laravel Reverb)
   - 2.5 Spesifikasi API & Kontrak Data
   - 2.6 Integrasi Hardware & Cetak Struk (ESC/POS)
   - 2.7 Matriks Hak Akses (Role-Based Access Control)
3. [BAGIAN III: SPRINT ROADMAP & KICKOFF BESOK PAGI](#bagian-iii-sprint-roadmap--kickoff-besok-pagi)
   - 3.1 Timeline 14 Hari (Sprint 1 - 4)
   - 3.2 Action Item Kickoff Jam 09.00

---

# BAGIAN I: PRODUCT REQUIREMENT DOCUMENT (PRD)

### 1.1 Latar Belakang & Pernyataan Masalah
Banyak pelaku UMKM Indonesia (khususnya kedai F&B dan toko retail mandiri) memiliki masalah operasional mendasar:
1. **Pencatatan Transaksi Manual / Tersebar:** Kasir masih menggunakan pembukuan manual atau aplikasi offline yang tidak terhubung antar-cabang.
2. **Ketiadaan Data Pelanggan (CRM Nol):** Pemilik toko tidak tahu siapa pelanggan setia mereka, berapa rata-rata belanja (AOV), dan kapan terakhir mereka berkunjung.
3. **Owner Buta Data Penjualan (Blind Monitoring):** Pemilik bisnis harus menunggu kasir mengirimkan rekap WhatsApp setiap malam atau akhir shift, rentan kecurangan (fraud), dan lambat dalam mengambil keputusan stok/promo.

**Solusi Produk:**  
Platform SaaS terpadu berbasis cloud yang menyediakan terminal kasir cepat (Point of Sale), pencatatan loyalitas pelanggan berbasis Nomor WhatsApp (CRM), dan dashboard pantauan langsung (Real-Time Central Monitoring) untuk pemilik usaha dari smartphone atau laptop mereka.

---

### 1.2 Tujuan Produk & Target Pengguna (User Persona)

| Persona | Peran | Kebutuhan Utama | Rasa Sakit Saat Ini |
| :--- | :--- | :--- | :--- |
| **Kasir (Cashier)** | Operasional terminal kasir di outlet | Input order super cepat, hitung diskon/pajak otomatis, cetak struk thermal, input no WA pelanggan dalam < 5 detik. | Aplikasi lemot, alur transaksi ribet, antrean panjang saat jam sibuk. |
| **Kepala Outlet (Manager)** | Supervisi operasional outlet | Kelola stok barang, buka/tutup kasir (shift reconciliation), rekap harian per cabang. | Selisih kas fisik vs sistem, stok minus tidak terpantau. |
| **Pemilik Usaha (Business Owner)** | Manajemen bisnis & finansial | Live monitoring omzet semua cabang detik demi detik, laporan laba kotor, broadcast promo ke member CRM. | Harus nagih rekap manual tiap malam, tidak ada data analitik tren penjualan. |
| **SaaS SuperAdmin** | Pengelola platform | Manajemen tenant (onboarding, suspend, paket langganan), pemantauan kesehatan sistem dan beban transaksi. | Pengelolaan tenant manual dan rawan salah konfigurasi. |

---

### 1.3 Ruang Lingkup Produk (In-Scope vs Out-of-Scope)

#### In-Scope (MVP - Rilis 14 Hari):
- **Multi-Tenancy:** 1 Database PostgreSQL dengan pemisahan `tenant_id` otomatis di setiap query.
- **Terminal POS:** Barcode scanner ready, pencarian produk instan, kalkulasi diskon/pajak, multi-payment (Cash, QRIS, Transfer), cetak struk ESC/POS Bluetooth/USB.
- **CRM Engine:** Perekaman data member via No WA, kalkulasi poin belanja otomatis, riwayat transaksi per pelanggan, segmentasi pelanggan (Aktif, Loyal, Pasif).
- **Owner Live Dashboard:** WebSocket push omzet harian real-time, grafik tren penjualan 7 hari, komparasi omzet antar-outlet, tabel top 5 produk.
- **Shift & Cash Register:** Pencatatan kas masuk modal awal, kas keluar biaya operasional, rekonsiliasi akhir shift.

#### Out-of-Scope (Fase Pasca-MVP):
- Integrasi payment gateway dinamis otomatis (Midtrans/Xendit) — di MVP menggunakan verifikasi QRIS statis / manual upload.
- Manajemen resep/BOM (Bill of Materials) bahan mentah F&B kompleks.
- Pengiriman WhatsApp API resmi terintegrasi (Meta Business Cloud API) — di MVP menggunakan deep link WhatsApp web/app.

---

### 1.4 Spesifikasi Fitur Fungsional

#### Modul 1: Terminal Kasir (POS)
1. **Catalog & Cart System:**
   - Grid katalog produk dengan pencarian instan (nama/SKU) dan filter kategori.
   - Penambahan item ke keranjang belanja dengan 1-klik/tap.
   - Dukungan varian produk (ukuran, rasa, opsi) dan catatan khusus per item.
2. **Checkout & Payment:**
   - Ringkasan pesanan: Subtotal, Diskon (persen/nominal), Pajak (PPN opsional), dan Grand Total.
   - Pilihan metode bayar: Tunai (tombol uang pas dan kalkulator kembalian instan), QRIS Statis, Transfer Bank.
   - Validasi transaksi atomic: nomor invoice terbit unik per tenant (`INV/YYYYMMDD/OUTLET/XXXX`).
3. **Struk & Receipt:**
   - Print struk langsung ke thermal printer (58mm / 80mm).
   - Opsi kirim ringkasan nota langsung ke WhatsApp pelanggan.

#### Modul 2: CRM & Customer Loyalty
1. **Perekaman Pelanggan Cepat:**
   - Input nomor HP/WA pelanggan saat transaksi (opsional, tidak memblokir antrean).
   - Auto-detect jika pelanggan sudah terdaftar; sistem menampilkan nama, tier, dan sisa poin.
2. **Sistem Poin & Reward:**
   - Konfigurasi rasio poin per nominal belanja (misal: tiap Rp 10.000 = 1 Poin).
   - Redeem poin menjadi potongan belanja saat checkout.
3. **Analitik CRM Sederhana:**
   - Customer Lifetime Value (LTV) dan frekuensi belanja (visit count).
   - Segmentasi: Active (belanja dalam 14 hari terakhir), Slipping (15-30 hari), Inactive (> 30 hari).

#### Modul 3: Owner & HQ Live Monitoring
1. **Real-time Live Sales Ticker:**
   - Widget metrik: Total Omzet Hari Ini, Jumlah Transaksi, Nilai Rata-rata Keranjang (AOV).
   - Notifikasi websocket setiap kali ada kasir yang menyelesaikan transaksi di cabang mana pun.
2. **Multi-Outlet Benchmarking:**
   - Grafik perbandingan performa penjualan antar-cabang.
3. **Laporan & Export:**
   - Laporan laba/rugi kotor (Gross Profit = Total Omzet - Total HPP).
   - Export rekap laporan ke format Excel (.xlsx) dan PDF.

---

# BAGIAN II: PRODUCT SPECIFICATION DOCUMENT (PSD)

### 2.1 Arsitektur Sistem & Komponen
Sistem dibangun menggunakan arsitektur **Modular Monolith** berbasis Laravel 11 untuk memaksimalkan kecepatan rilis dan kemudahan *maintenance* solo developer:

```
                  +----------------------------------------------+
                  |         Client Devices (Tablet / PC / Mobile)|
                  +----------------------------------------------+
                                         |
                       HTTPS (Inertia/SPA) | WebSockets (WSS)
                                         v
+---------------------------------------------------------------------------------+
|                                 LARAVEL 11 APP                                 |
|                                                                                 |
|  [ Middleware: TenantScope, Auth, RoleCheck, SubscriptionActive ]               |
|                                                                                 |
|  +--------------------+   +---------------------+   +------------------------+  |
|  |     POS Engine     |   |      CRM Engine     |   |   Live Monitor Engine  |  |
|  |  (Cart/Checkout/   |   | (Points, Loyalty,   |   |   (Reverb Event        |  |
|  |   Receipt Gen)     |   |  Customer Profile)  |   |    Broadcasting)       |  |
|  +--------------------+   +---------------------+   +------------------------+  |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                              Eloquent Models                              |  |
|  |  (TenantScoped: Tenant, Outlet, Product, Order, Customer, CashRegister)   |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
                                |                               |
                 SQL Queries    |                  Jobs / Cache |
                                v                               v
                 +-----------------------------+  +-------------------------------+
                 |    PostgreSQL 16 Database   |  |        Redis Cache & Queue    |
                 | (Row Level Scoped Isolation)|  +-------------------------------+
                 +-----------------------------+
```

---

### 2.2 Strategi Multi-Tenancy & Isolasi Data (PostgreSQL)

Pendekatan yang dipilih: **Single Database, Shared Schema dengan Discriminator Column (`tenant_id`)**.

**Alasan Pemilihan Teknis:**
1. **Efisiensi Sumber Daya:** Tidak memerlukan ratusan database terpisah untuk tiap UMKM, menghemat RAM PostgreSQL secara signifikan.
2. **Migrasi Cepat:** Menjalankan `php artisan migrate` mengeksekusi semua tenant dalam satu langkah, bebas risiko migrasi macet di satu DB.
3. **Keamanan Data (Zero-Leakage):**
   - Setiap model tenant mengimplementasikan `TenantScope` (Global Scope di Laravel).
   - Global Scope secara otomatis menambahkan klausul `WHERE tenant_id = ?` ke seluruh operasi `SELECT`, `UPDATE`, dan `DELETE`.
   - Event `creating` pada Model secara otomatis menginjeksi `tenant_id` dari user sesi yang aktif.
   - Pemanfaatan PostgreSQL *Row Level Security (RLS)* sebagai lapisan keamanan sekunder di tingkat basis data.

---

### 2.3 Skema Database Lengkap (Data Dictionary & DDL)

#### 1. Tabel `tenants` (Entitas Bisnis / UMKM)
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
```

#### 2. Tabel `outlets` (Cabang Toko)
```sql
CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_outlets_tenant ON outlets(tenant_id);
```

#### 3. Tabel `users` (Aktor Sistem)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'superadmin', 'owner', 'manager', 'cashier'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
```

#### 4. Tabel `products` (Katalog Produk & Harga)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00, -- HPP untuk hitung profit
    selling_price NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    track_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_tenant_sku ON products(tenant_id, sku);
CREATE INDEX idx_products_tenant_barcode ON products(tenant_id, barcode);
```

#### 5. Tabel `customers` (Database CRM & Loyalitas)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(30) NOT NULL, -- Nomor WhatsApp
    name VARCHAR(255),
    loyalty_points INTEGER DEFAULT 0,
    total_spend NUMERIC(15, 2) DEFAULT 0.00,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_phone UNIQUE (tenant_id, phone)
);
CREATE INDEX idx_customers_tenant_phone ON customers(tenant_id, phone);
```

#### 6. Tabel `orders` (Header Transaksi Penjualan)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES outlets(id),
    cashier_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    invoice_number VARCHAR(100) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'qris', 'bank_transfer'
    payment_status VARCHAR(50) DEFAULT 'paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_invoice UNIQUE (tenant_id, invoice_number)
);
CREATE INDEX idx_orders_tenant_outlet ON orders(tenant_id, outlet_id, created_at);
```

#### 7. Tabel `order_items` (Detail Item Transaksi)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost_price NUMERIC(12, 2) NOT NULL,
    unit_selling_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

---

### 2.4 Arsitektur Real-time Monitoring (Laravel Reverb)
Setiap kali transaksi baru berhasil disimpan:
1. `OrderService::createOrder()` menembakkan event Laravel: `OrderCompletedEvent`.
2. Event tersebut mengimplementasikan interface `ShouldBroadcastNow`.
3. Event mem-broadcast payload transaksi ringkas ke private channel: `private-tenant.{tenantId}.monitoring`.
4. Dashboard browser Owner yang sedang aktif (via Echo + Reverb) menangkap event dan meng-update counter pendapatan hari ini, grafik omzet, dan tabel live feed secara reaktif tanpa reloading.

---

### 2.5 Spesifikasi API & Kontrak Data

#### 1. POST `/api/v1/pos/checkout`
**Request Payload:**
```json
{
  "outlet_id": "018f3a2b-...",
  "customer_phone": "081234567890",
  "customer_name": "Budi Santoso",
  "items": [
    { "product_id": "018f3a3c-...", "quantity": 2, "price": 25000 },
    { "product_id": "018f3a4d-...", "quantity": 1, "price": 18000 }
  ],
  "discount_amount": 5000,
  "points_redeemed": 0,
  "payment_method": "cash",
  "cash_tendered": 70000
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "invoice_number": "INV/20261101/OUT01/0082",
  "grand_total": 63000,
  "cash_tendered": 70000,
  "change_due": 7000,
  "points_earned": 6,
  "customer": {
    "phone": "081234567890",
    "name": "Budi Santoso",
    "current_points": 56
  }
}
```

#### 2. GET `/api/v1/owner/live-metrics`
Mengambil metrik ringkas terkini cabang untuk owner.
**Response (200 OK):**
```json
{
  "today_revenue": 4820000,
  "today_transactions": 94,
  "average_ticket_size": 51276,
  "active_outlets": 3,
  "top_products": [
    { "name": "Kopi Susu Gula Aren", "qty_sold": 42 },
    { "name": "Croissant Butter", "qty_sold": 28 }
  ]
}
```

---

### 2.6 Integrasi Hardware & Cetak Struk (ESC/POS)
* Format Struk: 58mm standar (32 karakter per baris) dan 80mm standar (48 karakter per baris).
* Protokol Komunikasi: Driver-less printing via browser Web Serial API / Web Bluetooth API untuk perangkat modern, atau library QZ Tray / raw socket printer untuk koneksi USB/LAN lokal.

---

### 2.7 Matriks Hak Akses (Role-Based Access Control)

| Modul / Aksi | SuperAdmin | Owner | Outlet Manager | Cashier |
| :--- | :---: | :---: | :---: | :---: |
| **Buka/Tutup Kasir (Shift)** | ✓ | ✓ | ✓ | ✓ |
| **Transaksi Terminal Kasir** | — | ✓ | ✓ | ✓ |
| **Beri Diskon Manual** | — | ✓ | ✓ | — (Butuh PIN) |
| **Edit/Hapus Produk & Harga**| — | ✓ | ✓ | — |
| **Live Sales Dashboard** | ✓ (All) | ✓ (Own) | ✓ (Own Outlet)| — |
| **Laporan Finansial & HPP** | — | ✓ | — | — |
| **Manajemen Lisensi SaaS** | ✓ | — | — | — |

---

# BAGIAN III: SPRINT ROADMAP & KICKOFF BESOK PAGI

### 3.1 Timeline 14 Hari (Sprint 1 - 4)

| Fase | Waktu | Deliverable Utama |
| :--- | :--- | :--- |
| **Sprint 1: Fondasi & Multi-Tenancy** | Hari 1–3 | Setup Laravel 11, Postgres connection, Tenant scoping, User & Role Auth, Master Outlet & Produk |
| **Sprint 2: Terminal Kasir (POS Engine)** | Hari 4–7 | UI Kasir, Keranjang belanja, Multi-payment, Atomic transaction processing, Cetak struk ESC/POS |
| **Sprint 3: Modul CRM & Loyalitas** | Hari 8–10 | Lookup pelanggan via No WA, kalkulasi poin otomatis, riwayat belanja member, diskon poin |
| **Sprint 4: Owner Live Monitoring & Polish**| Hari 11–14 | Laravel Reverb WebSockets live feed, dashboard analitik owner, rekap laba kotor, smoke testing |

---

### 3.2 Action Item Kickoff Jam 09.00 (Besok Pagi)
1. Buka terminal di folder proyek: `/Users/kou/OpenBot/Shared/pos-crm-saas`
2. Jalankan perintah instalasi Laravel 11:
   ```bash
   composer create-project laravel/laravel .
   ```
3. Sesuaikan konfigurasi `.env` dengan kredensial PostgreSQL lokal.
4. Buat migration database sesuai tabel spesifikasi DDL pada dokumen ini.
5. Setup `TenantScope` pada folder `app/Scopes/TenantScope.php`.
