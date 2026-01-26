<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetComponent;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Repair;
use App\Models\RepairRemark;
use App\Models\Section;
use App\Models\Status;
use App\Models\Vendor;
use App\Models\SoftwareLicense;
use App\Models\OfficeTool;
use App\Observers\AssetCategoryObserver;
use App\Observers\AssetComponentObserver;
use App\Observers\AssetObserver;
use App\Observers\BranchObserver;
use App\Observers\DashboardCacheObserver;
use App\Observers\EmployeeObserver;
use App\Observers\RepairObserver;
use App\Observers\RepairRemarkObserver;
use App\Observers\SectionObserver;
use App\Observers\StatusObserver;
use App\Observers\VendorObserver;
use App\Observers\SoftwareLicenseObserver;
use App\Observers\OfficeToolObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers for automatic audit logging and movement tracking
        Asset::observe(AssetObserver::class);
        AssetComponent::observe(AssetComponentObserver::class);
        Repair::observe(RepairObserver::class);
        RepairRemark::observe(RepairRemarkObserver::class);

        // Register observers for inventory master data audit logging
        AssetCategory::observe(AssetCategoryObserver::class);
        Status::observe(StatusObserver::class);
        Vendor::observe(VendorObserver::class);
        Branch::observe(BranchObserver::class);
        Section::observe(SectionObserver::class);
        Employee::observe(EmployeeObserver::class);

        // Register observers for software license management audit logging
        SoftwareLicense::observe(SoftwareLicenseObserver::class);
        OfficeTool::observe(OfficeToolObserver::class);

        // Register cache observer to invalidate dashboard cache on data changes
        Asset::observe(DashboardCacheObserver::class);
        Repair::observe(DashboardCacheObserver::class);
    }
}
