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
        Schema::table('employee', function (Blueprint $table) {
            // Foreign key indexes for common joins
            $table->index('branch_id', 'employee_branch_id_index');
            $table->index('position_id', 'employee_position_id_index');
            $table->index('department_id', 'employee_department_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee', function (Blueprint $table) {
            $table->dropIndex('employee_branch_id_index');
            $table->dropIndex('employee_position_id_index');
            $table->dropIndex('employee_department_id_index');
        });
    }
};
