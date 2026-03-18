<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Base controller for catalog-style CRUD operations.
 *
 * Provides standardized index, show, store, update, and destroy methods
 * with optional caching, search, and dependency checking.
 *
 * Child controllers should define:
 * - $model: The Eloquent model class
 * - $resourceName: Human-readable name for messages
 * - Optional: $searchFields, $orderByField, $cacheKey, $cacheTtl, $withCounts
 */
abstract class BaseCatalogController extends Controller
{
    use ApiResponse;

    /**
     * The Eloquent model class name.
     *
     * @var class-string<Model>
     */
    protected string $model;

    /**
     * Human-readable resource name for messages.
     */
    protected string $resourceName = 'Record';

    /**
     * Fields to search when applying search filter.
     *
     * @var array<int, string>
     */
    protected array $searchFields = ['name'];

    /**
     * Default field for ordering results.
     */
    protected string $orderByField = 'name';

    /**
     * Order direction (asc or desc).
     */
    protected string $orderByDirection = 'asc';

    /**
     * Cache key for storing all records. Set to null to disable caching.
     */
    protected ?string $cacheKey = null;

    /**
     * Cache TTL in seconds (default: 24 hours).
     */
    protected int $cacheTtl = 86400;

    /**
     * Relations to count when fetching records.
     *
     * @var array<int, string>
     */
    protected array $withCounts = [];

    /**
     * Relations to eager load when fetching records.
     *
     * @var array<int, string>
     */
    protected array $withRelations = [];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = $this->buildIndexQuery($request);

            // Check if we should fetch all (non-paginated) or paginate
            if ($request->boolean('all') || ! $request->has('per_page')) {
                // Use cache for full listings if cache key is defined
                if ($this->cacheKey && ! $request->has('search')) {
                    $data = Cache::remember($this->cacheKey, $this->cacheTtl, fn () => $query->get());
                } else {
                    $data = $query->get();
                }

                return $this->success($data);
            }

            // Paginated response
            $perPage = min((int) $request->get('per_page', 15), 100);

            return $this->paginated($query->paginate($perPage));
        } catch (\Exception $e) {
            return $this->handleException($e, "Failed to fetch {$this->resourceName}s");
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $this->getValidatedData($request);
            $record = $this->performStore($data);

            $this->clearCache();

            return $this->created($record, "{$this->resourceName} created successfully");
        } catch (\Exception $e) {
            return $this->handleException($e, "Failed to create {$this->resourceName}");
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $query = $this->model::query();

            if (! empty($this->withCounts)) {
                $query->withCount($this->withCounts);
            }

            if (! empty($this->withRelations)) {
                $query->with($this->withRelations);
            }

            $record = $query->findOrFail($id);

            return $this->success($record);
        } catch (\Exception $e) {
            return $this->handleException($e, "{$this->resourceName} not found", 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $record = $this->model::findOrFail($id);
            $data = $this->getValidatedData($request);

            $this->performUpdate($record, $data);

            $this->clearCache();

            return $this->success($record->fresh(), "{$this->resourceName} updated successfully");
        } catch (\Exception $e) {
            return $this->handleException($e, "Failed to update {$this->resourceName}");
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $record = $this->model::findOrFail($id);

            // Check for dependencies before deleting
            $dependencyError = $this->checkDependencies($record);
            if ($dependencyError !== null) {
                return $this->conflict($dependencyError);
            }

            $record->delete();

            $this->clearCache();

            return $this->deleted($this->resourceName);
        } catch (\Exception $e) {
            return $this->handleException($e, "Failed to delete {$this->resourceName}");
        }
    }

    /**
     * Build the query for index listing.
     */
    protected function buildIndexQuery(Request $request): Builder
    {
        $query = $this->model::query();

        // Add withCount for relations
        if (! empty($this->withCounts)) {
            $query->withCount($this->withCounts);
        }

        // Add eager loading
        if (! empty($this->withRelations)) {
            $query->with($this->withRelations);
        }

        // Apply search filter
        $search = $request->get('search');
        if ($search && ! empty($this->searchFields)) {
            $query->where(function (Builder $q) use ($search) {
                foreach ($this->searchFields as $index => $field) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $q->$method($field, 'ILIKE', "%{$search}%");
                }
            });
        }

        // Apply additional filters (can be overridden in child classes)
        $this->applyFilters($query, $request);

        // Apply ordering
        $orderBy = $request->get('order_by', $this->orderByField);
        $orderDir = $request->get('order_dir', $this->orderByDirection);
        $query->orderBy($orderBy, $orderDir);

        return $query;
    }

    /**
     * Apply additional filters to the index query.
     * Override in child classes for custom filtering.
     */
    protected function applyFilters(Builder $query, Request $request): void
    {
        // Default implementation does nothing
        // Child classes can override this method to add custom filters
    }

    /**
     * Get validated data from the request.
     * By default, uses form request validation via validated() method.
     *
     * @return array<string, mixed>
     */
    protected function getValidatedData(Request $request): array
    {
        return $request->validated();
    }

    /**
     * Perform the actual store operation.
     * Override in child classes for custom store logic.
     *
     * @param  array<string, mixed>  $data
     */
    protected function performStore(array $data): Model
    {
        return $this->model::create($data);
    }

    /**
     * Perform the actual update operation.
     * Override in child classes for custom update logic.
     *
     * @param  array<string, mixed>  $data
     */
    protected function performUpdate(Model $record, array $data): void
    {
        $record->update($data);
    }

    /**
     * Check if the record has dependencies that prevent deletion.
     * Override in child classes to check specific relationships.
     *
     * @return string|null Error message if dependencies exist, null if safe to delete
     */
    protected function checkDependencies(Model $record): ?string
    {
        return null;
    }

    /**
     * Clear the cache for this resource.
     */
    protected function clearCache(): void
    {
        if ($this->cacheKey !== null) {
            Cache::forget($this->cacheKey);
        }
    }
}
