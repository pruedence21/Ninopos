# SaaS Petshop Management System - Setup Guide

## Prerequisites

1. **PostgreSQL Database**: Ensure you have a PostgreSQL database running
2. **Midtrans Account**: Sign up at [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/)
3. **Google OAuth**: Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)

## Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in the required environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY`: From Midtrans Dashboard

## Database Setup

1. Generate and push database schema:
```bash
bun run db:generate
bun run db:push
```

2. Seed initial data (subscription plans):
```bash
bun run db:seed
```

## Development

1. Start the development server:
```bash
bun run dev
```

2. Access the application:
   - Main domain: `http://localhost:3000`
   - Subdomain (after creating tenant): `http://yoursubdomain.localhost:3000`

## Wildcard DNS Setup (Production)

For production deployment with true subdomains:

1. Add wildcard DNS record:
   - Type: `A` or `CNAME`
   - Name: `*`
   - Value: Your server IP or domain

2. Configure SSL certificate for wildcard domain (e.g., `*.yourapp.com`)

## Testing Payment Flow

1. Use Midtrans sandbox test cards:
   - **Success**: `4811 1111 1111 1114`
   - **Failure**: `4911 1111 1111 1113`
   - CVV: `123`, Expiry: any future date

2. Configure webhook URL in Midtrans Dashboard:
   - URL: `https://yourdomain.com/api/billing/webhook`
   - For local testing, use ngrok or localtunnel

## User Flow

1. **Registration**: `/register` → Create account
2. **Tenant Setup**: `/register/tenant` → Choose subdomain
3. **Plan Selection**: `/register/plan` → Subscribe
4. **Payment**: Midtrans Snap popup → Complete payment
5. **Dashboard**: Redirect to `yoursubdomain.yourapp.com/dashboard`
