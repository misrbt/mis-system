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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_name');
            $table->foreignId('asset_category_id')->constrained('asset_category');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->float('book_value')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->float('acq_cost')->nullable();
            $table->date('waranty_expiration_date')->nullable();
            $table->unsignedInteger('estimate_life')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors');
            $table->foreignId('status_id')->constrained('status');
            $table->text('remarks')->nullable();
            $table->foreignId('assigned_to_employee_id')->nullable()->constrained('employee');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
