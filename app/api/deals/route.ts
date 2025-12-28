import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deals, contacts, stages } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get deals with related contact info
        const allDeals = await db
            .select({
                deal: deals,
                contact: contacts,
                stage: stages,
            })
            .from(deals)
            .leftJoin(contacts, eq(deals.contactId, contacts.id))
            .leftJoin(stages, eq(deals.stageId, stages.id))
            .orderBy(desc(deals.createdAt));

        return NextResponse.json(allDeals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        console.error('Database connection details:', {
            hasEnvVar: !!process.env.DATABASE_URL,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, contactId, pipelineId, stageId, value, notes } = body;

        if (!title || !contactId || !pipelineId || !stageId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newDeal = await db.insert(deals).values({
            title,
            contactId,
            pipelineId,
            stageId,
            value: value || 0,
            notes,
            createdBy: session.user.id ? parseInt(session.user.id) : undefined,
        }).returning();

        return NextResponse.json(newDeal[0], { status: 201 });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }
}
