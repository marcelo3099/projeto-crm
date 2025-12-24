import { NextResponse } from 'next/server';

// Diagnostic endpoint - no auth required
export async function GET() {
    const diagnostics: Record<string, any> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
    };

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({
            status: 'error',
            message: 'DATABASE_URL is not set',
            diagnostics,
        }, { status: 500 });
    }

    // Try to connect to database
    try {
        const postgres = (await import('postgres')).default;
        const sql = postgres(process.env.DATABASE_URL, {
            ssl: 'require',
            max: 1,
            connect_timeout: 10,
        });

        // Simple query
        const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
        await sql.end();

        diagnostics.dbConnection = 'SUCCESS';
        diagnostics.dbTime = result[0]?.current_time;
        diagnostics.dbName = result[0]?.db_name;

        return NextResponse.json({
            status: 'ok',
            message: 'Database connection successful',
            diagnostics,
        });
    } catch (error: any) {
        diagnostics.dbConnection = 'FAILED';
        diagnostics.errorName = error.name;
        diagnostics.errorMessage = error.message;
        diagnostics.errorCode = error.code;

        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            diagnostics,
        }, { status: 500 });
    }
}
