<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_approvers', function (Blueprint $table) {
            // A global approver is notified for EVERY High/Urgent ticket
            // regardless of the requester's branch. Branch-specific
            // approvers are still TO'd first; globals get CC'd.
            $table->boolean('is_global')->default(false)->after('obo_id');
            $table->index('is_global');
        });

        // Globals have no branch scope. Drop the NOT NULL constraint on
        // branch_id so a global row can exist without a branch.
        Schema::table('ticket_approvers', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ticket_approvers', function (Blueprint $table) {
            $table->dropIndex(['is_global']);
            $table->dropColumn('is_global');
        });

        Schema::table('ticket_approvers', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable(false)->change();
        });
    }
};
