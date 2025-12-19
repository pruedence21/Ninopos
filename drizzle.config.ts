import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables with priority:
// 1. .env.local (development)
// 2. .env.production (production)
// 3. .env (fallback)
const envFiles = [
    '.env.local',
    process.env.NODE_ENV === 'production' ? '.env.production' : null,
    '.env',
].filter(Boolean) as string[];

for (const envFile of envFiles) {
    const envPath = resolve(process.cwd(), envFile);
    if (existsSync(envPath)) {
        config({ path: envPath });
        console.log(`✓ Loaded environment from ${envFile}`);
        break;
    }
}

export default defineConfig({
    schema: './db/schema/*',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    schemaFilter: ['admin', 'public'],
    verbose: true,
    strict: true,
});
