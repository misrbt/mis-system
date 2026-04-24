<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('contact_number', 50)
                ->nullable()
                ->after('description');

            $table->string('anydesk_number', 50)
                ->nullable()
                ->after('contact_number');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['contact_number', 'anydesk_number']);
        });
    }
};
