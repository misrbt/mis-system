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
        Schema::create('asset_component_movements', function (Blueprint $table) {
            $table->id();

            // Component Reference
            $table->foreignId('asset_component_id')
                ->constrained('asset_components')
                ->onDelete('cascade');

            // Parent Asset Reference (for context)
            $table->foreignId('parent_asset_id')->nullable()
                ->constrained('assets')
                ->onDelete('set null')
                ->comment('Parent asset at time of movement');

            // Movement Type (mirrors asset_movements)
            $table->enum('movement_type', [
                'created',
                'assigned',
                'transferred',
                'returned',
                'status_changed',
                'updated',
                'disposed',
                'attached',      // Component attached to parent asset
                'detached',      // Component detached from parent asset
            ]);

            // From/To Fields (same pattern as asset_movements)
            $table->foreignId('from_employee_id')->nullable()
                ->constrained('employee')->onDelete('set null');
            $table->foreignId('to_employee_id')->nullable()
                ->constrained('employee')->onDelete('set null');
            $table->foreignId('from_status_id')->nullable()
                ->constrained('status')->onDelete('set null');
            $table->foreignId('to_status_id')->nullable()
                ->constrained('status')->onDelete('set null');
            $table->foreignId('from_branch_id')->nullable()
                ->constrained('branch')->onDelete('set null');
            $table->foreignId('to_branch_id')->nullable()
                ->constrained('branch')->onDelete('set null');

            // Who Made the Change
            $table->foreignId('performed_by_user_id')->nullable()
                ->constrained('users')->onDelete('set null');

            // Change Details
            $table->text('reason')->nullable();
            $table->text('remarks')->nullable();
            $table->json('metadata')->nullable();

            // Audit Trail
            $table->timestamp('movement_date');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('asset_component_id');
            $table->index('parent_asset_id');
            $table->index('movement_type');
            $table->index('movement_date');
            $table->index(['asset_component_id', 'movement_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_component_movements');
    }
};
