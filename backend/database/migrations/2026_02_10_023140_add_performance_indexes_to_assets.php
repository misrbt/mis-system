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
            // Foreign key indexes for common joins
            $table->index('vendor_id', 'assets_vendor_id_index');
            $table->index('assigned_to_employee_id', 'assets_assigned_to_employee_id_index');

            // Search and filter indexes
            $table->index('asset_name', 'assets_asset_name_index');
            $table->index('serial_number', 'assets_serial_number_index');

            // Compound indexes for common multi-column filters
            $table->index(['asset_category_id', 'status_id'], 'assets_category_status_index');
            $table->index(['assigned_to_employee_id', 'asset_category_id'], 'assets_employee_category_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('assets_vendor_id_index');
            $table->dropIndex('assets_assigned_to_employee_id_index');
            $table->dropIndex('assets_asset_name_index');
            $table->dropIndex('assets_serial_number_index');
            $table->dropIndex('assets_category_status_index');
            $table->dropIndex('assets_employee_category_index');
        });
    }
};
