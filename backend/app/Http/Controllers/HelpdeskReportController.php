<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class HelpdeskReportController extends Controller
{
    /**
     * Top-level KPIs over the selected date range.
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            $base = $this->baseQuery($request);

            $total = (clone $base)->count();
            $open = (clone $base)->where('status', 'Open')->count();
            $inProgress = (clone $base)->where('status', 'In Progress')->count();
            $pending = (clone $base)->where('status', 'Pending')->count();
            $resolved = (clone $base)->where('status', 'Resolved')->count();
            $closed = (clone $base)->where('status', 'Closed')->count();
            $cancelled = (clone $base)->where('status', 'Cancelled')->count();

            $overdue = (clone $base)
                ->whereNotNull('due_date')
                ->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled'])
                ->where('due_date', '<', Carbon::now()->startOfDay())
                ->count();

            $unassigned = (clone $base)
                ->whereNull('assigned_to_user_id')
                ->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled'])
                ->count();

            // Postgres-friendly minute diff via EXTRACT(EPOCH)
            $avgFirstResponse = (clone $base)
                ->whereNotNull('first_response_at')
                ->value(DB::raw('AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60)'));

            $avgResolution = (clone $base)
                ->whereNotNull('resolved_at')
                ->value(DB::raw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)'));

            $satisfactionRows = (clone $base)
                ->whereNotNull('satisfaction_rating')
                ->get(['satisfaction_rating']);

            $satisfactionCount = $satisfactionRows->count();
            $satisfactionAvg = $satisfactionCount > 0
                ? round($satisfactionRows->avg('satisfaction_rating'), 2)
                : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'open' => $open,
                    'in_progress' => $inProgress,
                    'pending' => $pending,
                    'resolved' => $resolved,
                    'closed' => $closed,
                    'cancelled' => $cancelled,
                    'overdue' => $overdue,
                    'unassigned' => $unassigned,
                    'avg_first_response_minutes' => $avgFirstResponse !== null ? round((float) $avgFirstResponse, 2) : null,
                    'avg_resolution_minutes' => $avgResolution !== null ? round((float) $avgResolution, 2) : null,
                    'satisfaction_avg' => $satisfactionAvg,
                    'satisfaction_count' => $satisfactionCount,
                    'range' => [
                        'from' => $this->rangeStart($request)->toDateString(),
                        'to' => $this->rangeEnd($request)->toDateString(),
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load helpdesk summary');
        }
    }

    /**
     * "Who submits the most tickets" — top N requesters.
     */
    public function topRequesters(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->input('limit', 20);

            $rows = $this->baseQuery($request)
                ->with([
                    'requester:id,fullname,branch_id,department_id',
                    'requester.branch:id,branch_name',
                    'requester.department:id,name',
                ])
                ->get();

            $grouped = $rows->groupBy('requester_employee_id')->map(function ($tickets, $employeeId) {
                $first = $tickets->first();
                $resolved = $tickets->filter(fn ($t) => $t->resolved_at !== null);

                $avgResolution = null;
                if ($resolved->isNotEmpty()) {
                    $sum = $resolved->sum(function ($t) {
                        return Carbon::parse($t->resolved_at)->diffInMinutes(Carbon::parse($t->created_at));
                    });
                    $avgResolution = round($sum / $resolved->count(), 2);
                }

                return [
                    'employee_id' => $employeeId,
                    'employee_name' => $first?->requester?->fullname ?? 'Unknown',
                    'branch' => $first?->requester?->branch?->branch_name,
                    'section' => $first?->requester?->department?->name,
                    'total' => $tickets->count(),
                    'open' => $tickets->whereIn('status', ['Open', 'In Progress', 'Pending'])->count(),
                    'resolved' => $tickets->whereIn('status', ['Resolved', 'Closed'])->count(),
                    'avg_resolution_minutes' => $avgResolution,
                ];
            })
                ->sortByDesc('total')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load top requesters');
        }
    }

    /**
     * IT leaderboard — top resolvers.
     */
    public function topResolvers(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->input('limit', 20);

            $rows = $this->baseQuery($request)
                ->whereNotNull('assigned_to_user_id')
                ->with(['assignedTo:id,name'])
                ->get();

            $grouped = $rows->groupBy('assigned_to_user_id')->map(function ($tickets, $userId) {
                $first = $tickets->first();
                $resolved = $tickets->filter(fn ($t) => $t->resolved_at !== null);
                $responded = $tickets->filter(fn ($t) => $t->first_response_at !== null);

                $avgResolution = null;
                if ($resolved->isNotEmpty()) {
                    $sum = $resolved->sum(function ($t) {
                        return Carbon::parse($t->resolved_at)->diffInMinutes(Carbon::parse($t->created_at));
                    });
                    $avgResolution = round($sum / $resolved->count(), 2);
                }

                $avgFirstResponse = null;
                if ($responded->isNotEmpty()) {
                    $sum = $responded->sum(function ($t) {
                        return Carbon::parse($t->first_response_at)->diffInMinutes(Carbon::parse($t->created_at));
                    });
                    $avgFirstResponse = round($sum / $responded->count(), 2);
                }

                $overdue = $tickets->filter(function ($t) {
                    return $t->due_date
                        && ! in_array($t->status, ['Resolved', 'Closed', 'Cancelled'], true)
                        && Carbon::parse($t->due_date)->lt(Carbon::now()->startOfDay());
                })->count();

                $rated = $tickets->filter(fn ($t) => $t->satisfaction_rating !== null);
                $satisfactionAvg = $rated->isNotEmpty() ? round($rated->avg('satisfaction_rating'), 2) : null;

                return [
                    'user_id' => $userId,
                    'user_name' => $first?->assignedTo?->name ?? 'Unknown',
                    'total' => $tickets->count(),
                    'resolved' => $resolved->count(),
                    'avg_first_response_minutes' => $avgFirstResponse,
                    'avg_resolution_minutes' => $avgResolution,
                    'overdue_count' => $overdue,
                    'satisfaction_avg' => $satisfactionAvg,
                ];
            })
                ->sortByDesc('total')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load top resolvers');
        }
    }

    /**
     * Breakdowns for the four pie/bar charts.
     */
    public function breakdowns(Request $request): JsonResponse
    {
        try {
            $base = $this->baseQuery($request);

            $byStatus = (clone $base)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status');

            $byPriority = (clone $base)
                ->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->pluck('count', 'priority');

            $byCategory = (clone $base)
                ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
                ->select('ticket_categories.name as category', DB::raw('count(tickets.id) as count'))
                ->groupBy('ticket_categories.name')
                ->pluck('count', 'category');

            $byBranch = (clone $base)
                ->leftJoin('employee', 'tickets.requester_employee_id', '=', 'employee.id')
                ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
                ->select('branch.branch_name as branch', DB::raw('count(tickets.id) as count'))
                ->groupBy('branch.branch_name')
                ->pluck('count', 'branch');

            return response()->json([
                'success' => true,
                'data' => [
                    'by_status' => $byStatus,
                    'by_priority' => $byPriority,
                    'by_category' => $byCategory,
                    'by_branch' => $byBranch,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load breakdowns');
        }
    }

    /**
     * Volume trend over time. Auto-picks daily bucket for <=90 day ranges
     * and weekly bucket otherwise.
     */
    public function volumeTrend(Request $request): JsonResponse
    {
        try {
            $from = $this->rangeStart($request);
            $to = $this->rangeEnd($request);

            $bucket = $request->input('bucket');
            if (! $bucket) {
                $bucket = $from->diffInDays($to) > 90 ? 'week' : 'day';
            }
            $truncUnit = $bucket === 'week' ? 'week' : 'day';

            $created = Ticket::query()
                ->visibleToStaff()
                ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                ->select(
                    DB::raw("DATE_TRUNC('{$truncUnit}', created_at) AS bucket"),
                    DB::raw('count(*) AS count')
                )
                ->groupBy('bucket')
                ->orderBy('bucket')
                ->get();

            $resolved = Ticket::query()
                ->visibleToStaff()
                ->whereNotNull('resolved_at')
                ->whereBetween('resolved_at', [$from->startOfDay(), $to->endOfDay()])
                ->select(
                    DB::raw("DATE_TRUNC('{$truncUnit}', resolved_at) AS bucket"),
                    DB::raw('count(*) AS count')
                )
                ->groupBy('bucket')
                ->orderBy('bucket')
                ->get();

            // Merge into a single array keyed by bucket.
            $map = [];
            foreach ($created as $row) {
                $key = Carbon::parse($row->bucket)->toDateString();
                $map[$key] = ['bucket' => $key, 'created' => (int) $row->count, 'resolved' => 0];
            }
            foreach ($resolved as $row) {
                $key = Carbon::parse($row->bucket)->toDateString();
                if (! isset($map[$key])) {
                    $map[$key] = ['bucket' => $key, 'created' => 0, 'resolved' => 0];
                }
                $map[$key]['resolved'] = (int) $row->count;
            }

            ksort($map);

            return response()->json([
                'success' => true,
                'data' => array_values($map),
                'bucket' => $bucket,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load volume trend');
        }
    }

    /**
     * Tickets grouped by requester's branch, with per-status breakdown.
     * Starts from the branch table (not tickets) so every branch appears
     * on the dashboard chart even when it has zero tickets in the period.
     * Frontend renders a stacked bar: Open / In Progress / Pending /
     * Resolved / Closed / Cancelled, each segment click-filterable.
     */
    public function ticketsByBranch(Request $request): JsonResponse
    {
        try {
            $from = $this->rangeStart($request)->startOfDay();
            $to = $this->rangeEnd($request)->endOfDay();

            $rows = DB::table('branch')
                ->leftJoin('employee', 'employee.branch_id', '=', 'branch.id')
                ->leftJoin('tickets', function ($join) use ($from, $to) {
                    $join->on('tickets.requester_employee_id', '=', 'employee.id')
                        ->whereBetween('tickets.created_at', [$from, $to])
                        ->whereNull('tickets.deleted_at')
                        // Hide pending/rejected approvals from dashboard branch chart.
                        ->where(function ($w) {
                            $w->whereNull('tickets.approval_status')
                                ->orWhere('tickets.approval_status', 'approved');
                        });
                })
                ->select(
                    'branch.id as branch_id',
                    'branch.branch_name',
                    'tickets.status',
                    DB::raw('count(tickets.id) as count')
                )
                ->groupBy('branch.id', 'branch.branch_name', 'tickets.status')
                ->get();

            $grouped = collect($rows)
                ->groupBy('branch_id')
                ->map(function ($branchRows) {
                    $first = $branchRows->first();
                    $byStatus = [];
                    foreach ($branchRows as $r) {
                        if (! empty($r->status)) {
                            $byStatus[$r->status] = (int) $r->count;
                        }
                    }

                    return [
                        'branch_id' => $first->branch_id,
                        'branch_name' => $first->branch_name,
                        'open' => $byStatus['Open'] ?? 0,
                        'in_progress' => $byStatus['In Progress'] ?? 0,
                        'pending' => $byStatus['Pending'] ?? 0,
                        'resolved' => $byStatus['Resolved'] ?? 0,
                        'closed' => $byStatus['Closed'] ?? 0,
                        'cancelled' => $byStatus['Cancelled'] ?? 0,
                        'total' => array_sum($byStatus),
                    ];
                })
                ->sortByDesc('total')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load tickets by branch');
        }
    }

    /**
     * For each branch, who is raising the most tickets? Returns the top-N
     * requesters per branch so MIS can see at a glance: "Head Office is
     * hot this month and it's mostly Juan and Maria."
     */
    public function branchesWithRequesters(Request $request): JsonResponse
    {
        try {
            $perBranchLimit = max(3, min(10, (int) $request->input('per_branch', 5)));
            $branchLimit = max(5, min(50, (int) $request->input('limit', 20)));

            $rows = $this->baseQuery($request)
                ->leftJoin('employee', 'tickets.requester_employee_id', '=', 'employee.id')
                ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
                ->select(
                    'branch.id as branch_id',
                    DB::raw("COALESCE(branch.branch_name, '(No branch)') as branch_name"),
                    'employee.id as employee_id',
                    'employee.fullname as employee_name',
                    DB::raw('count(tickets.id) as count')
                )
                ->groupBy('branch.id', 'branch.branch_name', 'employee.id', 'employee.fullname')
                ->get();

            $grouped = $rows->groupBy(fn ($r) => $r->branch_id === null ? 'null' : (string) $r->branch_id)
                ->map(function ($branchRows) use ($perBranchLimit) {
                    $first = $branchRows->first();
                    $employees = $branchRows
                        ->filter(fn ($r) => $r->employee_id !== null)
                        ->sortByDesc('count')
                        ->values();

                    $top = $employees->take($perBranchLimit)->map(fn ($r) => [
                        'employee_id' => $r->employee_id,
                        'employee_name' => $r->employee_name,
                        'count' => (int) $r->count,
                    ])->values();

                    return [
                        'branch_id' => $first->branch_id,
                        'branch_name' => $first->branch_name,
                        'total' => (int) $branchRows->sum('count'),
                        'active_employees' => $employees->count(),
                        'top_requesters' => $top,
                    ];
                })
                ->sortByDesc('total')
                ->take($branchLimit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load branches with requesters');
        }
    }

    /**
     * Assignee workload — for every IT user currently holding an active ticket:
     * active count, per-status breakdown, overdue count, oldest ticket age.
     * Used by the helpdesk dashboard's workload table.
     */
    public function workload(Request $request): JsonResponse
    {
        try {
            $rows = Ticket::query()
                ->visibleToStaff()
                ->whereNotNull('assigned_to_user_id')
                ->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled'])
                ->with(['assignedTo:id,name'])
                ->get();

            $grouped = $rows->groupBy('assigned_to_user_id')->map(function ($tickets, $userId) {
                $first = $tickets->first();

                $byStatus = $tickets->groupBy('status')->map->count();
                $overdue = $tickets->filter(function ($t) {
                    return $t->due_date
                        && Carbon::parse($t->due_date)->lt(Carbon::now()->startOfDay());
                })->count();

                $oldest = $tickets->sortBy('created_at')->first();
                $oldestDays = $oldest
                    ? (int) Carbon::parse($oldest->created_at)->diffInDays(Carbon::now())
                    : 0;

                return [
                    'user_id' => $userId,
                    'user_name' => $first?->assignedTo?->name ?? 'Unknown',
                    'active' => $tickets->count(),
                    'open' => (int) ($byStatus['Open'] ?? 0),
                    'in_progress' => (int) ($byStatus['In Progress'] ?? 0),
                    'pending' => (int) ($byStatus['Pending'] ?? 0),
                    'overdue' => $overdue,
                    'oldest_days' => $oldestDays,
                ];
            })
                ->sortByDesc('active')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load workload');
        }
    }

    /**
     * Recurring issues — requester+category pairs with >= threshold tickets
     * in the selected window. This is the helpdesk → inventory bridge: when
     * the same end user keeps raising the same kind of concern, it often
     * points at an IT asset that needs repair or replacement. MIS reads this
     * list to decide what to investigate.
     */
    public function recurringIssues(Request $request): JsonResponse
    {
        try {
            $threshold = max(2, (int) $request->input('threshold', 3));
            $days = max(7, (int) $request->input('days', 90));
            $since = Carbon::now()->subDays($days);

            $rows = Ticket::query()
                ->visibleToStaff()
                ->whereNotNull('requester_employee_id')
                ->whereNotNull('category_id')
                ->where('created_at', '>=', $since)
                ->with([
                    'requester:id,fullname,branch_id,department_id',
                    'requester.branch:id,branch_name',
                    'requester.department:id,name',
                    'category:id,name',
                ])
                ->get();

            $groups = $rows->groupBy(fn ($t) => $t->requester_employee_id.'|'.$t->category_id)
                ->map(function ($tickets) {
                    $first = $tickets->first();
                    $sorted = $tickets->sortByDesc('created_at')->values();

                    return [
                        'requester_employee_id' => $first->requester_employee_id,
                        'category_id' => $first->category_id,
                        'requester_name' => $first?->requester?->fullname ?? 'Unknown',
                        'branch' => $first?->requester?->branch?->branch_name,
                        'section' => $first?->requester?->department?->name,
                        'category' => $first?->category?->name ?? 'Uncategorized',
                        'count' => $tickets->count(),
                        'first_seen' => $tickets->min('created_at'),
                        'last_seen' => $tickets->max('created_at'),
                        'ticket_numbers' => $sorted->take(5)->pluck('ticket_number')->all(),
                        'open_count' => $tickets->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled'])->count(),
                    ];
                })
                ->filter(fn ($g) => $g['count'] >= $threshold)
                ->sortByDesc('count')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $groups,
                'window_days' => $days,
                'threshold' => $threshold,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load recurring issues');
        }
    }

    /**
     * Paginated detailed ticket list for the report drill-down table.
     */
    public function detailedTickets(Request $request): JsonResponse
    {
        try {
            $query = $this->baseQuery($request)
                ->with([
                    'category:id,name',
                    'requester:id,fullname,branch_id',
                    'requester.branch:id,branch_name',
                    'assignedTo:id,name',
                ])
                ->orderByDesc('created_at');

            if ($request->boolean('all', false)) {
                return response()->json([
                    'success' => true,
                    'data' => $query->get(),
                ], 200);
            }

            $perPage = (int) $request->input('per_page', 50);
            $tickets = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $tickets->items(),
                'meta' => [
                    'total' => $tickets->total(),
                    'per_page' => $tickets->perPage(),
                    'current_page' => $tickets->currentPage(),
                    'last_page' => $tickets->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load detailed tickets');
        }
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function baseQuery(Request $request): Builder
    {
        $from = $this->rangeStart($request);
        $to = $this->rangeEnd($request);

        // Qualify the column so joins (branch / employee) don't make this ambiguous.
        $query = Ticket::query()
            ->visibleToStaff()
            ->whereBetween('tickets.created_at', [$from->startOfDay(), $to->endOfDay()]);

        if ($request->filled('branch_id')) {
            $branchId = $request->input('branch_id');
            $query->whereHas('requester', fn ($q) => $q->where('branch_id', $branchId));
        }

        if ($request->filled('section_id')) {
            $sectionId = $request->input('section_id');
            $query->whereHas('requester', fn ($q) => $q->where('department_id', $sectionId));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('assigned_to_user_id')) {
            $query->where('assigned_to_user_id', $request->input('assigned_to_user_id'));
        }

        return $query;
    }

    private function rangeStart(Request $request): Carbon
    {
        if ($request->filled('date_from')) {
            return Carbon::parse($request->input('date_from'));
        }

        return Carbon::now()->startOfMonth();
    }

    private function rangeEnd(Request $request): Carbon
    {
        if ($request->filled('date_to')) {
            return Carbon::parse($request->input('date_to'));
        }

        return Carbon::now()->endOfMonth();
    }
}
