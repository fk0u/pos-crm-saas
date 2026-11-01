#!/usr/bin/env bash
# ==============================================================================
# Automated Starter Project Setup Script
# SaaS POS + CRM + Central Sales Monitoring (Laravel 11 + PostgreSQL)
# ==============================================================================

set -e

echo "🚀 [1/5] Memeriksa environment & dependency..."
if ! command -v php &> /dev/null; then
    echo "❌ Error: PHP belum terinstall."
    exit 1
fi

if ! command -v composer &> /dev/null; then
    echo "❌ Error: Composer belum terinstall."
    exit 1
fi

echo "📄 [2/5] Menyiapkan file konfigurasi .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env berhasil dibuat dari .env.example"
fi

# Ensure PostgreSQL configuration in .env
if grep -q "DB_CONNECTION=sqlite" .env; then
    sed -i '' 's/DB_CONNECTION=sqlite/DB_CONNECTION=pgsql/' .env
    sed -i '' 's/# DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/' .env
    sed -i '' 's/# DB_PORT=5432/DB_PORT=5432/' .env
    sed -i '' 's/# DB_DATABASE=laravel/DB_DATABASE=pos_saas_db/' .env
    sed -i '' 's/# DB_USERNAME=root/DB_USERNAME=postgres/' .env
    sed -i '' 's/# DB_PASSWORD=/DB_PASSWORD=postgres/' .env
    echo "✓ Konfigurasi database diubah ke PostgreSQL (pos_saas_db)"
fi

echo "📦 [3/5] Menginstall PHP dependencies via Composer..."
composer install --no-interaction --prefer-dist

echo "🔑 [4/5] Generate Application Key..."
php artisan key:generate --ansi

echo "🗄️ [5/5] Menjalankan Database Migration & Seeding..."
echo "Catatan: Pastikan PostgreSQL service aktif dan database 'pos_saas_db' sudah dibuat."
if php artisan migrate:fresh --seed --force; then
    echo "✓ Migrasi database & demo seeder berhasil dijalankan!"
else
    echo "⚠️ Database belum terkoneksi atau belum dibuat. Silakan buat DB PostgreSQL 'pos_saas_db' lalu jalankan: php artisan migrate --seed"
fi

echo ""
echo "=============================================================================="
echo "🎉 STARTER PROJECT SIAP DIGUNAKAN!"
echo "=============================================================================="
echo "Untuk menjalankan server lokal:"
echo "  php artisan serve"
echo ""
echo "Demo Login Akun:"
echo "  Owner  : owner@kopikawan.com (password: password123)"
echo "  Kasir  : kasir@kopikawan.com (password: password123)"
echo "=============================================================================="
