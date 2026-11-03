#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================"
echo " QLon POS + CRM SaaS - Docker Container"
echo "============================================"

# Ensure .env exists inside container
if [ ! -f /var/www/.env ]; then
    echo "      Membuat file .env dari template..."
    if [ -f /var/www/.env.docker ]; then
        cp /var/www/.env.docker /var/www/.env
    elif [ -f /var/www/.env.example ]; then
        cp /var/www/.env.example /var/www/.env
    else
        touch /var/www/.env
    fi
fi

# If using PostgreSQL, wait for DB
if [ "$DB_CONNECTION" = "pgsql" ] || [ "$DB_CONNECTION" = "postgres" ]; then
  echo "[1/5] Menunggu database PostgreSQL siap (${DB_HOST:-db}:${DB_PORT:-5432})..."
  until nc -z -w5 "${DB_HOST:-db}" "${DB_PORT:-5432}" 2>/dev/null
  do
    echo "      Database belum siap. Menunggu 2 detik..."
    sleep 2
  done
  echo "      [OK] Database PostgreSQL siap!"
elif [ "$DB_CONNECTION" = "sqlite" ]; then
  echo "[1/5] Menyiapkan database SQLite..."
  mkdir -p /var/www/database
  touch /var/www/database/database.sqlite
  echo "      [OK] Database SQLite siap!"
fi

echo "[2/5] Membersihkan cache bootstrap lama..."
rm -f /var/www/bootstrap/cache/packages.php
rm -f /var/www/bootstrap/cache/services.php
rm -f /var/www/bootstrap/cache/config.php
rm -f /var/www/bootstrap/cache/routes-v7.php
rm -f /var/www/bootstrap/cache/events.php
echo "      [OK] Cache bootstrap dibersihkan."

echo "[3/5] Memeriksa APP_KEY..."
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ] || ! grep -q "APP_KEY=base64:" /var/www/.env; then
    echo "      Menghasilkan kunci aplikasi baru..."
    php artisan key:generate --force
fi
echo "      [OK] APP_KEY tersedia."

echo "[4/5] Menjalankan migrasi database..."
php artisan migrate --force
echo "      [OK] Migrasi database selesai."

echo "[5/5] Memeriksa data awal seeder..."
USER_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class); \$kernel->bootstrap(); echo \App\Models\User::count();" 2>/dev/null || echo "0")
if [ "$USER_COUNT" -eq "0" ]; then
    echo "      Database belum terisi. Menjalankan db:seed..."
    php artisan db:seed --force
    echo "      [OK] Data demo akun dan katalog berhasil disemai."
else
  echo "      [OK] Database sudah memiliki data ($USER_COUNT user). Skipping seeder."
fi

echo "============================================"
echo " Aplikasi siap! Memulai PHP-FPM..."
echo "============================================"

exec php-fpm
