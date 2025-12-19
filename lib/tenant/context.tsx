'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
    tenantId: string | null;
    subdomain: string | null;
    tenantName: string | null;
}

const TenantContext = createContext<TenantContextType>({
    tenantId: null,
    subdomain: null,
    tenantName: null,
});

export function TenantProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: TenantContextType;
}) {
    return (
        <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
}
