import { NextResponse } from 'next/server';
import { db } from '@/db';
import { forms, formSteps, formFields, contacts, deals, stages, formSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Public endpoint - no auth required
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const [form] = await db.select()
            .from(forms)
            .where(eq(forms.slug, slug))
            .limit(1);

        if (!form || !form.isActive) {
            return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
        }

        const steps = await db.select()
            .from(formSteps)
            .where(eq(formSteps.formId, form.id))
            .orderBy(formSteps.order);

        const fields = await db.select()
            .from(formFields)
            .where(eq(formFields.formId, form.id))
            .orderBy(formFields.order);

        return NextResponse.json({ form, steps, fields });
    } catch (error) {
        console.error('Error fetching public form:', error);
        return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        // Get form details
        const [form] = await db.select()
            .from(forms)
            .where(eq(forms.slug, slug))
            .limit(1);

        if (!form || !form.isActive) {
            return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
        }

        const body = await request.json();
        const submissionData = body.data;
        const dealId = body.dealId; // Capture optional dealId from request

        // Extract contact info
        const contactName = submissionData.name || submissionData.nome;
        const contactEmail = submissionData.email;
        const contactPhone = submissionData.phone || submissionData.whatsapp || submissionData.telefone;

        if (!contactName || !contactPhone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        // 1. Create or update contact
        let contact = contactEmail
            ? await db.select().from(contacts).where(eq(contacts.email, contactEmail)).limit(1).then(rows => rows[0])
            : null;

        if (!contact) {
            const [newContact] = await db.insert(contacts).values({
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                source: 'FORM',
            }).returning();
            contact = newContact;
        }

        // 2. Fetch existing deal if dealId is provided
        let existingDeal = null;
        if (dealId) {
            [existingDeal] = await db.select().from(deals).where(eq(deals.id, parseInt(dealId.toString()))).limit(1);
        }

        // 3. Handle Deal logic
        let targetDealId = existingDeal?.id;

        if (existingDeal) {
            // Update existing property deal with lead info if it doesn't have a contact yet
            if (!existingDeal.contactId) {
                await db.update(deals).set({ contactId: contact.id }).where(eq(deals.id, existingDeal.id));
            }
            // Add note about the new interest
            const currentNotes = existingDeal.notes || '';
            const newInterestNote = `\n--- Novo Interesse via Formulário (${new Date().toLocaleDateString()}) ---\n${JSON.stringify(submissionData, null, 2)}`;
            await db.update(deals).set({ notes: currentNotes + newInterestNote }).where(eq(deals.id, existingDeal.id));
        } else {
            // Create a new generic deal for the form submission
            const [firstStage] = await db.select()
                .from(stages)
                .where(eq(stages.pipelineId, form.pipelineId))
                .orderBy(stages.order)
                .limit(1);

            if (firstStage) {
                const [newDeal] = await db.insert(deals).values({
                    title: `${form.name} - ${contactName}`,
                    contactId: contact.id,
                    pipelineId: form.pipelineId,
                    stageId: firstStage.id,
                    notes: JSON.stringify(submissionData),
                }).returning();
                targetDealId = newDeal.id;
            }
        }

        // 4. Save submission
        await db.insert(formSubmissions).values({
            formId: form.id,
            contactId: contact.id,
            dealId: targetDealId || null,
            data: JSON.stringify(submissionData),
        });

        return NextResponse.json({
            success: true,
            contactId: contact.id,
            dealId: targetDealId,
            message: 'Formulário enviado com sucesso!'
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }
}
