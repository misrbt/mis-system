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
        Schema::table('repairs', function (Blueprint $table) {
            // Index for warranty/due date queries
            $table->index('expected_return_date', 'repairs_expected_return_date_index');

            // Compound indexes for common filters
            $table->index(['status', 'expected_return_date'], 'repairs_status_date_index');
            $table->index(['asset_id', 'status'], 'repairs_asset_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropIndex('repairs_expected_return_date_index');
            $table->dropIndex('repairs_status_date_index');
            $table->dropIndex('repairs_asset_status_index');
        });
    }
};
