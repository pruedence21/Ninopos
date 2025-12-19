import { db } from './index';
import { plans } from './schema/admin';

async function seed() {
    console.log('🌱 Seeding database...');

    // Create subscription plans
    await db.insert(plans).values([
        {
            name: 'Monthly Plan',
            description: 'Perfect for getting started',
            price: '100000',
            interval: 'monthly',
            isActive: 1,
        },
        {
            name: 'Yearly Plan',
            description: 'Best value - save 2 months!',
            price: '1000000',
            interval: 'yearly',
            isActive: 1,
        },
    ]);

    console.log('✅ Database seeded successfully!');
}

seed()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
