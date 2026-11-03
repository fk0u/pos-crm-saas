# Daftar Temuan Audit Keterhubungan Database (Database Persistence & Data Integrity Issues)

Dokumen ini memetakan seluruh komponen antarmuka, kontroler, dan alur data yang saat ini masih menggunakan **data statis/mock/hardcoded** atau operasi lokal (*client-side only*) yang **belum tersimpan permanen ke database PostgreSQL**.

---

## Ringkasan Prioritas Isu

| Kode Isu | Modul / Halaman | Deskripsi Masalah | Tingkat Urgensi | Status |
| :--- | :--- | :--- | :---: | :---: |
| **ISSUE-01** | `Dashboard/Index.tsx` | Kartu metrik ringkasan (Total Order, Omzet, Sukses, Pelanggan) berisi angka hardcoded & fallback statis. | Tinggi | Selesai (Tersinkronisasi DB) |
| **ISSUE-02** | `Dashboard/Index.tsx` | Grafik batang pendapatan 12 bulan (*monthlyData*) menggunakan array statis Jan-Des tanpa kueri database. | Tinggi | Selesai (Tersinkronisasi DB) |
| **ISSUE-03** | `Dashboard/Index.tsx` | Donut chart *Status Analysis* (Selesai, Proses, Pending) menggunakan angka statis (1037, 486, 165). | Sedang | Selesai (Tersinkronisasi DB) |
| **ISSUE-04** | `Dashboard/Index.tsx` | Showcase produk *Explore Products* berisi mock array produk kuliner tetap bukannya mengambil dari tabel `products`. | Tinggi | Selesai (Tersinkronisasi DB) |
| **ISSUE-05** | `Dashboard/Index.tsx` | Fitur Refund pesanan di tabel dasbor hanya memakai `setTimeout` & state lokal, tidak memanggil API database. | Kritis | Selesai (Tersinkronisasi DB) |
| **ISSUE-06** | `Dashboard/Index.tsx` | Tombol Export CSV di header dasbor hanya memunculkan toast tiruan tanpa mengunduh file CSV asli. | Sedang | Selesai (Tersinkronisasi DB) |
| **ISSUE-07** | `routes/web.php` & Settings | Belum ada rute & antarmuka CRUD untuk pendaftaran Outlet baru dan akun Kasir/Staff oleh Owner. | Tinggi | Selesai (Tersinkronisasi DB) |
| **ISSUE-08** | `SuperadminController.php` | Metrik `active_connections` klaster server masih di-hardcode ke angka `14` bukannya kueri `pg_stat_activity`. | Rendah | Selesai (Tersinkronisasi DB) |
| **ISSUE-09** | `app-shell.tsx` | Lonceng notifikasi belum memiliki tabel database `notifications` (stok menipis, shift tutup, tiket CS). | Sedang | Terbuka |

---

## Rincian Teknis Per Isu

### [ISSUE-01] Nilai Metrik Statistik Hardcoded di Kartu Utama Dasbor
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:455, 498, 531, 562`
- **Gejala:**
  - Card 1: Tertulis angka mati `<p ...>4,860</p>` sebagai Total Pesanan Terkelola.
  - Card 2: Menggunakan fallback string `'Rp 248.5jt'` jika omzet hari ini kosong.
  - Card 3: Menggunakan fallback string `'1,037'` untuk transaksi sukses.
  - Card 4: Menggunakan fallback string `'895'` untuk pelanggan aktif CRM.
- **Dampak:** Pengguna melihat angka buatan yang tidak mencerminkan transaksi asli yang tersimpan di PostgreSQL.
- **Rekomendasi Perbaikan:**
  - Update `SalesMetricsService::summary()` agar mengembalikan `total_orders_all_time`, `total_revenue_all_time`, `today_successful_orders`, dan `active_customers_count`.
  - Hapus semua angka statis di JSX dan ganti dengan props riil.

---

### [ISSUE-02] Grafik Tren Penjualan 12 Bulan Menggunakan Mock Array
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:272-285, 738-758`
- **Gejala:**
  - Variabel `monthlyData` dideklarasikan langsung di dalam komponen React:
    ```typescript
    const monthlyData = [
      { month: 'Jan', revenue: 28, deals: 210 },
      { month: 'Feb', revenue: 34, deals: 250 },
      ...
    ];
    ```
- **Dampak:** Grafik penjualan bulanan tidak bergeser saat ada transaksi baru di kasir.
- **Rekomendasi Perbaikan:**
  - Di `SalesMetricsService`, buat kueri SQL:
    ```sql
    SELECT 
      TO_CHAR(created_at, 'Mon') as month,
      DATE_PART('month', created_at) as month_num,
      COUNT(*) as deals,
      COALESCE(SUM(grand_total), 0) / 1000000.0 as revenue
    FROM orders
    WHERE tenant_id = :tenantId AND payment_status = 'paid' AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month, month_num
    ORDER BY month_num;
    ```
  - Kirimkan data ini melalui `DashboardController` ke props Inertia.

---

### [ISSUE-03] Donut Ring Status Analysis Menggunakan Persentase Statis
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:616-685`
- **Gejala:**
  - Persentase stroke SVG di-hardcode ke `65 100`, `20 100`, dan `15 100`.
  - Teks rincian di-hardcode ke `1,037` (Selesai), `486` (Diproses), `165` (Pending).
- **Dampak:** Diagram lingkaran status order tidak mencerminkan status riil pesanan di database.
- **Rekomendasi Perbaikan:**
  - Tambahkan hitungan status pesanan di `SalesMetricsService` (`paid`, `pending`, `refunded`, `cancelled`).
  - Hitung persentase dinamis `(statusCount / totalOrders) * 100` di React.

---

### [ISSUE-04] Daftar Produk Unggulan Dasbor Tidak Mengambil Dari Tabel `products`
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:228-269, 817-882`
- **Gejala:**
  - Bagian *Explore Your Products & Event Booths* merender array `exploreProducts` yang berisi 4 produk statis:
    - Kopi Susu Aren Signature
    - Matcha Latte Premium
    - Croissant Butter Artisan
    - Caramel Cold Brew Bottle
- **Dampak:** Produk baru yang ditambahkan pengguna di menu `/products` tidak muncul pada dasbor ini.
- **Rekomendasi Perbaikan:**
  - Sambungkan komponen ke prop `topProducts` yang dikirim dari `DashboardController` (mengambil dari tabel `products` dan `order_items`).

---

### [ISSUE-05] Fitur Refund di Dasbor Hanya Berjalan Lokal (*Client-Side Mock*)
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:287-295`
- **Gejala:**
  - Fungsi `handleRefund` menggunakan `setTimeout` dan `setOrdersList` tanpa request jaringan:
    ```typescript
    setTimeout(() => {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'refunded' } : o))
      );
      setIsRefunding(false);
    }, 500);
    ```
- **Dampak:** Jika halaman di-refresh, status pesanan kembali belum ter-refund, stok tidak dikembalikan, dan tidak tercatat di `audit_logs`.
- **Rekomendasi Perbaikan:**
  - Ganti dengan pemanggilan resmi Inertia:
    ```typescript
    router.post(`/transactions/${selectedOrder.id}/refund`, {
      reason: refundReason,
    }, {
      onSuccess: () => {
        setIsRefunding(false);
        setSelectedOrder(null);
      }
    });
    ```

---

### [ISSUE-06] Tombol Export CSV di Dasbor Hanya Berupa Toast Dummy
- **Lokasi File:** `resources/js/Pages/Dashboard/Index.tsx:418-428`
- **Gejala:**
  - Mengklik tombol Export hanya memicu `setToastMessage('Laporan diexport ke format CSV...')`.
- **Dampak:** Pengguna tidak menerima berkas file laporan apapun.
- **Rekomendasi Perbaikan:**
  - Sambungkan tombol tersebut ke endpoint ekspor riil:
    ```typescript
    window.location.href = `/reports/export?period=this_month`;
    ```

---

### [ISSUE-07] Belum Ada Alur Pendaftaran Cabang/Outlet & Akun Staf/Kasir Oleh Owner
- **Lokasi File:** `routes/web.php`, `app/Http/Controllers/Web/`
- **Gejala:**
  - Tabel `outlets` dan `users` telah memiliki skema relasi di database, namun di antarmuka web belum ada form/modal bagi Owner untuk:
    1. Menambah cabang baru (Nama outlet, alamat, nomor telepon).
    2. Menambah akun kasir/manajer baru (Nama, email, password, penugasan outlet).
- **Dampak:** Owner tidak bisa menambah staf kasir baru atau membuka cabang baru secara mandiri tanpa seeder manual.
- **Rekomendasi Perbaikan:**
  - Buat `OutletController` (`store`, `update`, `destroy`).
  - Buat `StaffController` (`store`, `update`, `destroy`).
  - Tambahkan tab "Kelola Cabang & Staf" pada menu Pengaturan atau Dasbor Owner.

---

### [ISSUE-08] Telemetri Koneksi Database Superadmin Masih Statis
- **Lokasi File:** `app/Http/Controllers/Web/SuperadminController.php:42`
- **Gejala:**
  - Nilai `'active_connections' => 14` ditulis secara konstan.
- **Rekomendasi Perbaikan:**
  - Ambil nilai riil dengan kueri:
    ```php
    $activeConnections = (int) (DB::select("SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'")[0]->count ?? 1);
    ```

---

### [ISSUE-09] Tombol Lonceng Notifikasi Belum Memiliki Penyimpanan Database
- **Lokasi File:** `resources/js/Components/app/app-shell.tsx:331-340`
- **Gejala:**
  - Tombol lonceng notifikasi hanya memiliki penanda titik biru statis dan memicu suara `playTap()`.
- **Rekomendasi Perbaikan:**
  - Implementasikan tabel `notifications` dan drawer/popover notifikasi riil (pemberitahuan saat stok menipis <= 5, saat kasir menutup shift, atau balasan baru dari CS).

