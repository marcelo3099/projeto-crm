import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [contact] = await db.select().from(contacts).where(eq(contacts.id, parseInt(id))).limit(1);

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, email, phone, company, preferences } = body;

        const updated = await db.update(contacts)
            .set({
                name,
                email,
                phone,
                company,
                ...(preferences !== undefined && { preferences }),
                updatedAt: new Date()
            })
            .where(eq(contacts.id, parseInt(id)))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await db.delete(contacts).where(eq(contacts.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
