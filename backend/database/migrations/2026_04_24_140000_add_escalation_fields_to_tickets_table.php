<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('escalated_at')->nullable()->after('approver_email');
            $table->foreignId('escalated_by_user_id')
                ->nullable()
                ->after('escalated_at')
                ->constrained('users')
                ->nullOnDelete();
            $table->index('escalated_at');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('escalated_by_user_id');
            $table->dropIndex(['escalated_at']);
            $table->dropColumn('escalated_at');
        });
    }
};
