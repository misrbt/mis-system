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
        Schema::create('repairs', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('restrict');

            // Repair Details
            $table->text('description'); // Repair description/notes
            $table->string('technician_name'); // Technician/contact person at vendor
            $table->string('technician_contact')->nullable(); // Optional contact info

            // Dates
            $table->date('repair_date'); // Date when sent for repair
            $table->date('expected_return_date');
            $table->date('actual_return_date')->nullable();

            // Financial
            $table->decimal('repair_cost', 10, 2)->nullable(); // 10 digits, 2 decimal places

            // Status
            $table->enum('status', ['Pending', 'In Repair', 'Completed', 'Returned'])->default('Pending');

            // Additional Notes
            $table->text('remarks')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index('asset_id');
            $table->index('vendor_id');
            $table->index('status');
            $table->index('repair_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repairs');
    }
};
