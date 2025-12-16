<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>IT Asset Report</title>
    <style>
        @page {
            margin: 15mm;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9pt;
            color: #333;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #4F46E5;
        }
        .header h1 {
            font-size: 20pt;
            margin: 0 0 5px 0;
            color: #4F46E5;
            font-weight: bold;
        }
        .header .subtitle {
            font-size: 10pt;
            color: #666;
            margin: 3px 0;
        }
        .header .filters {
            font-size: 9pt;
            color: #888;
            margin-top: 8px;
            font-style: italic;
        }
        .summary {
            background: #F8F9FA;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 4px;
            border-left: 4px solid #4F46E5;
        }
        .summary h2 {
            font-size: 11pt;
            margin: 0 0 10px 0;
            color: #4F46E5;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 25%;
            padding: 5px;
        }
        .summary-label {
            font-size: 8pt;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
        }
        .summary-value {
            font-size: 13pt;
            color: #333;
            font-weight: bold;
            margin-top: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 8pt;
        }
        thead {
            background: #4F46E5;
            color: white;
        }
        th {
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 8pt;
        }
        td {
            padding: 6px;
            border-bottom: 1px solid #E5E7EB;
        }
        tbody tr:nth-child(even) {
            background: #F9FAFB;
        }
        tbody tr:hover {
            background: #F3F4F6;
        }
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8pt;
            color: #999;
            border-top: 1px solid #E5E7EB;
            padding-top: 5px;
        }
        .page-number:after {
            content: counter(page);
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .text-nowrap {
            white-space: nowrap;
        }
        .currency {
            font-family: 'DejaVu Sans Mono', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>IT Asset Report</h1>
        <p class="subtitle">RBT Bank - Information Technology Department</p>
        <p class="subtitle">Generated on {{ date('F d, Y \a\t h:i A') }}</p>
        @if($filters)
            <p class="filters">{{ $filters }}</p>
        @endif
    </div>

    <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Assets</div>
                <div class="summary-value">{{ number_format($summary['total_count']) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Acquisition Cost</div>
                <div class="summary-value currency">₱{{ number_format($summary['total_acquisition_cost'], 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Current Book Value</div>
                <div class="summary-value currency">₱{{ number_format($summary['total_book_value'], 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Depreciation</div>
                <div class="summary-value currency">₱{{ number_format($summary['total_depreciation'], 2) }}</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 3%;">#</th>
                <th style="width: 18%;">Asset Name</th>
                <th style="width: 10%;">Serial #</th>
                <th style="width: 10%;">Category</th>
                <th style="width: 12%;">Brand/Model</th>
                <th style="width: 8%;">Status</th>
                <th style="width: 12%;">Assigned To</th>
                <th style="width: 10%;">Branch</th>
                <th style="width: 9%;" class="text-right">Acq. Cost</th>
                <th style="width: 8%;" class="text-right">Book Value</th>
            </tr>
        </thead>
        <tbody>
            @forelse($assets as $index => $asset)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $asset->asset_name }}</td>
                <td class="text-nowrap">{{ $asset->serial_number ?: '—' }}</td>
                <td>{{ $asset->category->name ?? '—' }}</td>
                <td>{{ trim(($asset->brand ?? '') . ' ' . ($asset->model ?? '')) ?: '—' }}</td>
                <td>{{ $asset->status->name ?? '—' }}</td>
                <td>{{ $asset->assignedEmployee->fullname ?? 'Unassigned' }}</td>
                <td>{{ $asset->assignedEmployee->branch->branch_name ?? '—' }}</td>
                <td class="text-right currency">₱{{ number_format($asset->acq_cost ?? 0, 2) }}</td>
                <td class="text-right currency">₱{{ number_format($asset->book_value ?? 0, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center" style="padding: 20px; color: #999;">
                    No assets found matching the selected criteria
                </td>
            </tr>
            @endforelse
        </tbody>
        @if($assets->count() > 0)
        <tfoot style="background: #F3F4F6; font-weight: bold;">
            <tr>
                <td colspan="8" class="text-right" style="padding: 10px;">TOTAL:</td>
                <td class="text-right currency">₱{{ number_format($summary['total_acquisition_cost'], 2) }}</td>
                <td class="text-right currency">₱{{ number_format($summary['total_book_value'], 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        <p>RBT Bank IT Asset Management System | Page <span class="page-number"></span> | Confidential</p>
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
            $size = 8;
            $font = $fontMetrics->getFont("DejaVu Sans");
            $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
            $x = ($pdf->get_width() - $width) / 2;
            $y = $pdf->get_height() - 30;
            $pdf->page_text($x, $y, $text, $font, $size);
        }
    </script>
</body>
</html>
