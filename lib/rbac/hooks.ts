'use client';

import { useEffect, useState } from 'react';
import { hasPermission, type Permission, type Role } from './permissions';

/**
 * Get current user's role from headers (set by proxy)
 */
function getUserRoleFromHeaders(): Role | null {
    // This will be set by the proxy middleware
    // In client components, we need to fetch it from an API
    return null;
}

/**
 * Hook to get current user's role
 */
export function useRole(): Role | null {
    const [role, setRole] = useState<Role | null>(null);

    useEffect(() => {
        // Fetch user role from API
        fetch('/api/user/role')
            .then((res) => res.json())
            .then((data) => setRole(data.role))
            .catch(() => setRole(null));
    }, []);

    return role;
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
    const role = useRole();

    if (!role) {
        return false;
    }

    return hasPermission(role, permission);
}

/**
 * Hook to check if user can invite other users
 */
export function useCanInvite(): boolean {
    const role = useRole();

    if (!role) {
        return false;
    }

    // Owner and Admin can invite
    return role === 'owner' || role === 'admin';
}

/**
 * Hook to check if user can manage billing
 */
export function useCanManageBilling(): boolean {
    const role = useRole();
    return role === 'owner';
}

/**
 * Hook to check if user can manage users
 */
export function useCanManageUsers(): boolean {
    const role = useRole();
    return role === 'owner';
}
