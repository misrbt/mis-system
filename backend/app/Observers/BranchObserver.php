<?php

namespace App\Observers;

use App\Models\Branch;
use App\Services\InventoryAuditLogService;

class BranchObserver
{
    /**
     * Trackable fields for Branch
     */
    private const TRACKABLE_FIELDS = [
        'branch_name',
        'brak',
        'brcode',
    ];

    /**
     * Handle the Branch "created" event.
     */
    public function created(Branch $branch): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($branch->$field)) {
                $initialData[$field] = $branch->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'branch',
            operationType: 'created',
            entityId: $branch->id,
            entityName: $branch->branch_name,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'brak' => $branch->brak,
                'brcode' => $branch->brcode,
                'created_fields' => array_keys($initialData),
            ]
        );
    }

    /**
     * Handle the Branch "updated" event.
     */
    public function updated(Branch $branch): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $branch->getOriginal(),
            $branch->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'branch',
            operationType: 'updated',
            entityId: $branch->id,
            entityName: $branch->branch_name,
            changes: $changes,
            reason: null,
            additionalMetadata: [
                'brak' => $branch->brak,
                'brcode' => $branch->brcode,
                'updated_fields' => array_keys($changes),
            ]
        );
    }

    /**
     * Handle the Branch "deleted" event.
     */
    public function deleted(Branch $branch): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($branch->$field)) {
                $deletedData[$field] = $branch->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'branch',
            operationType: 'deleted',
            entityId: $branch->id,
            entityName: $branch->branch_name,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'brak' => $branch->brak,
                'brcode' => $branch->brcode,
                'deleted_fields' => array_keys($deletedData),
            ]
        );
    }

    /**
     * Handle the Branch "restored" event.
     */
    public function restored(Branch $branch): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'branch',
            operationType: 'restored',
            entityId: $branch->id,
            entityName: $branch->branch_name,
            changes: [],
            reason: null,
            additionalMetadata: [
                'brak' => $branch->brak,
                'brcode' => $branch->brcode,
            ]
        );
    }

    /**
     * Handle the Branch "force deleted" event.
     */
    public function forceDeleted(Branch $branch): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'branch',
            operationType: 'force_deleted',
            entityId: $branch->id,
            entityName: $branch->branch_name,
            changes: [],
            reason: 'Permanently deleted from database',
            additionalMetadata: [
                'brak' => $branch->brak,
                'brcode' => $branch->brcode,
            ]
        );
    }
}
