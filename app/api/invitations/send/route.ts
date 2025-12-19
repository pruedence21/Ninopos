import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { invitations } from '@/db/schema/public';
import { tenants } from '@/db/schema/admin';
import { requirePermission } from '@/lib/rbac/middleware';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { canInviteRole } from '@/lib/rbac/permissions';
import {
    generateInvitationToken,
    getInvitationExpiry,
    getInvitationAcceptUrl,
} from '@/lib/invitations/token';
import { sendInvitationEmail } from '@/lib/invitations/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check permission
        const authCheck = await requirePermission(request, PERMISSIONS.INVITE_USERS);
        if (!authCheck.authorized) {
            return authCheck.response;
        }

        const body = await request.json();
        const { email, role } = body;

        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email and role are required' },
                { status: 400 }
            );
        }

        const tenantId = request.headers.get('x-tenant-id');
        const tenantName = request.headers.get('x-tenant-name');

        if (!tenantId || !tenantName) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Check if user can invite this role
        if (!canInviteRole(authCheck.role, role)) {
            return NextResponse.json(
                { error: 'You cannot invite users with this role' },
                { status: 403 }
            );
        }

        // Generate invitation token
        const token = generateInvitationToken();
        const expiresAt = getInvitationExpiry();

        // Create invitation record
        const [invitation] = await db
            .insert(invitations)
            .values({
                email,
                tenantId,
                role,
                invitedBy: session.user.id,
                token,
                expiresAt,
            })
            .returning();

        // Send invitation email
        const acceptUrl = getInvitationAcceptUrl(token);
        await sendInvitationEmail({
            to: email,
            tenantName,
            inviterName: session.user.name || 'A team member',
            role,
            acceptUrl,
        });

        return NextResponse.json({
            success: true,
            invitationId: invitation.id,
        });
    } catch (error) {
        console.error('Send invitation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
