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
        // Backfill initial "created" movements for all existing assets
        // Using jsonb_build_object for PostgreSQL
        DB::statement("
            INSERT INTO asset_movements (
                asset_id,
                movement_type,
                to_status_id,
                to_employee_id,
                to_branch_id,
                movement_date,
                remarks,
                metadata,
                created_at,
                updated_at
            )
            SELECT
                a.id as asset_id,
                'created' as movement_type,
                a.status_id as to_status_id,
                a.assigned_to_employee_id as to_employee_id,
                e.branch_id as to_branch_id,
                COALESCE(a.created_at, NOW()) as movement_date,
                'Backfilled movement record for existing asset' as remarks,
                jsonb_build_object('backfilled', true, 'original_created_at', a.created_at::text) as metadata,
                NOW() as created_at,
                NOW() as updated_at
            FROM assets a
            LEFT JOIN employee e ON a.assigned_to_employee_id = e.id
            WHERE NOT EXISTS (
                SELECT 1 FROM asset_movements am
                WHERE am.asset_id = a.id
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove backfilled records
        // Using PostgreSQL JSON operator
        DB::statement("
            DELETE FROM asset_movements
            WHERE metadata->>'backfilled' = 'true'
        ");
    }
};
