<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_approvers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                ->nullable()
                ->constrained('employee')
                ->nullOnDelete();
            $table->string('name', 150);
            $table->string('email', 190);
            $table->foreignId('branch_id')
                ->constrained('branch')
                ->cascadeOnDelete();
            $table->foreignId('obo_id')
                ->nullable()
                ->constrained('branch_obos')
                ->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['branch_id', 'obo_id'], 'ticket_approvers_branch_obo_unique');
            $table->index('is_active');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_approvers');
    }
};
