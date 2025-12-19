import { db } from '@/db';
import {
    subscriptions,
    invoices,
    paymentTransactions,
    plans,
} from '@/db/schema/admin';
import { eq, and, gte } from 'drizzle-orm';

export async function createSubscription(
    tenantId: string,
    planId: string
): Promise<string> {
    const plan = await db.query.plans.findFirst({
        where: eq(plans.id, planId),
    });

    if (!plan) {
        throw new Error('Plan not found');
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);

    if (plan.interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create subscription
    const [subscription] = await db
        .insert(subscriptions)
        .values({
            tenantId,
            planId,
            status: 'trialing', // Will be activated after payment
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        })
        .returning();

    // Create initial invoice
    const [invoice] = await db
        .insert(invoices)
        .values({
            subscriptionId: subscription.id,
            amount: plan.price,
            status: 'pending',
            dueDate: now,
        })
        .returning();

    return invoice.id;
}

export async function activateSubscription(invoiceId: string) {
    const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
        with: {
            subscription: true,
        },
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    // Update invoice status
    await db
        .update(invoices)
        .set({
            status: 'paid',
            paidAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

    // Activate subscription
    await db
        .update(subscriptions)
        .set({
            status: 'active',
        })
        .where(eq(subscriptions.id, invoice.subscriptionId));
}

export async function cancelSubscription(subscriptionId: string) {
    await db
        .update(subscriptions)
        .set({
            status: 'cancelled',
            cancelledAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
}

export async function getActiveSubscription(tenantId: string) {
    const subscription = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.tenantId, tenantId),
            eq(subscriptions.status, 'active')
        ),
        with: {
            plan: true,
        },
    });

    return subscription;
}

export async function isSubscriptionActive(tenantId: string): Promise<boolean> {
    const subscription = await getActiveSubscription(tenantId);

    if (!subscription) {
        return false;
    }

    // Check if subscription is still within valid period
    const now = new Date();
    return now <= subscription.currentPeriodEnd;
}

export async function createPaymentTransaction(
    invoiceId: string,
    midtransOrderId: string,
    amount: string
) {
    const [transaction] = await db
        .insert(paymentTransactions)
        .values({
            invoiceId,
            midtransOrderId,
            amount,
            status: 'pending',
        })
        .returning();

    return transaction;
}

export async function updatePaymentTransaction(
    midtransOrderId: string,
    data: {
        midtransTransactionId?: string;
        paymentType?: string;
        status: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure';
        transactionTime?: Date;
        settlementTime?: Date;
        metadata?: string;
    }
) {
    await db
        .update(paymentTransactions)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.midtransOrderId, midtransOrderId));
}
