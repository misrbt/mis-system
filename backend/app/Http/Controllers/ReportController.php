<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Status;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get asset report data with filtering and summary statistics.
     */
    public function getAssetReport(Request $request)
    {
        // Increase limits for large report queries (all branches)
        set_time_limit(120);
        ini_set('memory_limit', '512M');

        try {
            $query = $this->buildAssetQuery($request);
            $includeGrouped = $request->has('include_grouped')
                ? filter_var($request->input('include_grouped'), FILTER_VALIDATE_BOOLEAN)
                : true;
            $includeSummary = $request->has('include_summary')
                ? filter_var($request->input('include_summary'), FILTER_VALIDATE_BOOLEAN)
                : true;
            $limit = (int) $request->input('limit', 0);

            $totalCount = (clone $query)->count();

            $assetsQuery = clone $query;
            if ($limit > 0) {
                $assetsQuery->limit($limit);
            }
            $assets = $assetsQuery->get();

            $this->applyEffectiveStatus($assets, $request->input('report_date_to', $request->input('purchase_date_to')));
            $assets = $this->filterByEffectiveStatus($assets, $request->input('status_id'));

            // Group assets by employee (optional)
            $groupedByEmployee = $includeGrouped ? $this->groupAssetsByEmployee($assets) : [];

            // Calculate summary statistics (optional)
            $summary = $includeSummary ? $this->calculateSummary($assets) : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'assets' => $assets,
                    'grouped_by_employee' => $groupedByEmployee,
                    'summary' => $summary,
                    'meta' => [
                        'total_count' => $totalCount,
                        'limit' => $limit > 0 ? $limit : null,
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Report generation failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export asset report as PDF.
     */
    public function exportAssets(Request $request)
    {
        try {
            $format = $request->input('format', 'pdf');

            $query = $this->buildAssetQuery($request);
            $assets = $query->get();
            $this->applyEffectiveStatus($assets, $request->input('report_date_to', $request->input('purchase_date_to')));
            $assets = $this->filterByEffectiveStatus($assets, $request->input('status_id'));
            $summary = $this->calculateSummary($assets);

            // Format filters for display
            $filters = $this->formatFiltersForDisplay($request);

            if ($format === 'pdf') {
                return $this->exportToPDF($assets, $summary, $filters);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unsupported export format',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build the asset query with all filters applied.
     * Includes both direct employee assignment and workstation-based assignment.
     */
    private function buildAssetQuery(Request $request)
    {
        $query = Asset::withoutGlobalScope('hide_expired_defective')->with([
            'category',
            'subcategory',
            'equipment',
            'equipment.subcategory',
            'vendor',
            'status',
            'assignedEmployee.branch',
            'assignedEmployee.position',
            'assignedEmployee.department',
            'assignedEmployee.obo:id,name',
            'workstation:id,name,branch_id,obo_id,employee_id',
            'workstation.obo:id,name',
            'workstation.employee:id,fullname,branch_id,obo_id,position_id,department_id',
            'workstation.employee.obo:id,name',
            'workstation.employee.branch:id,branch_name,brcode',
            'workstation.employee.position:id,title',
            'workstation.employee.department:id,name',
            'workstation.branch:id,branch_name,brcode',
            'movements' => function ($q) {
                $q->where('movement_type', 'status_changed')
                    ->orderBy('movement_date', 'asc');
            },
        ]);

        // Branch filter (via direct employee OR workstation)
        if ($request->has('branch_id') && $request->branch_id) {
            $branchId = $request->branch_id;
            $query->where(function ($q) use ($branchId) {
                $q->whereHas('assignedEmployee', function ($emp) use ($branchId) {
                    $emp->where('branch_id', $branchId);
                })->orWhereHas('workstation', function ($ws) use ($branchId) {
                    $ws->where('branch_id', $branchId);
                });
            });
        }

        // Category filter
        if ($request->has('category_id') && $request->category_id) {
            $query->where('asset_category_id', $request->category_id);
        }

        // Note: Status filter is intentionally NOT applied here. It is applied
        // AFTER applyEffectiveStatus() runs so the filter operates on the
        // historical (resolved) status, not the live status_id. Otherwise the
        // filter and the displayed status get out of sync (e.g. an asset
        // currently Functional but historically New would not match a "New"
        // filter even though the report would render it as New).

        // Vendor filter
        if ($request->has('vendor_id') && $request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Assigned employee filter (both direct and workstation-based)
        if ($request->has('assigned_to_employee_id') && $request->assigned_to_employee_id) {
            $employeeId = $request->assigned_to_employee_id;
            $query->where(function ($q) use ($employeeId) {
                $q->where('assigned_to_employee_id', $employeeId)
                    ->orWhereHas('workstation', function ($ws) use ($employeeId) {
                        $ws->where('employee_id', $employeeId);
                    });
            });
        }

        $reportDateFrom = $request->input('report_date_from', $request->input('purchase_date_from'));
        $reportDateTo = $request->input('report_date_to', $request->input('purchase_date_to'));
        $dateFilterField = $request->input('date_filter_field', 'purchase_date');

        if ($dateFilterField === 'status_change') {
            // Filter assets that had a status_changed movement within the date range.
            if ($reportDateFrom || $reportDateTo) {
                $query->whereHas('movements', function ($q) use ($reportDateFrom, $reportDateTo) {
                    $q->where('movement_type', 'status_changed');
                    if ($reportDateFrom) {
                        $q->whereDate('movement_date', '>=', $reportDateFrom);
                    }
                    if ($reportDateTo) {
                        $q->whereDate('movement_date', '<=', $reportDateTo);
                    }
                });
            }
        } else {
            // Default: filter by purchase_date.
            // Only the upper bound (report_date_to) is applied so that assets
            // purchased before the "from" date are still included — they may have
            // been New in an earlier period but are now Functional (or another
            // status) within the requested period. The historical status resolver
            // (applyEffectiveStatus) then shows the correct status as of report_date_to.
            if ($reportDateTo) {
                $query->whereDate('purchase_date', '<=', $reportDateTo);
            }
        }

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('asset_name', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'updated_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }

    /**
     * Filter the resolved asset collection by the historical (resolved) status.
     * Operates after applyEffectiveStatus has overwritten the status relation,
     * so the filter matches what the report actually displays.
     */
    private function filterByEffectiveStatus($assets, $statusId)
    {
        if (! $statusId) {
            return $assets;
        }

        $statusId = (int) $statusId;

        return $assets->filter(function ($asset) use ($statusId) {
            return (int) ($asset->status?->id ?? $asset->status_id) === $statusId;
        })->values();
    }

    /**
     * Resolve each asset's status as it was on $asOfDate. Resolution order:
     *   1. Latest explicit status_changed movement on or before the cutoff
     *      → use its to_status_id. Explicit history always wins so manual
     *      changes (e.g. an asset marked Defective on Aug 20) are respected.
     *   2. ELSE if $cutoff is within the first 30 days after the asset's
     *      purchase_date → return "New" (implicit auto-transition fallback,
     *      used when no explicit history exists yet for that window).
     *   3. ELSE earliest future status_changed movement → its from_status_id
     *      (status before the next change).
     *   4. ELSE keep the asset's current/live status.
     */
    private function applyEffectiveStatus($assets, ?string $asOfDate): void
    {
        if (! $asOfDate || $assets->isEmpty()) {
            return;
        }

        $cutoff = \Carbon\Carbon::parse($asOfDate)->endOfDay();
        $statusCache = [];

        $newStatus = Status::where('name', 'New')->first();
        $newStatusId = $newStatus?->id;
        if ($newStatus) {
            $statusCache[$newStatus->id] = $newStatus;
        }

        $functionalStatus = Status::where('name', 'Functional')->first();
        $functionalStatusId = $functionalStatus?->id;
        if ($functionalStatus) {
            $statusCache[$functionalStatus->id] = $functionalStatus;
        }

        foreach ($assets as $asset) {
            $effectiveStatusId = null;
            $effectiveStatusDate = null;
            $movements = $asset->movements ?? collect();
            $explicitlySetByHistory = false;

            // Pre-compute purchase date once so all steps can use it.
            $purchaseDate = null;
            if ($asset->purchase_date) {
                $purchaseDate = $asset->purchase_date instanceof \Carbon\Carbon
                    ? $asset->purchase_date->copy()
                    : \Carbon\Carbon::parse($asset->purchase_date);
            }
            $isOlderThanOneMonth = $purchaseDate && $cutoff->gte($purchaseDate->copy()->addMonth());

            // Step 1: explicit history — latest status_changed ≤ cutoff wins.
            $priorChange = $movements
                ->filter(fn ($m) => $m->movement_date && $m->movement_date->lte($cutoff))
                ->sortByDesc('movement_date')
                ->first();
            if ($priorChange) {
                $effectiveStatusId = $priorChange->to_status_id;
                $effectiveStatusDate = $priorChange->movement_date;
                $explicitlySetByHistory = true;
            }

            // Step 2: implicit "New for first 1 month" fallback.
            // If the asset has no explicit status history and the report cutoff
            // is within 1 calendar month of the purchase date, treat it as New.
            // Use the purchase date as the "status date" since that is when it became New.
            if ($effectiveStatusId === null && $newStatusId && ! $isOlderThanOneMonth && $purchaseDate) {
                $effectiveStatusId = $newStatusId;
                $effectiveStatusDate = $purchaseDate;
            }

            // Step 3: earliest future change tells us what we WERE before it.
            // If the future movement's from_status is "New" but the asset is
            // already older than 1 month at the cutoff, the movement was recorded
            // late (e.g. a bulk backfill). Use to_status_id in that case so the
            // asset is not incorrectly shown as New for a months-old purchase.
            if ($effectiveStatusId === null) {
                $futureChange = $movements
                    ->filter(fn ($m) => $m->movement_date && $m->movement_date->gt($cutoff))
                    ->sortBy('movement_date')
                    ->first();
                if ($futureChange) {
                    if ($isOlderThanOneMonth && $futureChange->from_status_id === $newStatusId) {
                        $effectiveStatusId = $futureChange->to_status_id;
                    } else {
                        $effectiveStatusId = $futureChange->from_status_id;
                    }
                    // Date is unknown for Step 3 — we know it was before the future change
                    // but not the exact date, so leave $effectiveStatusDate as null.
                }
            }

            // Final guard: an asset older than 1 month should not display as New
            // when its current live status has moved on. Two sub-cases:
            //
            // (a) Historical resolution = New, live status ≠ New → the "New" came
            //     from an erroneous or transitional movement (e.g. a Functional→New
            //     rollback that was later corrected outside the report window).
            //     Trust the live status instead.
            //
            // (b) Historical resolution = New (or null) AND live status is also New
            //     for an asset that is already > 1 month old → it was simply never
            //     transitioned in the system. Promote to Functional.
            if ($isOlderThanOneMonth) {
                $resolvedIsNew = $effectiveStatusId === $newStatusId
                    || ($effectiveStatusId === null && $asset->status_id === $newStatusId);

                if ($resolvedIsNew) {
                    if ($asset->status_id !== $newStatusId) {
                        // Sub-case (a): live status has moved on — drop override and
                        // let the asset keep its live status relation unchanged.
                        $effectiveStatusId = null;
                        $effectiveStatusDate = null;
                    } elseif ($functionalStatusId) {
                        // Sub-case (b): live status is still New for an old asset —
                        // promote to Functional as it has clearly been in service.
                        $effectiveStatusId = $functionalStatusId;
                        $effectiveStatusDate = null;
                    }
                }
            }

            // Attach the resolved status date so the frontend can display it.
            $asset->effective_status_date = $effectiveStatusDate instanceof \Carbon\Carbon
                ? $effectiveStatusDate->format('Y-m-d')
                : ($effectiveStatusDate ? \Carbon\Carbon::parse($effectiveStatusDate)->format('Y-m-d') : null);

            if ($effectiveStatusId && $effectiveStatusId !== $asset->status_id) {
                if (! array_key_exists($effectiveStatusId, $statusCache)) {
                    $statusCache[$effectiveStatusId] = Status::find($effectiveStatusId);
                }
                if ($statusCache[$effectiveStatusId]) {
                    $asset->setRelation('status', $statusCache[$effectiveStatusId]);
                }
            }
        }
    }

    /**
     * Group assets by effective employee (direct assignment or via workstation).
     * Assets on workstations without employees are grouped by workstation name.
     */
    private function groupAssetsByEmployee($assets)
    {
        // Group by workstation. Assets without a workstation fall back to
        // direct employee assignment, and truly unassigned assets go to
        // the 'unassigned' bucket.
        $grouped = $assets->groupBy(function ($asset) {
            if ($asset->workstation_id) {
                return 'ws:'.$asset->workstation_id;
            }
            if ($asset->assigned_to_employee_id) {
                return 'emp:'.$asset->assigned_to_employee_id;
            }

            return 'unassigned';
        })->map(function ($groupAssets, $groupKey) {
            $firstAsset = $groupAssets->first();
            $workstation = $firstAsset->workstation;
            $employee = $workstation?->employee ?? $firstAsset->assignedEmployee;
            $totalAcquisitionCost = $groupAssets->sum('acq_cost') ?? 0;

            // Determine OBO data from workstation or employee
            $oboData = null;
            if ($workstation?->obo) {
                $oboData = ['id' => $workstation->obo->id, 'name' => $workstation->obo->name];
            } elseif ($employee?->obo) {
                $oboData = ['id' => $employee->obo->id, 'name' => $employee->obo->name];
            }

            // Determine branch from workstation (primary) or employee (fallback)
            $branch = $workstation?->branch ?? $employee?->branch;

            $employeeData = null;
            if ($employee) {
                $employeeData = [
                    'id' => $employee->id,
                    'fullname' => $employee->fullname,
                    'branch' => $branch ? [
                        'id' => $branch->id,
                        'branch_name' => $branch->branch_name,
                        'brcode' => $branch->brcode,
                    ] : null,
                    'position' => $employee->position ? [
                        'id' => $employee->position->id,
                        'title' => $employee->position->title,
                    ] : null,
                    'department' => $employee->department ? [
                        'id' => $employee->department->id,
                        'name' => $employee->department->name,
                    ] : null,
                    'obo' => $oboData,
                    'is_workstation' => (bool) $workstation,
                    'workstation_name' => $workstation?->name,
                ];
            } elseif ($workstation) {
                // Workstation exists but no employee assigned
                $employeeData = [
                    'id' => null,
                    'fullname' => $workstation->name,
                    'employee_id' => null,
                    'branch' => $branch ? [
                        'id' => $branch->id,
                        'branch_name' => $branch->branch_name,
                        'brcode' => $branch->brcode,
                    ] : null,
                    'position' => null,
                    'department' => null,
                    'is_workstation' => true,
                    'workstation_name' => $workstation->name,
                    'obo' => $oboData,
                ];
            }

            $branchName = $employeeData['branch']['branch_name'] ?? '';
            $employeeType = $this->resolveEmployeeType($branchName, $employeeData);

            return [
                'employee_id' => $employee?->id,
                'employee' => $employeeData,
                'employee_type' => $employeeType,
                'assets' => $groupAssets->values(),
                'total_assets' => $groupAssets->count(),
                'total_acquisition_cost' => round($totalAcquisitionCost, 2),
            ];
        });

        // Sort: Unassigned first, then Branch groups, then BLU groups.
        // Within each type: sort by branch code, then OBO groups, then employee name.
        return $grouped->sortBy(function ($group) {
            $type = $group['employee_type'];
            $typeOrder = match ($type) {
                'Unassigned' => '0',
                'Branch' => '1',
                'BLU' => '2',
                default => '3',
            };
            $brcode = strtolower($group['employee']['branch']['brcode'] ?? '');
            $branchName = strtolower($group['employee']['branch']['branch_name'] ?? '');
            $oboName = strtolower($group['employee']['obo']['name'] ?? '');
            $oboFlag = $oboName === '' ? '0' : '1';
            $name = strtolower($group['employee']['fullname'] ?? '');

            return $typeOrder.'|'.$brcode.'|'.$branchName.'|'.$oboFlag.'|'.$oboName.'|'.$name;
        })->values();
    }

    /**
     * Classify an employee/workstation group as Branch, BLU, or Unassigned.
     * BLU branches are identified by the substring "BLU" in the branch name.
     */
    private function resolveEmployeeType(string $branchName, ?array $employeeData): string
    {
        if ($employeeData === null) {
            return 'Unassigned';
        }

        if ($branchName === '') {
            return 'Unassigned';
        }

        return stripos($branchName, 'BLU') !== false ? 'BLU' : 'Branch';
    }

    /**
     * Calculate summary statistics for the report.
     */
    private function calculateSummary($assets)
    {
        $totalCount = $assets->count();
        $totalAcquisitionCost = $assets->sum('acq_cost') ?? 0;
        $totalBookValue = $assets->sum('book_value') ?? 0;
        $totalDepreciation = $totalAcquisitionCost - $totalBookValue;

        // Group by category
        $byCategory = $assets->groupBy(function ($asset) {
            return $asset->category->name ?? 'Uncategorized';
        })->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_cost' => $group->sum('acq_cost'),
                'total_book_value' => $group->sum('book_value'),
            ];
        });

        // Group by status
        $byStatus = $assets->groupBy(function ($asset) {
            return $asset->status->name ?? 'Unknown';
        })->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_cost' => $group->sum('acq_cost'),
                'total_book_value' => $group->sum('book_value'),
            ];
        });

        // Group by branch (check workstation branch first, then direct employee branch)
        $byBranch = $assets->groupBy(function ($asset) {
            return $asset->workstation?->branch?->branch_name
                ?? $asset->assignedEmployee?->branch?->branch_name
                ?? 'Unassigned';
        })->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_cost' => $group->sum('acq_cost'),
                'total_book_value' => $group->sum('book_value'),
            ];
        });

        return [
            'total_count' => $totalCount,
            'total_acquisition_cost' => round($totalAcquisitionCost, 2),
            'total_book_value' => round($totalBookValue, 2),
            'total_depreciation' => round($totalDepreciation, 2),
            'by_category' => $byCategory,
            'by_status' => $byStatus,
            'by_branch' => $byBranch,
        ];
    }

    /**
     * Format filter values for display in PDF.
     */
    private function formatFiltersForDisplay(Request $request)
    {
        $filters = [];

        $reportDateFrom = $request->input('report_date_from', $request->input('purchase_date_from'));
        $reportDateTo = $request->input('report_date_to', $request->input('purchase_date_to'));

        if ($reportDateFrom) {
            $filters[] = 'Report Date From: '.date('M d, Y', strtotime($reportDateFrom));
        }

        if ($reportDateTo) {
            $filters[] = 'Report Date To: '.date('M d, Y', strtotime($reportDateTo));
        }

        if ($request->has('branch_id') && $request->branch_id) {
            $branch = \App\Models\Branch::find($request->branch_id);
            if ($branch) {
                $filters[] = 'Branch: '.$branch->branch_name;
            }
        }

        if ($request->has('category_id') && $request->category_id) {
            $category = \App\Models\AssetCategory::find($request->category_id);
            if ($category) {
                $filters[] = 'Category: '.$category->name;
            }
        }

        if ($request->has('status_id') && $request->status_id) {
            $status = \App\Models\Status::find($request->status_id);
            if ($status) {
                $filters[] = 'Status: '.$status->name;
            }
        }

        if ($request->has('vendor_id') && $request->vendor_id) {
            $vendor = \App\Models\Vendor::find($request->vendor_id);
            if ($vendor) {
                $filters[] = 'Vendor: '.$vendor->company_name;
            }
        }

        if ($request->has('search') && $request->search) {
            $filters[] = 'Search: '.$request->search;
        }

        return implode(' | ', $filters);
    }

    /**
     * Export report to PDF format.
     */
    private function exportToPDF($assets, $summary, $filtersDisplay)
    {
        // Group assets by employee for the PDF
        $groupedByEmployee = $this->groupAssetsByEmployee($assets);

        $pdf = PDF::loadView('exports.assets-pdf', [
            'assets' => $assets,
            'groupedByEmployee' => $groupedByEmployee,
            'summary' => $summary,
            'filters' => $filtersDisplay,
        ])->setPaper('a4', 'landscape');

        $filename = 'asset-report-'.now()->format('Y-m-d-His').'.pdf';

        return $pdf->download($filename);
    }
}
