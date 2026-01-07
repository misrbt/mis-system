<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>IT Asset Report</title>
    <style>
        @page {
            size: A4 landscape;
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
                <th style="width: 14%;">Name of User</th>
                <th style="width: 13%;">Equipment</th>
                <th style="width: 8%;">Serial No.</th>
                <th style="width: 6%;">Date Acq</th>
                <th style="width: 7%;">Type</th>
                <th style="width: 10%;">Vendor</th>
                <th style="width: 8%;" class="text-right">Acq Cost</th>
                <th style="width: 4%;" class="text-center">Est. Life</th>
                <th style="width: 6%;">Exp. Date</th>
                <th style="width: 6%;">Current Date</th>
                <th style="width: 8%;" class="text-right">Book Value</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($groupedByEmployee as $group)
                @foreach($group['assets'] as $assetIndex => $asset)
                    @php
                        $isFirstAsset = $assetIndex === 0;
                        $purchaseDate = $asset->purchase_date ? \Carbon\Carbon::parse($asset->purchase_date) : null;
                        $estLife = $asset->estimated_life ?? 3;
                        $expirationDate = $purchaseDate ? $purchaseDate->copy()->addYears($estLife) : null;
                    @endphp
                    <tr style="{{ $assetIndex === count($group['assets']) - 1 ? 'border-bottom: 2px solid #C7D2FE;' : '' }}">
                        <td style="font-size: 7pt; line-height: 1.3;">
                            @if($isFirstAsset)
                                <strong>{{ $group['employee']['fullname'] ?? 'Unassigned' }}</strong><br/>
                                @if(isset($group['employee']['position']['title']))
                                    <span style="font-size: 6pt; color: #666;">{{ $group['employee']['position']['title'] }}</span><br/>
                                @endif
                                @if(isset($group['employee']['branch']['branch_name']))
                                    <span style="font-size: 6pt; color: #666;">{{ $group['employee']['branch']['branch_name'] }}</span>
                                @endif
                            @endif
                        </td>
                        <td>{{ $asset->asset_name }}</td>
                        <td class="text-nowrap">{{ $asset->serial_number ?: '—' }}</td>
                        <td>{{ $purchaseDate ? $purchaseDate->format('m/d/y') : '—' }}</td>
                        <td>{{ $asset->category->name ?? '—' }}</td>
                        <td>{{ $asset->vendor->company_name ?? '—' }}</td>
                        <td class="text-right currency">{{ number_format($asset->acq_cost ?? 0, 2) }}</td>
                        <td class="text-center">{{ $estLife }}</td>
                        <td>{{ $expirationDate ? $expirationDate->format('m/d/y') : '—' }}</td>
                        <td>{{ \Carbon\Carbon::now()->format('m/d/Y') }}</td>
                        <td class="text-right currency">{{ number_format($asset->book_value ?? 0, 2) }}</td>
                        <td>{{ $asset->status->name ?? '—' }}</td>
                    </tr>
                @endforeach
            @empty
            <tr>
                <td colspan="12" class="text-center" style="padding: 20px; color: #999;">
                    No assets found matching the selected criteria
                </td>
            </tr>
            @endforelse
        </tbody>
        @if($assets->count() > 0)
        <tfoot style="background: #10B981; color: white; font-weight: bold; font-size: 10pt;">
            <tr>
                <td colspan="6" style="padding: 10px; text-align: right;">GRAND TOTAL:</td>
                <td class="text-right currency" style="padding: 10px;">₱{{ number_format($summary['total_acquisition_cost'], 2) }}</td>
                <td colspan="3" class="text-center" style="padding: 10px;">{{ $summary['total_count'] }} Assets</td>
                <td class="text-right currency" style="padding: 10px;">₱{{ number_format($summary['total_book_value'], 2) }}</td>
                <td></td>
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
