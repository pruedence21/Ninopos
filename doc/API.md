# API Documentation

Auto-generated API documentation for the SaaS Petshop Management System.

## Authentication APIs

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "uuid"
}
```

---

## Tenant APIs

### POST /api/tenant/create
Create a new tenant with subdomain.

**Request Body:**
```json
{
  "name": "string",
  "subdomain": "string"
}
```

**Response:**
```json
{
  "success": true,
  "tenantId": "uuid",
  "subdomain": "string"
}
```

### GET /api/tenant/check-subdomain
Check subdomain availability.

**Query Parameters:**
- subdomain: string

**Response:**
```json
{
  "available": boolean
}
```

---

## Billing APIs

### GET /api/billing/plans
Get all active subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "string",
      "price": "string",
      "interval": "monthly" | "yearly",
      "description": "string"
    }
  ]
}
```

### POST /api/billing/checkout
Create Midtrans checkout session.

**Request Body:**
```json
{
  "tenantId": "uuid",
  "planId": "uuid"
}
```

**Response:**
```json
{
  "token": "string",
  "redirectUrl": "string"
}
```

### POST /api/billing/webhook
Midtrans payment webhook handler.

**Request Body:** Midtrans notification payload

---

## Invitation APIs

### POST /api/invitations/send
Send team invitation email.

**Request Body:**
```json
{
  "email": "string",
  "role": "admin" | "staff"
}
```

**Response:**
```json
{
  "success": true,
  "invitationId": "uuid"
}
```

### POST /api/invitations/accept
Accept team invitation.

**Request Body:**
```json
{
  "token": "string",
  "name": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "tenantId": "uuid"
}
```

### GET /api/invitations/[token]
Get invitation details by token.

**Response:**
```json
{
  "email": "string",
  "role": "string",
  "tenantName": "string",
  "inviterName": "string"
}
```

---

## Team APIs

### DELETE /api/team/members/[id]
Remove team member.

**Response:**
```json
{
  "success": true
}
```

### GET /api/user/role
Get current user's role.

**Response:**
```json
{
  "role": "owner" | "admin" | "staff"
}
```
