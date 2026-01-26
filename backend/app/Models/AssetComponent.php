<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Illuminate\Support\Facades\Log;

class AssetComponent extends Model
{
    use SoftDeletes;

    protected $table = 'asset_components';

    protected $fillable = [
        'parent_asset_id',
        'category_id',
        'subcategory_id',
        'component_name',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'specifications',
        'qr_code',
        'barcode',
        'acq_cost',
        'vendor_id',
        'status_id',
        'assigned_to_employee_id',
        'remarks',
    ];

    protected $casts = [
        'acq_cost' => 'float',
        'specifications' => 'array',
        'purchase_date' => 'date',
    ];

    // Relationships
    public function parentAsset()
    {
        return $this->belongsTo(Asset::class, 'parent_asset_id');
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(AssetSubcategory::class, 'subcategory_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function movements()
    {
        return $this->hasMany(AssetComponentMovement::class)
            ->orderBy('movement_date', 'desc');
    }

    public function latestMovement()
    {
        return $this->hasOne(AssetComponentMovement::class)
            ->latestOfMany('movement_date');
    }

    // QR Code Generation (mirrors Asset model)
    public function generateQRCode()
    {
        $parentAssetCode = $this->parentAsset?->category?->code ?? 'N/A';
        $parentAssetName = $this->parentAsset?->asset_name ?? 'N/A';
        $statusName = $this->status?->name ?? 'N/A';
        $assignedTo = $this->assignedEmployee?->fullname ?? 'Unassigned';
        $branchName = $this->assignedEmployee?->branch?->branch_name ?? 'N/A';

        $qrData = "================================\n";
        $qrData .= "  COMPONENT INFORMATION\n";
        $qrData .= "================================\n\n";

        $qrData .= "[COMPONENT INFO]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Component Type:\n  " . ($this->category?->name ?? 'N/A') . "\n\n";
        $qrData .= "* Component Name:\n  " . $this->component_name . "\n\n";
        $qrData .= "* Parent Asset:\n  " . $parentAssetName . "\n\n";
        $qrData .= "* Parent ID:\n  " . $parentAssetCode . "\n\n";
        $qrData .= "* Serial Number:\n  " . ($this->serial_number ?? 'N/A') . "\n\n";

        $qrData .= "[PRODUCT DETAILS]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Brand:\n  " . ($this->brand ?? 'N/A') . "\n\n";
        $qrData .= "* Model:\n  " . ($this->model ?? 'N/A') . "\n\n";

        $qrData .= "[STATUS & ASSIGNMENT]\n";
        $qrData .= "--------------------------------\n";
        $qrData .= "* Status:\n  " . $statusName . "\n\n";
        $qrData .= "* Assigned To:\n  " . $assignedTo . "\n\n";
        $qrData .= "* Branch:\n  " . $branchName . "\n\n";

        $qrData .= "================================";

        try {
            $qrCode = QrCode::format('svg')
                ->size(600)
                ->margin(2)
                ->errorCorrection('H')
                ->generate($qrData);

            return 'data:image/svg+xml;base64,' . base64_encode($qrCode);
        } catch (\Exception $e) {
            Log::error("Failed to generate QR code for component {$this->id}: " . $e->getMessage());
            return null;
        }
    }

    public function generateAndSaveQRCode()
    {
        $this->qr_code = $this->generateQRCode();
        $this->save();
        return $this->qr_code;
    }

    // Barcode Generation (mirrors Asset model)
    public function generateBarcode()
    {
        if (!$this->serial_number) {
            return null;
        }

        try {
            $generator = new BarcodeGeneratorSVG();
            $barcodeSvg = $generator->getBarcode(
                $this->serial_number,
                $generator::TYPE_CODE_128,
                3,
                80
            );

            return 'data:image/svg+xml;base64,' . base64_encode($barcodeSvg);
        } catch (\Exception $e) {
            Log::error("Failed to generate barcode for component {$this->id}: " . $e->getMessage());
            return null;
        }
    }

    public function generateAndSaveBarcode()
    {
        $this->barcode = $this->generateBarcode();
        $this->save();
        return $this->barcode;
    }

    // Helper to get formatted component type
    public function getFormattedTypeAttribute()
    {
        return $this->category?->name ?? 'N/A';
    }
}
