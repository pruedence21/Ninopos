import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, users } from '@/db/schema/public';
import { tenants } from '@/db/schema/admin';
import { eq } from 'drizzle-orm';
import { isInvitationExpired } from '@/lib/invitations/token';

export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        const invitation = await db.query.invitations.findFirst({
            where: eq(invitations.token, token),
            with: {
                invitedBy: true,
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        if (invitation.acceptedAt) {
            return NextResponse.json(
                { error: 'Invitation already accepted' },
                { status: 400 }
            );
        }

        if (isInvitationExpired(invitation.expiresAt)) {
            return NextResponse.json(
                { error: 'Invitation has expired' },
                { status: 400 }
            );
        }

        // Get tenant name
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, invitation.tenantId),
        });

        return NextResponse.json({
            email: invitation.email,
            role: invitation.role,
            tenantName: tenant?.name || 'Unknown',
            inviterName: invitation.invitedBy.name || 'A team member',
        });
    } catch (error) {
        console.error('Get invitation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
