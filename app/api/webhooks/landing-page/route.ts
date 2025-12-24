import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts, deals, stages, pipelines } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const apiSecret = request.headers.get('x-api-secret');
        if (apiSecret !== process.env.API_SECRET_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Landing Page Webhook received:', body);

        const { name, email, phone, origin_url } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
        }

        // 1. Create or find contact
        let contact = email ? await db.select().from(contacts).where(eq(contacts.email, email)).limit(1).then(rows => rows[0]) : null;

        if (!contact) {
            const [newContact] = await db.insert(contacts).values({
                name,
                phone,
                email,
                source: 'LANDING_PAGE',
            }).returning();
            contact = newContact;
        }

        // 2. Get default pipeline and first stage
        const [defaultPipeline] = await db.select().from(pipelines).limit(1);
        if (!defaultPipeline) {
            return NextResponse.json({ error: 'No pipeline configured' }, { status: 500 });
        }

        const [firstStage] = await db.select().from(stages)
            .where(eq(stages.pipelineId, defaultPipeline.id))
            .orderBy(stages.order)
            .limit(1);

        if (!firstStage) {
            return NextResponse.json({ error: 'No stages configured' }, { status: 500 });
        }

        // 3. Create deal
        const [newDeal] = await db.insert(deals).values({
            title: `Landing Page - ${contact.name}`,
            contactId: contact.id,
            pipelineId: defaultPipeline.id,
            stageId: firstStage.id,
            notes: origin_url ? `Origin: ${origin_url}` : undefined,
        }).returning();

        return NextResponse.json({ success: true, contact, deal: newDeal });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
