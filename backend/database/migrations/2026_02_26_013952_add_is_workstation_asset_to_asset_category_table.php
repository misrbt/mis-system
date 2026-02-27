<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asset_category', function (Blueprint $table) {
            // Add flag to distinguish workstation-based vs portable assets
            // true = stays at workstation (Desktop PC, Monitor, etc.)
            // false = follows employee (Laptops)
            $table->boolean('is_workstation_asset')->default(true)->after('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_category', function (Blueprint $table) {
            $table->dropColumn('is_workstation_asset');
        });
    }
};
