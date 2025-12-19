export function isValidSubdomain(subdomain: string): boolean {
    // Subdomain rules:
    // - 3-63 characters
    // - Only lowercase letters, numbers, and hyphens
    // - Cannot start or end with hyphen
    // - Cannot contain consecutive hyphens
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
}

export function sanitizeSubdomain(subdomain: string): string {
    return subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-')
        .slice(0, 63);
}

export function extractSubdomain(hostname: string): string | null {
    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
    const rootDomainParts = rootDomain.split('.');

    // Remove port if present
    const cleanHostname = hostname.split(':')[0];
    const hostnameParts = cleanHostname.split('.');

    // If hostname is same as root domain, no subdomain
    if (cleanHostname === rootDomain.split(':')[0]) {
        return null;
    }

    // For localhost development
    if (cleanHostname.includes('localhost')) {
        // Format: subdomain.localhost or just localhost
        const parts = cleanHostname.split('.');
        if (parts.length > 1 && parts[0] !== 'www') {
            return parts[0];
        }
        return null;
    }

    // For production domains
    // If we have more parts than root domain, extract subdomain
    if (hostnameParts.length > rootDomainParts.length) {
        const subdomainParts = hostnameParts.slice(
            0,
            hostnameParts.length - rootDomainParts.length
        );
        const subdomain = subdomainParts.join('.');

        // Ignore www
        if (subdomain === 'www') {
            return null;
        }

        return subdomain;
    }

    return null;
}

export function generateSubdomainUrl(subdomain: string): string {
    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    // For localhost, use subdomain.localhost format
    if (rootDomain.includes('localhost')) {
        const port = rootDomain.split(':')[1] || '3000';
        return `${protocol}://${subdomain}.localhost:${port}`;
    }

    // For production domains
    return `${protocol}://${subdomain}.${rootDomain}`;
}
