<?php

namespace App\Observers;

use App\Models\Employee;
use App\Services\InventoryAuditLogService;

class EmployeeObserver
{
    /**
     * Trackable fields for Employee
     */
    private const TRACKABLE_FIELDS = [
        'fullname',
        'branch_id',
        'department_id',
        'position_id',
    ];

    /**
     * Handle the Employee "created" event.
     */
    public function created(Employee $employee): void
    {
        $initialData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($employee->$field)) {
                $initialData[$field] = $employee->$field;
            }
        }

        // Load relationships for better audit context
        $employee->load(['branch', 'department', 'position']);

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'employee',
            operationType: 'created',
            entityId: $employee->id,
            entityName: $employee->fullname,
            changes: $initialData,
            reason: null,
            additionalMetadata: [
                'branch_name' => $employee->branch?->branch_name,
                'department_name' => $employee->department?->name,
                'position_title' => $employee->position?->title,
                'created_fields' => array_keys($initialData),
            ]
        );
    }

    /**
     * Handle the Employee "updated" event.
     */
    public function updated(Employee $employee): void
    {
        $changes = InventoryAuditLogService::trackChanges(
            $employee->getOriginal(),
            $employee->getAttributes(),
            self::TRACKABLE_FIELDS
        );

        if (empty($changes)) {
            return;
        }

        // Load relationships for better audit context
        $employee->load(['branch', 'department', 'position']);

        // Add relationship names for changed foreign keys
        $additionalMetadata = [
            'updated_fields' => array_keys($changes),
        ];

        if (isset($changes['branch_id'])) {
            $oldBranch = \App\Models\Branch::find($changes['branch_id']['old']);
            $additionalMetadata['branch_changed_from'] = $oldBranch?->branch_name;
            $additionalMetadata['branch_changed_to'] = $employee->branch?->branch_name;
        }

        if (isset($changes['department_id'])) {
            $oldDepartment = \App\Models\Section::find($changes['department_id']['old']);
            $additionalMetadata['department_changed_from'] = $oldDepartment?->name;
            $additionalMetadata['department_changed_to'] = $employee->department?->name;
        }

        if (isset($changes['position_id'])) {
            $oldPosition = \App\Models\Position::find($changes['position_id']['old']);
            $additionalMetadata['position_changed_from'] = $oldPosition?->title;
            $additionalMetadata['position_changed_to'] = $employee->position?->title;
        }

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'employee',
            operationType: 'updated',
            entityId: $employee->id,
            entityName: $employee->fullname,
            changes: $changes,
            reason: null,
            additionalMetadata: $additionalMetadata
        );
    }

    /**
     * Handle the Employee "deleted" event.
     */
    public function deleted(Employee $employee): void
    {
        $deletedData = [];

        foreach (self::TRACKABLE_FIELDS as $field) {
            if (!is_null($employee->$field)) {
                $deletedData[$field] = $employee->$field;
            }
        }

        // Load relationships for better audit context
        $employee->load(['branch', 'department', 'position']);

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'employee',
            operationType: 'deleted',
            entityId: $employee->id,
            entityName: $employee->fullname,
            changes: $deletedData,
            reason: null,
            additionalMetadata: [
                'branch_name' => $employee->branch?->branch_name,
                'department_name' => $employee->department?->name,
                'position_title' => $employee->position?->title,
                'deleted_fields' => array_keys($deletedData),
            ]
        );
    }

    /**
     * Handle the Employee "restored" event.
     */
    public function restored(Employee $employee): void
    {
        $employee->load(['branch', 'department', 'position']);

        InventoryAuditLogService::logInventoryOperation(
            entityType: 'employee',
            operationType: 'restored',
            entityId: $employee->id,
            entityName: $employee->fullname,
            changes: [],
            reason: null,
            additionalMetadata: [
                'branch_name' => $employee->branch?->branch_name,
                'department_name' => $employee->department?->name,
                'position_title' => $employee->position?->title,
            ]
        );
    }

    /**
     * Handle the Employee "force deleted" event.
     */
    public function forceDeleted(Employee $employee): void
    {
        InventoryAuditLogService::logInventoryOperation(
            entityType: 'employee',
            operationType: 'force_deleted',
            entityId: $employee->id,
            entityName: $employee->fullname,
            changes: [],
            reason: 'Permanently deleted from database',
            additionalMetadata: [
                'branch_id' => $employee->branch_id,
                'department_id' => $employee->department_id,
                'position_id' => $employee->position_id,
            ]
        );
    }
}
