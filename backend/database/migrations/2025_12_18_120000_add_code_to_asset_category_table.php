<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asset_category', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->unique()->after('name');
        });

        // Backfill existing categories with generated codes to avoid nulls
        $categories = DB::table('asset_category')->orderBy('id')->get();
        $prefixCounts = [];

        foreach ($categories as $category) {
            $name = trim($category->name ?? '');
            $initials = '';

            if ($name !== '') {
                $words = preg_split('/\s+/', $name);
                foreach ($words as $word) {
                    $initials .= mb_substr($word, 0, 1);
                }
            }

            $prefix = strtoupper($initials !== '' ? $initials : 'CAT');
            $prefix = mb_substr($prefix, 0, 4);

            if (!array_key_exists($prefix, $prefixCounts)) {
                $prefixCounts[$prefix] = 0;
            }

            $prefixCounts[$prefix]++;
            $code = sprintf('%s-%03d', $prefix, $prefixCounts[$prefix]);

            DB::table('asset_category')
                ->where('id', $category->id)
                ->update(['code' => $code]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_category', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
