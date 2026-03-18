<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends BaseCatalogController
{
    protected string $model = Vendor::class;

    protected string $resourceName = 'Vendor';

    protected array $searchFields = ['company_name', 'contact_person', 'email'];

    protected string $orderByField = 'company_name';

    protected ?string $cacheKey = 'vendors_all';

    protected array $withCounts = ['assets'];

    /**
     * Store a newly created vendor.
     */
    public function store(Request $request): JsonResponse
    {
        return parent::store($request);
    }

    /**
     * Update the specified vendor.
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
            return $request->validate(app(StoreVendorRequest::class)->rules());
        }

        return $request->validate(app(UpdateVendorRequest::class)->rules());
    }

    /**
     * Check if vendor has assets before deletion.
     */
    protected function checkDependencies(Model $record): ?string
    {
        /** @var Vendor $record */
        if ($record->assets()->count() > 0) {
            return 'Cannot delete vendor with assigned assets';
        }

        return null;
    }
}
