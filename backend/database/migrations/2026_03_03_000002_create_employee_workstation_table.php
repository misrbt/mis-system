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
        Schema::create('employee_workstation', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('workstation_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('employee_id')
                ->references('id')
                ->on('employee')
                ->onDelete('cascade');

            $table->foreign('workstation_id')
                ->references('id')
                ->on('workstations')
                ->onDelete('cascade');

            // Unique constraint to prevent duplicate assignments
            $table->unique(['employee_id', 'workstation_id'], 'unique_employee_workstation');

            // Indexes for common queries
            $table->index('employee_id', 'idx_ew_employee');
            $table->index('workstation_id', 'idx_ew_workstation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_workstation');
    }
};
