<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Emits events to the Node.js Socket.io sidecar so browser clients
 * in the target room can react to changes in real-time.
 *
 * Never throws: a realtime outage must never block the main API flow.
 */
class RealtimeService
{
    public static function emit(string $room, string $event, array $data): void
    {
        if (! config('services.realtime.enabled', false)) {
            return;
        }

        $url = rtrim((string) config('services.realtime.url'), '/').'/emit';
        $secret = (string) config('services.realtime.secret');

        try {
            Http::timeout(2)
                ->withHeaders(['X-Realtime-Secret' => $secret])
                ->post($url, [
                    'event' => $event,
                    'room' => $room,
                    'data' => $data,
                ]);
        } catch (\Throwable $e) {
            // Swallow — realtime is best-effort. Log for diagnosis.
            Log::warning('Realtime emit failed', [
                'event' => $event,
                'room' => $room,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public static function ticketRoom(string $ticketNumber): string
    {
        return 'ticket:'.$ticketNumber;
    }

    /**
     * Global helpdesk room — heard by the tickets list page and dashboard.
     */
    public static function helpdeskRoom(): string
    {
        return 'helpdesk';
    }
}
