<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetComponent;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\OfficeTool;
use App\Models\Repair;
use App\Models\RepairRemark;
use App\Models\Replenishment;
use App\Models\Section;
use App\Models\SoftwareLicense;
use App\Models\Status;
use App\Models\Ticket;
use App\Models\Vendor;
use App\Models\Workstation;
use App\Observers\AssetCategoryObserver;
use App\Observers\AssetComponentObserver;
use App\Observers\AssetObserver;
use App\Observers\BranchObserver;
use App\Observers\DashboardCacheObserver;
use App\Observers\EmployeeObserver;
use App\Observers\OfficeToolObserver;
use App\Observers\RepairObserver;
use App\Observers\RepairRemarkObserver;
use App\Observers\ReplenishmentObserver;
use App\Observers\SectionObserver;
use App\Observers\SoftwareLicenseObserver;
use App\Observers\StatusObserver;
use App\Observers\TicketObserver;
use App\Observers\VendorObserver;
use App\Observers\WorkstationObserver;
use Illuminate\Support\ServiceProvider;

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
        Replenishment::observe(ReplenishmentObserver::class);

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

        // Register workstation observer for audit logging
        Workstation::observe(WorkstationObserver::class);

        // Register helpdesk ticket observer for status/assignment activity tracking
        Ticket::observe(TicketObserver::class);

        // Register cache observer to invalidate dashboard cache on data changes
        Asset::observe(DashboardCacheObserver::class);
        Repair::observe(DashboardCacheObserver::class);
        Workstation::observe(DashboardCacheObserver::class);
    }
}
