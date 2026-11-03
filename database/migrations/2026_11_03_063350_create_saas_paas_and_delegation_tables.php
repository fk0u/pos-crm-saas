<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Support Delegation Tokens (Shopify Collaborator / AWS AssumeRole style)
        Schema::create('support_delegation_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->string('reason')->nullable();
            $table->json('allowed_scopes')->nullable(); // e.g. ['transactions.view', 'products.edit']
            $table->foreignUuid('claimed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['tenant_id', 'token']);
        });

        // 2. Semi-PaaS API Keys
        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('key_prefix', 16);
            $table->string('secret_hash', 128);
            $table->json('permissions')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'key_prefix']);
        });

        // 3. Semi-PaaS Webhook Endpoints
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('url');
            $table->string('secret_key', 64);
            $table->json('events'); // e.g. ['order.completed', 'stock.low']
            $table->boolean('is_active')->default(true);
            $table->integer('failure_count')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });

        // 4. Real-time Support Chat Messages
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject');
            $table->string('status')->default('open'); // open, resolved, closed
            $table->string('priority')->default('medium'); // low, medium, urgent
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_from_support')->default(false);
            $table->timestamps();

            $table->index(['ticket_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('webhook_endpoints');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('support_delegation_tokens');
    }
};
