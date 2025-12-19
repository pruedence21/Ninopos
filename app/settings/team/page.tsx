import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTenantFromHeaders } from '@/lib/tenant/server';
import { db } from '@/db';
import { userTenants, invitations, users } from '@/db/schema/public';
import { eq, and, isNull } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkPermission } from '@/lib/rbac/middleware';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import InviteForm from '@/components/team/invite-form';
import MemberList from '@/components/team/member-list';

export default async function TeamPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const tenant = await getTenantFromHeaders();

    if (!tenant) {
        redirect('/dashboard');
    }

    // Check if user has permission to view team
    const canManageUsers = await checkPermission(
        session.user.id,
        tenant.tenantId,
        PERMISSIONS.MANAGE_USERS
    );

    const canInviteUsers = await checkPermission(
        session.user.id,
        tenant.tenantId,
        PERMISSIONS.INVITE_USERS
    );

    // Get team members
    const teamMembers = await db
        .select({
            id: userTenants.id,
            userId: userTenants.userId,
            role: userTenants.role,
            createdAt: userTenants.createdAt,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
        })
        .from(userTenants)
        .innerJoin(users, eq(userTenants.userId, users.id))
        .where(eq(userTenants.tenantId, tenant.tenantId));

    // Get pending invitations
    const pendingInvitations = await db
        .select({
            id: invitations.id,
            email: invitations.email,
            role: invitations.role,
            createdAt: invitations.createdAt,
            expiresAt: invitations.expiresAt,
            inviterName: users.name,
        })
        .from(invitations)
        .innerJoin(users, eq(invitations.invitedBy, users.id))
        .where(
            and(
                eq(invitations.tenantId, tenant.tenantId),
                isNull(invitations.acceptedAt)
            )
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                            <p className="text-sm text-gray-500">{tenant.tenantName}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = '/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Team Members List */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h2 className="mb-6 text-lg font-semibold">Team Members</h2>
                            <MemberList
                                members={teamMembers}
                                canManageUsers={canManageUsers}
                                currentUserId={session.user.id}
                            />
                        </Card>

                        {/* Pending Invitations */}
                        {pendingInvitations.length > 0 && (
                            <Card className="mt-6 p-6">
                                <h2 className="mb-4 text-lg font-semibold">Pending Invitations</h2>
                                <div className="space-y-3">
                                    {pendingInvitations.map((invitation) => (
                                        <div
                                            key={invitation.id}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div>
                                                <p className="font-medium">{invitation.email}</p>
                                                <p className="text-sm text-gray-500">
                                                    Role: {invitation.role} • Invited by {invitation.inviterName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                Pending
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Invite Form */}
                    {canInviteUsers && (
                        <div>
                            <Card className="p-6">
                                <h2 className="mb-6 text-lg font-semibold">Invite Team Member</h2>
                                <InviteForm />
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
