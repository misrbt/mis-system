# Realtime Server — Deployment Guide

Real-time chat sidecar for the MIS Helpdesk. Receives events from Laravel via
authenticated HTTP POST and fans them out to browser clients over Socket.io.

```
Browser (wss)                 Nginx (TLS)             Node.js         Laravel (PHP)
   │  wss://mis.rbtbank.com     │                      │                │
   │ /socket.io/... ──────────► │  upgrade ──────────► :6001  ◄─── POST /emit ◄── Laravel
   │                            │                      │  (X-Realtime-Secret)
```

## Environments

| Env | Frontend origin | WebSocket URL (from browser) | Node binds |
|---|---|---|---|
| Local | `http://localhost:5173` | `http://127.0.0.1:6001/socket.io/` | `:6001` |
| Staging | `https://staging.mis.local` | `wss://staging.mis.local/socket.io/` | `:6001` (proxied) |
| Production | `https://mis.rbtbank.com` | `wss://mis.rbtbank.com/socket.io/` | `:6001` (proxied) |

In **staging/production** the realtime server is only reachable **over Nginx**
on the same hostname as the frontend. The Node process binds to `127.0.0.1:6001`
and is never exposed directly.

## Prerequisites on each server

- Node.js ≥ 20
- PM2 (`npm i -g pm2`)
- Nginx with TLS (Let's Encrypt recommended)

## First-time setup

```bash
# On the server
cd /var/www/mis-system/realtime-server
npm ci --omit=dev

# Pick the right env template and fill in REALTIME_SECRET
cp .env.production.example .env    # or .env.staging.example
openssl rand -hex 32                # use this for REALTIME_SECRET
$EDITOR .env

# Laravel side: make sure backend/.env has the SAME secret
#   REALTIME_URL=http://127.0.0.1:6001
#   REALTIME_SECRET=<same-as-above>
#   REALTIME_ENABLED=true

# Start under PM2
pm2 start ecosystem.config.cjs --env production   # or --env staging
pm2 save
pm2 startup                  # prints a command — run it as root to auto-start on reboot
```

Verify:
```bash
curl http://127.0.0.1:6001/health
# { "status":"ok", "env":"production", ... }
```

## Nginx config

Add a **WebSocket upgrade block** to the existing vhost. The frontend is
served from the same vhost; we only add one `location` for `/socket.io/`.

### Production — `/etc/nginx/sites-available/mis.rbtbank.com`

```nginx
# WebSocket upgrade helper (put at http { } level, once per nginx install)
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl http2;
    server_name mis.rbtbank.com;

    ssl_certificate     /etc/letsencrypt/live/mis.rbtbank.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mis.rbtbank.com/privkey.pem;

    # --- existing frontend + API locations here ---

    # Realtime WebSocket
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;   # long-lived WebSocket
        proxy_send_timeout 3600s;
    }
}

server {
    listen 80;
    server_name mis.rbtbank.com;
    return 301 https://$host$request_uri;
}
```

### Staging — `/etc/nginx/sites-available/staging.mis.local`

Identical, just swap `server_name` and the cert paths. For an internal hostname
(`.local`) you likely use an internal CA or a self-signed cert.

Apply:
```bash
nginx -t && systemctl reload nginx
```

## Environment variable checklist

### Realtime server `.env`
| Var | Local | Staging | Production |
|---|---|---|---|
| `NODE_ENV` | `development` | `staging` | `production` |
| `PORT` | `6001` | `6001` | `6001` |
| `REALTIME_SECRET` | any | **≥32 chars, unique** | **≥32 chars, unique** |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174` | `https://staging.mis.local` | `https://mis.rbtbank.com` |
| `TRUST_PROXY` | `0` | `1` | `1` |

The server **refuses to start** in staging/production if `REALTIME_SECRET` is
shorter than 32 chars or `CORS_ORIGIN` contains `*`.

### Laravel `backend/.env`
```
REALTIME_URL=http://127.0.0.1:6001
REALTIME_SECRET=<SAME as realtime-server .env>
REALTIME_ENABLED=true
```

### Frontend build
Leave `VITE_REALTIME_URL` **unset** for staging/production builds so the
client connects to the same origin it was served from (Nginx handles the
proxy). Only set it in dev.

## Deploy flow (CI/CD)

```bash
# on deploy
git pull
cd realtime-server
npm ci --omit=dev
pm2 reload ecosystem.config.cjs --env production    # zero-downtime reload
```

## Security checklist

- [ ] `REALTIME_SECRET` rotated per env, stored in secrets manager (not git)
- [ ] `CORS_ORIGIN` is an explicit allow-list (no `*`)
- [ ] Node process bound to `127.0.0.1`, never `0.0.0.0`, behind Nginx
- [ ] Nginx terminates TLS (`wss://`), not the Node server
- [ ] `pm2 logs mis-helpdesk-realtime` monitored (or shipped to Loki/CloudWatch)
- [ ] Firewall blocks `:6001` from outside the server
- [ ] Secret rotation procedure documented: update both `.env` files, then
      `pm2 reload mis-helpdesk-realtime` and restart Laravel workers

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `FATAL: REALTIME_SECRET must be at least 32 chars` at boot | Secret is too weak in staging/prod; regenerate with `openssl rand -hex 32` |
| `FATAL: CORS_ORIGIN must be an explicit allow-list` | You left `*` in CORS_ORIGIN — set it to the real frontend origin |
| Browser keeps polling instead of upgrading | Nginx missing `Upgrade`/`Connection` headers or the `map` block |
| `401 Invalid secret` in Laravel logs | Backend `REALTIME_SECRET` drifted from realtime-server `.env` — redeploy both |
| Works in dev, silent in prod | `VITE_REALTIME_URL` was baked into the build pointing at `127.0.0.1:6001`. Rebuild with it unset. |
| `pm2` not restarting on reboot | Run `pm2 startup` and execute the printed command as root, then `pm2 save` |

## Disabling realtime (emergency brake)

```bash
# On the Laravel server — no deploy needed
sed -i 's/^REALTIME_ENABLED=.*/REALTIME_ENABLED=false/' backend/.env
php artisan config:clear
```

Comments will still post and display — they'll just need a page refresh to
appear for the other side instead of arriving live.
