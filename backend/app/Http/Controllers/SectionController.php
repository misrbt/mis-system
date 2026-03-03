<?php

namespace App\Http\Controllers;

use App\Http\Requests\Section\StoreSectionRequest;
use App\Http\Requests\Section\UpdateSectionRequest;
use App\Models\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends BaseCatalogController
{
    protected string $model = Section::class;

    protected string $resourceName = 'Section';

    protected array $searchFields = ['name'];

    protected string $orderByField = 'name';

    protected array $withCounts = ['employees'];

    /**
     * Store a newly created section.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified section.
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
            return $request->validate(app(StoreSectionRequest::class)->rules());
        }

        return $request->validate(app(UpdateSectionRequest::class)->rules());
    }

    /**
     * Check if section has employees before deletion.
     */
    protected function checkDependencies(Model $record): ?string
    {
        /** @var Section $record */
        if ($record->employees()->count() > 0) {
            return 'Cannot delete section with assigned employees';
        }

        return null;
    }
}
