# External Access Setup Guide

## Server Information

- **Server IP:** 192.168.0.213
- **Domain:** risk-profiling.local
- **Ports:** 80 (HTTP), 443 (HTTPS)

---

## Quick Access Methods

### Method 1: Access by IP Address (Easiest)

**From any PC on the same network:**

1. Open browser
2. Go to: **`https://192.168.0.213`**
3. You'll see a security warning (self-signed certificate)
4. Click **"Advanced"** → **"Proceed to site"**
5. Login page should appear!

---

### Method 2: Access by Domain Name

**Step 1: Edit hosts file on the other PC**

**Windows:**
```
1. Open Notepad as Administrator
2. Open file: C:\Windows\System32\drivers\etc\hosts
3. Add this line at the end:
   192.168.0.213 risk-profiling.local
4. Save and close
```

**Linux/Mac:**
```bash
sudo nano /etc/hosts

# Add this line:
192.168.0.213 risk-profiling.local

# Save: Ctrl+O, Enter, Ctrl+X
```

**Step 2: Access the site**
```
Open browser and go to: https://risk-profiling.local
```

---

## Troubleshooting

### If you can't access from other PC:

#### 1. Check Network Connectivity

**From the other PC, test ping:**
```bash
ping 192.168.0.213
```

Should get replies. If not:
- Both PCs must be on same network (192.168.0.x)
- Check network cables/WiFi connection

#### 2. Check Firewall on Server

**Run the check script:**
```bash
cd /home/rbtwebsrvr/projects/risk-profiling
./check-external-access.sh
```

**If firewall is blocking ports, open them:**

**For UFW (Ubuntu Firewall):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

**For iptables:**
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

#### 3. Check if Nginx is Accessible

**From the server, test:**
```bash
curl -k https://192.168.0.213
```

Should return HTML. If it does, then the issue is firewall or network.

#### 4. Check Windows Firewall on Client PC

If accessing from Windows, make sure Windows Firewall isn't blocking:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Make sure your browser is allowed

---

## SSL Certificate Warning

### Why you see "Not Secure" warning:

The site uses a **self-signed SSL certificate**. This is normal for internal networks.

### To Accept the Warning:

**Chrome/Brave:**
1. Click **"Advanced"**
2. Click **"Proceed to 192.168.0.213 (unsafe)"**

**Firefox:**
1. Click **"Advanced"**
2. Click **"Accept the Risk and Continue"**

**Edge:**
1. Click **"Advanced"**
2. Click **"Continue to 192.168.0.213 (unsafe)"**

### To Remove the Warning (Optional):

Install the CA certificate on client PCs:

1. **Copy certificate to client PC:**
   ```
   File: /home/rbtwebsrvr/projects/risk-profiling/RBT-Bank-Root-CA.crt
   ```

2. **Windows:**
   - Double-click the .crt file
   - Click "Install Certificate"
   - Store Location: "Local Machine"
   - Certificate Store: "Trusted Root Certification Authorities"
   - Click Finish

3. **Linux:**
   ```bash
   sudo cp RBT-Bank-Root-CA.crt /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

4. **Mac:**
   - Double-click the .crt file
   - Add to "System" keychain
   - Double-click the certificate
   - Expand "Trust"
   - Set "When using this certificate" to "Always Trust"

---

## Current Server Status

### Services Running:
- ✅ Nginx (Web Server) - Port 80, 443
- ✅ Laravel API - Port 8000 (internal)
- ✅ Reverb WebSocket - Port 8082 (internal)
- ✅ PostgreSQL Database

### Network Configuration:
- Nginx is listening on **all interfaces** (0.0.0.0)
- Server accepts connections from any IP
- No IP restrictions configured

---

## Testing External Access

### From Another PC:

**Test 1: Ping the server**
```bash
ping 192.168.0.213
```
Expected: Replies from 192.168.0.213

**Test 2: Check if port is open**
```bash
# Linux/Mac:
nc -zv 192.168.0.213 443

# Windows (PowerShell):
Test-NetConnection -ComputerName 192.168.0.213 -Port 443
```
Expected: Connection succeeded

**Test 3: Access in browser**
```
https://192.168.0.213
```
Expected: Login page appears (after accepting security warning)

---

## Common Issues & Solutions

### Issue 1: "This site can't be reached"
**Cause:** Network issue or firewall blocking

**Solutions:**
1. Check both PCs are on same network
2. Ping the server: `ping 192.168.0.213`
3. Check server firewall (see commands above)
4. Check client PC firewall/antivirus

### Issue 2: "Connection timed out"
**Cause:** Firewall blocking ports

**Solution:**
```bash
# On server, allow ports:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Issue 3: "ERR_SSL_PROTOCOL_ERROR"
**Cause:** SSL certificate issue

**Solutions:**
1. Make sure using `https://` not `http://`
2. Try accessing by IP: `https://192.168.0.213`
3. Check nginx is running: `systemctl status nginx`

### Issue 4: Works on server but not other PCs
**Cause:** Firewall or network isolation

**Solutions:**
1. Disable server firewall temporarily to test:
   ```bash
   sudo ufw disable
   ```
2. Try accessing by IP instead of domain
3. Check router settings (some routers block internal traffic)

---

## Network Diagram

```
┌─────────────────────────────────────┐
│  Other PC (192.168.0.x)             │
│  Browser: https://192.168.0.213     │
└──────────────┬──────────────────────┘
               │
               │ Network (192.168.0.0/24)
               │
┌──────────────▼──────────────────────┐
│  Server (192.168.0.213)             │
│  ┌──────────────────────────────┐   │
│  │  Nginx (Port 443)            │   │
│  │  SSL Termination             │   │
│  └──────────┬───────────────────┘   │
│             │                        │
│  ┌──────────▼───────────────────┐   │
│  │  Laravel API (Port 8000)     │   │
│  │  Internal only               │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  PostgreSQL (Port 5432)      │   │
│  │  Database: testing           │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Quick Reference Commands

### Check if accessible from server:
```bash
curl -k https://192.168.0.213
```

### Check nginx status:
```bash
systemctl status nginx
```

### Check firewall status:
```bash
sudo ufw status
```

### View nginx logs:
```bash
tail -f /var/log/nginx/risk-profiling-access.log
tail -f /var/log/nginx/risk-profiling-error.log
```

### Restart nginx:
```bash
sudo systemctl restart nginx
```

---

## Summary

**To access from another PC:**

1. **Easiest way:** `https://192.168.0.213` in browser
2. **Accept SSL warning** when it appears
3. **Login** with your credentials

**If it doesn't work:**
1. Run the check script: `./check-external-access.sh`
2. Open firewall ports: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`
3. Test connectivity: `ping 192.168.0.213`

**Need help?** Check the troubleshooting section above!

---

**The server is configured correctly for external access. The issue is most likely firewall or network connectivity!**

---

---

# User Management API Integration

Use these endpoints from your other system to create, update, view, and manage user accounts **without going through the Risk Profiling UI**.

---

## Base URL

```
https://risk-profiling.rbtbank.com/api/risk-profiling/v1/users
```

---

## Required Headers (All Requests)

```
Content-Type: application/json
Accept: application/json
X-Api-Key: rbtBKinc1964
```

No login step needed. Just include the API key on every request.

---

## API Key

The API key is set in the Risk Profiling server's `.env`:

```
EXTERNAL_API_KEY=rbtBKinc1964
```

Store this key in your other system's config and send it in the `X-Api-Key` header.
If the key is missing or wrong, the API returns `401 Unauthorized`.

> To change the key: edit `EXTERNAL_API_KEY` in `/home/rbtwebsrvr/projects/risk-profiling/risk/.env` and run `php artisan config:clear`.

---

## Create a User

**POST** `/api/risk-profiling/v1/users`

### Request Body

```json
{
  "first_name":     "John",
  "middle_initial": "A",
  "last_name":      "Doe",
  "username":       "johndoe",
  "email":          "john@example.com",
  "branch_id":      1,
  "role_ids":       [2],
  "status":         "active"
}
```

| Field            | Type     | Required | Description                                      |
|------------------|----------|----------|--------------------------------------------------|
| `first_name`     | string   | Yes      | User's first name                                |
| `middle_initial` | string   | No       | Single character middle initial                  |
| `last_name`      | string   | Yes      | User's last name                                 |
| `username`       | string   | Yes      | Unique username (no spaces)                      |
| `email`          | string   | Yes      | Unique email address                             |
| `branch_id`      | integer  | Yes      | ID of the branch the user belongs to             |
| `role_ids`       | array    | Yes      | Array of role IDs to assign (e.g. `[2]`)         |
| `status`         | string   | No       | `active` or `inactive` (default: `active`)       |

### Response `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "temporary_password": "Xk2!mP9@Jz",
  "data": {
    "id": 42,
    "first_name": "John",
    "middle_initial": "A",
    "last_name": "Doe",
    "full_name": "John A. Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "status": "active",
    "branch": { "id": 1, "name": "Main Office" },
    "roles": [ { "id": 2, "name": "User", "slug": "user" } ],
    "created_at": "2026-02-19T10:00:00.000000Z"
  }
}
```

> **Important:** Save the `temporary_password` and provide it to the user. The system sets `password_change_required = true` — the user must change it on first login.

---

## View a User

**GET** `/api/risk-profiling/v1/users/{id}`

### Example Request

```
GET /api/risk-profiling/v1/users/42
```

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 42,
    "first_name": "John",
    "middle_initial": "A",
    "last_name": "Doe",
    "full_name": "John A. Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "status": "active",
    "profile_pic": null,
    "branch": { "id": 1, "name": "Main Office" },
    "roles": [ { "id": 2, "name": "User", "slug": "user" } ],
    "created_at": "2026-02-19T10:00:00.000000Z",
    "updated_at": "2026-02-19T10:00:00.000000Z"
  }
}
```

---

## List Users

**GET** `/api/risk-profiling/v1/users`

### Query Parameters

| Parameter  | Type    | Description                                     |
|------------|---------|-------------------------------------------------|
| `per_page` | integer | Results per page (default: 50)                  |
| `search`   | string  | Search by name, email, or username              |
| `status`   | string  | Filter by `active` or `inactive`                |
| `role`     | string  | Filter by role slug (e.g. `user`, `admin`)      |
| `branch_id`| integer | Filter by branch ID                             |

### Example Request

```
GET /api/risk-profiling/v1/users?search=john&status=active&per_page=10
```

### Response `200 OK`

```json
{
  "success": true,
  "data": [ ...array of user objects... ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

---

## Update a User

**PUT** `/api/risk-profiling/v1/users/{id}`

### Request Body

```json
{
  "first_name":  "John",
  "last_name":   "Smith",
  "username":    "johnsmith",
  "email":       "john.smith@example.com",
  "branch_id":   2,
  "role_ids":    [2],
  "status":      "active"
}
```

All fields are required (same as create, except `middle_initial` is optional).

To also update the password, include:

```json
{
  "password":              "NewPass123!",
  "password_confirmation": "NewPass123!"
}
```

### Response `200 OK`

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ...updated user object... }
}
```

---

## Reset a User's Password

**POST** `/api/risk-profiling/v1/users/{id}/reset-password`

No request body required.

### Example Request

```
POST /api/risk-profiling/v1/users/42/reset-password
```

### Response `200 OK`

```json
{
  "success": true,
  "message": "Password reset successfully. Provide the temporary password to the user.",
  "temporary_password": "Yz3!nQ8@Kp",
  "data": { ...user object... }
}
```

> **Note:** All existing login tokens for the user are revoked. The user must log in with the new temporary password and will be required to change it.

---

## Update User Status (Activate / Deactivate)

**PUT** `/api/risk-profiling/v1/users/{id}/status`

### Request Body

```json
{
  "status": "inactive"
}
```

Values: `active` or `inactive`.

### Response `200 OK`

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": { ...user object... }
}
```

> **Note:** Setting status to `inactive` automatically revokes all active tokens for that user.

---

## Error Responses

| HTTP Code | Meaning                                                          |
|-----------|------------------------------------------------------------------|
| `401`     | Missing or invalid `X-Api-Key` header                           |
| `404`     | User not found                                                   |
| `422`     | Validation failed — see `errors` field for details              |
| `500`     | Server error                                                     |

### Example 422 Validation Error

```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."],
    "username": ["The username has already been taken."]
  }
}
```

---

## Integration Examples

### PHP (Laravel HTTP Client)

```php
// In your other system's .env:
// RISK_PROFILING_API_KEY=rbtBKinc1964

$base   = 'https://risk-profiling.rbtbank.com';
$apiKey = config('services.risk_profiling.api_key'); // env('RISK_PROFILING_API_KEY')

$http = Http::withHeaders([
        'X-Api-Key'    => $apiKey,
        'Accept'       => 'application/json',
        'Content-Type' => 'application/json',
    ])
    ->baseUrl($base);

// Create a user
$response = $http->post('/api/risk-profiling/v1/users', [
    'first_name' => 'Jane',
    'last_name'  => 'Smith',
    'username'   => 'janesmith',
    'email'      => 'jane@example.com',
    'branch_id'  => 1,
    'role_ids'   => [2],
    'status'     => 'active',
]);

$tempPassword = $response->json('temporary_password');
$userId       = $response->json('data.id');

// View the user
$user = $http->get("/api/risk-profiling/v1/users/{$userId}")->json('data');

// Update the user
$http->put("/api/risk-profiling/v1/users/{$userId}", [
    'first_name' => 'Jane',
    'last_name'  => 'Doe',
    'username'   => 'janedoe',
    'email'      => 'jane.doe@example.com',
    'branch_id'  => 1,
    'role_ids'   => [2],
    'status'     => 'active',
]);

// Reset password
$reset           = $http->post("/api/risk-profiling/v1/users/{$userId}/reset-password");
$newTempPassword = $reset->json('temporary_password');
```

### JavaScript / Axios

```javascript
// In your other system's .env:
// RISK_PROFILING_API_KEY=rbtBKinc1964

const BASE    = 'https://risk-profiling.rbtbank.com';
const API_KEY = process.env.RISK_PROFILING_API_KEY;

const api = axios.create({
  baseURL: BASE,
  headers: {
    'X-Api-Key':    API_KEY,
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

// Create a user
const { data: createRes } = await api.post('/api/risk-profiling/v1/users', {
  first_name: 'Jane',
  last_name:  'Smith',
  username:   'janesmith',
  email:      'jane@example.com',
  branch_id:  1,
  role_ids:   [2],
  status:     'active',
});
const { temporary_password, data: user } = createRes;

// View a user
const { data: viewRes } = await api.get(`/api/risk-profiling/v1/users/${user.id}`);

// Update a user
await api.put(`/api/risk-profiling/v1/users/${user.id}`, {
  first_name: 'Jane', last_name: 'Doe',
  username: 'janedoe', email: 'jane.doe@example.com',
  branch_id: 1, role_ids: [2], status: 'active',
});

// Reset password
const { data: resetRes } = await api.post(`/api/risk-profiling/v1/users/${user.id}/reset-password`);
const newTempPassword = resetRes.temporary_password;
```

### cURL (Terminal / Shell Script)

```bash
BASE="https://risk-profiling.rbtbank.com"
API_KEY="rbtBKinc1964"

# Create a user
curl -k -s -X POST "$BASE/api/risk-profiling/v1/users" \
  -H "X-Api-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "branch_id": 1,
    "role_ids": [2],
    "status": "active"
  }'

# View a user (replace 42 with actual ID)
curl -k -s "$BASE/api/risk-profiling/v1/users/42" \
  -H "X-Api-Key: $API_KEY" \
  -H "Accept: application/json"

# Reset password (replace 42 with actual ID)
curl -k -s -X POST "$BASE/api/risk-profiling/v1/users/42/reset-password" \
  -H "X-Api-Key: $API_KEY" \
  -H "Accept: application/json"
```

> **Note:** The `-k` flag skips SSL certificate verification (needed for self-signed certs). In production with a valid cert, remove `-k`.

---

## Quick Reference

| Action              | Method | Endpoint                                          |
|---------------------|--------|---------------------------------------------------|
| List users          | GET    | `/api/risk-profiling/v1/users`                    |
| Create user         | POST   | `/api/risk-profiling/v1/users`                    |
| View user           | GET    | `/api/risk-profiling/v1/users/{id}`               |
| Update user         | PUT    | `/api/risk-profiling/v1/users/{id}`               |
| Update status       | PUT    | `/api/risk-profiling/v1/users/{id}/status`        |
| Reset password      | POST   | `/api/risk-profiling/v1/users/{id}/reset-password`|
