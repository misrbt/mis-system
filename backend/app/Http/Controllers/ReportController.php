<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Get asset report data with filtering and summary statistics.
     */
    public function getAssetReport(Request $request)
    {
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
     */
    private function buildAssetQuery(Request $request)
    {
        $query = Asset::with([
            'category',
            'vendor',
            'status',
            'assignedEmployee.branch',
            'assignedEmployee.position',
            'assignedEmployee.department'
        ]);

        // Branch filter (via employee relationship)
        if ($request->has('branch_id') && $request->branch_id) {
            $query->whereHas('assignedEmployee', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        // Category filter
        if ($request->has('category_id') && $request->category_id) {
            $query->where('asset_category_id', $request->category_id);
        }

        // Status filter
        if ($request->has('status_id') && $request->status_id) {
            $query->where('status_id', $request->status_id);
        }

        // Vendor filter
        if ($request->has('vendor_id') && $request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Assigned employee filter
        if ($request->has('assigned_to_employee_id') && $request->assigned_to_employee_id) {
            $query->where('assigned_to_employee_id', $request->assigned_to_employee_id);
        }

        $reportDateTo = $request->input('report_date_to', $request->input('purchase_date_to'));

        // Report snapshot: Show all assets that existed as of the end date
        // Only filter by purchase date <= end date (asset must have been acquired by then)
        if ($reportDateTo) {
            $query->whereDate('purchase_date', '<=', $reportDateTo);
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
     * Group assets by employee with totals.
     */
    private function groupAssetsByEmployee($assets)
    {
        $grouped = $assets->groupBy('assigned_to_employee_id')->map(function ($employeeAssets, $employeeId) {
            $employee = $employeeAssets->first()->assignedEmployee;
            $totalAcquisitionCost = $employeeAssets->sum('acq_cost') ?? 0;

            return [
                'employee_id' => $employeeId,
                'employee' => $employee ? [
                    'id' => $employee->id,
                    'fullname' => $employee->fullname,
                    'employee_id' => $employee->employee_id,
                    'branch' => $employee->branch ? [
                        'id' => $employee->branch->id,
                        'branch_name' => $employee->branch->branch_name,
                    ] : null,
                    'position' => $employee->position ? [
                        'id' => $employee->position->id,
                        'title' => $employee->position->title,
                    ] : null,
                    'department' => $employee->department ? [
                        'id' => $employee->department->id,
                        'dept_name' => $employee->department->dept_name,
                    ] : null,
                ] : null,
                'assets' => $employeeAssets->values(),
                'total_assets' => $employeeAssets->count(),
                'total_acquisition_cost' => round($totalAcquisitionCost, 2),
            ];
        });

        // Sort: Unassigned first, then by employee name
        return $grouped->sortBy(function ($group) {
            if ($group['employee_id'] === null) {
                return '0'; // Unassigned first
            }
            return '1' . ($group['employee']['fullname'] ?? '');
        })->values();
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

        // Group by branch
        $byBranch = $assets->groupBy(function ($asset) {
            return $asset->assignedEmployee->branch->branch_name ?? 'Unassigned';
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
            $filters[] = 'Report Date From: ' . date('M d, Y', strtotime($reportDateFrom));
        }

        if ($reportDateTo) {
            $filters[] = 'Report Date To: ' . date('M d, Y', strtotime($reportDateTo));
        }

        if ($request->has('branch_id') && $request->branch_id) {
            $branch = \App\Models\Branch::find($request->branch_id);
            if ($branch) {
                $filters[] = 'Branch: ' . $branch->branch_name;
            }
        }

        if ($request->has('category_id') && $request->category_id) {
            $category = \App\Models\AssetCategory::find($request->category_id);
            if ($category) {
                $filters[] = 'Category: ' . $category->name;
            }
        }

        if ($request->has('status_id') && $request->status_id) {
            $status = \App\Models\Status::find($request->status_id);
            if ($status) {
                $filters[] = 'Status: ' . $status->name;
            }
        }

        if ($request->has('vendor_id') && $request->vendor_id) {
            $vendor = \App\Models\Vendor::find($request->vendor_id);
            if ($vendor) {
                $filters[] = 'Vendor: ' . $vendor->company_name;
            }
        }

        if ($request->has('search') && $request->search) {
            $filters[] = 'Search: ' . $request->search;
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

        $filename = 'asset-report-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }
}
