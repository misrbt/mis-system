<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branch', function (Blueprint $table) {
            $table->boolean('has_obo')->default(false)->after('brcode');
            $table->string('obo_name')->nullable()->after('has_obo');
        });
    }

    public function down(): void
    {
        Schema::table('branch', function (Blueprint $table) {
            $table->dropColumn(['has_obo', 'obo_name']);
        });
    }
};
