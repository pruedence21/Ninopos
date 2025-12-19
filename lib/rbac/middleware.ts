import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { userTenants } from '@/db/schema/public';
import { eq, and } from 'drizzle-orm';
import { hasPermission, type Permission, type Role } from './permissions';

/**
 * Get user's role in a specific tenant
 */
export async function getUserRole(
    userId: string,
    tenantId: string
): Promise<Role | null> {
    const userTenant = await db.query.userTenants.findFirst({
        where: and(
            eq(userTenants.userId, userId),
            eq(userTenants.tenantId, tenantId)
        ),
    });

    return (userTenant?.role as Role) ?? null;
}

/**
 * Server-side middleware to require specific role
 */
export async function requireRole(
    request: NextRequest,
    allowedRoles: Role[]
): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Tenant not found' }, { status: 404 }),
        };
    }

    const userRole = await getUserRole(session.user.id, tenantId);

    if (!userRole || !allowedRoles.includes(userRole)) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        };
    }

    return { authorized: true };
}

/**
 * Server-side middleware to require specific permission
 */
export async function requirePermission(
    request: NextRequest,
    requiredPermission: Permission
): Promise<{ authorized: true; role: Role } | { authorized: false; response: NextResponse }> {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Tenant not found' }, { status: 404 }),
        };
    }

    const userRole = await getUserRole(session.user.id, tenantId);

    if (!userRole || !hasPermission(userRole, requiredPermission)) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        };
    }

    return { authorized: true, role: userRole };
}

/**
 * Check if current user has permission (for use in Server Components)
 */
export async function checkPermission(
    userId: string,
    tenantId: string,
    permission: Permission
): Promise<boolean> {
    const userRole = await getUserRole(userId, tenantId);

    if (!userRole) {
        return false;
    }

    return hasPermission(userRole, permission);
}
