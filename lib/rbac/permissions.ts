// Permission definitions for role-based access control
export const PERMISSIONS = {
    // Billing & Subscription
    MANAGE_BILLING: 'manage_billing',
    VIEW_BILLING: 'view_billing',

    // User Management
    MANAGE_USERS: 'manage_users',
    INVITE_USERS: 'invite_users',
    REMOVE_USERS: 'remove_users',
    CHANGE_ROLES: 'change_roles',

    // Tenant Management
    MANAGE_TENANT: 'manage_tenant',
    DELETE_TENANT: 'delete_tenant',

    // Products & Inventory
    MANAGE_PRODUCTS: 'manage_products',
    VIEW_PRODUCTS: 'view_products',

    // Customers
    MANAGE_CUSTOMERS: 'manage_customers',
    VIEW_CUSTOMERS: 'view_customers',

    // Transactions
    CREATE_TRANSACTIONS: 'create_transactions',
    VIEW_TRANSACTIONS: 'view_transactions',
    MANAGE_TRANSACTIONS: 'manage_transactions',

    // Reports
    VIEW_REPORTS: 'view_reports',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions
export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    STAFF: 'staff',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [ROLES.OWNER]: [
        // Full access to everything
        PERMISSIONS.MANAGE_BILLING,
        PERMISSIONS.VIEW_BILLING,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.INVITE_USERS,
        PERMISSIONS.REMOVE_USERS,
        PERMISSIONS.CHANGE_ROLES,
        PERMISSIONS.MANAGE_TENANT,
        PERMISSIONS.DELETE_TENANT,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_TRANSACTIONS,
        PERMISSIONS.VIEW_TRANSACTIONS,
        PERMISSIONS.MANAGE_TRANSACTIONS,
        PERMISSIONS.VIEW_REPORTS,
    ],

    [ROLES.ADMIN]: [
        // Can manage operations but not billing or tenant settings
        PERMISSIONS.VIEW_BILLING,
        PERMISSIONS.INVITE_USERS, // Can invite staff only
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_TRANSACTIONS,
        PERMISSIONS.VIEW_TRANSACTIONS,
        PERMISSIONS.MANAGE_TRANSACTIONS,
        PERMISSIONS.VIEW_REPORTS,
    ],

    [ROLES.STAFF]: [
        // View-only access, can create transactions
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_TRANSACTIONS,
        PERMISSIONS.VIEW_TRANSACTIONS,
    ],
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

// Check if a role can invite users with a specific target role
export function canInviteRole(userRole: Role, targetRole: Role): boolean {
    // Owners can invite anyone
    if (userRole === ROLES.OWNER) {
        return true;
    }

    // Admins can only invite staff
    if (userRole === ROLES.ADMIN && targetRole === ROLES.STAFF) {
        return true;
    }

    return false;
}

// Check if a role can remove a user with a specific role
export function canRemoveRole(userRole: Role, targetRole: Role): boolean {
    // Owners can remove anyone except other owners
    if (userRole === ROLES.OWNER && targetRole !== ROLES.OWNER) {
        return true;
    }

    // Admins can remove staff only
    if (userRole === ROLES.ADMIN && targetRole === ROLES.STAFF) {
        return true;
    }

    return false;
}

// Check if a role can change another user's role
export function canChangeRole(userRole: Role, fromRole: Role, toRole: Role): boolean {
    // Only owners can change roles
    if (userRole !== ROLES.OWNER) {
        return false;
    }

    // Owners cannot change other owners' roles
    if (fromRole === ROLES.OWNER || toRole === ROLES.OWNER) {
        return false;
    }

    return true;
}
