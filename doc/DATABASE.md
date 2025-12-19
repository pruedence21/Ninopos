# Database Schema Documentation

## Overview

Multi-schema PostgreSQL database with two schemas:
- **admin**: Tenant and billing data
- **public**: User authentication and relationships

---

## Admin Schema

### tenants
Stores tenant/organization information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar | Business name |
| slug | varchar | URL-friendly identifier |
| subdomain | varchar | Unique subdomain |
| status | varchar | active/suspended/cancelled |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### plans
Subscription plan definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar | Plan name |
| slug | varchar | URL-friendly identifier |
| price | decimal | Price in IDR |
| interval | varchar | monthly/yearly |
| description | text | Plan description |
| is_active | boolean | Plan availability |

### subscriptions
Active subscriptions linking tenants to plans.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenants |
| plan_id | uuid | FK to plans |
| status | varchar | active/cancelled/expired |
| current_period_start | timestamp | Billing period start |
| current_period_end | timestamp | Billing period end |
| cancel_at_period_end | boolean | Auto-cancel flag |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### invoices
Billing invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| subscription_id | uuid | FK to subscriptions |
| amount | decimal | Invoice amount |
| status | varchar | pending/paid/failed |
| due_date | timestamp | Payment due date |
| paid_at | timestamp | Payment timestamp |
| created_at | timestamp | Creation timestamp |

### payment_transactions
Payment transaction records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| invoice_id | uuid | FK to invoices |
| order_id | varchar | Midtrans order ID |
| transaction_id | varchar | Midtrans transaction ID |
| payment_type | varchar | Payment method |
| gross_amount | decimal | Total amount |
| transaction_status | varchar | Transaction status |
| transaction_time | timestamp | Transaction timestamp |
| settlement_time | timestamp | Settlement timestamp |
| fraud_status | varchar | Fraud check status |
| status_code | varchar | Status code |
| status_message | text | Status message |
| created_at | timestamp | Creation timestamp |

---

## Public Schema

### users
User accounts (Auth.js compatible).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar | User full name |
| email | varchar | Unique email |
| email_verified | timestamp | Email verification |
| image | varchar | Profile image URL |
| password | varchar | Hashed password |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### accounts
OAuth provider accounts (Auth.js).

### sessions
User sessions (Auth.js).

### verification_tokens
Email verification tokens (Auth.js).

### user_tenants
User-tenant relationships with roles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| tenant_id | uuid | FK to tenants (admin schema) |
| role | varchar | owner/admin/staff |
| created_at | timestamp | Join timestamp |

### invitations
Team invitation records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | varchar | Invitee email |
| tenant_id | uuid | FK to tenants |
| role | varchar | Assigned role |
| invited_by | uuid | FK to users |
| token | varchar | Unique invitation token |
| expires_at | timestamp | Token expiry |
| accepted_at | timestamp | Acceptance timestamp |
| created_at | timestamp | Creation timestamp |
