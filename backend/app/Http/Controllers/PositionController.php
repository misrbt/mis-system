<?php

namespace App\Http\Controllers;

use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Models\Position;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends BaseCatalogController
{
    protected string $model = Position::class;

    protected string $resourceName = 'Position';

    protected array $searchFields = ['title'];

    protected string $orderByField = 'title';

    protected array $withCounts = ['employees'];

    /**
     * Store a newly created position.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified position.
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
            return $request->validate(app(StorePositionRequest::class)->rules());
        }

        return $request->validate(app(UpdatePositionRequest::class)->rules());
    }

    /**
     * Check if position has employees before deletion.
     */
    protected function checkDependencies(Model $record): ?string
    {
        /** @var Position $record */
        if ($record->employees()->count() > 0) {
            return 'Cannot delete position with assigned employees';
        }

        return null;
    }
}
