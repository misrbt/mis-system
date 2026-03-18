<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('report_signatories', function (Blueprint $table) {
            $table->foreignId('prepared_by_id')
                ->nullable()
                ->after('user_id')
                ->constrained('employee')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('report_signatories', function (Blueprint $table) {
            $table->dropForeign(['prepared_by_id']);
            $table->dropColumn('prepared_by_id');
        });
    }
};
