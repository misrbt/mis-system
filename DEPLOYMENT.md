# Deployment Guide

Step-by-step deploy for **staging** and **production**. The repo ships
environment-specific `.env` templates so the only manual work is pasting
four secrets into each `.env`.

---

## 1. Environment templates

| Environment | Backend template                       | Frontend template                        |
| ----------- | -------------------------------------- | ---------------------------------------- |
| Local dev   | `backend/.env.example`                 | `frontend/.env.example`                  |
| Staging     | `backend/.env.staging.example`         | `frontend/.env.staging.example`          |
| Production  | `backend/.env.production.example`      | `frontend/.env.production.example`       |

Every value (SMTP host, URLs, APP_ENV, Sanctum/CORS domains, log level) is
pre-filled per environment. Only the following need to be filled in by hand
on the server — they are marked `# <FILL IN>` in the templates:

| Variable                    | How to obtain                                                        |
| --------------------------- | -------------------------------------------------------------------- |
| `DB_PASSWORD`               | Password for the `mis_staging` / `mis_production` Postgres role      |
| `MAIL_PASSWORD`             | App-password for the `mis@rbtbank.com` Microsoft 365 mailbox         |
| `REALTIME_SECRET`           | `openssl rand -hex 32` — must match the realtime sidecar's secret    |

> **Approver routing is no longer an env var.** Configure one approver per
> branch through the admin UI at `/helpdesk/approvers` after the app is up.
> The public submit form rejects High/Urgent tickets from any branch that
> has no approver in its cascade.

---

## 2. One-time prerequisites (Microsoft 365 SMTP)

Done **once** per tenant, not per deploy.

1. **Enable Authenticated SMTP** on `mis@rbtbank.com`. Tenant admin runs:
   ```powershell
   Set-CASMailbox -Identity mis@rbtbank.com -SmtpClientAuthenticationDisabled $false
   ```
   (Or in the admin center: Users → Manage email apps → **Authenticated SMTP** on.)

2. **Generate an App Password** if the mailbox has MFA. The regular account
   password will fail silently — Microsoft blocks basic auth when MFA is on.

3. **Open outbound TCP 587** from the app server to `smtp.office365.com`.

4. **Recommended**: publish SPF and DKIM records for `rbtbank.com` so that
   Gmail/Yahoo recipients don't drop approval emails into Spam.

---

## 3. Backend deploy (staging or production)

From the `backend/` directory on the target server:

```bash
# Pull latest code
git pull origin <staging|main>

# Install PHP dependencies (no dev packages)
composer install --no-dev --optimize-autoloader

# Copy the right template (choose one)
cp .env.staging.example .env
cp .env.production.example .env

# Edit .env and fill in the four <FILL IN> secrets
nano .env

# App key — only on the very first deploy, leave alone afterwards
php artisan key:generate

# Cache config, routes, views for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Apply DB migrations
php artisan migrate --force

# Ensure the public storage symlink exists (for ticket attachments)
php artisan storage:link
```

Restart PHP-FPM after deploying so `config:cache` is picked up:
```bash
sudo systemctl reload php8.3-fpm
```

---

## 4. Frontend deploy (staging or production)

From the `frontend/` directory on the target server:

```bash
git pull origin <staging|main>
npm ci
cp .env.staging.example .env          # or .env.production.example
npm run build
```

The `dist/` folder is what Nginx serves. Point the site root at `frontend/dist`.

---

## 5. Queue worker (recommended)

The High/Urgent approval email is sent synchronously with a try/catch, so
the ticket submission never blocks on mail. For snappier public-submit
responses and better retry behavior, run a queue worker under systemd or
supervisor:

```ini
# /etc/systemd/system/mis-queue.service
[Unit]
Description=MIS Laravel queue worker
After=network.target

[Service]
User=www-data
Restart=always
WorkingDirectory=/var/www/mis-system/backend
ExecStart=/usr/bin/php artisan queue:work --queue=default --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now mis-queue
```

---

## 6. Realtime sidecar (Socket.io)

Nginx proxies `/socket.io/` to the Node realtime server on `127.0.0.1:6001`.
The Node server must be running with the same `REALTIME_SECRET` as in
Laravel's `.env`. Reuse the secret value from `backend/.env` when starting
the sidecar service.

---

## 7. Verify the helpdesk approval flow

After a deploy, confirm SMTP is wired by mailing your own address:

```bash
php artisan tinker --execute="Mail::raw('MIS SMTP test', fn(\$m) => \$m->to('you@rbtbank.com')->subject('MIS SMTP test'));"
```

Then open `/helpdesk/approvers` and configure at least one branch approver.
Once that's in place, submit a test ticket at priority `High` or `Urgent`
to verify end-to-end:

1. The ticket is saved with `approval_status = pending` and stays hidden
   from `/helpdesk/tickets`.
2. `TicketApprovalRequestMail` is dispatched to the approver resolved for
   the requester's branch (branch+OBO → branch → parent cascade) with an
   Approve / Reject link.
3. The link opens `{FRONTEND_URL}/public-helpdesk/approval/{token}` — a
   token-gated public page, no login required.
4. Only after the officer approves does the ticket appear on the
   helpdesk board and fire realtime events to the IT team.
5. On the ticket detail page, MIS can click **Forward to President** to
   email all active global approvers for executive visibility.

Mail failures are caught and logged; the ticket still saves in `pending`
state so nothing is lost if SMTP is temporarily misconfigured.

---

## 8. Troubleshooting

| Symptom                                                           | Fix                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `SMTPAuthenticationException`                                     | Authenticated SMTP not enabled on the mailbox, or account password used instead of an app password.   |
| Email lands in Spam                                               | Publish SPF + DKIM for `rbtbank.com`.                                                                  |
| Approver's "Review" button 404s                                   | `FRONTEND_URL` in backend `.env` doesn't match the SPA's actual hostname.                              |
| `config:cache` changes not picked up                              | `php artisan config:clear && php artisan config:cache` and reload PHP-FPM.                             |
| `ViteException: Unable to locate file in Vite manifest`           | Run `npm run build` in `frontend/`.                                                                    |
| Ticket stuck in `pending` even though SMTP works                  | Check `storage/logs/laravel.log` for `Approval email send failed` warnings — mail error is swallowed.  |
