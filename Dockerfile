FROM php:8.4-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apk update && apk add --no-cache \
    build-base \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    postgresql-dev \
    sqlite-dev \
    zip \
    unzip \
    git \
    curl \
    icu-dev \
    oniguruma-dev \
    nodejs \
    npm \
    netcat-openbsd \
    shadow

# Install PHP extensions for PostgreSQL, SQLite & modern Laravel 13 features
RUN docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pdo_sqlite \
        mbstring \
        zip \
        bcmath \
        exif \
        pcntl \
        intl \
        opcache

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www

# Copy entrypoint to /usr/local/bin so it is always accessible regardless of volume mounts
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Ensure bootstrap/cache and storage directories exist
RUN mkdir -p /var/www/bootstrap/cache \
    && mkdir -p /var/www/storage/framework/cache \
    && mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/logs

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install npm dependencies and build production assets
RUN npm ci && npm run build && rm -rf node_modules

# Add non-root user for laravel application
RUN addgroup -g 1000 -S www \
    && adduser -u 1000 -S www -G www -s /bin/sh

# Set directory permissions
RUN chown -R www:www /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Switch to non-root user
USER www

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
