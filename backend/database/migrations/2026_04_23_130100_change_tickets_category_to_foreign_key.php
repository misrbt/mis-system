<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('category_id')
                ->nullable()
                ->after('description')
                ->constrained('ticket_categories')
                ->restrictOnDelete();
            $table->index('category_id');
        });

        // Backfill: map existing enum string values to category_id by name
        $categoryMap = DB::table('ticket_categories')->pluck('id', 'name');

        foreach ($categoryMap as $name => $id) {
            DB::table('tickets')
                ->where('category', $name)
                ->update(['category_id' => $id]);
        }

        // Any tickets that still have no mapping fall back to "Other"
        $otherId = $categoryMap['Other'] ?? null;
        if ($otherId) {
            DB::table('tickets')->whereNull('category_id')->update(['category_id' => $otherId]);
        }

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->enum('category', [
                'Hardware',
                'Software',
                'Network',
                'Account',
                'Email',
                'Printer',
                'Peripherals',
                'Other',
            ])->default('Other')->after('description');
            $table->index('category');
        });

        // Best-effort restore by name match
        $categoryMap = DB::table('ticket_categories')->pluck('name', 'id');
        foreach ($categoryMap as $id => $name) {
            $categoryName = in_array($name, ['Hardware', 'Software', 'Network', 'Account', 'Email', 'Printer', 'Peripherals', 'Other'], true)
                ? $name
                : 'Other';

            DB::table('tickets')
                ->where('category_id', $id)
                ->update(['category' => $categoryName]);
        }

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
