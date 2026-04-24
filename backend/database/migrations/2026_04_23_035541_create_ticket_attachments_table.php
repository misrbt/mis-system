<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->string('file_path');          // relative path on public disk
            $table->string('original_name');      // original filename for download
            $table->string('mime_type');
            $table->unsignedBigInteger('size');   // bytes

            $table->timestamps();

            $table->index('ticket_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_attachments');
    }
};
