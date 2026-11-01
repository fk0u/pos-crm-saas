<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('category')->nullable();
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->string('name');
            $table->decimal('cost_price', 12, 2)->default(0.00);
            $table->decimal('selling_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'sku']);
            $table->index(['tenant_id', 'barcode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
