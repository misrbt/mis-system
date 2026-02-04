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
        Schema::table('replenishments', function (Blueprint $table) {
            $table->date('warranty_expiration_date')->nullable()->after('purchase_date');
            $table->integer('estimate_life')->nullable()->after('warranty_expiration_date');
            $table->decimal('book_value', 15, 2)->nullable()->after('acq_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('replenishments', function (Blueprint $table) {
            $table->dropColumn(['warranty_expiration_date', 'estimate_life', 'book_value']);
        });
    }
};
