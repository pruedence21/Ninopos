# System Architecture

## Overview

SaaS Petshop Management System with multi-tenant architecture, subdomain routing, and subscription billing.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Database**: PostgreSQL (multi-schema)
- **ORM**: Drizzle ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Payment**: Midtrans
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui

## Architecture Layers

### 1. Routing Layer

**Subdomain Routing** (`proxy.ts`):
- Extracts subdomain from hostname
- Validates tenant existence
- Injects tenant context into headers
- Enforces authentication

**Routes**:
- Main domain: Registration, login
- Subdomain: Tenant-specific dashboard and features

### 2. Authentication Layer

**Auth.js Configuration** (`auth.ts`):
- Credentials provider (email/password)
- Google OAuth provider
- Drizzle adapter for session storage
- Custom callbacks for user data

### 3. Multi-Tenancy Layer

**Tenant Isolation**:
- Subdomain-based tenant identification
- Tenant context injection via middleware
- Row-level tenant filtering in queries

**User-Tenant Relationships**:
- Many-to-many via `user_tenants` table
- Role-based access control (RBAC)
- Owner, Admin, Staff roles

### 4. RBAC Layer

**Permission System** (`lib/rbac/`):
- Permission definitions per role
- Server-side middleware enforcement
- Client-side hooks for UI rendering

**Roles**:
- **Owner**: Full access (billing, users, deletion)
- **Admin**: Operations (products, customers, invite staff)
- **Staff**: View-only + create transactions

### 5. Billing Layer

**Subscription Management** (`lib/billing/`):
- Plan-based subscriptions
- Midtrans payment integration
- Invoice generation
- Webhook handling for payment events

**Flow**:
1. User selects plan
2. Checkout creates subscription + invoice
3. Midtrans Snap handles payment
4. Webhook activates subscription

### 6. Invitation Layer

**Team Invitations** (`lib/invitations/`):
- Token-based invitations (7-day expiry)
- Email delivery via Resend
- New user registration flow
- Existing user join flow

## Data Flow

### Registration Flow
1. User registers → Create account
2. Auto-login with credentials
3. Create tenant → Generate subdomain
4. Select plan → Initiate checkout
5. Payment → Activate subscription
6. Redirect to tenant dashboard

### Invitation Flow
1. Owner/Admin sends invitation
2. Email sent with token link
3. Recipient clicks link
4. New user: Register + join tenant
5. Existing user: Login + join tenant

## Security

- Password hashing with bcrypt
- JWT session tokens
- CSRF protection (Auth.js)
- Subdomain validation
- Permission-based API access
- Webhook signature verification

## Scalability Considerations

- Database connection pooling
- Multi-schema for data isolation
- Stateless authentication (JWT)
- CDN-ready static assets
- Horizontal scaling support
