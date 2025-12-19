import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    pgEnum,
    pgSchema,
    decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create admin schema
export const adminSchema = pgSchema('admin');

// Enums
export const tenantStatusEnum = pgEnum('tenant_status', [
    'active',
    'suspended',
    'cancelled',
]);

export const planIntervalEnum = pgEnum('plan_interval', ['monthly', 'yearly']);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
    'active',
    'past_due',
    'cancelled',
    'trialing',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
    'pending',
    'paid',
    'failed',
    'cancelled',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
    'pending',
    'settlement',
    'capture',
    'deny',
    'cancel',
    'expire',
    'failure',
]);

// Tables
export const tenants = adminSchema.table('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    subdomain: text('subdomain').notNull().unique(),
    status: tenantStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plans = adminSchema.table('plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    interval: planIntervalEnum('interval').notNull(),
    isActive: integer('is_active').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = adminSchema.table('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
        .notNull()
        .references(() => tenants.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
        .notNull()
        .references(() => plans.id),
    status: subscriptionStatusEnum('status').notNull().default('active'),
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = adminSchema.table('invoices', {
    id: uuid('id').defaultRandom().primaryKey(),
    subscriptionId: uuid('subscription_id')
        .notNull()
        .references(() => subscriptions.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: invoiceStatusEnum('status').notNull().default('pending'),
    dueDate: timestamp('due_date').notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const paymentTransactions = adminSchema.table('payment_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceId: uuid('invoice_id')
        .notNull()
        .references(() => invoices.id, { onDelete: 'cascade' }),
    midtransOrderId: text('midtrans_order_id').notNull().unique(),
    midtransTransactionId: text('midtrans_transaction_id'),
    paymentType: text('payment_type'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    transactionTime: timestamp('transaction_time'),
    settlementTime: timestamp('settlement_time'),
    metadata: text('metadata'), // JSON string for additional data
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
    subscriptions: many(subscriptions),
}));

export const plansRelations = relations(plans, ({ many }) => ({
    subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [subscriptions.tenantId],
        references: [tenants.id],
    }),
    plan: one(plans, {
        fields: [subscriptions.planId],
        references: [plans.id],
    }),
    invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    subscription: one(subscriptions, {
        fields: [invoices.subscriptionId],
        references: [subscriptions.id],
    }),
    paymentTransactions: many(paymentTransactions),
}));

export const paymentTransactionsRelations = relations(
    paymentTransactions,
    ({ one }) => ({
        invoice: one(invoices, {
            fields: [paymentTransactions.invoiceId],
            references: [invoices.id],
        }),
    })
);
