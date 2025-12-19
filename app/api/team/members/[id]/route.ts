import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { userTenants } from '@/db/schema/public';
import { eq, and } from 'drizzle-orm';
import { requirePermission } from '@/lib/rbac/middleware';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { canRemoveRole } from '@/lib/rbac/permissions';
import { getUserRole } from '@/lib/rbac/middleware';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authCheck = await requirePermission(request, PERMISSIONS.REMOVE_USERS);
        if (!authCheck.authorized) {
            return authCheck.response;
        }

        const { id } = params;
        const tenantId = request.headers.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Get the member to be removed
        const memberToRemove = await db.query.userTenants.findFirst({
            where: and(eq(userTenants.id, id), eq(userTenants.tenantId, tenantId)),
        });

        if (!memberToRemove) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Check if user can remove this role
        if (!canRemoveRole(authCheck.role, memberToRemove.role as any)) {
            return NextResponse.json(
                { error: 'You cannot remove users with this role' },
                { status: 403 }
            );
        }

        // Delete the user-tenant relationship
        await db.delete(userTenants).where(eq(userTenants.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove member error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
