<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'defective_at')) {
                $table->timestamp('defective_at')->nullable()->after('status_id');
            }
            if (!Schema::hasColumn('assets', 'delete_after_at')) {
                $table->timestamp('delete_after_at')->nullable()->after('defective_at');
            }
        });

        $indexExists = DB::selectOne(
            "SELECT 1 FROM pg_indexes WHERE tablename = 'assets' AND indexname = 'assets_delete_after_at_index'"
        );

        if (!$indexExists) {
            Schema::table('assets', function (Blueprint $table) {
                $table->index('delete_after_at');
            });
        }
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
