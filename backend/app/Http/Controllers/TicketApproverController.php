<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketApprover\StoreTicketApproverRequest;
use App\Http\Requests\TicketApprover\UpdateTicketApproverRequest;
use App\Models\Employee;
use App\Models\TicketApprover;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketApproverController extends Controller
{
    /**
     * List approvers. Admin page passes ?all=1 to include inactive entries.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TicketApprover::query()
                ->with(['branch:id,branch_name', 'obo:id,name,branch_id', 'employee:id,fullname']);

            if (! $request->boolean('all')) {
                $query->where('is_active', true);
            }

            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->input('branch_id'));
            }

            $approvers = $query
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $approvers,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch approvers');
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $approver = TicketApprover::with([
                'branch:id,branch_name',
                'obo:id,name,branch_id',
                'employee:id,fullname',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $approver,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Approver not found', 404);
        }
    }

    public function store(StoreTicketApproverRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            if (! isset($data['sort_order'])) {
                $data['sort_order'] = (int) (TicketApprover::max('sort_order') ?? 0) + 10;
            }

            $data['is_active'] = $data['is_active'] ?? true;

            $approver = TicketApprover::create($data);
            $approver->load(['branch:id,branch_name', 'obo:id,name,branch_id', 'employee:id,fullname']);

            return response()->json([
                'success' => true,
                'message' => 'Approver created',
                'data' => $approver,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create approver');
        }
    }

    public function update(UpdateTicketApproverRequest $request, string $id): JsonResponse
    {
        try {
            $approver = TicketApprover::findOrFail($id);
            $approver->update($request->validated());
            $approver->load(['branch:id,branch_name', 'obo:id,name,branch_id', 'employee:id,fullname']);

            return response()->json([
                'success' => true,
                'message' => 'Approver updated',
                'data' => $approver,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update approver');
        }
    }

    public function toggleActive(string $id): JsonResponse
    {
        try {
            $approver = TicketApprover::findOrFail($id);
            $approver->is_active = ! $approver->is_active;
            $approver->save();

            return response()->json([
                'success' => true,
                'message' => $approver->is_active ? 'Approver activated' : 'Approver deactivated',
                'data' => $approver,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to toggle approver');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $approver = TicketApprover::findOrFail($id);
            $approver->delete();

            return response()->json([
                'success' => true,
                'message' => 'Approver deleted',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete approver');
        }
    }

    /**
     * Helper endpoint for the admin page's "Pick a manager" dropdown.
     * Returns employees whose Position title contains "Manager", with the
     * branch and OBO eager-loaded so the frontend can auto-fill the form.
     */
    public function managers(): JsonResponse
    {
        try {
            $managers = Employee::query()
                ->whereHas('position', function ($q) {
                    $q->where('title', 'like', '%Manager%');
                })
                ->with([
                    'branch:id,branch_name',
                    'obo:id,name,branch_id',
                    'position:id,title',
                ])
                ->orderBy('fullname')
                ->get(['id', 'fullname', 'branch_id', 'obo_id', 'position_id']);

            return response()->json([
                'success' => true,
                'data' => $managers,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch managers');
        }
    }
}
