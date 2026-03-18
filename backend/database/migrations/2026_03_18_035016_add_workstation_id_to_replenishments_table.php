<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('replenishments', function (Blueprint $table) {
            $table->foreignId('assigned_to_workstation_id')
                ->nullable()
                ->after('assigned_to_branch_id')
                ->constrained('workstations')
                ->nullOnDelete();
        });

        // Migrate existing employee assignments to workstation assignments
        $replenishments = DB::table('replenishments')->whereNotNull('assigned_to_employee_id')->get();
        foreach ($replenishments as $replenishment) {
            $workstation = DB::table('workstations')
                ->where('employee_id', $replenishment->assigned_to_employee_id)
                ->first();
            if ($workstation) {
                DB::table('replenishments')
                    ->where('id', $replenishment->id)
                    ->update([
                        'assigned_to_workstation_id' => $workstation->id,
                        'assigned_to_employee_id' => null,
                    ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('replenishments', function (Blueprint $table) {
            $table->dropForeign(['assigned_to_workstation_id']);
            $table->dropColumn('assigned_to_workstation_id');
        });
    }
};
