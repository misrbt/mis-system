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
        Schema::table('asset_components', function (Blueprint $table) {
            // Add subcategory reference (optional)
            $table->foreignId('subcategory_id')->nullable()
                ->after('category_id')
                ->constrained('asset_subcategories')
                ->onDelete('set null')
                ->comment('Component subcategory');

            // Add purchase date (optional)
            $table->date('purchase_date')->nullable()
                ->after('serial_number')
                ->comment('Component purchase date');

            // Add specifications as JSON field (optional)
            $table->json('specifications')->nullable()
                ->after('purchase_date')
                ->comment('Component specifications (JSON)');

            // Add vendor reference (optional)
            $table->foreignId('vendor_id')->nullable()
                ->after('acq_cost')
                ->constrained('vendors')
                ->onDelete('set null')
                ->comment('Component vendor');

            // Add indexes for performance
            $table->index('subcategory_id');
            $table->index('vendor_id');
            $table->index('purchase_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_components', function (Blueprint $table) {
            // Drop foreign keys and indexes
            $table->dropForeign(['subcategory_id']);
            $table->dropForeign(['vendor_id']);
            $table->dropIndex(['subcategory_id']);
            $table->dropIndex(['vendor_id']);
            $table->dropIndex(['purchase_date']);

            // Drop columns
            $table->dropColumn([
                'subcategory_id',
                'purchase_date',
                'specifications',
                'vendor_id'
            ]);
        });
    }
};
