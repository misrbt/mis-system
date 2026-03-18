<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add employee_id column to workstations table
        Schema::table('workstations', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->after('position_id')->constrained('employee')->nullOnDelete();
        });

        // Migrate data from pivot table to workstations.employee_id
        // Take the first employee if multiple are assigned
        $assignments = DB::table('employee_workstation')
            ->select('workstation_id', DB::raw('MIN(employee_id) as employee_id'))
            ->groupBy('workstation_id')
            ->get();

        foreach ($assignments as $assignment) {
            DB::table('workstations')
                ->where('id', $assignment->workstation_id)
                ->update(['employee_id' => $assignment->employee_id]);
        }

        // Drop the pivot table
        Schema::dropIfExists('employee_workstation');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate pivot table
        Schema::create('employee_workstation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employee')->cascadeOnDelete();
            $table->foreignId('workstation_id')->constrained('workstations')->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['employee_id', 'workstation_id']);
        });

        // Migrate data back to pivot table
        $workstations = DB::table('workstations')
            ->whereNotNull('employee_id')
            ->get(['id', 'employee_id']);

        foreach ($workstations as $workstation) {
            DB::table('employee_workstation')->insert([
                'employee_id' => $workstation->employee_id,
                'workstation_id' => $workstation->id,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Remove employee_id column from workstations
        Schema::table('workstations', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });
    }
};
