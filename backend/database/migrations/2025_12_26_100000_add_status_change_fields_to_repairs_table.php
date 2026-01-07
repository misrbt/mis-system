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
            // Fields for "Completed" status
            $table->string('invoice_no')->nullable()->after('repair_cost');
            $table->text('completion_description')->nullable()->after('invoice_no');
            $table->string('job_order_path')->nullable()->after('completion_description');

            // Fields for "In Repair" status
            $table->enum('delivered_by_type', ['employee', 'branch'])->nullable()->after('job_order_path');
            $table->foreignId('delivered_by_employee_id')->nullable()->after('delivered_by_type')->constrained('employee')->onDelete('set null');
            $table->foreignId('delivered_by_branch_id')->nullable()->after('delivered_by_employee_id')->constrained('branches')->onDelete('set null');

            // Add indexes
            $table->index('delivered_by_employee_id');
            $table->index('delivered_by_branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropForeign(['delivered_by_employee_id']);
            if (Schema::hasColumn('repairs', 'delivered_by_branch_id')) {
                $table->dropForeign(['delivered_by_branch_id']);
            }
            $table->dropColumn([
                'invoice_no',
                'completion_description',
                'job_order_path',
                'delivered_by_type',
                'delivered_by_employee_id',
                'delivered_by_branch_id',
            ]);
        });
    }
};
