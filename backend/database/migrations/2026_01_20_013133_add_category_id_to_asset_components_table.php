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
            // Make component_type nullable since we're transitioning to category_id
            $table->string('component_type')->nullable()->change();

            // Add category_id column
            $table->unsignedBigInteger('category_id')->nullable()->after('parent_asset_id');

            // Add foreign key constraint
            $table->foreign('category_id')
                  ->references('id')
                  ->on('asset_category')
                  ->onDelete('restrict');

            // Add index for performance
            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_components', function (Blueprint $table) {
            // Drop foreign key and column
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');

            // Revert component_type back to non-nullable enum
            // Note: This assumes you want to revert to the original state
            $table->dropColumn('component_type');
        });

        // Re-add component_type as enum
        Schema::table('asset_components', function (Blueprint $table) {
            $table->enum('component_type', [
                'system_unit',
                'monitor',
                'keyboard_mouse',
                'other'
            ])->after('parent_asset_id')->comment('Type of component');
        });
    }
};
