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
        Schema::create('system_incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('user_name', 150)->nullable();
            $table->string('user_email', 150)->nullable();
            $table->string('user_role', 50)->nullable();
            $table->text('url');
            $table->string('route_name', 150)->nullable();
            $table->string('method', 10)->default('GET');
            $table->integer('status_code')->default(500);
            $table->string('error_type', 150)->nullable();
            $table->text('message');
            $table->text('file')->nullable();
            $table->integer('line')->nullable();
            $table->longText('trace_summary')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('severity', 20)->default('critical'); // critical, warning, info
            $table->string('status', 20)->default('open'); // open, investigating, resolved
            $table->timestamp('resolved_at')->nullable();
            $table->string('resolved_by', 150)->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_incidents');
    }
};
