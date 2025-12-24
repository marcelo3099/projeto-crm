import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
        return NextResponse.json(allLeads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, source, notes } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
        }

        const newLead = await db.insert(leads).values({
            name,
            phone,
            email,
            source: source || 'MANUAL',
            notes,
        }).returning();

        return NextResponse.json(newLead[0], { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
