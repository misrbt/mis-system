<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

abstract class Controller
{
    /**
     * Handle exceptions with sanitized error responses.
     * Logs full error details for debugging while only exposing sanitized messages to clients.
     *
     * @param  \Exception  $e  The caught exception
     * @param  string  $message  User-facing error message
     * @param  int  $statusCode  HTTP status code to return
     */
    protected function handleException(
        \Exception $e,
        string $message,
        int $statusCode = 500
    ): \Illuminate\Http\JsonResponse {
        // Log full error details for debugging
        Log::error($message, [
            'exception' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ]);

        // Build sanitized response
        $response = [
            'success' => false,
            'message' => $message,
        ];

        // Only expose exception details in debug mode
        if (config('app.debug')) {
            $response['error'] = $e->getMessage();
        }

        return response()->json($response, $statusCode);
    }
}
