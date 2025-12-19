import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { invitations, users, userTenants } from '@/db/schema/public';
import { eq, and } from 'drizzle-orm';
import { isInvitationExpired } from '@/lib/invitations/token';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password, name } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Find invitation
        const invitation = await db.query.invitations.findFirst({
            where: eq(invitations.token, token),
        });

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invalid invitation' },
                { status: 404 }
            );
        }

        // Check if already accepted
        if (invitation.acceptedAt) {
            return NextResponse.json(
                { error: 'Invitation already accepted' },
                { status: 400 }
            );
        }

        // Check if expired
        if (isInvitationExpired(invitation.expiresAt)) {
            return NextResponse.json(
                { error: 'Invitation has expired' },
                { status: 400 }
            );
        }

        const session = await auth();
        let userId: string;

        if (session?.user?.id) {
            // User is already logged in
            userId = session.user.id;
        } else {
            // Check if user exists with this email
            let existingUser = await db.query.users.findFirst({
                where: eq(users.email, invitation.email),
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'User already exists. Please login first.' },
                    { status: 400 }
                );
            }

            // Create new user
            if (!password || !name) {
                return NextResponse.json(
                    { error: 'Name and password are required for new users' },
                    { status: 400 }
                );
            }

            const hashedPassword = await hashPassword(password);

            const [newUser] = await db
                .insert(users)
                .values({
                    email: invitation.email,
                    name,
                    password: hashedPassword,
                })
                .returning();

            userId = newUser.id;
        }

        // Add user to tenant
        await db.insert(userTenants).values({
            userId,
            tenantId: invitation.tenantId,
            role: invitation.role,
        });

        // Mark invitation as accepted
        await db
            .update(invitations)
            .set({
                acceptedAt: new Date(),
            })
            .where(eq(invitations.id, invitation.id));

        return NextResponse.json({
            success: true,
            tenantId: invitation.tenantId,
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
