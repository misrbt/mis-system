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
        Schema::table('equipment', function (Blueprint $table) {
            $table->unsignedBigInteger('asset_category_id')->nullable()->after('id');
            $table->unsignedBigInteger('subcategory_id')->nullable()->after('asset_category_id');

            $table->foreign('asset_category_id')
                ->references('id')
                ->on('asset_category')
                ->restrictOnDelete();

            $table->foreign('subcategory_id')
                ->references('id')
                ->on('asset_subcategories')
                ->restrictOnDelete();

            $table->index('asset_category_id');
            $table->index('subcategory_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropForeign(['asset_category_id']);
            $table->dropForeign(['subcategory_id']);
            $table->dropIndex(['asset_category_id']);
            $table->dropIndex(['subcategory_id']);
            $table->dropColumn(['asset_category_id', 'subcategory_id']);
        });
    }
};
