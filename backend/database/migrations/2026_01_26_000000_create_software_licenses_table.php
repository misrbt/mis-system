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
        Schema::create('software_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained('employee')->onDelete('set null');
            $table->foreignId('position_id')->nullable()->constrained('position')->onDelete('set null');
            $table->foreignId('section_id')->nullable()->constrained('section')->onDelete('set null');
            $table->foreignId('branch_id')->nullable()->constrained('branch')->onDelete('set null');
            $table->foreignId('asset_category_id')->nullable()->constrained('asset_category')->onDelete('set null');
            $table->string('operating_system')->nullable();
            $table->string('licensed')->nullable(); // License key or license type
            $table->string('office_tools')->nullable();
            $table->string('client_access')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('software_licenses');
    }
};
