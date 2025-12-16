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
            $assets = $query->get();

            // Calculate summary statistics
            $summary = $this->calculateSummary($assets);

            return response()->json([
                'success' => true,
                'data' => [
                    'assets' => $assets,
                    'summary' => $summary,
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

        // Purchase date range filter
        if ($request->has('purchase_date_from') && $request->purchase_date_from) {
            $query->where('purchase_date', '>=', $request->purchase_date_from);
        }

        if ($request->has('purchase_date_to') && $request->purchase_date_to) {
            $query->where('purchase_date', '<=', $request->purchase_date_to);
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
        $sortBy = $request->get('sort_by', 'purchase_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return $query;
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

        if ($request->has('purchase_date_from') && $request->purchase_date_from) {
            $filters[] = 'From: ' . date('M d, Y', strtotime($request->purchase_date_from));
        }

        if ($request->has('purchase_date_to') && $request->purchase_date_to) {
            $filters[] = 'To: ' . date('M d, Y', strtotime($request->purchase_date_to));
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
        $pdf = PDF::loadView('exports.assets-pdf', [
            'assets' => $assets,
            'summary' => $summary,
            'filters' => $filtersDisplay,
        ])->setPaper('a4', 'landscape');

        $filename = 'asset-report-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }
}
