<?php

namespace App\Observers;

use App\Models\Section;
use App\Services\InventoryAuditLogService;

class SectionObserver
{
    /**
     * Trackable fields for Section
     */
    private const TRACKABLE_FIELDS = [
        'name',
    ];

    /**
     * Handle the Section "created" event.
     */
    public function created(Section $section): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($section->$field)) {
                $initialData[$field] = $section->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'section',
            operationType: 'created',
            entityId: $section->id,
            entityName: $section->name,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'created_fields' => array_keys($initialData),
            ]
        );
    }

    /**
     * Handle the Section "updated" event.
     */
    public function updated(Section $section): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $section->getOriginal(),
            $section->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'section',
            operationType: 'updated',
            entityId: $section->id,
            entityName: $section->name,
            changes: $changes,
            reason: null,
            additionalMetadata: [
                'updated_fields' => array_keys($changes),
            ]
        );
    }

    /**
     * Handle the Section "deleted" event.
     */
    public function deleted(Section $section): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($section->$field)) {
                $deletedData[$field] = $section->$field;
            }
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'section',
            operationType: 'deleted',
            entityId: $section->id,
            entityName: $section->name,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'deleted_fields' => array_keys($deletedData),
            ]
        );
    }

    /**
     * Handle the Section "restored" event.
     */
    public function restored(Section $section): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'section',
            operationType: 'restored',
            entityId: $section->id,
            entityName: $section->name,
            changes: [],
            reason: null
        );
    }

    /**
     * Handle the Section "force deleted" event.
     */
    public function forceDeleted(Section $section): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'section',
            operationType: 'force_deleted',
            entityId: $section->id,
            entityName: $section->name,
            changes: [],
            reason: 'Permanently deleted from database'
        );
    }
}
