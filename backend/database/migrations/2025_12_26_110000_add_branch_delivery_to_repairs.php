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
        if (!Schema::hasColumn('repairs', 'delivered_by_type')) {
            Schema::table('repairs', function (Blueprint $table) {
                $table->enum('delivered_by_type', ['employee', 'branch'])->nullable()->after('job_order_path');
            });
        }

        if (!Schema::hasColumn('repairs', 'delivered_by_branch_id')) {
            Schema::table('repairs', function (Blueprint $table) {
                $table->foreignId('delivered_by_branch_id')->nullable()->after('delivered_by_employee_id')->constrained('branch')->onDelete('set null');
                $table->index('delivered_by_branch_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            if (Schema::hasColumn('repairs', 'delivered_by_branch_id')) {
                $table->dropForeign(['delivered_by_branch_id']);
                $table->dropColumn('delivered_by_branch_id');
            }
            if (Schema::hasColumn('repairs', 'delivered_by_type')) {
                $table->dropColumn('delivered_by_type');
            }
        });
    }
};
