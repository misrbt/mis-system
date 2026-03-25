<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CentralAuth
{
    protected array $except = [
        'api/auth/login',
        'api/auth/register',
        'up',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->except as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $authUrl = config('services.central_auth.url', 'http://127.0.0.1:8001/api');

            $response = Http::timeout(10)
                ->withToken($token)
                ->get("{$authUrl}/auth/validate-token", [
                    'system_slug' => 'mis_system',
                ]);

            if (!$response->ok() || !$response->json('valid')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $data = $response->json();

            $request->merge([
                'auth_user' => $data['user'],
                'auth_access' => $data['access'] ?? null,
            ]);

            // Find or create local user
            $user = \App\Models\User::where('email', $data['user']['email'])->first();
            if (!$user) {
                $user = \App\Models\User::create([
                    'name' => $data['user']['name'],
                    'username' => $data['user']['username'],
                    'email' => $data['user']['email'],
                    'password' => bcrypt(str()->random(32)),
                    'is_active' => true,
                ]);
            }

            auth()->setUser($user);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication service unavailable.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 503);
        }

        return $next($request);
    }
}
