<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Promotions & Promo Codes Table
        if (! Schema::hasTable('promotions')) {
            Schema::create('promotions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
                $table->string('code', 50);
                $table->string('name', 150);
                $table->string('type', 20)->default('percentage'); // percentage | fixed
                $table->decimal('value', 12, 2);
                $table->decimal('min_order_amount', 12, 2)->default(0.00);
                $table->decimal('max_discount_amount', 12, 2)->nullable();
                $table->integer('quota')->default(100);
                $table->integer('used_count')->default(0);
                $table->dateTime('starts_at')->nullable();
                $table->dateTime('expires_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['tenant_id', 'code']);
                $table->index(['tenant_id', 'is_active']);
            });
        }

        // 2. Stock Adjustments / Inventory Mutations Table
        if (! Schema::hasTable('stock_adjustments')) {
            Schema::create('stock_adjustments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
                $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type', 20); // in, out, opname, waste
                $table->integer('quantity');
                $table->integer('previous_stock');
                $table->integer('current_stock');
                $table->string('reason', 255);
                $table->timestamps();

                $table->index(['tenant_id', 'product_id']);
                $table->index(['tenant_id', 'created_at']);
            });
        }

        // 3. Enhance Orders Table for Restaurant & Online Ordering
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('cashier_id')->nullable()->change();

            if (! Schema::hasColumn('orders', 'order_type')) {
                $table->string('order_type', 30)->default('pos')->after('customer_id'); // pos, dine_in, takeaway, delivery
            }
            if (! Schema::hasColumn('orders', 'table_number')) {
                $table->string('table_number', 50)->nullable()->after('order_type');
            }
            if (! Schema::hasColumn('orders', 'customer_name')) {
                $table->string('customer_name', 150)->nullable()->after('table_number');
            }
            if (! Schema::hasColumn('orders', 'customer_phone')) {
                $table->string('customer_phone', 50)->nullable()->after('customer_name');
            }
            if (! Schema::hasColumn('orders', 'order_status')) {
                $table->string('order_status', 30)->default('completed')->after('payment_status'); // pending, accepted, preparing, ready, completed, cancelled
            }
            if (! Schema::hasColumn('orders', 'coupon_code')) {
                $table->string('coupon_code', 50)->nullable()->after('discount_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $cols = ['order_type', 'table_number', 'customer_name', 'customer_phone', 'order_status', 'coupon_code'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('orders', $c)) {
                    $table->dropColumn($c);
                }
            }
        });

        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('promotions');
    }
};
