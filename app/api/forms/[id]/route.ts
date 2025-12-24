import { NextResponse } from 'next/server';
import { db } from '@/db';
import { forms, formSteps, formFields } from '@/db/schema';
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

        const [form] = await db.select().from(forms).where(eq(forms.id, parseInt(id))).limit(1);

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const steps = await db.select()
            .from(formSteps)
            .where(eq(formSteps.formId, form.id))
            .orderBy(formSteps.order);

        const fields = await db.select()
            .from(formFields)
            .where(eq(formFields.formId, form.id))
            .orderBy(formFields.order);

        return NextResponse.json({ ...form, steps, fields });
    } catch (error) {
        console.error('Error fetching form:', error);
        return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
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
        const { name, slug, isActive } = body;

        const updated = await db.update(forms)
            .set({
                ...(name && { name }),
                ...(slug && { slug }),
                ...(isActive !== undefined && { isActive }),
            })
            .where(eq(forms.id, parseInt(id)))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating form:', error);
        return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
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

        await db.delete(forms).where(eq(forms.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting form:', error);
        return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }
}
