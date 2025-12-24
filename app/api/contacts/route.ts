import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
        return NextResponse.json(allContacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, email, phone, company, source } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newContact = await db.insert(contacts).values({
            name,
            email,
            phone,
            company,
            source: source || 'MANUAL',
            createdBy: session.user.id ? parseInt(session.user.id) : undefined,
        }).returning();

        return NextResponse.json(newContact[0], { status: 201 });
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
