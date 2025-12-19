import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { tenants } from '@/db/schema/admin';
import { userTenants } from '@/db/schema/public';
import { sanitizeSubdomain } from '@/lib/tenant/subdomain';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, subdomain } = body;

        if (!name || !subdomain) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const sanitizedSubdomain = sanitizeSubdomain(subdomain);
        const slug = sanitizedSubdomain;

        // Create tenant
        const [tenant] = await db
            .insert(tenants)
            .values({
                name,
                slug,
                subdomain: sanitizedSubdomain,
                status: 'active',
            })
            .returning();

        // Link user as owner
        await db.insert(userTenants).values({
            userId: session.user.id,
            tenantId: tenant.id,
            role: 'owner',
        });

        return NextResponse.json({
            success: true,
            tenantId: tenant.id,
            subdomain: tenant.subdomain,
        });
    } catch (error) {
        console.error('Create tenant error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
