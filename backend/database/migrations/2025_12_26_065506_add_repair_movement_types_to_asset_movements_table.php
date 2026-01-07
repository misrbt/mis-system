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
        // Drop the existing check constraint
        DB::statement('ALTER TABLE asset_movements DROP CONSTRAINT IF EXISTS asset_movements_movement_type_check');

        // Create a new check constraint with all movement types including the new ones
        DB::statement("
            ALTER TABLE asset_movements
            ADD CONSTRAINT asset_movements_movement_type_check
            CHECK (movement_type::text = ANY (ARRAY[
                'created'::text,
                'assigned'::text,
                'transferred'::text,
                'returned'::text,
                'status_changed'::text,
                'repair_initiated'::text,
                'repair_completed'::text,
                'repair_deleted'::text,
                'updated'::text,
                'disposed'::text,
                'code_generated'::text,
                'inventory_operation'::text,
                'repair_in_progress'::text,
                'repair_returned'::text,
                'repair_status_changed'::text,
                'repair_updated'::text,
                'repair_remark_added'::text
            ]))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the updated constraint
        DB::statement('ALTER TABLE asset_movements DROP CONSTRAINT IF EXISTS asset_movements_movement_type_check');

        // Restore the original constraint without the new repair types
        DB::statement("
            ALTER TABLE asset_movements
            ADD CONSTRAINT asset_movements_movement_type_check
            CHECK (movement_type::text = ANY (ARRAY[
                'created'::text,
                'assigned'::text,
                'transferred'::text,
                'returned'::text,
                'status_changed'::text,
                'repair_initiated'::text,
                'repair_completed'::text,
                'repair_deleted'::text,
                'updated'::text,
                'disposed'::text,
                'code_generated'::text,
                'inventory_operation'::text
            ]))
        ");
    }
};
