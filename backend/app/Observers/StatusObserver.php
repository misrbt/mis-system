<?php

namespace App\Observers;

use App\Models\Status;
use App\Services\InventoryAuditLogService;

class StatusObserver
{
    /**
     * Trackable fields for Status
     */
    private const TRACKABLE_FIELDS = [
        'status_name',
        'color',
        'description',
    ];

    /**
     * Handle the Status "created" event.
     */
    public function created(Status $status): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($status->$field)) {
                $initialData[$field] = $status->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'status',
            operationType: 'created',
            entityId: $status->id,
            entityName: $status->status_name,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'color' => $status->color,
                'created_fields' => array_keys($initialData),
            ]
        );
    }

    /**
     * Handle the Status "updated" event.
     */
    public function updated(Status $status): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $status->getOriginal(),
            $status->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'status',
            operationType: 'updated',
            entityId: $status->id,
            entityName: $status->status_name,
            changes: $changes,
            reason: null,
            additionalMetadata: [
                'color' => $status->color,
                'updated_fields' => array_keys($changes),
            ]
        );
    }

    /**
     * Handle the Status "deleted" event.
     */
    public function deleted(Status $status): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($status->$field)) {
                $deletedData[$field] = $status->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'status',
            operationType: 'deleted',
            entityId: $status->id,
            entityName: $status->status_name,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'color' => $status->color,
                'deleted_fields' => array_keys($deletedData),
            ]
        );
    }

    /**
     * Handle the Status "restored" event.
     */
    public function restored(Status $status): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'status',
            operationType: 'restored',
            entityId: $status->id,
            entityName: $status->status_name,
            changes: [],
            reason: null,
            additionalMetadata: [
                'color' => $status->color,
            ]
        );
    }

    /**
     * Handle the Status "force deleted" event.
     */
    public function forceDeleted(Status $status): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'status',
            operationType: 'force_deleted',
            entityId: $status->id,
            entityName: $status->status_name,
            changes: [],
            reason: 'Permanently deleted from database',
            additionalMetadata: [
                'color' => $status->color,
            ]
        );
    }
}
