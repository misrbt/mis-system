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
        // Add indexes to asset_movements table for better query performance
        Schema::table('asset_movements', function (Blueprint $table) {
            $table->index('movement_type', 'idx_asset_movements_movement_type');
            $table->index('movement_date', 'idx_asset_movements_movement_date');
            $table->index('from_employee_id', 'idx_asset_movements_from_employee');
            $table->index('to_employee_id', 'idx_asset_movements_to_employee');
        });

        // Add indexes to assets table for better query performance
        Schema::table('assets', function (Blueprint $table) {
            $table->index('purchase_date', 'idx_assets_purchase_date');
        });

        // Add indexes to repairs table for better query performance
        Schema::table('repairs', function (Blueprint $table) {
            $table->index('repair_date', 'idx_repairs_repair_date');
            $table->index('vendor_id', 'idx_repairs_vendor_id');
            $table->index('status', 'idx_repairs_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from asset_movements table
        Schema::table('asset_movements', function (Blueprint $table) {
            $table->dropIndex('idx_asset_movements_movement_type');
            $table->dropIndex('idx_asset_movements_movement_date');
            $table->dropIndex('idx_asset_movements_from_employee');
            $table->dropIndex('idx_asset_movements_to_employee');
        });

        // Drop indexes from assets table
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('idx_assets_purchase_date');
        });

        // Drop indexes from repairs table
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropIndex('idx_repairs_repair_date');
            $table->dropIndex('idx_repairs_vendor_id');
            $table->dropIndex('idx_repairs_status');
        });
    }
};
