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
        Schema::create('replenishments', function (Blueprint $table) {
            $table->id();
            $table->string('asset_name');
            $table->string('serial_number')->nullable();
            $table->unsignedBigInteger('asset_category_id')->nullable();
            $table->unsignedBigInteger('subcategory_id')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->decimal('acq_cost', 15, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->unsignedBigInteger('status_id')->nullable();
            $table->unsignedBigInteger('assigned_to_employee_id')->nullable();
            $table->unsignedBigInteger('assigned_to_branch_id')->nullable();
            $table->text('remarks')->nullable();
            $table->json('specifications')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('replenishments');
    }
};
