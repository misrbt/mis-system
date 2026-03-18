<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\Employee;
use App\Models\Replenishment;
use App\Models\Workstation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateEmployeeAssignmentsToWorkstations extends Command
{
    protected $signature = 'migrate:to-workstations {--dry-run : Show what would be done without making changes} {--force : Skip confirmation}';

    protected $description = 'Migrate employee-based asset assignments to workstation-based assignments. Creates workstations for each employee and reassigns their assets.';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $this->info('=== Employee → Workstation Migration ===');
        $this->newLine();

        // 1. Check if workstations table exists
        if (! Schema::hasTable('workstations')) {
            $this->error('Workstations table does not exist. Run migrations first: php artisan migrate');

            return Command::FAILURE;
        }

        // Check if assets table has workstation columns
        if (! Schema::hasColumn('assets', 'workstation_id')) {
            $this->error('Assets table missing workstation_id column. Run migrations first.');

            return Command::FAILURE;
        }

        // 2. Gather data
        $employeesWithAssets = Employee::whereHas('assignedAssets')
            ->with(['branch', 'position', 'assignedAssets'])
            ->get();

        $allEmployees = Employee::with(['branch', 'position'])->get();

        $assetsWithEmployee = Asset::whereNotNull('assigned_to_employee_id')
            ->whereNull('workstation_id')
            ->count();

        $existingWorkstations = Workstation::count();

        $this->info("Existing workstations: {$existingWorkstations}");
        $this->info("Employees with assets (direct assignment): {$employeesWithAssets->count()}");
        $this->info("Assets needing migration: {$assetsWithEmployee}");
        $this->info("Total employees: {$allEmployees->count()}");
        $this->newLine();

        if ($assetsWithEmployee === 0 && $existingWorkstations > 0) {
            $this->info('No assets need migration — all assets are already on workstations or unassigned.');

            return Command::SUCCESS;
        }

        // 3. Show migration plan
        $this->info('Migration Plan:');
        $this->table(
            ['Employee', 'Branch', 'Position', 'Assets', 'Workstation'],
            $employeesWithAssets->map(function ($emp) {
                $branchName = $emp->branch?->branch_name ?? 'No Branch';
                $positionName = $emp->position?->title ?? 'No Position';
                $wsName = "{$branchName} - {$positionName}";
                $existing = Workstation::where('employee_id', $emp->id)->first();

                return [
                    $emp->fullname,
                    $branchName,
                    $positionName,
                    $emp->assignedAssets->count(),
                    $existing ? "EXISTS (ID:{$existing->id})" : "CREATE: {$wsName}",
                ];
            })
        );

        if ($dryRun) {
            $this->warn('DRY RUN — No changes made.');

            return Command::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('Proceed with migration?')) {
            $this->info('Cancelled.');

            return Command::SUCCESS;
        }

        // 4. Execute migration
        DB::beginTransaction();

        try {
            $workstationsCreated = 0;
            $employeesAssigned = 0;
            $assetsMigrated = 0;
            $replenishmentsMigrated = 0;

            // Step A: Create workstations for ALL employees (not just those with assets)
            $this->info('Creating workstations for all employees...');
            $bar = $this->output->createProgressBar($allEmployees->count());

            foreach ($allEmployees as $employee) {
                // Check if employee already has a workstation
                $workstation = Workstation::where('employee_id', $employee->id)->first();

                if (! $workstation) {
                    // Create workstation
                    $branchName = $employee->branch?->branch_name ?? 'Unknown';
                    $positionName = $employee->position?->title ?? 'Unknown';

                    $workstation = Workstation::create([
                        'name' => "{$branchName} - {$positionName}",
                        'branch_id' => $employee->branch_id,
                        'position_id' => $employee->position_id,
                        'employee_id' => $employee->id,
                        'is_active' => true,
                    ]);

                    $workstationsCreated++;
                    $employeesAssigned++;
                } elseif (! $workstation->employee_id) {
                    // Workstation exists but no employee — assign
                    $workstation->update(['employee_id' => $employee->id]);
                    $employeesAssigned++;
                }

                // Step B: Migrate this employee's assets to the workstation
                $migratedCount = Asset::where('assigned_to_employee_id', $employee->id)
                    ->whereNull('workstation_id')
                    ->update([
                        'workstation_id' => $workstation->id,
                        'workstation_branch_id' => $workstation->branch_id,
                        'workstation_position_id' => $workstation->position_id,
                        'assigned_to_employee_id' => null, // Clear direct assignment
                    ]);

                $assetsMigrated += $migratedCount;

                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);

            // Step C: Migrate replenishments if they have assigned_to_employee_id
            if (Schema::hasColumn('replenishments', 'assigned_to_workstation_id')) {
                $replenishments = Replenishment::whereNotNull('assigned_to_employee_id')
                    ->whereNull('assigned_to_workstation_id')
                    ->get();

                foreach ($replenishments as $replenishment) {
                    $workstation = Workstation::where('employee_id', $replenishment->assigned_to_employee_id)->first();
                    if ($workstation) {
                        $replenishment->update([
                            'assigned_to_workstation_id' => $workstation->id,
                            'assigned_to_employee_id' => null,
                        ]);
                        $replenishmentsMigrated++;
                    }
                }
            }

            DB::commit();

            $this->newLine();
            $this->info('=== Migration Complete ===');
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Workstations created', $workstationsCreated],
                    ['Employees assigned to workstations', $employeesAssigned],
                    ['Assets migrated to workstations', $assetsMigrated],
                    ['Replenishments migrated', $replenishmentsMigrated],
                ]
            );

            // Verify
            $remainingDirect = Asset::whereNotNull('assigned_to_employee_id')->count();
            if ($remainingDirect > 0) {
                $this->warn("{$remainingDirect} assets still have direct employee assignment (may have both workstation and employee).");
            } else {
                $this->info('All assets successfully migrated to workstation-based assignment.');
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Migration failed: '.$e->getMessage());
            $this->error('All changes have been rolled back.');

            return Command::FAILURE;
        }
    }
}
