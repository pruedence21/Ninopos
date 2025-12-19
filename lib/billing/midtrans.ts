import MidtransClient from 'midtrans-client';

// Initialize Snap API client
export const snap = new MidtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Initialize Core API client (for subscription)
export const coreApi = new MidtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export interface CreateTransactionParams {
    orderId: string;
    amount: number;
    customerDetails: {
        firstName: string;
        email: string;
        phone?: string;
    };
    itemDetails: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    }[];
}

export async function createSnapTransaction(params: CreateTransactionParams) {
    const parameter = {
        transaction_details: {
            order_id: params.orderId,
            gross_amount: params.amount,
        },
        customer_details: {
            first_name: params.customerDetails.firstName,
            email: params.customerDetails.email,
            phone: params.customerDetails.phone,
        },
        item_details: params.itemDetails,
        callbacks: {
            finish: `${process.env.NEXTAUTH_URL}/billing/success`,
            error: `${process.env.NEXTAUTH_URL}/billing/error`,
            pending: `${process.env.NEXTAUTH_URL}/billing/pending`,
        },
    };

    const transaction = await snap.createTransaction(parameter);
    return transaction;
}

export async function getTransactionStatus(orderId: string) {
    const status = await coreApi.transaction.status(orderId);
    return status;
}

export function verifySignatureKey(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean {
    const crypto = require('crypto');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    const hash = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

    return hash === signatureKey;
}
