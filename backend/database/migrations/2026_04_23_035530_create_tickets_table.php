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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            // Human-readable identifier (auto-generated in model, e.g. TKT-2026-000001)
            $table->string('ticket_number')->unique();

            // Core content
            $table->string('title');
            $table->text('description');

            // Classification
            $table->enum('category', [
                'Hardware',
                'Software',
                'Network',
                'Account',
                'Email',
                'Printer',
                'Peripherals',
                'Other',
            ])->default('Other');

            $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');

            $table->enum('status', [
                'Open',
                'In Progress',
                'Pending',
                'Resolved',
                'Closed',
                'Cancelled',
            ])->default('Open');

            // Who reported the concern (end user - always linked to Employee)
            $table->foreignId('requester_employee_id')
                ->constrained('employee')
                ->onDelete('restrict');

            // MIS staff member handling the ticket (optional until assigned)
            $table->foreignId('assigned_to_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // Who logged the ticket (MIS staff creating the record)
            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // Dates
            $table->date('due_date')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            // Resolution summary filled when status -> Resolved/Closed
            $table->text('resolution_summary')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes on filtered / sorted columns
            $table->index('status');
            $table->index('priority');
            $table->index('category');
            $table->index('assigned_to_user_id');
            $table->index('requester_employee_id');
            $table->index('due_date');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
