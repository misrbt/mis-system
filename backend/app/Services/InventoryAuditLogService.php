<?php

namespace App\Services;

use App\Models\AssetMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Inventory-specific audit logging service
 * Handles audit logging for all inventory-related operations
 */
class InventoryAuditLogService
{
    /**
     * Log an inventory operation (for inventory entities like categories, vendors, employees, etc.)
     *
     * @param string $entityType Type of entity (e.g., 'asset_category', 'vendor', 'employee', 'branch', 'section', 'status')
     * @param string $operationType Operation performed (e.g., 'created', 'updated', 'deleted')
     * @param int|null $entityId ID of the entity
     * @param string|null $entityName Name/description of the entity
     * @param array $changes Array of changed fields with old/new values
     * @param string|null $reason Reason for the change
     * @param array $additionalMetadata Any additional metadata to store
     * @return AssetMovement
     */
    public static function logInventoryOperation(
        string $entityType,
        string $operationType,
        ?int $entityId = null,
        ?string $entityName = null,
        array $changes = [],
        ?string $reason = null,
        array $additionalMetadata = []
    ): AssetMovement {
        $metadata = array_merge([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'operation' => $operationType,
            'changes' => $changes,
        ], $additionalMetadata);

        return AssetMovement::create([
            'asset_id' => null, // Inventory operations may not be tied to specific asset
            'movement_type' => 'inventory_operation',
            'performed_by_user_id' => Auth::id(),
            'reason' => $reason,
            'remarks' => static::generateRemarks($entityType, $operationType, $entityName),
            'metadata' => $metadata,
            'movement_date' => now(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log an asset-related operation
     *
     * @param int $assetId Asset ID
     * @param string $movementType Type of movement
     * @param array $data Additional data for the movement
     * @return AssetMovement
     */
    public static function logAssetOperation(
        int $assetId,
        string $movementType,
        array $data = []
    ): AssetMovement {
        $defaults = [
            'asset_id' => $assetId,
            'movement_type' => $movementType,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ];

        return AssetMovement::create(array_merge($defaults, $data));
    }

    /**
     * Track changes between old and new values
     *
     * @param array $original Original values
     * @param array $changes New values
     * @param array $trackableFields Fields to track
     * @return array Changed fields with old/new values
     */
    public static function trackChanges(array $original, array $changes, array $trackableFields): array
    {
        $trackedChanges = [];

        foreach ($trackableFields as $field) {
            $oldValue = $original[$field] ?? null;
            $newValue = $changes[$field] ?? null;

            if ($oldValue != $newValue) {
                $trackedChanges[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $trackedChanges;
    }

    /**
     * Generate human-readable remarks for inventory operations
     *
     * @param string $entityType Type of entity
     * @param string $operationType Operation performed
     * @param string|null $entityName Name of entity
     * @return string
     */
    private static function generateRemarks(
        string $entityType,
        string $operationType,
        ?string $entityName
    ): string {
        $entityLabel = str_replace('_', ' ', ucwords($entityType, '_'));
        $operationLabel = ucfirst($operationType);

        if ($entityName) {
            return "{$operationLabel} {$entityLabel}: {$entityName}";
        }

        return "{$operationLabel} {$entityLabel}";
    }

    /**
     * Log bulk delete operation for inventory items
     *
     * @param string $entityType Type of entity being deleted
     * @param array $deletedItems Array of deleted items with id and name
     * @param string|null $reason Reason for deletion
     * @return AssetMovement
     */
    public static function logBulkDelete(
        string $entityType,
        array $deletedItems,
        ?string $reason = null
    ): AssetMovement {
        $count = count($deletedItems);
        $names = array_column($deletedItems, 'name');

        return static::logInventoryOperation(
            $entityType,
            'bulk_deleted',
            null,
            "{$count} items",
            $deletedItems,
            $reason,
            [
                'count' => $count,
                'deleted_items' => $deletedItems,
                'item_names' => $names,
            ]
        );
    }

    /**
     * Log code generation (QR/Barcode) for assets
     *
     * @param int $assetId Asset ID
     * @param string $codeType Type of code (qr_code or barcode)
     * @param string|null $assetName Asset name
     * @return AssetMovement
     */
    public static function logCodeGeneration(
        int $assetId,
        string $codeType,
        ?string $assetName = null
    ): AssetMovement {
        return static::logAssetOperation(
            $assetId,
            'code_generated',
            [
                'remarks' => "Generated {$codeType} for asset" . ($assetName ? ": {$assetName}" : ''),
                'metadata' => [
                    'code_type' => $codeType,
                    'asset_name' => $assetName,
                ],
            ]
        );
    }

    /**
     * Log bulk code generation for assets
     *
     * @param string $codeType Type of code (qr_code or barcode)
     * @param int $count Number of codes generated
     * @param array $assetIds Array of asset IDs
     * @return AssetMovement
     */
    public static function logBulkCodeGeneration(
        string $codeType,
        int $count,
        array $assetIds = []
    ): AssetMovement {
        return static::logInventoryOperation(
            'asset',
            'bulk_code_generated',
            null,
            "Generated {$codeType} for {$count} assets",
            [],
            null,
            [
                'code_type' => $codeType,
                'count' => $count,
                'asset_ids' => $assetIds,
            ]
        );
    }
}
