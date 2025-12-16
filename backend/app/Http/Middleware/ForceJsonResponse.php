<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Force all API responses to be JSON.
     * This ensures consistent response format across all API endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set Accept header to application/json for all API requests
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
