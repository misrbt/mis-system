<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\ApiLogger;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configure Sanctum stateful domains for SPA authentication
        $middleware->statefulApi();

        // Add CORS headers
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // API middleware group
        $middleware->api(prepend: [
            ForceJsonResponse::class,
            SecurityHeaders::class,
        ]);

        // Add API logger (appended so it runs after other middleware)
        $middleware->api(append: [
            ApiLogger::class,
        ]);

        // Configure rate limiting for auth routes
        $middleware->alias([
            'throttle.auth' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':5,1',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
