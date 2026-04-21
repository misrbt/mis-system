<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_workstation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employee')->cascadeOnDelete();
            $table->foreignId('workstation_id')->constrained('workstations')->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['employee_id', 'workstation_id']);
            $table->index('workstation_id');
        });

        // Seed pivot from existing employee_id column on workstations
        $assignments = DB::table('workstations')
            ->whereNotNull('employee_id')
            ->get(['id', 'employee_id']);

        foreach ($assignments as $row) {
            DB::table('employee_workstation')->insertOrIgnore([
                'employee_id' => $row->employee_id,
                'workstation_id' => $row->id,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_workstation');
    }
};
