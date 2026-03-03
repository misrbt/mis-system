<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends BaseCatalogController
{
    protected string $model = Branch::class;

    protected string $resourceName = 'Branch';

    protected array $searchFields = ['branch_name', 'brak', 'brcode'];

    protected string $orderByField = 'brcode';

    protected ?string $cacheKey = 'branches_all';

    protected array $withCounts = ['employees'];

    /**
     * Store a newly created branch.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified branch.
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
            return $request->validate(app(StoreBranchRequest::class)->rules());
        }

        return $request->validate(app(UpdateBranchRequest::class)->rules());
    }

    /**
     * Check if branch has employees before deletion.
     */
    protected function checkDependencies(Model $record): ?string
    {
        /** @var Branch $record */
        if ($record->employees()->count() > 0) {
            return 'Cannot delete branch with assigned employees';
        }

        return null;
    }
}
