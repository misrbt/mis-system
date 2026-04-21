<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchController extends BaseCatalogController
{
    protected string $model = Branch::class;

    protected string $resourceName = 'Branch';

    protected array $searchFields = ['branch_name', 'brak', 'brcode'];

    protected string $orderByField = 'brcode';

    protected ?string $cacheKey = 'branches_all';

    protected array $withCounts = ['employees'];

    protected array $withRelations = ['obos'];

    /**
     * Persist the branch and sync its OBOs in one transaction.
     */
    protected function performStore(array $data): Model
    {
        $obos = $data['obos'] ?? [];
        unset($data['obos']);

        return DB::transaction(function () use ($data, $obos) {
            /** @var Branch $branch */
            $branch = Branch::create($data);
            $this->syncObos($branch, $obos);

            return $branch->load('obos');
        });
    }

    /**
     * Update branch fields and reconcile its OBOs (insert/update/delete).
     */
    protected function performUpdate(Model $record, array $data): void
    {
        /** @var Branch $record */
        $obos = $data['obos'] ?? null;
        unset($data['obos']);

        DB::transaction(function () use ($record, $data, $obos) {
            $record->update($data);
            if ($obos !== null) {
                $this->syncObos($record, $obos);
            }
        });
    }

    /**
     * Reconcile the branch's OBOs against the submitted list.
     * Rows with an id are updated; rows without are inserted; missing rows are deleted.
     */
    private function syncObos(Branch $branch, array $obos): void
    {
        $hasObo = (bool) $branch->has_obo;
        if (! $hasObo) {
            $branch->obos()->delete();

            return;
        }

        $submittedIds = [];
        foreach ($obos as $row) {
            $name = trim($row['name'] ?? '');
            if ($name === '') {
                continue;
            }

            if (! empty($row['id'])) {
                $existing = $branch->obos()->whereKey($row['id'])->first();
                if ($existing) {
                    $existing->update(['name' => $name]);
                    $submittedIds[] = $existing->id;

                    continue;
                }
            }

            $created = $branch->obos()->create(['name' => $name]);
            $submittedIds[] = $created->id;
        }

        $branch->obos()->whereNotIn('id', $submittedIds ?: [0])->delete();
    }

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
