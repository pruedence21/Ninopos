import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants } from '@/db/schema/admin';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subdomain = searchParams.get('subdomain');

        if (!subdomain) {
            return NextResponse.json(
                { error: 'Subdomain parameter required' },
                { status: 400 }
            );
        }

        const existingTenant = await db.query.tenants.findFirst({
            where: eq(tenants.subdomain, subdomain),
        });

        return NextResponse.json({
            available: !existingTenant,
        });
    } catch (error) {
        console.error('Check subdomain error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
