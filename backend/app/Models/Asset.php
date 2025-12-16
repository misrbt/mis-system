<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $table = 'assets';

    protected $fillable = [
        'asset_name',
        'asset_category_id',
        'brand',
        'model',
        'book_value',
        'serial_number',
        'purchase_date',
        'acq_cost',
        'waranty_expiration_date',
        'estimate_life',
        'vendor_id',
        'status_id',
        'remarks',
        'assigned_to_employee_id',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'waranty_expiration_date' => 'date',
        'book_value' => 'float',
        'acq_cost' => 'float',
        'estimate_life' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
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

    /**
     * Calculate the current book value using straight-line depreciation
     * Formula: Book Value = max(1, Amount Purchased - (Daily Depreciation × Days Since Purchase))
     * Daily Depreciation = Amount Purchased / (Life in Years × 365)
     */
    public function calculateBookValue($asOfDate = null)
    {
        // Return null if required fields are missing
        if (!$this->purchase_date || !$this->estimate_life || !$this->acq_cost) {
            return [
                'book_value' => $this->acq_cost ?? 0,
                'purchase_date' => $this->purchase_date?->toDateString(),
                'as_of_date' => now()->toDateString(),
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
     * Update the book value in the database
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
}
