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
        Schema::table('software_licenses', function (Blueprint $table) {
            // Remove the old office_tools string column
            $table->dropColumn('office_tools');
        });

        Schema::table('software_licenses', function (Blueprint $table) {
            // Add new office_tool_id foreign key column
            $table->foreignId('office_tool_id')->nullable()->after('operating_system')->constrained('office_tools')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('software_licenses', function (Blueprint $table) {
            $table->dropForeign(['office_tool_id']);
            $table->dropColumn('office_tool_id');
        });

        Schema::table('software_licenses', function (Blueprint $table) {
            $table->string('office_tools')->nullable();
        });
    }
};
