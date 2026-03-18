<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheApiResponse
{
    /**
     * Cache GET request responses to improve performance
     *
     * This middleware caches successful GET responses at the HTTP layer,
     * reducing database queries and improving response times for repeated requests.
     *
     * Usage in routes:
     * Route::get('/endpoint')->middleware('cache.response:300'); // Cache for 5 minutes
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  int  $ttl  Time to live in seconds (default: 60)
     */
    public function handle(Request $request, Closure $next, int $ttl = 60): Response
    {
        // Only cache GET requests
        if (! $request->isMethod('GET')) {
            return $next($request);
        }

        // Create cache key from full URL (includes query parameters)
        // This ensures different query params get different cache entries
        $cacheKey = $this->getCacheKey($request);

        // Check if we have a cached response
        if (Cache::has($cacheKey)) {
            $cachedData = Cache::get($cacheKey);

            // Reconstruct response from cached data
            $response = response()->json(
                $cachedData['content'],
                $cachedData['status']
            );

            // Add headers to indicate cached response
            $response->headers->add([
                'X-Cache' => 'HIT',
                'X-Cache-Expires' => $cachedData['expires_at'],
            ]);

            return $response;
        }

        // Get fresh response
        $response = $next($request);

        // Only cache successful JSON responses
        if ($response->isSuccessful() && $this->isJsonResponse($response)) {
            $expiresAt = now()->addSeconds($ttl)->toIso8601String();

            // Cache the response data
            Cache::put($cacheKey, [
                'content' => json_decode($response->getContent(), true),
                'status' => $response->getStatusCode(),
                'expires_at' => $expiresAt,
            ], $ttl);

            // Add headers to indicate fresh response
            $response->headers->add([
                'X-Cache' => 'MISS',
                'X-Cache-Expires' => $expiresAt,
            ]);
        }

        return $response;
    }

    /**
     * Generate cache key from request
     */
    private function getCacheKey(Request $request): string
    {
        // Include user ID if authenticated to prevent cache poisoning
        $userId = $request->user()?->id ?? 'guest';

        // Use full URL with query parameters for cache key
        return 'api_response:'.$userId.':'.md5($request->fullUrl());
    }

    /**
     * Check if response is JSON
     */
    private function isJsonResponse(Response $response): bool
    {
        $contentType = $response->headers->get('Content-Type');

        return $contentType && str_contains($contentType, 'application/json');
    }
}
