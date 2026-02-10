<?php

namespace App\Traits;

trait ValidatesSort
{
    /**
     * Validate and sanitize sort parameters to prevent SQL injection.
     *
     * @param  string  $sortBy  The requested sort field
     * @param  string  $sortOrder  The requested sort direction
     * @param  array  $allowedFields  Whitelist of allowed field names
     * @param  string  $default  Default field to sort by if invalid
     * @return array [$sortBy, $sortOrder] Validated sort parameters
     */
    protected function validateSort(
        string $sortBy,
        string $sortOrder,
        array $allowedFields,
        string $default = 'created_at'
    ): array {
        // Validate sort field against whitelist
        if (! in_array($sortBy, $allowedFields, true)) {
            $sortBy = $default;
        }

        // Validate sort order (only 'asc' or 'desc')
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        return [$sortBy, $sortOrder];
    }
}
