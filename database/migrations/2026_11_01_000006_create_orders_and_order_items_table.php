<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('outlet_id')->constrained('outlets');
            $table->foreignUuid('cashier_id')->constrained('users');
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('invoice_number', 100);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('tax_amount', 12, 2)->default(0.00);
            $table->decimal('grand_total', 12, 2);
            $table->integer('points_earned')->default(0);
            $table->integer('points_redeemed')->default(0);
            $table->string('payment_method', 50); // cash, qris, bank_transfer
            $table->string('payment_status', 50)->default('paid');
            $table->timestamps();

            $table->unique(['tenant_id', 'invoice_number']);
            $table->index(['tenant_id', 'outlet_id', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products');
            $table->integer('quantity');
            $table->decimal('unit_cost_price', 12, 2);
            $table->decimal('unit_selling_price', 12, 2);
            $table->decimal('subtotal', 12, 2);

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
