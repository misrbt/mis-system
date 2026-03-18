<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Auto-creates workstations from existing workstation_branch_id + workstation_position_id
     * combinations and links assets to their new workstation_id.
     */
    public function up(): void
    {
        // Find all unique workstation combinations from assets
        $workstationCombinations = DB::table('assets')
            ->whereNotNull('workstation_branch_id')
            ->whereNotNull('workstation_position_id')
            ->select('workstation_branch_id', 'workstation_position_id')
            ->distinct()
            ->get();

        foreach ($workstationCombinations as $combo) {
            // Get branch and position names for the workstation name
            $branch = DB::table('branch')->find($combo->workstation_branch_id);
            $position = DB::table('position')->find($combo->workstation_position_id);

            if (! $branch) {
                continue;
            }

            $branchName = $branch->branch_name ?? 'Unknown Branch';
            $positionName = $position->title ?? 'General';
            $workstationName = "{$branchName} - {$positionName}";

            // Create the workstation
            $workstationId = DB::table('workstations')->insertGetId([
                'branch_id' => $combo->workstation_branch_id,
                'position_id' => $combo->workstation_position_id,
                'name' => $workstationName,
                'description' => 'Auto-migrated from legacy workstation fields',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update all assets that match this combination
            DB::table('assets')
                ->where('workstation_branch_id', $combo->workstation_branch_id)
                ->where('workstation_position_id', $combo->workstation_position_id)
                ->update(['workstation_id' => $workstationId]);

            // Also create employee_workstation assignments for employees currently assigned
            // to assets at this workstation
            $employeeIds = DB::table('assets')
                ->where('workstation_id', $workstationId)
                ->whereNotNull('assigned_to_employee_id')
                ->pluck('assigned_to_employee_id')
                ->unique();

            foreach ($employeeIds as $employeeId) {
                // Check if assignment already exists
                $exists = DB::table('employee_workstation')
                    ->where('employee_id', $employeeId)
                    ->where('workstation_id', $workstationId)
                    ->exists();

                if (! $exists) {
                    DB::table('employee_workstation')->insert([
                        'employee_id' => $employeeId,
                        'workstation_id' => $workstationId,
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear workstation_id from assets (data will remain in legacy fields)
        DB::table('assets')->update(['workstation_id' => null]);

        // Remove employee_workstation assignments created during migration
        DB::table('employee_workstation')->truncate();

        // Remove auto-created workstations
        DB::table('workstations')
            ->where('description', 'Auto-migrated from legacy workstation fields')
            ->delete();
    }
};
