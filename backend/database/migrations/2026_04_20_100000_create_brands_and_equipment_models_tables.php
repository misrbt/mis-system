<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create brands table
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 2. Create equipment_models table with brand FK
        Schema::create('equipment_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['brand_id', 'name']);
        });

        // 3. Seed brands from existing equipment data
        $brands = DB::table('equipment')
            ->whereNull('deleted_at')
            ->select('brand')
            ->distinct()
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->pluck('brand');

        $now = now();
        foreach ($brands as $brand) {
            DB::table('brands')->insert([
                'name' => trim($brand),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 4. Seed equipment_models from existing equipment data
        $equipmentRecords = DB::table('equipment')
            ->whereNull('deleted_at')
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->whereNotNull('model')
            ->where('model', '!=', '')
            ->select('brand', 'model')
            ->distinct()
            ->get();

        $brandMap = DB::table('brands')->pluck('id', 'name');

        foreach ($equipmentRecords as $record) {
            $brandName = trim($record->brand);
            $brandId = $brandMap[$brandName] ?? null;
            if (! $brandId) {
                continue;
            }

            // Avoid duplicates
            $exists = DB::table('equipment_models')
                ->where('brand_id', $brandId)
                ->where('name', trim($record->model))
                ->exists();

            if (! $exists) {
                DB::table('equipment_models')->insert([
                    'brand_id' => $brandId,
                    'name' => trim($record->model),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 5. Add brand_id and equipment_model_id columns to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->after('id')->constrained('brands')->nullOnDelete();
            $table->foreignId('equipment_model_id')->nullable()->after('brand_id')->constrained('equipment_models')->nullOnDelete();
        });

        // 6. Backfill equipment table with brand_id and equipment_model_id
        $allEquipment = DB::table('equipment')
            ->whereNull('deleted_at')
            ->get(['id', 'brand', 'model']);

        $modelMap = DB::table('equipment_models')
            ->join('brands', 'equipment_models.brand_id', '=', 'brands.id')
            ->get(['equipment_models.id as model_id', 'equipment_models.brand_id', 'brands.name as brand_name', 'equipment_models.name as model_name'])
            ->groupBy('brand_name');

        foreach ($allEquipment as $eq) {
            $brandName = trim($eq->brand ?? '');
            $modelName = trim($eq->model ?? '');
            $brandId = $brandMap[$brandName] ?? null;
            $modelId = null;

            if ($brandId && isset($modelMap[$brandName])) {
                $match = $modelMap[$brandName]->first(fn ($m) => $m->model_name === $modelName);
                $modelId = $match?->model_id;
            }

            if ($brandId || $modelId) {
                DB::table('equipment')->where('id', $eq->id)->update([
                    'brand_id' => $brandId,
                    'equipment_model_id' => $modelId,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropConstrainedForeignId('equipment_model_id');
            $table->dropConstrainedForeignId('brand_id');
        });

        Schema::dropIfExists('equipment_models');
        Schema::dropIfExists('brands');
    }
};
