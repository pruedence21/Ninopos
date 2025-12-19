import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureKey } from '@/lib/billing/midtrans';
import {
    updatePaymentTransaction,
    activateSubscription,
} from '@/lib/billing/subscription';
import { db } from '@/db';
import { paymentTransactions, invoices } from '@/db/schema/admin';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            transaction_id,
            payment_type,
            transaction_time,
            settlement_time,
        } = body;

        // Verify signature
        const isValid = verifySignatureKey(
            order_id,
            status_code,
            gross_amount,
            signature_key
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Map Midtrans status to our status
        let paymentStatus:
            | 'pending'
            | 'settlement'
            | 'capture'
            | 'deny'
            | 'cancel'
            | 'expire'
            | 'failure' = 'pending';

        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            paymentStatus = transaction_status;
        } else if (transaction_status === 'deny') {
            paymentStatus = 'deny';
        } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
            paymentStatus = transaction_status;
        } else if (transaction_status === 'pending') {
            paymentStatus = 'pending';
        }

        // Update payment transaction
        await updatePaymentTransaction(order_id, {
            midtransTransactionId: transaction_id,
            paymentType: payment_type,
            status: paymentStatus,
            transactionTime: transaction_time ? new Date(transaction_time) : undefined,
            settlementTime: settlement_time ? new Date(settlement_time) : undefined,
            metadata: JSON.stringify(body),
        });

        // If payment is successful, activate subscription
        if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
            // Get invoice ID from payment transaction
            const transaction = await db.query.paymentTransactions.findFirst({
                where: eq(paymentTransactions.midtransOrderId, order_id),
            });

            if (transaction) {
                await activateSubscription(transaction.invoiceId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
