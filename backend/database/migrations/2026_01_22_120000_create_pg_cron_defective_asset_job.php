<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_cron");

        DB::statement("
            DO $$
            DECLARE
                existing_job_id integer;
            BEGIN
                SELECT jobid INTO existing_job_id
                FROM cron.job
                WHERE jobname = 'purge_defective_assets';

                IF existing_job_id IS NOT NULL THEN
                    PERFORM cron.unschedule(existing_job_id);
                END IF;

                PERFORM cron.schedule(
                    'purge_defective_assets',
                    '0 1 * * *',
                    $cmd$
                        DELETE FROM assets
                        WHERE status_id = (
                            SELECT id FROM status WHERE name = 'Defective' LIMIT 1
                        )
                        AND delete_after_at IS NOT NULL
                        AND delete_after_at <= NOW();
                    $cmd$
                );
            END
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("
            DO $$
            DECLARE
                existing_job_id integer;
            BEGIN
                SELECT jobid INTO existing_job_id
                FROM cron.job
                WHERE jobname = 'purge_defective_assets';

                IF existing_job_id IS NOT NULL THEN
                    PERFORM cron.unschedule(existing_job_id);
                END IF;
            END
            $$;
        ");
    }
};
