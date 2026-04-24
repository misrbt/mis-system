/**
 * PM2 ecosystem for the MIS Helpdesk realtime server.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 start ecosystem.config.cjs --env staging
 *   pm2 save && pm2 startup     # auto-start on reboot
 *
 * Actual secrets belong in a .env file on the server (not committed).
 * The env_* blocks only set NODE_ENV so the server's own .env is loaded
 * correctly and dotenv picks up the right values.
 */
module.exports = {
  apps: [
    {
      name: 'mis-helpdesk-realtime',
      script: './server.js',
      instances: 1,           // Socket.io rooms are in-memory — do not cluster
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '256M',
      watch: false,
      time: true,             // Prepend ISO timestamps to logs
      env: {
        NODE_ENV: 'development',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
