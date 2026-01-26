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
        Schema::create('asset_subcategories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraint
            $table->foreign('category_id')
                  ->references('id')
                  ->on('asset_category')
                  ->onDelete('restrict'); // Prevent deletion if subcategories exist

            // Unique constraint: name must be unique within the same category
            $table->unique(['category_id', 'name'], 'unique_subcategory_per_category');

            // Index for performance
            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_subcategories');
    }
};
