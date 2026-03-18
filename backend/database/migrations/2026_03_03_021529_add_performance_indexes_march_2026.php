<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Add missing performance indexes identified during optimization audit.
 *
 * Critical indexes:
 * - Single-column foreign key indexes for faster joins
 * - Soft delete indexes for faster filtered queries
 * - Covering indexes for common query patterns
 */
return new class extends Migration
{
    /**
     * Check if an index exists on a PostgreSQL table.
     */
    private function indexExists(string $indexName): bool
    {
        $result = DB::select('SELECT 1 FROM pg_indexes WHERE indexname = ?', [$indexName]);

        return count($result) > 0;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Assets table - missing critical single-column indexes
        Schema::table('assets', function (Blueprint $table) {
            // status_id is heavily filtered/grouped but only exists in compound indexes
            if (! $this->indexExists('idx_assets_status_single')) {
                $table->index('status_id', 'idx_assets_status_single');
            }

            // workstation_id for new workstation feature queries
            if (! $this->indexExists('idx_assets_workstation')) {
                $table->index('workstation_id', 'idx_assets_workstation');
            }

            // asset_category_id for category filtering (only in compound currently)
            if (! $this->indexExists('idx_assets_category_single')) {
                $table->index('asset_category_id', 'idx_assets_category_single');
            }

            // delete_after_at for global scope filtering (defective asset cleanup)
            if (! $this->indexExists('idx_assets_delete_after')) {
                $table->index('delete_after_at', 'idx_assets_delete_after');
            }
        });

        // Repairs table - asset_id only in compound index
        Schema::table('repairs', function (Blueprint $table) {
            if (! $this->indexExists('idx_repairs_asset_single')) {
                $table->index('asset_id', 'idx_repairs_asset_single');
            }

            // vendor_id for vendor-based repair queries
            if (! $this->indexExists('idx_repairs_vendor')) {
                $table->index('vendor_id', 'idx_repairs_vendor');
            }
        });

        // Asset components - missing parent and status indexes
        Schema::table('asset_components', function (Blueprint $table) {
            if (! $this->indexExists('idx_components_parent')) {
                $table->index('parent_asset_id', 'idx_components_parent');
            }

            if (! $this->indexExists('idx_components_status')) {
                $table->index('status_id', 'idx_components_status');
            }

            // Soft delete filtering index
            if (! $this->indexExists('idx_components_deleted')) {
                $table->index('deleted_at', 'idx_components_deleted');
            }
        });

        // Asset movements - soft delete index (table has soft deletes)
        Schema::table('asset_movements', function (Blueprint $table) {
            if (! $this->indexExists('idx_movements_deleted')) {
                $table->index('deleted_at', 'idx_movements_deleted');
            }

            // asset_id for movement lookups
            if (! $this->indexExists('idx_movements_asset')) {
                $table->index('asset_id', 'idx_movements_asset');
            }
        });

        // Status table - name lookup for firstOrCreate operations
        Schema::table('status', function (Blueprint $table) {
            if (! $this->indexExists('idx_status_name')) {
                $table->index('name', 'idx_status_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if ($this->indexExists('idx_assets_status_single')) {
                $table->dropIndex('idx_assets_status_single');
            }
            if ($this->indexExists('idx_assets_workstation')) {
                $table->dropIndex('idx_assets_workstation');
            }
            if ($this->indexExists('idx_assets_category_single')) {
                $table->dropIndex('idx_assets_category_single');
            }
            if ($this->indexExists('idx_assets_delete_after')) {
                $table->dropIndex('idx_assets_delete_after');
            }
        });

        Schema::table('repairs', function (Blueprint $table) {
            if ($this->indexExists('idx_repairs_asset_single')) {
                $table->dropIndex('idx_repairs_asset_single');
            }
            if ($this->indexExists('idx_repairs_vendor')) {
                $table->dropIndex('idx_repairs_vendor');
            }
        });

        Schema::table('asset_components', function (Blueprint $table) {
            if ($this->indexExists('idx_components_parent')) {
                $table->dropIndex('idx_components_parent');
            }
            if ($this->indexExists('idx_components_status')) {
                $table->dropIndex('idx_components_status');
            }
            if ($this->indexExists('idx_components_deleted')) {
                $table->dropIndex('idx_components_deleted');
            }
        });

        Schema::table('asset_movements', function (Blueprint $table) {
            if ($this->indexExists('idx_movements_deleted')) {
                $table->dropIndex('idx_movements_deleted');
            }
            if ($this->indexExists('idx_movements_asset')) {
                $table->dropIndex('idx_movements_asset');
            }
        });

        Schema::table('status', function (Blueprint $table) {
            if ($this->indexExists('idx_status_name')) {
                $table->dropIndex('idx_status_name');
            }
        });
    }
};
