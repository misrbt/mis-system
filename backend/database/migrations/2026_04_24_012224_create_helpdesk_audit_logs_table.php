<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_audit_logs', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->foreign('ticket_id')
                ->references('id')
                ->on('tickets')
                ->nullOnDelete();

            // Denormalized so the log stays readable even if a ticket is hard-deleted.
            $table->string('ticket_number')->nullable()->index();

            // e.g. ticket.created, ticket.updated, ticket.status_changed, ticket.assigned,
            // remark.added, attachment.uploaded, attachment.deleted, satisfaction.submitted
            $table->string('action')->index();

            // user = authenticated MIS staff, employee = trust-attributed employee,
            // public = unauthenticated public caller, system = observer/job
            $table->enum('actor_type', ['user', 'employee', 'public', 'system'])->index();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('actor_name')->nullable();

            // Field-level diff { field: { old, new } } for update events.
            $table->json('changes')->nullable();

            // Everything else (remark_id, attachment_id, filename, remark_type, internal flag, ...)
            $table->json('metadata')->nullable();

            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();

            $table->timestamp('created_at')->useCurrent()->index();
            $table->timestamp('updated_at')->useCurrent();
            $table->softDeletes();

            $table->index(['ticket_id', 'created_at']);
            $table->index(['actor_type', 'actor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_audit_logs');
    }
};
