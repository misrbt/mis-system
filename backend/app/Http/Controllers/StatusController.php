<?php

namespace App\Http\Controllers;

use App\Http\Requests\Status\StoreStatusRequest;
use App\Http\Requests\Status\UpdateStatusRequest;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusController extends BaseCatalogController
{
    protected string $model = Status::class;

    protected string $resourceName = 'Status';

    protected array $searchFields = ['name'];

    protected string $orderByField = 'name';

    protected ?string $cacheKey = 'statuses_all';

    /**
     * Store a newly created status.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified status.
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
            return $request->validate(app(StoreStatusRequest::class)->rules());
        }

        return $request->validate(app(UpdateStatusRequest::class)->rules());
    }
}
