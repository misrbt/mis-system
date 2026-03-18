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
        // Add index on assets.waranty_expiration_date for warranty queries
        Schema::table('assets', function (Blueprint $table) {
            $table->index('waranty_expiration_date', 'idx_assets_warranty_expiration');
        });

        // Add composite index on assets(purchase_date, book_value) for aggregations
        Schema::table('assets', function (Blueprint $table) {
            $table->index(['purchase_date', 'book_value'], 'idx_assets_purchase_book');
        });

        // Add composite index on assets(status_id, assigned_to_employee_id)
        Schema::table('assets', function (Blueprint $table) {
            $table->index(['status_id', 'assigned_to_employee_id'], 'idx_assets_status_employee');
        });

        // Add composite index on repairs(repair_date, repair_cost) for expense calculations
        Schema::table('repairs', function (Blueprint $table) {
            $table->index(['repair_date', 'repair_cost'], 'idx_repairs_date_cost');
        });

        // Add composite index on asset_movements(movement_type, movement_date) for trending
        Schema::table('asset_movements', function (Blueprint $table) {
            $table->index(['movement_type', 'movement_date'], 'idx_movements_type_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('idx_assets_warranty_expiration');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('idx_assets_purchase_book');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('idx_assets_status_employee');
        });

        Schema::table('repairs', function (Blueprint $table) {
            $table->dropIndex('idx_repairs_date_cost');
        });

        Schema::table('asset_movements', function (Blueprint $table) {
            $table->dropIndex('idx_movements_type_date');
        });
    }
};
