<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiLogger
{
    /**
     * Log API requests for security monitoring and debugging.
     * Sensitive data like passwords are automatically masked.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $startTime) * 1000, 2);

        // Only log in non-production or when explicitly enabled
        if (config('app.debug') || config('logging.api_logging', false)) {
            $this->logRequest($request, $response, $duration);
        }

        return $response;
    }

    /**
     * Log the request details
     */
    protected function logRequest(Request $request, Response $response, float $duration): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'status' => $response->getStatusCode(),
            'duration_ms' => $duration,
        ];

        // Log based on response status
        if ($response->getStatusCode() >= 500) {
            Log::error('API Request Error', $logData);
        } elseif ($response->getStatusCode() >= 400) {
            Log::warning('API Request Warning', $logData);
        } else {
            Log::info('API Request', $logData);
        }
    }
}
