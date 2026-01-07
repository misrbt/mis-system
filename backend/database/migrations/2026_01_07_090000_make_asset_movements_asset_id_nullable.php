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
        // Inventory audit logs don't always map to a specific asset.
        DB::statement('ALTER TABLE asset_movements ALTER COLUMN asset_id DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE asset_movements ALTER COLUMN asset_id SET NOT NULL');
    }
};
