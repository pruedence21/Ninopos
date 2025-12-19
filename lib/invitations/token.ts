import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 */
export function generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate invitation expiry date (7 days from now)
 */
export function getInvitationExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
}

/**
 * Check if invitation token is expired
 */
export function isInvitationExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}

/**
 * Generate invitation accept URL
 */
export function getInvitationAcceptUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/invitations/accept/${token}`;
}
