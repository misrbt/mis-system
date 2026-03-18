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
            // Add workstation foreign keys
            $table->unsignedBigInteger('workstation_branch_id')->nullable()->after('branch_id');
            $table->unsignedBigInteger('workstation_position_id')->nullable()->after('workstation_branch_id');

            // Add foreign key constraints
            $table->foreign('workstation_branch_id')
                ->references('id')
                ->on('branch')
                ->onDelete('set null');

            $table->foreign('workstation_position_id')
                ->references('id')
                ->on('position')
                ->onDelete('set null');

            // Add index for common queries
            $table->index(['workstation_branch_id', 'workstation_position_id'], 'idx_workstation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['workstation_branch_id']);
            $table->dropForeign(['workstation_position_id']);
            $table->dropIndex('idx_workstation');
            $table->dropColumn(['workstation_branch_id', 'workstation_position_id']);
        });
    }
};
