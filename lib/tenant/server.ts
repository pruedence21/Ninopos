import { headers } from 'next/headers';

export async function getTenantFromHeaders() {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    const subdomain = headersList.get('x-tenant-subdomain');
    const tenantName = headersList.get('x-tenant-name');

    if (!tenantId || !subdomain) {
        return null;
    }

    return {
        tenantId,
        subdomain,
        tenantName: tenantName || '',
    };
}
