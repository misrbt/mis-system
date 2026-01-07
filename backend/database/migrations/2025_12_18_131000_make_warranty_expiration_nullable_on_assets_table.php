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
        // PostgreSQL: drop NOT NULL constraint to make the column optional
        DB::statement('ALTER TABLE assets ALTER COLUMN waranty_expiration_date DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep nullable to avoid failures if null values exist; no-op rollback
        DB::statement('ALTER TABLE assets ALTER COLUMN waranty_expiration_date DROP NOT NULL');
    }
};
