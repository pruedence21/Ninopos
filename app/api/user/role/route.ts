import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/rbac/middleware';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = request.headers.get('x-tenant-id');

        if (!tenantId) {
            return NextResponse.json({ role: null });
        }

        const role = await getUserRole(session.user.id, tenantId);

        return NextResponse.json({ role });
    } catch (error) {
        console.error('Get user role error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
