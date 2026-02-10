<?php

namespace App\Observers;

use App\Models\Vendor;
use App\Services\InventoryAuditLogService;

class VendorObserver
{
    /**
     * Trackable fields for Vendor
     */
    private const TRACKABLE_FIELDS = [
        'company_name',
        'contact_no',
        'address',
    ];

    /**
     * Handle the Vendor "created" event.
     */
    public function created(Vendor $vendor): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (! is_null($vendor->$field)) {
                $initialData[$field] = $vendor->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'vendor',
            operationType: 'created',
            entityId: $vendor->id,
            entityName: $vendor->company_name,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'contact_no' => $vendor->contact_no,
                'address' => $vendor->address,
                'created_fields' => array_keys($initialData),
            ]
        );

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('vendors_all');
    }

    /**
     * Handle the Vendor "updated" event.
     */
    public function updated(Vendor $vendor): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $vendor->getOriginal(),
            $vendor->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'vendor',
            operationType: 'updated',
            entityId: $vendor->id,
            entityName: $vendor->company_name,
            changes: $changes,
            reason: null,
            additionalMetadata: [
                'contact_no' => $vendor->contact_no,
                'address' => $vendor->address,
                'updated_fields' => array_keys($changes),
            ]
        );

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('vendors_all');
    }

    /**
     * Handle the Vendor "deleted" event.
     */
    public function deleted(Vendor $vendor): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (! is_null($vendor->$field)) {
                $deletedData[$field] = $vendor->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'vendor',
            operationType: 'deleted',
            entityId: $vendor->id,
            entityName: $vendor->company_name,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'contact_no' => $vendor->contact_no,
                'address' => $vendor->address,
                'deleted_fields' => array_keys($deletedData),
            ]
        );

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('vendors_all');
    }

    /**
     * Handle the Vendor "restored" event.
     */
    public function restored(Vendor $vendor): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'vendor',
            operationType: 'restored',
            entityId: $vendor->id,
            entityName: $vendor->company_name,
            changes: [],
            reason: null,
            additionalMetadata: [
                'contact_no' => $vendor->contact_no,
                'address' => $vendor->address,
            ]
        );
    }

    /**
     * Handle the Vendor "force deleted" event.
     */
    public function forceDeleted(Vendor $vendor): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'vendor',
            operationType: 'force_deleted',
            entityId: $vendor->id,
            entityName: $vendor->company_name,
            changes: [],
            reason: 'Permanently deleted from database',
            additionalMetadata: [
                'contact_no' => $vendor->contact_no,
                'address' => $vendor->address,
            ]
        );
    }
}
