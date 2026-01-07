<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to drop the existing check constraint and recreate it
        // First, find and drop the existing check constraint
        $tableName = 'asset_movements';
        $columnName = 'movement_type';

        // Get the constraint name
        $constraintName = DB::selectOne(
            "SELECT constraint_name
             FROM information_schema.constraint_column_usage
             WHERE table_name = ? AND column_name = ?",
            [$tableName, $columnName]
        )?->constraint_name;

        // Drop the old constraint if it exists
        if ($constraintName) {
            DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT {$constraintName}");
        }

        // Add new check constraint with all movement types
        DB::statement("ALTER TABLE {$tableName} ADD CONSTRAINT {$tableName}_{$columnName}_check
            CHECK ({$columnName}::text = ANY (ARRAY[
                'created'::character varying,
                'assigned'::character varying,
                'transferred'::character varying,
                'returned'::character varying,
                'status_changed'::character varying,
                'repair_initiated'::character varying,
                'repair_completed'::character varying,
                'repair_deleted'::character varying,
                'updated'::character varying,
                'disposed'::character varying,
                'code_generated'::character varying,
                'inventory_operation'::character varying
            ]::text[]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableName = 'asset_movements';
        $columnName = 'movement_type';

        // Drop the new constraint
        DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT IF EXISTS {$tableName}_{$columnName}_check");

        // Recreate the original constraint
        DB::statement("ALTER TABLE {$tableName} ADD CONSTRAINT {$tableName}_{$columnName}_check
            CHECK ({$columnName}::text = ANY (ARRAY[
                'created'::character varying,
                'assigned'::character varying,
                'transferred'::character varying,
                'returned'::character varying,
                'status_changed'::character varying,
                'repair_initiated'::character varying,
                'repair_completed'::character varying,
                'updated'::character varying,
                'disposed'::character varying
            ]::text[]))");
    }
};
