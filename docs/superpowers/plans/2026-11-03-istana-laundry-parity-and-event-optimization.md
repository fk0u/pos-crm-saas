# Istana Laundry Feature Parity & High-Concurrency Event Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyamakan fungsionalitas `pos-crm-saas` dengan `IstanaLaundryManagementSystem` sesuai masukan dari Kak Ichsan & Ghani:
1. Akun Master / Superadmin yang bisa melihat semua data/tenant/outlet (muncul di Seeder & persona Login).
2. Sistem Cetak Struk Thermal 58mm/80mm profesional (dialog print, RawBT Android `intent:`, Web Bluetooth BLE, QR nota digital).
3. Kirim Struk via WhatsApp (`WhatsAppService` format nota terstruktur + wa.me URL generator + tombol aksi cepat di checkout kasir & invoice).
4. Optimisasi Caching & DB Concurrency untuk skenario event (high burst orders, pessimistic locking pada stock decrement, caching produk POS & summary metrics).

---

## File Structure & Proposed Changes

### Backend (PHP / Laravel)
- `app/Services/WhatsAppService.php`: Layanan pembuat pesan WhatsApp nota transaksi rapi & generator wa.me link.
- `app/Http/Controllers/Web/InvoiceController.php`: Controller untuk render halaman cetak struk thermal (`/invoices/{order}/receipt`) dan redirect WhatsApp (`/invoices/{order}/whatsapp`).
- `app/Domain/Pos/Actions/ProcessCheckoutAction.php`: Tambahkan pessimistic lock (`lockForUpdate()`) dan invalidasi cache produk.
- `app/Http/Controllers/Api/PosController.php`: Tambahkan layer caching pada `getProducts()`.
- `app/Services/SalesMetricsService.php`: Dukungan multi-tenant agregat untuk Superadmin dan short-lived cache untuk ringkasan metrics.
- `app/Http/Controllers/Web/DashboardController.php`: Dukungan role `superadmin` untuk beralih atau memantau semua tenant/outlet.
- `database/seeders/DatabaseSeeder.php`: Tambahkan akun `master@qlon.id` (Master Administrator) ber-role `superadmin`.
- `routes/web.php`: Tambahkan route `/invoices/{order}/receipt` dan `/invoices/{order}/whatsapp`.

### Frontend (React / Inertia)
- `resources/js/Pages/Auth/Login.tsx`: Tambahkan persona 3 "Akun Master / Developer" (`master@qlon.id`).
- `resources/js/Pages/Pos/Terminal.tsx`: Perbarui modal Checkout Success:
  - Tombol "Cetak Struk Thermal" (membuka thermal slip / print dialog)
  - Tombol "Kirim WhatsApp" (membuka wa.me link dengan nomor terisi atau prompt nomor jika walk-in)
  - Tombol "Buka Halaman Struk"
- `resources/views/invoices/receipt.blade.php`: Halaman struk thermal 58mm/80mm mandiri (seperti di Istana Laundry) lengkap dengan kontrol cetak (Print Dialog, RawBT Android, Web Bluetooth, dan WhatsApp).
- `resources/js/Pages/Dashboard/Index.tsx`: Tampilkan badge role superadmin dan tenant selector jika user adalah superadmin.

---

## Tasks

### Task 1: Akun Master / Superadmin & Login Persona Integration
- [x] Tambahkan helper check di `app/Models/User.php` (`isSuperAdmin()`, role hierarchy).
- [x] Perbarui `database/seeders/DatabaseSeeder.php` untuk membuat user `master@qlon.id` (password: `password123`, role: `superadmin`).
- [x] Jalankan seeder database untuk memastikan akun master tercipta di SQLite/DB.
- [x] Perbarui `resources/js/Pages/Auth/Login.tsx` untuk menampilkan 3 tombol persona: Master Administrator, Owner HQ, Kasir Outlet.
- [x] Perbarui `app/Http/Controllers/Web/DashboardController.php` agar akun superadmin dapat mengakses dashboard seluruh outlet/tenant tanpa error.
- [x] Tulis test di `tests/Feature/SuperAdminAccessTest.php` untuk memvalidasi akses login superadmin dan melihat data.

### Task 2: WhatsAppService & Endpoint Kirim Struk WA
- [x] Buat `app/Services/WhatsAppService.php` dengan method `generateReceiptMessage(Order $order)` dan `generateWhatsAppUrl(string $phone, string $message)`.
- [x] Buat `app/Http/Controllers/Web/InvoiceController.php` dengan method `sendWhatsApp(Order $order, Request $request)` yang meredirect ke URL WhatsApp.
- [x] Daftarkan route `invoices.whatsapp` di `routes/web.php`.
- [x] Tulis test di `tests/Feature/WhatsAppInvoiceTest.php` untuk memverifikasi normalisasi nomor telepon (628...) dan format pesan.

### Task 3: Sistem Print Struk Thermal (58mm/80mm, RawBT, Bluetooth, Browser)
- [x] Buat view `resources/views/invoices/receipt.blade.php` dengan layout thermal printer standar industri (seperti di Istana Laundry) dengan opsi Cetak Dialog, RawBT Android `intent:`, dan Web Bluetooth API.
- [x] Hubungkan route `GET /invoices/{order}/receipt` di `InvoiceController`.
- [x] Perbarui `resources/js/Pages/Pos/Terminal.tsx` pada modal checkout sukses:
  - Tambahkan tombol "Kirim WhatsApp"
  - Tambahkan tombol "Cetak Struk (58mm)"
  - Tambahkan tombol "Lihat Struk Lengkap"
- [x] Verifikasi print styling (`@media print`) agar pas tanpa margin berlebih pada kertas thermal.

### Task 4: Optimisasi Konkurensi & Caching untuk Event Ramai
- [x] Update `app/Domain/Pos/Actions/ProcessCheckoutAction.php` dengan pessimistic locking (`lockForUpdate()`) pada query produk saat checkout ramai.
- [x] Tambahkan caching pada `PosController::getProducts` dengan TTL dan cache tagging/key berdasarkan tenant & outlet.
- [x] Tambahkan short-lived TTL caching (5-10 detik) pada `SalesMetricsService::summary` agar polling dashboard tidak membebani database saat lonjakan transaksi di event.
- [x] Tulis unit/feature test `tests/Feature/EventConcurrencyTest.php` untuk memverifikasi integritas stok pada checkout cepat.

### Task 5: Pengujian Menyeluruh (Verification & Build)
- [x] Jalankan `php artisan test` untuk memastikan semua test lulus (100% pass).
- [x] Jalankan `npm run build` untuk memverifikasi kompilasi frontend Vite/React bebas error.
