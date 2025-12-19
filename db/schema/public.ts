import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    primaryKey,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './admin';

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'staff']);

// Auth.js compatible tables (public schema)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),
    password: text('password'), // For email/password auth
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
    'accounts',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('provider_account_id').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable('sessions', {
    sessionToken: text('session_token').notNull().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
    'verification_tokens',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

// Multi-tenant user relationship
export const userTenants = pgTable(
    'user_tenants',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        tenantId: uuid('tenant_id').notNull(),
        role: userRoleEnum('role').notNull().default('staff'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    }
);

// Invitations for team members
export const invitations = pgTable('invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    tenantId: uuid('tenant_id').notNull(), // References admin.tenants
    role: userRoleEnum('role').notNull(),
    invitedBy: uuid('invited_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    userTenants: many(userTenants),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const userTenantsRelations = relations(userTenants, ({ one }) => ({
    user: one(users, {
        fields: [userTenants.userId],
        references: [users.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    invitedBy: one(users, {
        fields: [invitations.invitedBy],
        references: [users.id],
    }),
}));
