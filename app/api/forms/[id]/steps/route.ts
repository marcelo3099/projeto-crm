import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formSteps } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, description, order } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const newStep = await db.insert(formSteps).values({
            formId: parseInt(params.id),
            title,
            description,
            order: order || 0,
        }).returning();

        return NextResponse.json(newStep[0], { status: 201 });
    } catch (error) {
        console.error('Error creating step:', error);
        return NextResponse.json({ error: 'Failed to create step' }, { status: 500 });
    }
}
