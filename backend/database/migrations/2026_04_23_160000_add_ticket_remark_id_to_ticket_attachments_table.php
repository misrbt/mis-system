<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_attachments', function (Blueprint $table) {
            $table->foreignId('ticket_remark_id')
                ->nullable()
                ->after('ticket_id')
                ->constrained('ticket_remarks')
                ->cascadeOnDelete();

            $table->index('ticket_remark_id');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_attachments', function (Blueprint $table) {
            $table->dropForeign(['ticket_remark_id']);
            $table->dropIndex(['ticket_remark_id']);
            $table->dropColumn('ticket_remark_id');
        });
    }
};
