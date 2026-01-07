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
        Schema::create('asset_movements', function (Blueprint $table) {
            $table->id();

            // Asset Reference
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');

            // Movement Type - what kind of change occurred
            $table->enum('movement_type', [
                'created',           // Asset first created
                'assigned',          // Assigned to employee
                'transferred',       // Transferred between employees
                'returned',          // Returned from employee (unassigned)
                'status_changed',    // Status updated (functional, under repair, etc)
                'repair_initiated',  // Sent for repair
                'repair_completed',  // Returned from repair
                'updated',           // General update (category, vendor, etc)
                'disposed',          // Asset disposed/retired
            ]);

            // From/To Fields (nullable for certain movement types)
            $table->foreignId('from_employee_id')->nullable()->constrained('employee')->onDelete('set null');
            $table->foreignId('to_employee_id')->nullable()->constrained('employee')->onDelete('set null');
            $table->foreignId('from_status_id')->nullable()->constrained('status')->onDelete('set null');
            $table->foreignId('to_status_id')->nullable()->constrained('status')->onDelete('set null');
            $table->foreignId('from_branch_id')->nullable()->constrained('branch')->onDelete('set null');
            $table->foreignId('to_branch_id')->nullable()->constrained('branch')->onDelete('set null');

            // Repair Reference (if movement related to repair)
            $table->foreignId('repair_id')->nullable()->constrained('repairs')->onDelete('set null');

            // Who Made the Change
            $table->foreignId('performed_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Change Details
            $table->text('reason')->nullable();        // Why the change was made
            $table->text('remarks')->nullable();       // Additional notes
            $table->json('metadata')->nullable();      // Store additional context (old/new values, etc)

            // Audit Trail
            $table->timestamp('movement_date');        // When the movement occurred
            $table->ipAddress('ip_address')->nullable(); // IP of user who made change
            $table->string('user_agent')->nullable();   // Browser/client info

            $table->timestamps();                      // created_at, updated_at
            $table->softDeletes();                     // Soft delete for tamper evidence

            // Indexes for performance
            $table->index('asset_id');
            $table->index('movement_type');
            $table->index('movement_date');
            $table->index(['asset_id', 'movement_date']);
            $table->index('from_employee_id');
            $table->index('to_employee_id');
            $table->index('to_status_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_movements');
    }
};
