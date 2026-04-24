<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Approval workflow for high/urgent public submissions.
            // NULL  → no approval needed (normal tickets)
            // pending → email sent, waiting for approver
            // approved → visible to IT team, business as usual
            // rejected → hidden from IT, requester can see status in track page
            $table->string('approval_status', 20)->nullable()->after('status');
            $table->string('approval_token', 64)->nullable()->unique()->after('approval_status');
            $table->string('approver_email')->nullable()->after('approval_token');
            $table->timestamp('approved_at')->nullable()->after('approver_email');
            $table->string('approved_by')->nullable()->after('approved_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('rejected_at');

            $table->index('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['approval_status']);
            $table->dropColumn([
                'approval_status',
                'approval_token',
                'approver_email',
                'approved_at',
                'approved_by',
                'rejected_at',
                'rejection_reason',
            ]);
        });
    }
};
