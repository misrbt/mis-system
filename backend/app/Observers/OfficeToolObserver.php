<?php

namespace App\Observers;

use App\Models\OfficeTool;
use App\Services\InventoryAuditLogService;

class OfficeToolObserver
{
    /**
     * Handle the OfficeTool "created" event.
     */
    public function created(OfficeTool $officeTool): void
    {
        $changes = $this->buildCreatedFields($officeTool);

        InventoryAuditLogService::logInventoryOperation(
            'office_tool',
            'created',
            $officeTool->id,
            $this->getOfficeToolDisplayName($officeTool),
            $changes
        );
    }

    /**
     * Handle the OfficeTool "updated" event.
     */
    public function updated(OfficeTool $officeTool): void
    {
        $original = $officeTool->getOriginal();
        $changes = $this->trackChanges($officeTool, $original);

        if (!empty($changes)) {
            InventoryAuditLogService::logInventoryOperation(
                'office_tool',
                'updated',
                $officeTool->id,
                $this->getOfficeToolDisplayName($officeTool),
                $changes
            );
        }
    }

    /**
     * Handle the OfficeTool "deleted" event.
     */
    public function deleted(OfficeTool $officeTool): void
    {
        $changes = $this->buildDeletedFields($officeTool);

        InventoryAuditLogService::logInventoryOperation(
            'office_tool',
            'deleted',
            $officeTool->id,
            $this->getOfficeToolDisplayName($officeTool),
            $changes
        );
    }

    /**
     * Build fields for created office tool
     */
    protected function buildCreatedFields(OfficeTool $officeTool): array
    {
        $fields = [];

        $fields[] = [
            'field' => 'name',
            'label' => 'Name',
            'old' => null,
            'new' => $officeTool->name,
        ];

        if ($officeTool->version) {
            $fields[] = [
                'field' => 'version',
                'label' => 'Version',
                'old' => null,
                'new' => $officeTool->version,
            ];
        }

        if ($officeTool->description) {
            $fields[] = [
                'field' => 'description',
                'label' => 'Description',
                'old' => null,
                'new' => $officeTool->description,
            ];
        }

        return $fields;
    }

    /**
     * Track changes between old and new values
     */
    protected function trackChanges(OfficeTool $officeTool, array $original): array
    {
        $changes = [];

        $trackableFields = [
            'name' => 'Name',
            'version' => 'Version',
            'description' => 'Description',
        ];

        foreach ($trackableFields as $field => $label) {
            if (!array_key_exists($field, $original)) {
                continue;
            }

            $oldValue = $original[$field];
            $newValue = $officeTool->$field;

            if ($oldValue != $newValue) {
                $changes[] = [
                    'field' => $field,
                    'label' => $label,
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }

    /**
     * Build fields for deleted office tool
     */
    protected function buildDeletedFields(OfficeTool $officeTool): array
    {
        $fields = [];

        $fields[] = [
            'field' => 'name',
            'label' => 'Name',
            'old' => $officeTool->name,
            'new' => null,
        ];

        if ($officeTool->version) {
            $fields[] = [
                'field' => 'version',
                'label' => 'Version',
                'old' => $officeTool->version,
                'new' => null,
            ];
        }

        if ($officeTool->description) {
            $fields[] = [
                'field' => 'description',
                'label' => 'Description',
                'old' => $officeTool->description,
                'new' => null,
            ];
        }

        return $fields;
    }

    /**
     * Get office tool display name
     */
    protected function getOfficeToolDisplayName(OfficeTool $officeTool): string
    {
        return $officeTool->name . ($officeTool->version ? ' ' . $officeTool->version : '');
    }
}
