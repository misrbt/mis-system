<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
            $table->index('sort_order');
        });

        $now = now();
        $rows = [
            [
                'name' => 'Hardware',
                'description' => 'Issues with computer hardware, workstations, peripherals, and physical equipment malfunctions.',
                'sort_order' => 10,
            ],
            [
                'name' => 'Software',
                'description' => 'Application errors, software crashes, installation help, licensing problems, and compatibility.',
                'sort_order' => 20,
            ],
            [
                'name' => 'Network',
                'description' => 'Internet, WiFi, VPN, connectivity problems, and network performance issues.',
                'sort_order' => 30,
            ],
            [
                'name' => 'Account',
                'description' => 'User account issues, password resets, permission problems, and login difficulties.',
                'sort_order' => 40,
            ],
            [
                'name' => 'Email',
                'description' => 'Email configuration, delivery problems, spam filtering, and email client issues.',
                'sort_order' => 50,
            ],
            [
                'name' => 'Printer',
                'description' => 'Printer connectivity, print quality issues, scanner problems, and driver installations.',
                'sort_order' => 60,
            ],
            [
                'name' => 'Peripherals',
                'description' => 'Keyboards, mice, monitors, webcams, and other connected devices.',
                'sort_order' => 70,
            ],
            [
                'name' => 'CBS',
                'description' => 'Core Banking System issues — transaction errors, module access, system errors.',
                'sort_order' => 80,
            ],
            [
                'name' => 'Other',
                'description' => 'General IT support requests that do not fit any other category.',
                'sort_order' => 99,
            ],
        ];

        foreach ($rows as $row) {
            DB::table('ticket_categories')->insert(array_merge($row, [
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_categories');
    }
};
