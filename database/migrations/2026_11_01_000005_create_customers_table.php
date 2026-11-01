<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('phone', 30);
            $table->string('name')->nullable();
            $table->integer('loyalty_points')->default(0);
            $table->decimal('total_spend', 15, 2)->default(0.00);
            $table->integer('visit_count')->default(0);
            $table->timestamp('last_visit_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'phone']);
            $table->index(['tenant_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
