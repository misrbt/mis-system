# External User Management API

A shared, stateless REST API for managing users from external applications.
Built on Laravel Sanctum — no sessions, pure token authentication.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Endpoints](#endpoints)
   - [List Users](#1-list-users)
   - [Get User](#2-get-user)
   - [Create User](#3-create-user)
   - [Update User](#4-update-user)
   - [Update User Status](#5-update-user-status)
   - [Assign Role](#6-assign-role)
   - [Remove Role](#7-remove-role)
   - [Sync Roles](#8-sync-roles)
   - [Reset Password](#9-reset-password)
   - [Delete User](#10-delete-user)
7. [Permission Requirements](#permission-requirements)
8. [Integration Guide](#integration-guide)
9. [Code Examples](#code-examples)

---

## Overview

The External User Management API gives external systems full CRUD access to users in the Risk Profiling system. Use it to:

- Provision users automatically from your HR or identity system
- Sync user statuses from an external source of truth
- Build admin tooling outside this application
- Integrate user management into your own dashboards

All endpoints are under `/api/risk-profiling/v1/users` and require a Sanctum Bearer token.

---

## Base URL

```
https://risk-profiling.rbtbank.com/api/risk-profiling/v1/users
```

Replace `<your-domain>` with the actual host where the Risk Profiling backend is deployed.

---

## Authentication

### Step 1 — Obtain a Token

POST your credentials to the auth endpoint. The account used must have the `admin` role or `manage-users` permission.

**Request**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourAdminPassword"
}
```

**Response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "email": "admin@example.com", ... },
    "token": "1|abcdefghijklmnopqrstuvwxyz1234567890",
    "expires_at": "2025-11-12T12:00:00.000000Z"
  }
}
```

Store `data.token` securely. Tokens expire based on system settings (default: 60 minutes).

### Step 2 — Include the Token in Every Request

```http
Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz1234567890
```

### Token Refresh

Before a token expires, refresh it to avoid interruption:

```http
POST /api/v1/auth/refresh-token
Authorization: Bearer {current-token}
```

---

## Response Format

All successful responses follow this shape:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

Paginated list responses include a `meta` object:

```json
{
  "success": true,
  "data": [ ...users... ],
  "meta": {
    "current_page": 1,
    "last_page": 4,
    "per_page": 50,
    "total": 183
  }
}
```

### User Object Shape

```json
{
  "id": 5,
  "first_name": "Jane",
  "middle_initial": "A",
  "last_name": "Doe",
  "full_name": "Jane A. Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "email_verified_at": "2025-01-01T00:00:00.000000Z",
  "status": "active",
  "profile_pic": null,
  "roles": [
    {
      "id": 2,
      "name": "Manager",
      "slug": "manager",
      "permissions": [ ... ]
    }
  ],
  "branch": {
    "id": 1,
    "name": "Main Branch"
  },
  "created_at": "2025-01-15T08:30:00.000000Z",
  "updated_at": "2025-02-10T14:22:00.000000Z"
}
```

---

## Error Handling

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthenticated — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | User not found |
| 422 | Validation error |
| 500 | Server error |

**Validation Error Response (422)**

```json
{
  "message": "The email field must be a valid email address.",
  "errors": {
    "email": ["The email field must be a valid email address."]
  }
}
```

**Forbidden Response (403)**

```json
{
  "success": false,
  "message": "Forbidden. You do not have permission to manage users."
}
```

---

## Endpoints

### 1. List Users

Retrieve a paginated list of all users. Supports filtering and search.

```
GET /api/risk-profiling/v1/users
```

**Headers**

```
Authorization: Bearer {token}
```

**Query Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| per_page  | int    | No       | Results per page (default: 50) |
| search    | string | No       | Search across first name, last name, username, email |
| status    | string | No       | Filter by status: `active` or `inactive` |
| role      | string | No       | Filter by role slug (e.g. `admin`, `manager`) |
| branch_id | int    | No       | Filter by branch ID |

**Example Request**

```http
GET /api/risk-profiling/v1/users?search=jane&status=active&per_page=20
Authorization: Bearer {token}
```

**Example Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "full_name": "Jane A. Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "status": "active",
      "roles": [{ "id": 2, "name": "Manager", "slug": "manager" }],
      "branch": { "id": 1, "name": "Main Branch" }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

---

### 2. Get User

Retrieve full details for a single user.

```
GET /api/risk-profiling/v1/users/{id}
```

**Headers**

```
Authorization: Bearer {token}
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id        | int  | User ID     |

**Example Request**

```http
GET /api/risk-profiling/v1/users/5
Authorization: Bearer {token}
```

**Example Response**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "first_name": "Jane",
    "middle_initial": "A",
    "last_name": "Doe",
    "full_name": "Jane A. Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "status": "active",
    "roles": [ ... ],
    "branch": { "id": 1, "name": "Main Branch" }
  }
}
```

---

### 3. Create User

Create a new user. A secure temporary password is auto-generated and returned in the response — deliver it to the user via a secure channel. The user will be required to change it on first login.

```
POST /api/risk-profiling/v1/users
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**

| Field          | Type     | Required | Description |
|----------------|----------|----------|-------------|
| first_name     | string   | Yes      | Max 255 chars |
| middle_initial | string   | No       | Single character |
| last_name      | string   | Yes      | Max 255 chars |
| username       | string   | Yes      | Unique across all users |
| email          | string   | Yes      | Valid email, unique across all users |
| branch_id      | int      | Yes      | Must exist in the `branch` table |
| role_ids       | int[]    | Yes      | Array of role IDs to assign |
| status         | string   | No       | `active` (default) or `inactive` |

**Example Request**

```http
POST /api/risk-profiling/v1/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Jane",
  "middle_initial": "A",
  "last_name": "Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "branch_id": 1,
  "role_ids": [2],
  "status": "active"
}
```

**Example Response (201)**

```json
{
  "success": true,
  "message": "User created successfully",
  "temporary_password": "Xb3!qW9@kZ1y",
  "data": {
    "id": 5,
    "first_name": "Jane",
    "last_name": "Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "status": "active",
    "roles": [{ "id": 2, "name": "Manager", "slug": "manager" }],
    "branch": { "id": 1, "name": "Main Branch" }
  }
}
```

> **Important:** The `temporary_password` is shown only once. Store it or transmit it immediately to the user.

---

### 4. Update User

Update any user fields. Password update is optional — omit `password` to leave it unchanged.

```
PUT /api/risk-profiling/v1/users/{id}
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id        | int  | User ID     |

**Body**

| Field                 | Type   | Required | Description |
|-----------------------|--------|----------|-------------|
| first_name            | string | Yes      | |
| middle_initial        | string | No       | Single character |
| last_name             | string | Yes      | |
| username              | string | Yes      | Unique (excluding this user) |
| email                 | string | Yes      | Valid email, unique (excluding this user) |
| branch_id             | int    | Yes      | |
| role_ids              | int[]  | Yes      | Replaces current roles |
| status                | string | No       | `active` or `inactive` |
| password              | string | No       | Must meet strength requirements |
| password_confirmation | string | Conditional | Required when `password` is set |

**Password Requirements**

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Example Request**

```http
PUT /api/risk-profiling/v1/users/5
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "username": "janesmith",
  "email": "jane.smith@example.com",
  "branch_id": 2,
  "role_ids": [2, 3],
  "status": "active"
}
```

**Example Response**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ...updated user object... }
}
```

---

### 5. Update User Status

Activate or deactivate a user. Deactivating a user immediately revokes all their tokens, forcing them offline.

```
PUT /api/risk-profiling/v1/users/{id}/status
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| status | string | Yes      | `active` or `inactive` |

**Example Request**

```http
PUT /api/risk-profiling/v1/users/5/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "inactive"
}
```

**Example Response**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": { ...user object... }
}
```

---

### 6. Assign Role

Add a role to a user without removing their existing roles.

```
POST /api/risk-profiling/v1/users/{id}/roles
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**

| Field   | Type | Required | Description |
|---------|------|----------|-------------|
| role_id | int  | Yes      | Role ID to assign |

**Example Request**

```http
POST /api/risk-profiling/v1/users/5/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_id": 3
}
```

**Example Response**

```json
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": { ...user object with updated roles... }
}
```

---

### 7. Remove Role

Remove a specific role from a user.

```
DELETE /api/risk-profiling/v1/users/{id}/roles
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**

| Field   | Type | Required | Description |
|---------|------|----------|-------------|
| role_id | int  | Yes      | Role ID to remove |

**Example Request**

```http
DELETE /api/risk-profiling/v1/users/5/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_id": 3
}
```

**Example Response**

```json
{
  "success": true,
  "message": "Role removed from user successfully",
  "data": { ...user object with updated roles... }
}
```

---

### 8. Sync Roles

Replace all of a user's roles at once. Any roles not in the list will be removed.

```
PUT /api/risk-profiling/v1/users/{id}/roles
```

**Headers**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**

| Field    | Type  | Required | Description |
|----------|-------|----------|-------------|
| role_ids | int[] | Yes      | Full list of role IDs to set |

**Example Request**

```http
PUT /api/risk-profiling/v1/users/5/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [1, 3]
}
```

**Example Response**

```json
{
  "success": true,
  "message": "User roles updated successfully",
  "data": { ...user object with updated roles... }
}
```

---

### 9. Reset Password

Generate a new temporary password for a user. All existing tokens for that user are immediately revoked. The user must change their password on next login.

```
POST /api/risk-profiling/v1/users/{id}/reset-password
```

**Headers**

```
Authorization: Bearer {token}
```

No request body required.

**Example Request**

```http
POST /api/risk-profiling/v1/users/5/reset-password
Authorization: Bearer {token}
```

**Example Response**

```json
{
  "success": true,
  "message": "Password reset successfully. Provide the temporary password to the user.",
  "temporary_password": "Kp7!mN3@xR9z",
  "data": { ...user object... }
}
```

> **Important:** The `temporary_password` is shown only once. Transmit it securely to the user.

---

### 10. Delete User

Permanently delete a user. All their tokens are revoked first. This action cannot be undone.

```
DELETE /api/risk-profiling/v1/users/{id}
```

**Headers**

```
Authorization: Bearer {token}
```

**Example Request**

```http
DELETE /api/risk-profiling/v1/users/5
Authorization: Bearer {token}
```

**Example Response**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Permission Requirements

| Endpoint | Method | Required Permission |
|----------|--------|---------------------|
| List Users | GET | Any authenticated user |
| Get User | GET | Any authenticated user |
| Create User | POST | `manage-users` or `admin` role |
| Update User | PUT | `manage-users` or `admin` role |
| Update Status | PUT | `manage-users` or `admin` role |
| Assign Role | POST | `manage-users` or `admin` role |
| Remove Role | DELETE | `manage-users` or `admin` role |
| Sync Roles | PUT | `manage-users` or `admin` role |
| Reset Password | POST | `manage-users` or `admin` role |
| Delete User | DELETE | `manage-users` or `admin` role |

---

## Integration Guide

### Step-by-step integration for a new external application

**1. Create a dedicated service account**

In the Risk Profiling admin panel, create a user with:
- Role: `admin` (full access) or a role with `manage-users` permission
- Store the credentials in your application's secrets manager

**2. Authenticate and cache the token**

Tokens expire (default 60 minutes). Cache the token and refresh it before expiry.

```
POST /api/v1/auth/login     → get token
POST /api/v1/auth/refresh-token  → extend session (call before expiry)
GET  /api/v1/auth/validate-token → check if token is still valid
```

**3. Make user management calls**

All calls use `Authorization: Bearer {token}` and `Content-Type: application/json`.

**4. Handle errors gracefully**

- `401` → Re-authenticate and retry once
- `403` → The service account lacks permissions — fix the account's role
- `422` → Validation failure — check `errors` in the response body
- `500` → Server error — log and alert

---

## Code Examples

### PHP (cURL)

```php
<?php

$baseUrl = 'https://your-domain.com/api';
$token   = null;

// 1. Authenticate
$ch = curl_init("{$baseUrl}/v1/auth/login");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode([
        'email'    => 'admin@example.com',
        'password' => 'YourPassword',
    ]),
]);
$response = json_decode(curl_exec($ch), true);
curl_close($ch);
$token = $response['data']['token'];

// 2. Create a user
$ch = curl_init("{$baseUrl}/v1/users");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        "Authorization: Bearer {$token}",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'first_name' => 'Jane',
        'last_name'  => 'Doe',
        'username'   => 'janedoe',
        'email'      => 'jane@example.com',
        'branch_id'  => 1,
        'role_ids'   => [2],
    ]),
]);
$user = json_decode(curl_exec($ch), true);
curl_close($ch);

echo 'Temporary password: ' . $user['temporary_password'];
```

---

### JavaScript / Node.js (fetch)

```javascript
const BASE_URL = 'https://your-domain.com/api';

async function getToken(email, password) {
  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return body.data.token;
}

async function createUser(token, userData) {
  const res = await fetch(`${BASE_URL}/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return res.json();
}

// Usage
const token = await getToken('admin@example.com', 'YourPassword');

const result = await createUser(token, {
  first_name: 'Jane',
  last_name: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  branch_id: 1,
  role_ids: [2],
});

console.log('Temporary password:', result.temporary_password);
```

---

### Python (requests)

```python
import requests

BASE_URL = 'https://your-domain.com/api'

# 1. Authenticate
resp = requests.post(f'{BASE_URL}/v1/auth/login', json={
    'email': 'admin@example.com',
    'password': 'YourPassword',
})
token = resp.json()['data']['token']
headers = {'Authorization': f'Bearer {token}'}

# 2. List users
users = requests.get(f'{BASE_URL}/v1/users', headers=headers, params={
    'status': 'active',
    'per_page': 100,
}).json()

# 3. Create a user
new_user = requests.post(f'{BASE_URL}/v1/users', headers=headers, json={
    'first_name': 'Jane',
    'last_name': 'Doe',
    'username': 'janedoe',
    'email': 'jane@example.com',
    'branch_id': 1,
    'role_ids': [2],
}).json()

print('Temporary password:', new_user['temporary_password'])

# 4. Reset a user's password
reset = requests.post(
    f'{BASE_URL}/v1/users/{new_user["data"]["id"]}/reset-password',
    headers=headers
).json()

print('New temporary password:', reset['temporary_password'])
```

---

*This API uses Laravel Sanctum for stateless token authentication. Tokens are scoped to the authenticated user's permissions.*
