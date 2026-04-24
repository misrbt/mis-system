<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Required by the public submit form whenever priority is High or
            // Urgent — surfaces to the approver in the review email so they
            // can decide with full context instead of just seeing "urgent".
            $table->text('priority_justification')->nullable()->after('priority');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('priority_justification');
        });
    }
};
