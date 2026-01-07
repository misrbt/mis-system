<?php

namespace App\Observers;

use App\Models\AssetCategory;
use App\Services\InventoryAuditLogService;

class AssetCategoryObserver
{
    /**
     * Trackable fields for AssetCategory
     */
    private const TRACKABLE_FIELDS = [
        'category_name',
        'code',
        'description',
    ];

    /**
     * Handle the AssetCategory "created" event.
     */
    public function created(AssetCategory $assetCategory): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($assetCategory->$field)) {
                $initialData[$field] = $assetCategory->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'asset_category',
            operationType: 'created',
            entityId: $assetCategory->id,
            entityName: $assetCategory->category_name,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'code' => $assetCategory->code,
                'created_fields' => array_keys($initialData),
            ]
        );
    }

    /**
     * Handle the AssetCategory "updated" event.
     */
    public function updated(AssetCategory $assetCategory): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $assetCategory->getOriginal(),
            $assetCategory->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'asset_category',
            operationType: 'updated',
            entityId: $assetCategory->id,
            entityName: $assetCategory->category_name,
            changes: $changes,
            reason: null,
            additionalMetadata: [
                'code' => $assetCategory->code,
                'updated_fields' => array_keys($changes),
            ]
        );
    }

    /**
     * Handle the AssetCategory "deleted" event.
     */
    public function deleted(AssetCategory $assetCategory): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($assetCategory->$field)) {
                $deletedData[$field] = $assetCategory->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'asset_category',
            operationType: 'deleted',
            entityId: $assetCategory->id,
            entityName: $assetCategory->category_name,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'code' => $assetCategory->code,
                'deleted_fields' => array_keys($deletedData),
            ]
        );
    }

    /**
     * Handle the AssetCategory "restored" event.
     */
    public function restored(AssetCategory $assetCategory): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'asset_category',
            operationType: 'restored',
            entityId: $assetCategory->id,
            entityName: $assetCategory->category_name,
            changes: [],
            reason: null,
            additionalMetadata: [
                'code' => $assetCategory->code,
            ]
        );
    }

    /**
     * Handle the AssetCategory "force deleted" event.
     */
    public function forceDeleted(AssetCategory $assetCategory): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'asset_category',
            operationType: 'force_deleted',
            entityId: $assetCategory->id,
            entityName: $assetCategory->category_name,
            changes: [],
            reason: 'Permanently deleted from database',
            additionalMetadata: [
                'code' => $assetCategory->code,
            ]
        );
    }
}
