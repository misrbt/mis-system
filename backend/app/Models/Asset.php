<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Asset extends Model
{
    use HasFactory;

    protected $table = 'assets';

    /**
     * The "booted" method of the model.
     * Auto-cleanup defective assets - works exactly like book value calculation
     * NO SCHEDULER NEEDED - Automatic cleanup whenever assets are queried
     */
    protected static function booted()
    {
        // Global scope to automatically exclude AND delete expired defective assets
        // This runs on EVERY query, ensuring real-time cleanup
        static::addGlobalScope('auto_delete_expired_defective', function ($query) {
            // First, delete any assets that have passed their delete_after_at timestamp
            // This happens in the background without blocking the query
            try {
                // Get assets ready for deletion (outside global scope to avoid recursion)
                $assetsToDelete = static::withoutGlobalScope('auto_delete_expired_defective')
                    ->whereNotNull('delete_after_at')
                    ->where('delete_after_at', '<=', now())
                    ->limit(50) // Batch delete to avoid performance issues
                    ->get();

                if ($assetsToDelete->isNotEmpty()) {
                    foreach ($assetsToDelete as $asset) {
                        try {
                            \Illuminate\Support\Facades\Log::info("Auto-deleted defective asset", [
                                'asset_id' => $asset->id,
                                'asset_name' => $asset->asset_name,
                                'defective_at' => $asset->defective_at,
                                'delete_after_at' => $asset->delete_after_at,
                            ]);
                            $asset->delete();
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error("Failed to auto-delete asset {$asset->id}: " . $e->getMessage());
                        }
                    }
                }
            } catch (\Exception $e) {
                // Silent fail - don't break queries
            }

            // Then exclude any remaining expired assets from the query results
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
        if (!$this->assigned_to_employee_id) {
            return null;
        }

        $lastAssignment = $this->movements()
            ->whereIn('movement_type', ['assigned', 'transferred'])
            ->where('to_employee_id', $this->assigned_to_employee_id)
            ->latest('movement_date')
            ->first();

        if (!$lastAssignment) {
            return null;
        }

        return now()->diffInDays($lastAssignment->movement_date);
    }

    /**
     * Calculate the current book value using straight-line depreciation
     * Formula: Book Value = max(1, Amount Purchased - (Daily Depreciation × Days Since Purchase))
     * Daily Depreciation = Amount Purchased / (Life in Years × 365)
     */
    public function calculateBookValue($asOfDate = null)
    {
        // Return null if required fields are missing
        if (!$this->purchase_date || !$this->estimate_life || !$this->acq_cost) {
            $purchaseDateString = $this->purchase_date
                ? \Carbon\Carbon::parse($this->purchase_date)->toDateString()
                : null;
            $asOfDateString = $asOfDate
                ? \Carbon\Carbon::parse($asOfDate)->toDateString()
                : now()->toDateString();

            return [
                'book_value' => $this->acq_cost ?? 0,
                'purchase_date' => $purchaseDateString,
                'as_of_date' => $asOfDateString,
                'life_years' => $this->estimate_life ?? 0,
                'amount_purchased' => $this->acq_cost ?? 0,
                'days_elapsed' => 0,
                'daily_depreciation' => 0,
                'diminished_value' => 0,
            ];
        }

        // Parse dates
        $purchaseDate = \Carbon\Carbon::parse($this->purchase_date);
        $asOfDate = $asOfDate ? \Carbon\Carbon::parse($asOfDate) : now();

        // Calculate number of days since purchase
        // Use startOfDay to ensure we only count FULL days (not partial days)
        // This ensures book value doesn't depreciate on the purchase day itself
        $daysElapsed = $purchaseDate->startOfDay()->diffInDays($asOfDate->startOfDay());

        // Calculate total life in days
        $totalLifeDays = $this->estimate_life * 365;

        // Calculate daily depreciation
        $dailyDepreciation = $this->acq_cost / $totalLifeDays;

        // Calculate diminished value
        $diminishedValue = $dailyDepreciation * $daysElapsed;

        // Calculate book value as of cutoff (never less than 1)
        $bookValue = max(1, $this->acq_cost - $diminishedValue);

        return [
            'purchase_date' => $purchaseDate->toDateString(),
            'as_of_date' => $asOfDate->toDateString(),
            'life_years' => $this->estimate_life,
            'amount_purchased' => $this->acq_cost,
            'days_elapsed' => $daysElapsed,
            'daily_depreciation' => round($dailyDepreciation, 2),
            'diminished_value' => round($diminishedValue, 2),
            'book_value' => round($bookValue, 2),
        ];
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
                if (!$this->purchase_date || !$this->estimate_life || !$this->acq_cost) {
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
        if (!$this->status || $this->status->name !== 'New') {
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
     * Accessor for calculated book value (appends to JSON)
     */
    protected $appends = ['calculated_book_value', 'depreciation_info'];

    public function getCalculatedBookValueAttribute()
    {
        return $this->calculateBookValue()['book_value'];
    }

    public function getDepreciationInfoAttribute()
    {
        return $this->calculateBookValue();
    }

    /**
     * Generate QR code for this asset
     * Returns base64 encoded SVG image
     */
    public function generateQRCode()
    {
        $purchaseDate = $this->purchase_date
            ? \Carbon\Carbon::parse($this->purchase_date)->toDateString()
            : 'N/A';
        $warrantyDate = $this->waranty_expiration_date
            ? \Carbon\Carbon::parse($this->waranty_expiration_date)->toDateString()
            : 'N/A';
        $vendorName = $this->vendor?->company_name ?? 'N/A';
        $statusName = $this->status?->name ?? 'N/A';
        $assignedTo = $this->assignedEmployee?->fullname ?? 'Unassigned';
        $branchName = $this->assignedEmployee?->branch?->branch_name ?? 'N/A';
        $acqCost = !is_null($this->acq_cost) ? number_format($this->acq_cost, 2) : 'N/A';
        $bookValue = !is_null($this->book_value) ? number_format($this->book_value, 2) : 'N/A';

        // Professional formatted text payload for QR code (ASCII compatible)
        $qrData = "================================\n";
        $qrData .= "    ASSET INFORMATION\n";
        $qrData .= "================================\n\n";

        // Basic Information
        $qrData .= "[BASIC INFO]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Equipment ID:\n  " . ($this->category?->code ?? 'N/A') . "\n\n";
        $qrData .= "* Asset Name:\n  " . ($this->asset_name ?? 'N/A') . "\n\n";
        $qrData .= "* Category:\n  " . ($this->category?->name ?? 'N/A') . "\n\n";
        $qrData .= "* Serial Number:\n  " . ($this->serial_number ?? 'N/A') . "\n\n";

        // Product Details
        $qrData .= "[PRODUCT DETAILS]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Brand:\n  " . ($this->brand ?? 'N/A') . "\n\n";
        $qrData .= "* Model:\n  " . ($this->model ?? 'N/A') . "\n\n";

        // Purchase & Warranty
        $qrData .= "[PURCHASE & WARRANTY]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Purchase Date:\n  " . $purchaseDate . "\n\n";
        $qrData .= "* Warranty Expiration:\n  " . $warrantyDate . "\n\n";
        $qrData .= "* Vendor:\n  " . $vendorName . "\n\n";

        // Financial Information
        $qrData .= "[FINANCIAL INFO]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Acquisition Cost:\n  PHP " . $acqCost . "\n\n";
        $qrData .= "* Book Value:\n  PHP " . $bookValue . "\n\n";

        // Status & Assignment
        $qrData .= "[STATUS & ASSIGNMENT]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Status:\n  " . $statusName . "\n\n";
        $qrData .= "* Assigned To:\n  " . $assignedTo . "\n\n";
        $qrData .= "* Branch:\n  " . $branchName . "\n\n";

        $qrData .= "================================";

        // Use SVG format to avoid image library dependencies
        $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
            // Larger base size + margin + highest error correction to keep codes scannable even when printed small
            ->size(600)
            ->margin(2)
            ->errorCorrection('H')
            ->generate($qrData);

        return 'data:image/svg+xml;base64,' . base64_encode($qrCode);
    }

    /**
     * Generate and save QR code for this asset
     */
    public function generateAndSaveQRCode()
    {
        $this->qr_code = $this->generateQRCode();
        $this->save();
        return $this->qr_code;
    }

    /**
     * Generate barcode for this asset
     * Returns base64 encoded SVG image
     */
    public function generateBarcode()
    {
        // Only generate barcode if serial number exists
        if (!$this->serial_number) {
            return null;
        }

        // Use serial number as barcode value
        $barcodeValue = $this->serial_number;

        // Generate CODE128 barcode as SVG
        $generator = new \Picqer\Barcode\BarcodeGeneratorSVG();
        $barcodeSvg = $generator->getBarcode($barcodeValue, $generator::TYPE_CODE_128, 3, 80);

        return 'data:image/svg+xml;base64,' . base64_encode($barcodeSvg);
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
