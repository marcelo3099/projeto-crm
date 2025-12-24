import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

// Lazy connection - only connect when needed
let client: Sql | null = null;
let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionString(): string {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return connectionString;
}

function createClient(): Sql {
    if (!client) {
        client = postgres(getConnectionString(), {
            ssl: 'require',
            max: 1, // Serverless optimization
            idle_timeout: 20,
            connect_timeout: 10,
        });
    }
    return client;
}

export function getDb(): PostgresJsDatabase<typeof schema> {
    if (!dbInstance) {
        dbInstance = drizzle(createClient(), { schema });
    }
    return dbInstance;
}

// For backward compatibility - but now lazily initialized
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
    get(target, prop) {
        return getDb()[prop as keyof PostgresJsDatabase<typeof schema>];
    }
});
