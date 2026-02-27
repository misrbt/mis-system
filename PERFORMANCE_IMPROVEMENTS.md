# Performance Improvements Needed

**Last Updated:** 2026-02-27
**System:** MIS Inventory Management System
**Status:** Performance Audit Completed

---

## 🔴 Critical Priority Issues

### 1. Database Cache Driver (HIGH IMPACT)

**Current State:**
- Using `database` cache driver (`backend/config/cache.php:18`)
- Dashboard cache lookups hit PostgreSQL instead of memory

**Problem:**
- Database caching is **10-100x slower** than Redis/Memcached
- Every cache read/write performs a database query
- Dashboard statistics cache takes 10-50ms per lookup vs <1ms with Redis

**Impact:**
- Slow dashboard loads
- Unnecessary database load
- Poor scalability under concurrent users

**Solution:**
```bash
# Install Redis driver
composer require predis/predis

# Update .env
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

**Expected Improvement:** 50-80% faster cache operations

**Estimated Effort:** 2 hours

---

### 2. Synchronous QR Code Generation (HIGH IMPACT)

**Current State:**
- QR codes generated synchronously during asset creation
- `AssetController.php:316-331` blocks response waiting for external API
- Uses QR Code Monkey API with fallback to local generation

**Problem:**
- Asset creation takes 2-5 seconds waiting for QR code API response
- Blocks user interaction
- Single point of failure if API is slow/down

**Impact:**
- Poor user experience during asset creation
- Timeout risks for batch operations
- API rate limiting affects asset creation speed

**Solution:**
```bash
# Create queue job
php artisan make:job GenerateAssetQRCode
```

```php
// backend/app/Jobs/GenerateAssetQRCode.php
namespace App\Jobs;

use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateAssetQRCode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Asset $asset,
        public string $type = 'simple'
    ) {}

    public function handle(): void
    {
        $this->asset->generateAndSaveQRCode($this->type, true);
    }
}

// In AssetController::store(), replace line 320:
// OLD: $qrCodeResult = $asset->generateAndSaveQRCode('full', true);
// NEW: GenerateAssetQRCode::dispatch($asset, 'full');
```

**Setup Queue Worker:**
```bash
# Install Redis queue driver (recommended)
QUEUE_CONNECTION=redis

# Run queue worker (supervisor in production)
php artisan queue:work --queue=default
```

**Expected Improvement:** 70% faster asset creation (instant response)

**Estimated Effort:** 3 hours

---

### 3. Missing Database Indexes (HIGH IMPACT)

**Current State:**
- No index on `assets.assigned_to_employee_id` (frequently filtered)
- No index on `assets.status_id` (used in every status filter)
- No index on `assets.asset_category_id` (category filtering)
- No composite indexes for common filter combinations

**Problem:**
- Full table scans on filtered queries
- Slow asset listings with filters
- Employee asset lookups scan entire assets table

**Impact:**
- Asset list endpoint slow with 1000+ assets
- Dashboard "assets by status" queries scan full table
- Employee transitions query all assets inefficiently

**Solution:**
```bash
php artisan make:migration add_performance_indexes_to_assets_table
```

```php
// backend/database/migrations/2026_02_27_XXXXXX_add_performance_indexes_to_assets_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Single column indexes
            $table->index('assigned_to_employee_id', 'idx_assets_assigned_employee');
            $table->index('status_id', 'idx_assets_status');
            $table->index('asset_category_id', 'idx_assets_category');
            $table->index('vendor_id', 'idx_assets_vendor');
            $table->index('purchase_date', 'idx_assets_purchase_date');

            // Composite indexes for common filter combinations
            $table->index(['asset_category_id', 'status_id'], 'idx_assets_category_status');
            $table->index(['status_id', 'assigned_to_employee_id'], 'idx_assets_status_employee');
            $table->index(['purchase_date', 'status_id'], 'idx_assets_purchase_status');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('idx_assets_assigned_employee');
            $table->dropIndex('idx_assets_status');
            $table->dropIndex('idx_assets_category');
            $table->dropIndex('idx_assets_vendor');
            $table->dropIndex('idx_assets_purchase_date');
            $table->dropIndex('idx_assets_category_status');
            $table->dropIndex('idx_assets_status_employee');
            $table->dropIndex('idx_assets_purchase_status');
        });
    }
};
```

**Run Migration:**
```bash
cd backend
php artisan migrate
```

**Expected Improvement:** 30-60% faster filtered queries

**Estimated Effort:** 1 hour

---

## 🟡 Medium Priority Issues

### 4. No Query Result Caching for Reference Data

**Current State:**
- Statuses, categories, branches, positions queried on every request
- No caching for rarely-changing master data
- Assets endpoint loads categories fresh every time

**Problem:**
- Reference data changes infrequently but queried constantly
- 5-10 extra queries per asset list request
- Unnecessary database load

**Impact:**
- Slower API responses
- Higher database connection usage
- Wasted CPU on redundant queries

**Solution:**
```bash
php artisan make:service CacheService
```

```php
// backend/app/Services/CacheService.php
<?php

namespace App\Services;

use App\Models\AssetCategory;
use App\Models\Branch;
use App\Models\Position;
use App\Models\Status;
use App\Models\Vendor;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class CacheService
{
    private const TTL = 3600; // 1 hour

    public static function getStatuses(): Collection
    {
        return Cache::remember('reference:statuses', self::TTL, function () {
            return Status::orderBy('name')->get();
        });
    }

    public static function getCategories(): Collection
    {
        return Cache::remember('reference:categories', self::TTL, function () {
            return AssetCategory::with('subcategories')->orderBy('name')->get();
        });
    }

    public static function getBranches(): Collection
    {
        return Cache::remember('reference:branches', self::TTL, function () {
            return Branch::orderBy('branch_name')->get();
        });
    }

    public static function getPositions(): Collection
    {
        return Cache::remember('reference:positions', self::TTL, function () {
            return Position::orderBy('title')->get();
        });
    }

    public static function getVendors(): Collection
    {
        return Cache::remember('reference:vendors', self::TTL, function () {
            return Vendor::orderBy('company_name')->get();
        });
    }

    /**
     * Clear all reference data caches
     */
    public static function clearAll(): void
    {
        Cache::forget('reference:statuses');
        Cache::forget('reference:categories');
        Cache::forget('reference:branches');
        Cache::forget('reference:positions');
        Cache::forget('reference:vendors');
    }

    /**
     * Clear specific reference cache
     */
    public static function clear(string $key): void
    {
        Cache::forget("reference:{$key}");
    }
}
```

**Update Observers to Clear Cache:**
```php
// backend/app/Observers/StatusObserver.php
public function updated($model): void
{
    $this->clearDashboardCache();
    \App\Services\CacheService::clear('statuses'); // Add this
}

// Similarly for BranchObserver, AssetCategoryObserver, VendorObserver, etc.
```

**Use in Controllers:**
```php
// Instead of: $statuses = Status::all();
$statuses = CacheService::getStatuses();

// Instead of: $categories = AssetCategory::with('subcategories')->get();
$categories = CacheService::getCategories();
```

**Expected Improvement:** 40% fewer database queries

**Estimated Effort:** 4 hours

---

### 5. Real-time Book Value Calculation

**Current State:**
- Book value calculated on-the-fly via Eloquent accessor
- `Asset.php:268-286` recalculates depreciation on every `$asset->book_value` access
- Lists of 100 assets = 100 depreciation calculations per request

**Problem:**
- CPU-intensive for large asset lists
- Same calculation repeated unnecessarily
- Calculation uses complex date math every time

**Impact:**
- Slow asset listings (especially with 500+ assets)
- Higher server CPU usage
- Wasted computation

**Solution:**

**Step 1: Create Scheduled Command**
```bash
php artisan make:command UpdateAssetBookValues
```

```php
// backend/app/Console/Commands/UpdateAssetBookValues.php
<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class UpdateAssetBookValues extends Command
{
    protected $signature = 'assets:update-book-values';
    protected $description = 'Update book values for all assets based on depreciation';

    public function handle(): int
    {
        $this->info('Updating asset book values...');

        $totalAssets = Asset::count();
        $bar = $this->output->createProgressBar($totalAssets);

        $updated = 0;

        Asset::chunk(100, function ($assets) use ($bar, &$updated) {
            foreach ($assets as $asset) {
                $calculation = $asset->calculateBookValue();

                // Only update if value changed (avoid unnecessary writes)
                if ($asset->book_value != $calculation['book_value']) {
                    $asset->book_value = $calculation['book_value'];
                    $asset->saveQuietly(); // Skip observers to avoid cache clearing
                    $updated++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("Updated {$updated} asset book values successfully.");

        return Command::SUCCESS;
    }
}
```

**Step 2: Schedule Daily Execution**
```php
// In bootstrap/app.php or routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('assets:update-book-values')->daily();
```

**Step 3: Remove Real-time Accessor (OPTIONAL)**
```php
// backend/app/Models/Asset.php

// REMOVE or COMMENT OUT the bookValue() Attribute accessor (lines 268-287)
// This makes book_value come from database instead of calculated on-the-fly

// Keep calculateBookValue() method for manual recalculation when needed
```

**Alternative (Keep Accessor for Single Views):**
```php
// Only calculate on-demand, cache within request
protected function bookValue(): Attribute
{
    return Attribute::make(
        get: function ($value) {
            // For list views, use database value
            if (request()->is('api/assets') && !request()->has('asset_id')) {
                return $value;
            }

            // For single asset view, calculate real-time
            if (!$this->purchase_date || !$this->estimate_life || !$this->acq_cost) {
                return $value ?? $this->acq_cost ?? 0;
            }

            // Calculate real-time
            $purchaseDate = \Carbon\Carbon::parse($this->purchase_date);
            $daysElapsed = $purchaseDate->startOfDay()->diffInDays(now()->startOfDay());
            $totalLifeDays = $this->estimate_life * 365;
            $dailyDepreciation = $this->acq_cost / $totalLifeDays;
            $bookValue = max(1, $this->acq_cost - ($dailyDepreciation * $daysElapsed));

            return round($bookValue, 2);
        }
    );
}
```

**Expected Improvement:** 25% faster asset lists

**Estimated Effort:** 3 hours

---

### 6. Database Connection Pooling Configuration

**Current State:**
- PostgreSQL pool size: 5 (default)
- Max connections: 10
- Low for production traffic

**Problem:**
- Connection pool exhaustion under load
- Waiting for available connections
- Connection churn (create/destroy overhead)

**Impact:**
- Slower response times under concurrent load
- "Too many connections" errors possible
- Connection timeout errors

**Solution:**
```env
# backend/.env
DB_POOL_SIZE=20
DB_MAX_CONNECTIONS=50
DB_IDLE_TIMEOUT=60
```

**For Production (High Traffic):**
```env
DB_POOL_SIZE=50
DB_MAX_CONNECTIONS=100
```

**PostgreSQL Config (Optional - if you manage PostgreSQL):**
```conf
# postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
```

**Expected Improvement:** Better concurrency, fewer connection errors

**Estimated Effort:** 30 minutes

---

### 7. N+1 Query Risks in Some Endpoints

**Current State:**
- Not all endpoints use eager loading consistently
- Potential lazy loading when iterating over collections

**Problem:**
- Risk of N+1 queries in:
  - Repair endpoints when accessing asset relationships
  - Employee endpoints when loading assigned assets
  - Component endpoints

**Impact:**
- Slow responses when N+1 occurs
- Exponential query growth with data size

**Solution:**

**Install Laravel Debugbar (Development):**
```bash
composer require barryvdh/laravel-debugbar --dev
```

**Audit All Controllers:**
```bash
# Search for potential N+1 patterns
cd backend
grep -r "->get()" app/Http/Controllers/ | grep -v "->with("
```

**Example Fixes:**
```php
// BEFORE (Potential N+1)
$repairs = Repair::where('status', 'Pending')->get();
foreach ($repairs as $repair) {
    echo $repair->asset->asset_name; // Lazy load
    echo $repair->vendor->company_name; // Lazy load
}

// AFTER (Eager Loading)
$repairs = Repair::with(['asset', 'vendor'])
    ->where('status', 'Pending')
    ->get();
```

**Expected Improvement:** 20-40% faster on affected endpoints

**Estimated Effort:** 4 hours (audit + fix)

---

## 🔵 Low Priority / Nice to Have

### 8. Frontend Bundle Size Optimization

**Current State:**
- Manual code splitting in place (`vite.config.js`)
- No lazy loading for routes
- All Material Tailwind components bundled upfront

**Problem:**
- Initial bundle size larger than necessary
- Users download code for pages they might not visit

**Solution:**

**Lazy Load Routes:**
```javascript
// frontend/src/routes/inventoryRoutes.jsx
import { lazy } from 'react';

const AssetsPage = lazy(() => import('../pages/inventory/AssetsPage'));
const AssetViewPage = lazy(() => import('../pages/inventory/AssetViewPage'));
const RepairsPage = lazy(() => import('../pages/inventory/RepairsPage'));
const ReplenishmentPage = lazy(() => import('../pages/inventory/ReplenishmentPage'));
const EmployeeTransitionsPage = lazy(() => import('../pages/inventory/EmployeeTransitionsPage'));

export const inventoryRoutes = [
  {
    path: '/assets',
    element: <AssetsPage />,
  },
  // ... other routes
];
```

**Wrap in Suspense:**
```javascript
// frontend/src/App.jsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* routes */}
      </Routes>
    </Suspense>
  );
}
```

**Expected Improvement:** 40% faster initial page load

**Estimated Effort:** 2 hours

---

### 9. API Response Caching Middleware

**Current State:**
- No HTTP response caching
- Every API request hits controller logic

**Solution:**
```bash
php artisan make:middleware CacheResponse
```

```php
// backend/app/Http/Middleware/CacheResponse.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CacheResponse
{
    public function handle(Request $request, Closure $next, int $ttl = 60)
    {
        // Only cache GET requests
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        $key = 'api_response:' . md5($request->fullUrl());

        return Cache::remember($key, $ttl, function () use ($next, $request) {
            return $next($request);
        });
    }
}
```

**Apply to Routes:**
```php
// backend/routes/api.php
Route::get('/statuses', [StatusController::class, 'index'])
    ->middleware('cache.response:300'); // 5 minutes

Route::get('/branches', [BranchController::class, 'index'])
    ->middleware('cache.response:600'); // 10 minutes
```

**Expected Improvement:** 50% faster for cached endpoints

**Estimated Effort:** 2 hours

---

### 10. Database Query Column Selection

**Current State:**
- Most queries use `SELECT *`
- Returns all columns even when not needed

**Solution:**
```php
// Specify only needed columns
Asset::select('id', 'asset_name', 'serial_number', 'status_id', 'asset_category_id')
    ->with('category:id,name') // Specify relationship columns too
    ->get();
```

**Expected Improvement:** 10-15% less memory, faster serialization

**Estimated Effort:** 6 hours (audit all queries)

---

### 11. Enable PHP OpCache

**Current State:**
- OpCache status unknown

**Solution:**
```ini
# php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.revalidate_freq=0
opcache.validate_timestamps=1  # Dev: 1, Prod: 0
opcache.interned_strings_buffer=16
opcache.fast_shutdown=1
```

**Verify:**
```bash
php -i | grep opcache
```

**Expected Improvement:** 10-30% faster PHP execution

**Estimated Effort:** 30 minutes

---

### 12. CDN for Static Assets

**Current State:**
- All assets served from application server

**Solution:**
- Use Cloudflare (free tier available)
- Or AWS CloudFront
- Or Azure CDN

**Expected Improvement:** 50% faster asset loading globally

**Estimated Effort:** 2-4 hours (setup + config)

---

## 📊 Performance Impact Summary

| Priority | Issue | Impact | Effort | ROI |
|----------|-------|--------|--------|-----|
| 🔴 Critical | Redis Cache | 50-80% faster cache | 2h | ⭐⭐⭐⭐⭐ |
| 🔴 Critical | Queue QR Codes | 70% faster creation | 3h | ⭐⭐⭐⭐⭐ |
| 🔴 Critical | DB Indexes | 30-60% faster queries | 1h | ⭐⭐⭐⭐⭐ |
| 🟡 Medium | Cache Reference Data | 40% fewer queries | 4h | ⭐⭐⭐⭐ |
| 🟡 Medium | Store Book Values | 25% faster lists | 3h | ⭐⭐⭐⭐ |
| 🟡 Medium | Connection Pooling | Better concurrency | 0.5h | ⭐⭐⭐ |
| 🟡 Medium | Fix N+1 Queries | 20-40% on affected | 4h | ⭐⭐⭐ |
| 🔵 Low | Lazy Load Routes | 40% faster initial | 2h | ⭐⭐⭐ |
| 🔵 Low | Response Caching | 50% cached endpoints | 2h | ⭐⭐ |
| 🔵 Low | OpCache | 10-30% PHP speed | 0.5h | ⭐⭐ |

---

## 🎯 Quick Win Implementation Plan

### Week 1: Critical Fixes (6 hours)
1. ✅ Add database indexes (1 hour) - **Immediate impact**
2. ✅ Switch to Redis cache (2 hours) - **Biggest gains**
3. ✅ Queue QR code generation (3 hours) - **User-visible improvement**

**Expected Result:** 60-70% overall performance improvement

### Week 2: Medium Priority (11 hours)
4. ✅ Cache reference data (4 hours)
5. ✅ Store book values + scheduler (3 hours)
6. ✅ Audit and fix N+1 queries (4 hours)

**Expected Result:** Additional 20-30% improvement

### Week 3: Polish (7 hours)
7. ✅ Lazy load frontend routes (2 hours)
8. ✅ API response caching middleware (2 hours)
9. ✅ Increase connection pool (0.5 hours)
10. ✅ Enable OpCache (0.5 hours)
11. ✅ Setup monitoring (2 hours)

**Expected Result:** Production-ready, highly optimized system

---

## 🔍 Monitoring & Validation

### Install Monitoring Tools

```bash
# Laravel Debugbar (Development only)
composer require barryvdh/laravel-debugbar --dev

# Laravel Telescope (Development/Staging)
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate

# Horizon (Queue monitoring - if using Redis queues)
composer require laravel/horizon
php artisan horizon:install
```

### Key Metrics to Track

1. **Database Query Time**
   - Target: <50ms per query
   - Alert: >200ms

2. **API Response Time**
   - Target: <200ms for lists, <100ms for single items
   - Alert: >1000ms

3. **Cache Hit Rate**
   - Target: >80%
   - Monitor: Redis stats

4. **Queue Depth**
   - Target: <100 jobs waiting
   - Alert: >500 jobs

5. **Memory Usage**
   - Target: <512MB per request
   - Alert: >1GB

### Performance Testing

```bash
# Install Apache Bench or use curl
ab -n 1000 -c 10 http://localhost:8000/api/assets

# Or use Laravel testing
php artisan test --filter=PerformanceTest
```

---

## 📝 Implementation Checklist

### Critical Priority
- [ ] Install Redis and configure cache driver
- [ ] Create GenerateAssetQRCode queue job
- [ ] Update AssetController to dispatch QR generation
- [ ] Setup queue worker (supervisor in production)
- [ ] Create and run database indexes migration
- [ ] Test asset creation speed
- [ ] Test asset list filtering performance

### Medium Priority
- [ ] Create CacheService for reference data
- [ ] Update all observers to clear reference caches
- [ ] Replace direct model queries with CacheService
- [ ] Create UpdateAssetBookValues command
- [ ] Schedule book value updates
- [ ] Update .env for connection pooling
- [ ] Audit controllers for N+1 queries
- [ ] Add eager loading where missing

### Low Priority
- [ ] Implement lazy loading for routes
- [ ] Create CacheResponse middleware
- [ ] Apply response caching to appropriate routes
- [ ] Enable and configure OpCache
- [ ] Setup monitoring tools
- [ ] Create performance tests

### Documentation
- [ ] Update README with new queue setup
- [ ] Document cache clearing procedures
- [ ] Document scheduled commands
- [ ] Update deployment guide

---

## ⚠️ Important Notes

1. **Test in Staging First**: Implement all changes in staging environment before production
2. **Backup Database**: Before running migrations, backup production database
3. **Queue Workers**: Ensure queue workers are running before deploying queue-based changes
4. **Cache Clearing**: Document cache clearing procedures for deployments
5. **Monitor After Deploy**: Watch error logs and performance metrics closely after each change

---

## 📞 Support & Resources

- Laravel Performance: https://laravel.com/docs/12.x/deployment#optimization
- Redis Caching: https://redis.io/docs/
- Laravel Queues: https://laravel.com/docs/12.x/queues
- Database Indexing: https://www.postgresql.org/docs/current/indexes.html

---

**End of Document**
