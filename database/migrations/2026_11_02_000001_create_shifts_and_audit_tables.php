<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('outlet_id')->constrained('outlets');
            $table->foreignUuid('user_id')->constrained('users');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('starting_cash', 12, 2)->default(0.00);
            $table->decimal('cash_sales_total', 12, 2)->default(0.00);
            $table->decimal('non_cash_sales_total', 12, 2)->default(0.00);
            $table->decimal('cash_in_total', 12, 2)->default(0.00);
            $table->decimal('cash_out_total', 12, 2)->default(0.00);
            $table->decimal('expected_ending_cash', 12, 2)->default(0.00);
            $table->decimal('actual_ending_cash', 12, 2)->nullable();
            $table->decimal('difference', 12, 2)->nullable();
            $table->string('status', 20)->default('open'); // open, closed
            $table->text('notes')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'outlet_id', 'status']);
            $table->index(['tenant_id', 'user_id', 'status']);
        });

        Schema::create('shift_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('shift_id')->constrained('shifts')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('type', 20); // cash_in, cash_out
            $table->decimal('amount', 12, 2);
            $table->string('reason', 255);
            $table->timestamps();

            $table->index(['shift_id', 'type']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 50); // void_order, discount_override, refund, shift_discrepancy, cash_movement
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'action', 'created_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignUuid('shift_id')->nullable()->after('outlet_id')->constrained('shifts')->nullOnDelete();
            $table->decimal('cash_tendered', 12, 2)->nullable()->after('grand_total');
            $table->decimal('change_amount', 12, 2)->nullable()->after('cash_tendered');
            $table->json('payment_details')->nullable()->after('payment_method');
            $table->text('notes')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['shift_id']);
            $table->dropColumn(['shift_id', 'cash_tendered', 'change_amount', 'payment_details', 'notes']);
        });

        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('shift_movements');
        Schema::dropIfExists('shifts');
    }
};
