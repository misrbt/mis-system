<?php

namespace App\Observers;

use App\Models\SoftwareLicense;
use App\Services\InventoryAuditLogService;

class SoftwareLicenseObserver
{
    /**
     * Handle the SoftwareLicense "created" event.
     */
    public function created(SoftwareLicense $license): void
    {
        $changes = $this->buildCreatedFields($license);

        InventoryAuditLogService::logInventoryOperation(
            'software_license',
            'created',
            $license->id,
            $this->getLicenseName($license),
            $changes,
            null,
            [
                'employee_id' => $license->employee_id,
                'office_tool_id' => $license->office_tool_id,
                'operating_system' => $license->operating_system,
                'licensed' => $license->licensed,
            ]
        );
    }

    /**
     * Handle the SoftwareLicense "updated" event.
     */
    public function updated(SoftwareLicense $license): void
    {
        $original = $license->getOriginal();
        $changes = $this->trackChanges($license, $original);

        if (!empty($changes)) {
            InventoryAuditLogService::logInventoryOperation(
                'software_license',
                'updated',
                $license->id,
                $this->getLicenseName($license),
                $changes,
                null,
                [
                    'employee_id' => $license->employee_id,
                    'office_tool_id' => $license->office_tool_id,
                ]
            );
        }
    }

    /**
     * Handle the SoftwareLicense "deleted" event.
     */
    public function deleted(SoftwareLicense $license): void
    {
        $changes = $this->buildDeletedFields($license);

        InventoryAuditLogService::logInventoryOperation(
            'software_license',
            'deleted',
            $license->id,
            $this->getLicenseName($license),
            $changes,
            null,
            [
                'employee_id' => $license->employee_id,
                'office_tool_id' => $license->office_tool_id,
            ]
        );
    }

    /**
     * Build fields for created license
     */
    protected function buildCreatedFields(SoftwareLicense $license): array
    {
        $fields = [];

        if ($license->employee_id) {
            $fields[] = [
                'field' => 'employee_id',
                'label' => 'Employee',
                'old' => null,
                'new' => $license->employee?->fullname,
            ];
        }

        if ($license->position_id) {
            $fields[] = [
                'field' => 'position_id',
                'label' => 'Position',
                'old' => null,
                'new' => $license->position?->title,
            ];
        }

        if ($license->section_id) {
            $fields[] = [
                'field' => 'section_id',
                'label' => 'Section',
                'old' => null,
                'new' => $license->section?->name,
            ];
        }

        if ($license->branch_id) {
            $fields[] = [
                'field' => 'branch_id',
                'label' => 'Branch',
                'old' => null,
                'new' => $license->branch?->branch_name,
            ];
        }

        if ($license->office_tool_id) {
            $fields[] = [
                'field' => 'office_tool_id',
                'label' => 'Office Tool',
                'old' => null,
                'new' => $license->officeTool?->name . ($license->officeTool?->version ? ' ' . $license->officeTool?->version : ''),
            ];
        }

        if ($license->operating_system) {
            $fields[] = [
                'field' => 'operating_system',
                'label' => 'Operating System',
                'old' => null,
                'new' => $license->operating_system,
            ];
        }

        if ($license->licensed) {
            $fields[] = [
                'field' => 'licensed',
                'label' => 'Licensed',
                'old' => null,
                'new' => $license->licensed,
            ];
        }

        if ($license->client_access) {
            $fields[] = [
                'field' => 'client_access',
                'label' => 'Client Access',
                'old' => null,
                'new' => $license->client_access,
            ];
        }

        return $fields;
    }

    /**
     * Track changes between old and new values
     */
    protected function trackChanges(SoftwareLicense $license, array $original): array
    {
        $changes = [];

        $trackableFields = [
            'employee_id' => ['label' => 'Employee', 'type' => 'relation', 'relation' => 'employee', 'display' => 'fullname'],
            'position_id' => ['label' => 'Position', 'type' => 'relation', 'relation' => 'position', 'display' => 'title'],
            'section_id' => ['label' => 'Section', 'type' => 'relation', 'relation' => 'section', 'display' => 'name'],
            'branch_id' => ['label' => 'Branch', 'type' => 'relation', 'relation' => 'branch', 'display' => 'branch_name'],
            'asset_category_id' => ['label' => 'Asset Category', 'type' => 'relation', 'relation' => 'assetCategory', 'display' => 'name'],
            'office_tool_id' => ['label' => 'Office Tool', 'type' => 'office_tool'],
            'operating_system' => ['label' => 'Operating System', 'type' => 'text'],
            'licensed' => ['label' => 'Licensed', 'type' => 'text'],
            'client_access' => ['label' => 'Client Access', 'type' => 'text'],
            'remarks' => ['label' => 'Remarks', 'type' => 'text'],
        ];

        foreach ($trackableFields as $field => $config) {
            if (!array_key_exists($field, $original)) {
                continue;
            }

            $oldValue = $original[$field];
            $newValue = $license->$field;

            if ($oldValue != $newValue) {
                // Get readable values for relations
                if ($config['type'] === 'relation') {
                    $relationName = $config['relation'];
                    $displayField = $config['display'];
                    $oldValue = $this->getRelationValue($oldValue, $relationName, $displayField);
                    $newValue = $license->$relationName?->$displayField;
                } elseif ($config['type'] === 'office_tool') {
                    $oldValue = $this->getOfficeToolName($oldValue);
                    $newValue = $this->getOfficeToolName($newValue);
                }

                $changes[] = [
                    'field' => $field,
                    'label' => $config['label'],
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }

    /**
     * Build fields for deleted license
     */
    protected function buildDeletedFields(SoftwareLicense $license): array
    {
        $fields = [];

        if ($license->employee_id) {
            $fields[] = [
                'field' => 'employee_id',
                'label' => 'Employee',
                'old' => $license->employee?->fullname,
                'new' => null,
            ];
        }

        if ($license->office_tool_id) {
            $fields[] = [
                'field' => 'office_tool_id',
                'label' => 'Office Tool',
                'old' => $license->officeTool?->name . ($license->officeTool?->version ? ' ' . $license->officeTool?->version : ''),
                'new' => null,
            ];
        }

        if ($license->operating_system) {
            $fields[] = [
                'field' => 'operating_system',
                'label' => 'Operating System',
                'old' => $license->operating_system,
                'new' => null,
            ];
        }

        return $fields;
    }

    /**
     * Get relation value by ID
     */
    protected function getRelationValue($id, string $relationName, string $displayField): ?string
    {
        if (!$id) {
            return null;
        }

        $modelMap = [
            'employee' => \App\Models\Employee::class,
            'position' => \App\Models\Position::class,
            'section' => \App\Models\Section::class,
            'branch' => \App\Models\Branch::class,
            'assetCategory' => \App\Models\AssetCategory::class,
        ];

        if (isset($modelMap[$relationName])) {
            $model = $modelMap[$relationName]::find($id);
            return $model?->$displayField;
        }

        return null;
    }

    /**
     * Get office tool name with version
     */
    protected function getOfficeToolName($id): ?string
    {
        if (!$id) {
            return null;
        }

        $officeTool = \App\Models\OfficeTool::find($id);
        if (!$officeTool) {
            return null;
        }

        return $officeTool->name . ($officeTool->version ? ' ' . $officeTool->version : '');
    }

    /**
     * Get license name for audit log
     */
    protected function getLicenseName(SoftwareLicense $license): string
    {
        $parts = [];

        if ($license->employee) {
            $parts[] = $license->employee->fullname;
        }

        if ($license->officeTool) {
            $parts[] = $license->officeTool->name;
        }

        if ($license->operating_system) {
            $parts[] = $license->operating_system;
        }

        return !empty($parts) ? implode(' - ', $parts) : 'Software License #' . $license->id;
    }
}
