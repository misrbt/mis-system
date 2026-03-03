<?php

namespace App\Models;

use App\Services\QRCodeMonkeyService;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Asset extends Model
{
    use HasFactory;

    protected $table = 'assets';

    /**
     * The "booted" method of the model.
     * Automatically exclude expired defective assets from queries.
     * Deletion is handled by scheduled command (CleanupExpiredDefectiveAssets).
     */
    protected static function booted()
    {
        if (! Schema::hasColumn('assets', 'delete_after_at')) {
            return;
        }

        // Global scope to automatically exclude expired defective assets
        // Deletion is now handled by scheduled command for better performance
        static::addGlobalScope('hide_expired_defective', function ($query) {
            $query->where(function ($q) {
                $q->whereNull('delete_after_at')
                    ->orWhere('delete_after_at', '>', now());
            });
        });
    }

    protected $fillable = [
        'asset_name',
        'asset_category_id',
        'subcategory_id',
        'equipment_id',
        'book_value',
        'serial_number',
        'purchase_date',
        'acq_cost',
        'waranty_expiration_date',
        'estimate_life',
        'vendor_id',
        'status_id',
        'defective_at',
        'delete_after_at',
        'remarks',
        'specifications',
        'assigned_to_employee_id',
        'workstation_branch_id',
        'workstation_position_id',
        'workstation_id',
        'qr_code',
        'barcode',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'waranty_expiration_date' => 'date',
        'book_value' => 'float',
        'acq_cost' => 'float',
        'estimate_life' => 'float',
        'specifications' => 'array',
        'defective_at' => 'datetime',
        'delete_after_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(AssetSubcategory::class, 'subcategory_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id');
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function workstationBranch()
    {
        return $this->belongsTo(Branch::class, 'workstation_branch_id');
    }

    public function workstationPosition()
    {
        return $this->belongsTo(Position::class, 'workstation_position_id');
    }

    /**
     * Get the workstation this asset belongs to.
     */
    public function workstation()
    {
        return $this->belongsTo(Workstation::class);
    }

    public function repairs()
    {
        return $this->hasMany(Repair::class);
    }

    public function activeRepairs()
    {
        return $this->repairs()
            ->whereIn('status', ['Pending', 'In Repair', 'Completed']);
    }

    /**
     * Asset Movement Relationships
     */
    public function movements()
    {
        return $this->hasMany(AssetMovement::class)->orderBy('movement_date', 'desc');
    }

    public function latestMovement()
    {
        return $this->hasOne(AssetMovement::class)->latestOfMany('movement_date');
    }

    /**
     * Components relationship (for Desktop PC assets)
     */
    public function components()
    {
        return $this->hasMany(AssetComponent::class, 'parent_asset_id');
    }

    /**
     * Movement Statistics Helpers
     */
    public function getAssignmentCount()
    {
        return $this->movements()->whereIn('movement_type', ['assigned', 'transferred'])->count();
    }

    public function getRepairCount()
    {
        return $this->movements()->where('movement_type', 'repair_initiated')->count();
    }

    public function getStatusChangeCount()
    {
        return $this->movements()->where('movement_type', 'status_changed')->count();
    }

    public function getCurrentAssignmentDuration()
    {
        if (! $this->assigned_to_employee_id) {
            return null;
        }

        $lastAssignment = $this->movements()
            ->whereIn('movement_type', ['assigned', 'transferred'])
            ->where('to_employee_id', $this->assigned_to_employee_id)
            ->latest('movement_date')
            ->first();

        if (! $lastAssignment) {
            return null;
        }

        return now()->diffInDays($lastAssignment->movement_date);
    }

    /** Cached result of calculateBookValue() for the current request. */
    private ?array $bookValueCache = null;

    /**
     * Calculate the current book value using straight-line depreciation
     * Formula: Book Value = max(1, Amount Purchased - (Daily Depreciation × Days Since Purchase))
     * Daily Depreciation = Amount Purchased / (Life in Years × 365)
     */
    public function calculateBookValue($asOfDate = null)
    {
        // Return the cached result for the default (current-date) calculation
        if ($asOfDate === null && $this->bookValueCache !== null) {
            return $this->bookValueCache;
        }

        // Return null if required fields are missing
        if (! $this->purchase_date || ! $this->estimate_life || ! $this->acq_cost) {
            $purchaseDateString = $this->purchase_date
                ? \Carbon\Carbon::parse($this->purchase_date)->toDateString()
                : null;
            $asOfDateString = $asOfDate
                ? \Carbon\Carbon::parse($asOfDate)->toDateString()
                : now()->toDateString();

            $result = [
                'book_value' => $this->acq_cost ?? 0,
                'purchase_date' => $purchaseDateString,
                'as_of_date' => $asOfDateString,
                'life_years' => $this->estimate_life ?? 0,
                'amount_purchased' => $this->acq_cost ?? 0,
                'days_elapsed' => 0,
                'daily_depreciation' => 0,
                'diminished_value' => 0,
            ];

            if ($asOfDate === null) {
                $this->bookValueCache = $result;
            }

            return $result;
        }

        // Parse dates
        $purchaseDate = \Carbon\Carbon::parse($this->purchase_date);
        $resolvedDate = $asOfDate ? \Carbon\Carbon::parse($asOfDate) : now();

        // Calculate number of days since purchase
        // Use startOfDay to ensure we only count FULL days (not partial days)
        // This ensures book value doesn't depreciate on the purchase day itself
        $daysElapsed = $purchaseDate->startOfDay()->diffInDays($resolvedDate->startOfDay());

        // Calculate total life in days
        $totalLifeDays = $this->estimate_life * 365;

        // Calculate daily depreciation
        $dailyDepreciation = $this->acq_cost / $totalLifeDays;

        // Calculate diminished value
        $diminishedValue = $dailyDepreciation * $daysElapsed;

        // Calculate book value as of cutoff (never less than 1)
        $bookValue = max(1, $this->acq_cost - $diminishedValue);

        $result = [
            'purchase_date' => $purchaseDate->toDateString(),
            'as_of_date' => $resolvedDate->toDateString(),
            'life_years' => $this->estimate_life,
            'amount_purchased' => $this->acq_cost,
            'days_elapsed' => $daysElapsed,
            'daily_depreciation' => round($dailyDepreciation, 2),
            'diminished_value' => round($diminishedValue, 2),
            'book_value' => round($bookValue, 2),
        ];

        if ($asOfDate === null) {
            $this->bookValueCache = $result;
        }

        return $result;
    }

    /**
     * Automatic real-time book value calculation accessor
     * Whenever you access $asset->book_value, it calculates the current depreciated value
     * NO SCHEDULER NEEDED - Always shows exact current value
     */
    protected function bookValue(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // If required fields are missing, return stored value or acquisition cost
                if (! $this->purchase_date || ! $this->estimate_life || ! $this->acq_cost) {
                    return $value ?? $this->acq_cost ?? 0;
                }

                // Calculate real-time depreciated book value
                $purchaseDate = \Carbon\Carbon::parse($this->purchase_date);
                $daysElapsed = $purchaseDate->startOfDay()->diffInDays(now()->startOfDay());
                $totalLifeDays = $this->estimate_life * 365;
                $dailyDepreciation = $this->acq_cost / $totalLifeDays;
                $bookValue = max(1, $this->acq_cost - ($dailyDepreciation * $daysElapsed));

                return round($bookValue, 2);
            }
        );
    }

    /**
     * Update the book value in the database (optional - for manual updates)
     */
    public function updateBookValue()
    {
        $calculation = $this->calculateBookValue();
        $this->book_value = $calculation['book_value'];
        $this->save();

        return $calculation;
    }

    /**
     * Check if asset should transition from "New" to "Functional"
     * Assets created 30+ days ago with status "New" should become "Functional"
     */
    public function shouldTransitionToFunctional()
    {
        // Check if status is "New"
        if (! $this->status || $this->status->name !== 'New') {
            return false;
        }

        // Check if created 30+ days ago
        $daysSinceCreation = $this->created_at->diffInDays(now());

        return $daysSinceCreation >= 30;
    }

    /**
     * Transition asset status from "New" to "Functional"
     */
    public function transitionToFunctional()
    {
        $functionalStatus = Status::where('name', 'Functional')->first();

        if ($functionalStatus && $this->shouldTransitionToFunctional()) {
            $this->status_id = $functionalStatus->id;
            $this->save();

            return true;
        }

        return false;
    }

    /**
     * Appends are disabled by default for performance.
     * Use $asset->append(['calculated_book_value', 'depreciation_info']) when needed.
     */
    protected $appends = [];

    /**
     * Accessor for calculated book value.
     * Not appended by default - call $asset->append('calculated_book_value') when needed.
     */
    public function getCalculatedBookValueAttribute(): float
    {
        return $this->calculateBookValue()['book_value'];
    }

    /**
     * Accessor for full depreciation info.
     * Not appended by default - call $asset->append('depreciation_info') when needed.
     *
     * @return array<string, mixed>
     */
    public function getDepreciationInfoAttribute(): array
    {
        return $this->calculateBookValue();
    }

    /**
     * Generate QR code for this asset using QR Code Monkey API
     * Returns base64 encoded PNG image with square design (frame0, ball0)
     *
     * @param  string  $type  Type of QR code: 'simple' (serial only), 'url' (asset URL), 'full' (all info)
     * @return string|null Base64 encoded PNG image
     */
    public function generateQRCode(string $type = 'simple')
    {
        switch ($type) {
            case 'url':
                // Generate QR with URL to asset page
                $baseUrl = config('app.frontend_url', config('app.url', 'http://localhost:5173'));

                return QRCodeMonkeyService::generateForAssetWithUrl($this, $baseUrl);

            case 'full':
                // Generate QR with full asset information
                return QRCodeMonkeyService::generateForAssetWithInfo($this);

            case 'simple':
            default:
                // Generate QR with just serial number (default - most scannable)
                return QRCodeMonkeyService::generateForAsset($this);
        }
    }

    /**
     * Legacy method - Generate QR code using local library (fallback)
     * Returns base64 encoded SVG image
     * Simple table format - easy to read when scanned
     */
    public function generateQRCodeLegacy()
    {
        $purchaseDate = $this->purchase_date
            ? \Carbon\Carbon::parse($this->purchase_date)->toDateString()
            : '-';
        $warrantyDate = $this->waranty_expiration_date
            ? \Carbon\Carbon::parse($this->waranty_expiration_date)->toDateString()
            : '-';
        $acqCost = ! is_null($this->acq_cost) ? 'PHP '.number_format($this->acq_cost, 2) : '-';
        $bookValue = ! is_null($this->book_value) ? 'PHP '.number_format($this->book_value, 2) : '-';

        // Simple table format - clean and easy to read
        $qrData = "ASSET INFO\n";
        $qrData .= 'Name: '.($this->asset_name ?? '-')."\n";
        $qrData .= 'Serial: '.($this->serial_number ?? '-')."\n";
        $qrData .= 'Category: '.($this->category?->name ?? '-')."\n";
        $qrData .= 'Status: '.($this->status?->name ?? '-')."\n";
        $qrData .= 'Assigned Personnel: '.($this->assignedEmployee?->fullname ?? 'Unassigned')."\n";
        $qrData .= 'Branch: '.($this->assignedEmployee?->branch?->branch_name ?? '-')."\n";
        $qrData .= 'Purchase: '.$purchaseDate."\n";
        $qrData .= 'Warranty: '.$warrantyDate."\n";
        $qrData .= 'Cost: '.$acqCost."\n";
        $qrData .= 'Book Value: '.$bookValue;

        $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
            ->size(400)
            ->margin(2)
            ->errorCorrection('M')
            ->generate($qrData);

        return 'data:image/svg+xml;base64,'.base64_encode($qrCode);
    }

    /**
     * Generate and save QR code for this asset
     * Uses QR Code Monkey API with fallback to legacy local generation
     *
     * @param  string  $type  Type of QR code: 'simple', 'url', or 'full'
     * @param  bool  $useFallback  Whether to use legacy fallback if API fails
     * @return array Result with 'success', 'qr_code', 'source', and optionally 'error'
     */
    public function generateAndSaveQRCode(string $type = 'simple', bool $useFallback = true): array
    {
        $result = [
            'success' => false,
            'qr_code' => null,
            'source' => null,
            'error' => null,
        ];

        // Try QR Code Monkey API first
        $qrCode = $this->generateQRCode($type);

        if ($qrCode) {
            $this->qr_code = $qrCode;
            $this->save();

            $result['success'] = true;
            $result['qr_code'] = $qrCode;
            $result['source'] = 'qr_code_monkey';

            return $result;
        }

        // Get error information from the service
        $apiError = QRCodeMonkeyService::getLastError();

        if ($useFallback) {
            // Fallback to legacy if API fails
            \Illuminate\Support\Facades\Log::warning("QR Code Monkey API failed for asset {$this->id}, using legacy generator", [
                'error' => $apiError,
            ]);

            $qrCode = $this->generateQRCodeLegacy();

            if ($qrCode) {
                $this->qr_code = $qrCode;
                $this->save();

                $result['success'] = true;
                $result['qr_code'] = $qrCode;
                $result['source'] = 'legacy';
                $result['warning'] = $apiError ? $apiError['message'] : 'QR Code Monkey API unavailable, used local generator';

                return $result;
            }
        }

        // Both methods failed
        $result['error'] = $apiError ? $apiError['message'] : 'Failed to generate QR code';
        $result['error_code'] = $apiError ? $apiError['code'] : 'GENERATION_FAILED';

        return $result;
    }

    /**
     * Generate barcode for this asset
     * Returns base64 encoded SVG image
     */
    public function generateBarcode()
    {
        // Only generate barcode if serial number exists
        if (! $this->serial_number) {
            return null;
        }

        // Use serial number as barcode value
        $barcodeValue = $this->serial_number;

        // Generate CODE128 barcode as SVG
        $generator = new \Picqer\Barcode\BarcodeGeneratorSVG;
        $barcodeSvg = $generator->getBarcode($barcodeValue, $generator::TYPE_CODE_128, 3, 80);

        return 'data:image/svg+xml;base64,'.base64_encode($barcodeSvg);
    }

    /**
     * Generate and save barcode for this asset
     */
    public function generateAndSaveBarcode()
    {
        $this->barcode = $this->generateBarcode();
        $this->save();

        return $this->barcode;
    }
}
