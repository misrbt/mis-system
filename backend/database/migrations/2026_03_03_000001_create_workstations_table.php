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
        Schema::create('workstations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('position_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('branch_id')
                ->references('id')
                ->on('branch')
                ->onDelete('cascade');

            $table->foreign('position_id')
                ->references('id')
                ->on('position')
                ->onDelete('set null');

            // Indexes for common queries
            $table->index('branch_id', 'idx_workstations_branch');
            $table->index('position_id', 'idx_workstations_position');
            $table->index('is_active', 'idx_workstations_active');
            $table->index(['branch_id', 'position_id'], 'idx_workstations_branch_position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workstations');
    }
};
