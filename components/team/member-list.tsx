'use client';

import { Button } from '@/components/ui/button';

interface Member {
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
    userName: string | null;
    userEmail: string;
    userImage: string | null;
}

interface MemberListProps {
    members: Member[];
    canManageUsers: boolean;
    currentUserId: string;
}

export default function MemberList({
    members,
    canManageUsers,
    currentUserId,
}: MemberListProps) {
    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) {
            return;
        }

        try {
            const response = await fetch(`/api/team/members/${memberId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to remove member');
            }
        } catch (error) {
            alert('An error occurred');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'staff':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-3">
            {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canRemove = canManageUsers && !isCurrentUser && member.role !== 'owner';

                return (
                    <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                    >
                        <div className="flex items-center gap-4">
                            {member.userImage ? (
                                <img
                                    src={member.userImage}
                                    alt={member.userName || ''}
                                    className="h-10 w-10 rounded-full"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                                    {member.userName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div>
                                <p className="font-medium">
                                    {member.userName || 'Unknown'}
                                    {isCurrentUser && (
                                        <span className="ml-2 text-sm text-gray-500">(You)</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">{member.userEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(
                                    member.role
                                )}`}
                            >
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>

                            {canRemove && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
