<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_obos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branch')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->index('branch_id');
        });

        Schema::table('branch', function (Blueprint $table) {
            $table->dropColumn('obo_name');
        });

        Schema::table('employee', function (Blueprint $table) {
            $table->dropColumn('assigned_to_obo');
            $table->foreignId('obo_id')->nullable()->after('branch_id')->constrained('branch_obos')->nullOnDelete();
        });

        Schema::table('workstations', function (Blueprint $table) {
            $table->dropColumn('assigned_to_obo');
            $table->foreignId('obo_id')->nullable()->after('branch_id')->constrained('branch_obos')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('workstations', function (Blueprint $table) {
            $table->dropForeign(['obo_id']);
            $table->dropColumn('obo_id');
            $table->boolean('assigned_to_obo')->default(false);
        });

        Schema::table('employee', function (Blueprint $table) {
            $table->dropForeign(['obo_id']);
            $table->dropColumn('obo_id');
            $table->boolean('assigned_to_obo')->default(false);
        });

        Schema::table('branch', function (Blueprint $table) {
            $table->string('obo_name')->nullable();
        });

        Schema::dropIfExists('branch_obos');
    }
};
