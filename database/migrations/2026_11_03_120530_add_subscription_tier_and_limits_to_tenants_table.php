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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('subscription_tier')->default('essential')->after('is_active');
            $table->json('custom_modules')->nullable()->after('subscription_tier');
            $table->integer('max_outlets')->nullable()->default(3)->after('custom_modules');
            $table->integer('max_staff')->nullable()->default(10)->after('max_outlets');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['subscription_tier', 'custom_modules', 'max_outlets', 'max_staff']);
        });
    }
};
