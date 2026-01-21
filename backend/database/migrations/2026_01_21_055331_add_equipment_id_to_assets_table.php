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
            // Add equipment_id foreign key
            $table->foreignId('equipment_id')->nullable()
                ->after('category_id')
                ->constrained('equipment')
                ->onDelete('restrict')
                ->comment('Equipment (brand/model) reference');

            // Add index for performance
            $table->index('equipment_id');

            // Remove brand and model columns
            $table->dropColumn(['brand', 'model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Drop foreign key and equipment_id column
            $table->dropForeign(['equipment_id']);
            $table->dropIndex(['equipment_id']);
            $table->dropColumn('equipment_id');

            // Re-add brand and model columns
            $table->string('brand')->nullable()->after('category_id');
            $table->string('model')->nullable()->after('brand');
        });
    }
};
