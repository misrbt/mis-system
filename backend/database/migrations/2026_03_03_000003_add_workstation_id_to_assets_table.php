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
            // Add new workstation_id foreign key
            $table->unsignedBigInteger('workstation_id')
                ->nullable()
                ->after('workstation_position_id');

            // Add foreign key constraint
            $table->foreign('workstation_id')
                ->references('id')
                ->on('workstations')
                ->onDelete('set null');

            // Add index for common queries
            $table->index('workstation_id', 'idx_assets_workstation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['workstation_id']);
            $table->dropIndex('idx_assets_workstation');
            $table->dropColumn('workstation_id');
        });
    }
};
