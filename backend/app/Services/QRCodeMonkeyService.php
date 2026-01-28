<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QRCodeMonkeyService
{
    /**
     * QR Code Monkey API endpoint
     */
    protected const API_URL = 'https://api.qrcode-monkey.com/qr/custom';

    /**
     * API timeout in seconds
     */
    protected const API_TIMEOUT = 30;

    /**
     * Connection timeout in seconds
     */
    protected const CONNECT_TIMEOUT = 15;

    /**
     * Default QR code configuration
     * Standard square QR code design matching sample-qrcode.png:
     * - body: square (standard square modules)
     * - eye: frame0 (square eye frame)
     * - eyeBall: ball0 (square eye ball)
     * - erf1, erf2, erf3: eye frame colors (empty = use bodyColor)
     * - erb1, erb2, erb3: eye ball colors (empty = use bodyColor)
     */
    protected const DEFAULT_CONFIG = [
        'body' => 'square',
        'eye' => 'frame0',
        'eyeBall' => 'ball0',
        'erf1' => '',
        'erf2' => '',
        'erf3' => '',
        'erb1' => '',
        'erb2' => '',
        'erb3' => '',
        'bodyColor' => '#000000',
        'bgColor' => '#FFFFFF',
    ];

    /**
     * Error codes for different failure scenarios
     */
    public const ERROR_NO_INTERNET = 'NO_INTERNET';
    public const ERROR_API_TIMEOUT = 'API_TIMEOUT';
    public const ERROR_API_ERROR = 'API_ERROR';
    public const ERROR_INVALID_RESPONSE = 'INVALID_RESPONSE';

    /**
     * Last error information
     */
    protected static ?array $lastError = null;

    /**
     * Get the last error that occurred
     *
     * @return array|null
     */
    public static function getLastError(): ?array
    {
        return self::$lastError;
    }

    /**
     * Clear the last error
     */
    public static function clearLastError(): void
    {
        self::$lastError = null;
    }

    /**
     * Check if the API is reachable
     *
     * @return bool
     */
    public static function isApiReachable(): bool
    {
        try {
            $response = Http::timeout(5)
                ->connectTimeout(3)
                ->get('https://api.qrcode-monkey.com');

            return $response->status() < 500;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Generate a QR code using QR Code Monkey API
     *
     * @param string $data The content to encode in the QR code
     * @param array $options Optional configuration overrides
     * @return string|null Base64 encoded PNG image or null on failure
     */
    public static function generate(string $data, array $options = []): ?string
    {
        self::clearLastError();

        $size = $options['size'] ?? 300;
        $config = array_merge(self::DEFAULT_CONFIG, $options['config'] ?? []);

        $requestBody = [
            'data' => $data,
            'config' => $config,
            'size' => $size,
            'download' => false,
            'file' => 'png',
        ];

        // Log the request for debugging
        Log::debug('QR Code Monkey API request', [
            'data_preview' => substr($data, 0, 100),
            'size' => $size,
            'config' => $config,
        ]);

        try {
            $response = Http::timeout(self::API_TIMEOUT)
                ->connectTimeout(self::CONNECT_TIMEOUT)
                ->withoutVerifying() // Disable SSL verification for compatibility
                ->retry(2, 1000) // Retry 2 times with 1 second delay
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'image/png',
                    'User-Agent' => 'MIS-System/1.0',
                ])
                ->post(self::API_URL, $requestBody);

            if ($response->successful()) {
                $imageData = $response->body();

                // Validate that we got actual image data
                if (empty($imageData) || strlen($imageData) < 100) {
                    self::$lastError = [
                        'code' => self::ERROR_INVALID_RESPONSE,
                        'message' => 'QR Code Monkey API returned empty or invalid response',
                    ];

                    Log::warning('QR Code Monkey API returned invalid response', [
                        'data_length' => strlen($imageData),
                    ]);

                    return null;
                }

                return 'data:image/png;base64,' . base64_encode($imageData);
            }

            // API returned an error status
            self::$lastError = [
                'code' => self::ERROR_API_ERROR,
                'message' => "QR Code Monkey API error: HTTP {$response->status()}",
                'status' => $response->status(),
            ];

            Log::error('QR Code Monkey API error', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);

            return null;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('QR Code Monkey API connection failed via HTTP client, trying cURL fallback', [
                'message' => $e->getMessage(),
            ]);

            // Try cURL fallback
            $curlResult = self::generateViaCurl($data, $size, $config);
            if ($curlResult) {
                return $curlResult;
            }

            // cURL also failed
            self::$lastError = [
                'code' => self::ERROR_NO_INTERNET,
                'message' => 'Unable to connect to QR Code Monkey API. Please check your internet connection.',
            ];

            return null;

        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::warning('QR Code Monkey API request failed via HTTP client, trying cURL fallback', [
                'message' => $e->getMessage(),
            ]);

            // Try cURL fallback
            $curlResult = self::generateViaCurl($data, $size, $config);
            if ($curlResult) {
                return $curlResult;
            }

            // cURL also failed
            if (str_contains($e->getMessage(), 'timed out') || str_contains($e->getMessage(), 'timeout')) {
                self::$lastError = [
                    'code' => self::ERROR_API_TIMEOUT,
                    'message' => 'QR Code Monkey API request timed out. Please try again.',
                ];
            } else {
                self::$lastError = [
                    'code' => self::ERROR_API_ERROR,
                    'message' => 'QR Code Monkey API request failed: ' . $e->getMessage(),
                ];
            }

            return null;

        } catch (\Exception $e) {
            Log::warning('QR Code Monkey API exception, trying cURL fallback', [
                'message' => $e->getMessage(),
            ]);

            // Try cURL fallback
            $curlResult = self::generateViaCurl($data, $size, $config);
            if ($curlResult) {
                return $curlResult;
            }

            // cURL also failed
            self::$lastError = [
                'code' => self::ERROR_API_ERROR,
                'message' => 'Failed to generate QR code: ' . $e->getMessage(),
            ];

            Log::error('QR Code Monkey API exception', [
                'message' => $e->getMessage(),
                'data' => substr($data, 0, 100),
            ]);

            return null;
        }
    }

    /**
     * Generate QR code using cURL directly (fallback method)
     *
     * @param string $data
     * @param int $size
     * @param array $config
     * @return string|null
     */
    protected static function generateViaCurl(string $data, int $size, array $config): ?string
    {
        if (!function_exists('curl_init')) {
            Log::warning('cURL extension not available');
            return null;
        }

        $requestBody = json_encode([
            'data' => $data,
            'config' => $config,
            'size' => $size,
            'download' => false,
            'file' => 'png',
        ]);

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => self::API_URL,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $requestBody,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => self::API_TIMEOUT,
            CURLOPT_CONNECTTIMEOUT => self::CONNECT_TIMEOUT,
            CURLOPT_SSL_VERIFYPEER => false, // Disable SSL verification
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: image/png',
                'User-Agent: MIS-System/1.0',
            ],
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $errno = curl_errno($ch);

        curl_close($ch);

        if ($errno !== 0) {
            Log::warning('cURL request failed', [
                'error' => $error,
                'errno' => $errno,
            ]);
            return null;
        }

        if ($httpCode !== 200) {
            Log::warning('cURL received non-200 response', [
                'http_code' => $httpCode,
            ]);
            return null;
        }

        if (empty($response) || strlen($response) < 100) {
            Log::warning('cURL received empty or invalid response');
            return null;
        }

        Log::info('QR Code generated successfully via cURL fallback');

        return 'data:image/png;base64,' . base64_encode($response);
    }

    /**
     * Generate a QR code for an asset
     *
     * @param \App\Models\Asset $asset
     * @param array $options Optional configuration
     * @return string|null Base64 encoded PNG image
     */
    public static function generateForAsset($asset, array $options = []): ?string
    {
        // Build QR code data - using serial number as primary identifier
        // This is more scannable than embedding all asset info
        $qrData = $asset->serial_number ?? "ASSET-{$asset->id}";

        return self::generate($qrData, array_merge([
            'size' => 300,
            'config' => self::DEFAULT_CONFIG,
        ], $options));
    }

    /**
     * Generate a QR code with asset URL for scanning to view details
     *
     * @param \App\Models\Asset $asset
     * @param string $baseUrl Base URL of the application
     * @param array $options Optional configuration
     * @return string|null Base64 encoded PNG image
     */
    public static function generateForAssetWithUrl($asset, string $baseUrl, array $options = []): ?string
    {
        // Create URL that points to asset detail page
        $assetUrl = rtrim($baseUrl, '/') . "/inventory/assets/{$asset->id}";

        return self::generate($assetUrl, array_merge([
            'size' => 300,
            'config' => self::DEFAULT_CONFIG,
        ], $options));
    }

    /**
     * Generate a QR code with full asset information
     * Simple table format - easy to read when scanned
     *
     * @param \App\Models\Asset $asset
     * @param array $options Optional configuration
     * @return string|null Base64 encoded PNG image
     */
    public static function generateForAssetWithInfo($asset, array $options = []): ?string
    {
        $purchaseDate = $asset->purchase_date
            ? \Carbon\Carbon::parse($asset->purchase_date)->format('m-d-Y')
            : '-';
        $warrantyDate = $asset->waranty_expiration_date
            ? \Carbon\Carbon::parse($asset->waranty_expiration_date)->format('m-d-Y')
            : '-';
        $acqCost = !is_null($asset->acq_cost) ? 'PHP ' . number_format($asset->acq_cost, 2) : '-';
        $bookValue = !is_null($asset->book_value) ? 'PHP ' . number_format($asset->book_value, 2) : '-';

        // Simple table format - clean and easy to read
        $qrData = "ASSET INFO\n";
        $qrData .= "Name: " . ($asset->asset_name ?? '-') . "\n";
        $qrData .= "Serial: " . ($asset->serial_number ?? '-') . "\n";
        $qrData .= "Category: " . ($asset->category?->name ?? '-') . "\n";
        $qrData .= "Status: " . ($asset->status?->name ?? '-') . "\n";
        $qrData .= "Assigned: " . ($asset->assignedEmployee?->fullname ?? 'Unassigned') . "\n";
        $qrData .= "Branch: " . ($asset->assignedEmployee?->branch?->branch_name ?? '-') . "\n";
        $qrData .= "Purchase: " . $purchaseDate . "\n";
        $qrData .= "Warranty: " . $warrantyDate . "\n";
        $qrData .= "Cost: " . $acqCost . "\n";
        $qrData .= "Book Value: " . $bookValue;

        return self::generate($qrData, array_merge([
            'size' => 350,
            'config' => self::DEFAULT_CONFIG,
        ], $options));
    }
}
