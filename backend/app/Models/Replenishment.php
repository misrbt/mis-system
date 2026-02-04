<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Replenishment extends Model
{
    use HasFactory;

    protected $table = 'replenishments';

    protected $fillable = [
        'asset_name',
        'serial_number',
        'asset_category_id',
        'subcategory_id',
        'brand',
        'model',
        'acq_cost',
        'book_value',
        'purchase_date',
        'warranty_expiration_date',
        'estimate_life',
        'vendor_id',
        'status_id',
        'assigned_to_employee_id',
        'assigned_to_branch_id',
        'remarks',
        'specifications',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiration_date' => 'date',
        'acq_cost' => 'float',
        'book_value' => 'float',
        'estimate_life' => 'integer',
        'specifications' => 'array',
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

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function assignedBranch()
    {
        return $this->belongsTo(Branch::class, 'assigned_to_branch_id');
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
     * Whenever you access $replenishment->book_value, it calculates the current depreciated value
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
}
