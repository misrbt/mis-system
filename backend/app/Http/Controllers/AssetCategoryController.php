<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssetCategory\StoreAssetCategoryRequest;
use App\Http\Requests\AssetCategory\UpdateAssetCategoryRequest;
use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetCategoryController extends BaseCatalogController
{
    protected string $model = AssetCategory::class;

    protected string $resourceName = 'Asset category';

    protected array $searchFields = ['name', 'code'];

    protected string $orderByField = 'name';

    /**
     * Store a newly created asset category.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified asset category.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        return parent::update($request, $id);
    }

    /**
     * Get validated data using the appropriate form request.
     */
    protected function getValidatedData(Request $request): array
    {
        if ($request->isMethod('POST')) {
            return $request->validate(app(StoreAssetCategoryRequest::class)->rules());
        }

        return $request->validate(app(UpdateAssetCategoryRequest::class)->rules());
    }

    /**
     * Custom store logic to auto-generate category code.
     *
     * @param  array<string, mixed>  $data
     */
    protected function performStore(array $data): Model
    {
        $data['code'] = $this->generateCode($data['name']);

        return AssetCategory::create($data);
    }

    /**
     * Custom update logic to preserve or generate category code.
     *
     * @param  array<string, mixed>  $data
     */
    protected function performUpdate(Model $record, array $data): void
    {
        /** @var AssetCategory $record */
        $data['code'] = $record->code ?: $this->generateCode($data['name'], $record->id);

        $record->update($data);
    }

    /**
     * Check if category has assets before deletion.
     */
    protected function checkDependencies(Model $record): ?string
    {
        /** @var AssetCategory $record */
        if ($record->assets()->count() > 0) {
            return 'Cannot delete category with assigned assets';
        }

        return null;
    }

    /**
     * Generate a unique category code based on the category name.
     */
    private function generateCode(string $name, ?int $ignoreId = null): string
    {
        $cleaned = trim($name);
        $initials = '';

        if ($cleaned !== '') {
            $words = preg_split('/\s+/', $cleaned);
            foreach ($words as $word) {
                $initials .= mb_substr($word, 0, 1);
            }
        }

        $prefix = strtoupper($initials !== '' ? $initials : 'CAT');
        $prefix = mb_substr($prefix, 0, 4);

        $query = AssetCategory::where('code', 'like', $prefix.'-%');
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        $existingCodes = $query->pluck('code');
        $maxNumber = 0;

        foreach ($existingCodes as $code) {
            if (preg_match('/-(\d+)$/', $code, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $nextNumber = $maxNumber + 1;

        return sprintf('%s-%03d', $prefix, $nextNumber);
    }
}
