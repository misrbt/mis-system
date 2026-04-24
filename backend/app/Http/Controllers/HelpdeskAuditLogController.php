<?php

namespace App\Http\Controllers;

use App\Models\HelpdeskAuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HelpdeskAuditLogController extends Controller
{
    /**
     * Paginated helpdesk audit log with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = HelpdeskAuditLog::query()
                ->with(['ticket:id,ticket_number,title,status', 'user:id,name', 'employee:id,fullname']);

            $this->applyFilters($query, $request);

            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            if ($sortBy !== 'id') {
                $query->orderBy('id', 'desc');
            }

            if ($request->boolean('all', false)) {
                return response()->json([
                    'success' => true,
                    'data' => $query->get(),
                ], 200);
            }

            $perPage = (int) $request->input('per_page', 50);
            $logs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $logs->items(),
                'meta' => [
                    'total' => $logs->total(),
                    'per_page' => $logs->perPage(),
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch helpdesk audit logs');
        }
    }

    /**
     * Counts by action / actor_type + recent events.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $base = HelpdeskAuditLog::query();
            $this->applyFilters($base, $request);

            $byAction = (clone $base)
                ->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->pluck('count', 'action');

            $byActorType = (clone $base)
                ->select('actor_type', DB::raw('count(*) as count'))
                ->groupBy('actor_type')
                ->pluck('count', 'actor_type');

            $recent = (clone $base)
                ->orderByDesc('created_at')
                ->limit(10)
                ->with(['ticket:id,ticket_number'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => (clone $base)->count(),
                    'by_action' => $byAction,
                    'by_actor_type' => $byActorType,
                    'recent' => $recent,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch helpdesk audit statistics');
        }
    }

    /**
     * Full audit trail for one ticket.
     */
    public function forTicket(string $id): JsonResponse
    {
        try {
            $logs = HelpdeskAuditLog::query()
                ->with(['user:id,name', 'employee:id,fullname'])
                ->where('ticket_id', $id)
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $logs,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch ticket audit trail');
        }
    }

    /**
     * Full filtered dataset for client-side export (PDF/Excel/Word).
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $query = HelpdeskAuditLog::query()
                ->with(['ticket:id,ticket_number,title,status', 'user:id,name', 'employee:id,fullname']);

            $this->applyFilters($query, $request);
            $query->orderByDesc('created_at');

            $logs = $query->get();

            return response()->json([
                'success' => true,
                'data' => $logs,
                'count' => $logs->count(),
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to export helpdesk audit logs');
        }
    }

    /**
     * Shared filter set across endpoints.
     */
    private function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('action')) {
            $actions = is_array($request->input('action')) ? $request->input('action') : [$request->input('action')];
            $query->whereIn('action', $actions);
        }

        if ($request->filled('actor_type')) {
            $types = is_array($request->input('actor_type')) ? $request->input('actor_type') : [$request->input('actor_type')];
            $query->whereIn('actor_type', $types);
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }

        if ($request->filled('ticket_id')) {
            $query->where('ticket_id', $request->input('ticket_id'));
        }

        if ($request->filled('ticket_number')) {
            $query->where('ticket_number', 'like', '%'.$request->input('ticket_number').'%');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('actor_name', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }
    }
}
