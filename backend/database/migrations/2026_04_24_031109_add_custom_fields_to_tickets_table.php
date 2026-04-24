<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Snapshot of submitted values for configurable form fields.
            // Shape: { field_key: value, ... }
            $table->json('custom_fields')->nullable()->after('resolution_summary');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });
    }
};
