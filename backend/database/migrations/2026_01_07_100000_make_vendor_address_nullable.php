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
        DB::statement('ALTER TABLE vendors ALTER COLUMN address DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE vendors SET address = '' WHERE address IS NULL");
        DB::statement('ALTER TABLE vendors ALTER COLUMN address SET NOT NULL');
    }
};
