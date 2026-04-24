<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_form_fields', function (Blueprint $table) {
            $table->id();
            $table->string('label', 120);

            // Stable machine key used as the JSON keys on tickets.custom_fields.
            // Lower-snake, unique across the system.
            $table->string('field_key', 64)->unique();

            // MVP types: text, textarea, number, date, select, checkbox.
            $table->string('field_type', 20);

            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->string('placeholder', 200)->nullable();
            $table->text('help_text')->nullable();

            // For select type: [{value, label}, ...]
            $table->json('options')->nullable();

            // Optional scoping — field only applies when this category is
            // chosen. NULL = show for every category.
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')
                ->references('id')
                ->on('ticket_categories')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_form_fields');
    }
};
