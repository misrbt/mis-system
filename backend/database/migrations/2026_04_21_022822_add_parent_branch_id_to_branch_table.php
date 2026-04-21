<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branch', function (Blueprint $table) {
            $table->foreignId('parent_branch_id')->nullable()->constrained('branch')->nullOnDelete();
        });

        // Set parent relationships for BLU branches
        $parents = [
            '06' => '01', // Gingoog BLU  → Main Office
            '07' => '01', // Camiguin BLU → Main Office
            '08' => '01', // Butuan BLU   → Main Office
            '09' => '05', // Kibawe BLU   → Maramag Branch
            '10' => '02', // Claveria BLU → Jasaan Branch
        ];

        foreach ($parents as $bluBrcode => $parentBrcode) {
            $parentId = DB::table('branch')->where('brcode', $parentBrcode)->value('id');
            if ($parentId) {
                DB::table('branch')->where('brcode', $bluBrcode)->update(['parent_branch_id' => $parentId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('branch', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_branch_id');
        });
    }
};
