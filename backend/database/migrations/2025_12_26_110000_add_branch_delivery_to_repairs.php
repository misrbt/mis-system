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
        Schema::table('repairs', function (Blueprint $table) {
            // Add delivered_by_type and delivered_by_branch_id
            $table->enum('delivered_by_type', ['employee', 'branch'])->nullable()->after('job_order_path');
            $table->foreignId('delivered_by_branch_id')->nullable()->after('delivered_by_employee_id')->constrained('branch')->onDelete('set null');

            // Add index
            $table->index('delivered_by_branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropForeign(['delivered_by_branch_id']);
            $table->dropColumn(['delivered_by_type', 'delivered_by_branch_id']);
        });
    }
};
