import { NextResponse } from 'next/server';
import { db } from '@/db';
import { plans } from '@/db/schema/admin';

export async function GET() {
    try {
        const allPlans = await db.query.plans.findMany({
            where: (plans, { eq }) => eq(plans.isActive, 1),
        });

        return NextResponse.json({
            plans: allPlans,
        });
    } catch (error) {
        console.error('Fetch plans error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
