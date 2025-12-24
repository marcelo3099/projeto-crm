import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, stageId, value, notes } = body;

        const updated = await db.update(deals)
            .set({
                ...(title && { title }),
                ...(stageId && { stageId }),
                ...(value !== undefined && { value }),
                ...(notes !== undefined && { notes }),
                updatedAt: new Date(),
            })
            .where(eq(deals.id, parseInt(params.id)))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating deal:', error);
        return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await db.delete(deals).where(eq(deals.id, parseInt(params.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting deal:', error);
        return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
    }
}
