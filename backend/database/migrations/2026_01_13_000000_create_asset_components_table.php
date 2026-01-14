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
        Schema::create('asset_components', function (Blueprint $table) {
            $table->id();

            // Parent Asset Reference
            $table->foreignId('parent_asset_id')
                ->constrained('assets')
                ->onDelete('cascade')
                ->comment('References the parent Desktop PC asset');

            // Component Information
            $table->enum('component_type', [
                'system_unit',
                'monitor',
                'keyboard_mouse',
                'other'
            ])->comment('Type of component');

            $table->string('component_name')
                ->comment('Descriptive name for the component');

            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable()->unique();

            // QR Code & Barcode (following asset table pattern)
            $table->text('qr_code')->nullable()
                ->comment('Base64 encoded SVG QR code');
            $table->text('barcode')->nullable()
                ->comment('Base64 encoded SVG barcode');

            // Financial Information (optional - can track component-level costs)
            $table->float('acq_cost')->nullable()
                ->comment('Component acquisition cost if tracked separately');

            // Status & Assignment (independent from parent)
            $table->foreignId('status_id')
                ->constrained('status')
                ->comment('Component status (can differ from parent asset)');

            $table->foreignId('assigned_to_employee_id')->nullable()
                ->constrained('employee')
                ->onDelete('set null')
                ->comment('Employee assigned to this component (can differ from parent)');

            // Additional Fields
            $table->text('remarks')->nullable();

            // Audit Fields
            $table->timestamps();
            $table->softDeletes(); // For data integrity

            // Indexes for performance
            $table->index('parent_asset_id');
            $table->index('component_type');
            $table->index('status_id');
            $table->index('assigned_to_employee_id');
            $table->index('serial_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_components');
    }
};
