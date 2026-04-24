<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('first_response_at')->nullable()->after('closed_at');
            $table->unsignedTinyInteger('satisfaction_rating')->nullable()->after('resolution_summary');
            $table->text('satisfaction_comment')->nullable()->after('satisfaction_rating');
            $table->timestamp('satisfaction_submitted_at')->nullable()->after('satisfaction_comment');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'first_response_at',
                'satisfaction_rating',
                'satisfaction_comment',
                'satisfaction_submitted_at',
            ]);
        });
    }
};
