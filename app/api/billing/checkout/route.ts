import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSnapTransaction } from '@/lib/billing/midtrans';
import {
    createSubscription,
    createPaymentTransaction,
} from '@/lib/billing/subscription';
import { db } from '@/db';
import { plans } from '@/db/schema/admin';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tenantId, planId } = body;

        if (!tenantId || !planId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get plan details
        const plan = await db.query.plans.findFirst({
            where: eq(plans.id, planId),
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Create subscription and invoice
        const invoiceId = await createSubscription(tenantId, planId);

        // Generate unique order ID (max 50 chars for Midtrans)
        // Format: INV-timestamp-random (e.g., INV-1734567890-abc123)
        const timestamp = Date.now().toString();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const orderId = `INV-${timestamp}-${randomStr}`;

        // Create payment transaction record
        await createPaymentTransaction(
            invoiceId,
            orderId,
            plan.price
        );

        // Create Midtrans Snap transaction
        const transaction = await createSnapTransaction({
            orderId,
            amount: Number(plan.price),
            customerDetails: {
                firstName: session.user.name || 'Customer',
                email: session.user.email,
            },
            itemDetails: [
                {
                    id: 'PLAN-1', // Simple ID instead of UUID
                    name: `${plan.name} - ${plan.interval}`,
                    price: Number(plan.price),
                    quantity: 1,
                },
            ],
        });

        return NextResponse.json({
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
