<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'realtime' => [
        'url' => env('REALTIME_URL', 'http://127.0.0.1:6001'),
        'secret' => env('REALTIME_SECRET', ''),
        'enabled' => env('REALTIME_ENABLED', true),
    ],

    /**
     * Helpdesk-specific config.
     *
     *   frontend_url : Base URL of the SPA; the approval email builds
     *                  "{frontend_url}/public-helpdesk/approval/{token}"
     *                  from this.
     *
     * Approver routing is handled entirely by the ticket_approvers table
     * (see App\Services\TicketApproverResolver and the admin page at
     * /helpdesk/approvers). There is no global env fallback.
     */
    'helpdesk' => [
        'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')),
    ],

];
