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
        Schema::table('assets', function (Blueprint $table) {
            $table->timestamp('defective_at')->nullable()->after('status_id');
            $table->timestamp('delete_after_at')->nullable()->after('defective_at');
            $table->index('delete_after_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex(['delete_after_at']);
            $table->dropColumn(['defective_at', 'delete_after_at']);
        });
    }
};
