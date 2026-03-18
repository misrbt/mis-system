<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

/**
 * Standardized API response methods for controllers.
 *
 * Provides consistent response formatting across all API endpoints.
 */
trait ApiResponse
{
    /**
     * Return a successful response.
     *
     * @param  mixed  $data
     * @param  array<string, mixed>  $extra
     */
    protected function success(
        $data = null,
        ?string $message = null,
        int $code = 200,
        array $extra = []
    ): JsonResponse {
        $response = array_merge([
            'success' => true,
            'data' => $data,
        ], $extra);

        if ($message !== null) {
            $response['message'] = $message;
        }

        return response()->json($response, $code);
    }

    /**
     * Return an error response.
     *
     * @param  array<string, mixed>|null  $errors
     */
    protected function error(
        string $message,
        int $code = 400,
        ?array $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a paginated response with standardized meta data.
     *
     * @param  array<string, mixed>  $extraMeta
     */
    protected function paginated(
        LengthAwarePaginator $paginator,
        ?string $message = null,
        array $extraMeta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'data' => $paginator->items(),
            'meta' => array_merge([
                'current_page' => $paginator->currentPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ], $extraMeta),
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        return response()->json($response, 200);
    }

    /**
     * Return a created response (201).
     *
     * @param  mixed  $data
     */
    protected function created($data, ?string $message = null): JsonResponse
    {
        return $this->success($data, $message ?? 'Created successfully', 201);
    }

    /**
     * Return a deleted response.
     */
    protected function deleted(string $resource = 'Record'): JsonResponse
    {
        return $this->success(null, "{$resource} deleted successfully");
    }

    /**
     * Return a not found error response.
     */
    protected function notFound(string $resource = 'Record'): JsonResponse
    {
        return $this->error("{$resource} not found", 404);
    }

    /**
     * Return a conflict error response (409).
     */
    protected function conflict(string $message): JsonResponse
    {
        return $this->error($message, 409);
    }

    /**
     * Return an unauthorized error response.
     */
    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * Return a forbidden error response.
     */
    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * Return a validation error response.
     *
     * @param  array<string, mixed>  $errors
     */
    protected function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->error($message, 422, $errors);
    }
}
