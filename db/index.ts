import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as adminSchema from './schema/admin';
import * as publicSchema from './schema/public';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
    schema: {
        ...adminSchema,
        ...publicSchema,
    },
});

export { adminSchema, publicSchema };
