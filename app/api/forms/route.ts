import { NextResponse } from 'next/server';
import { db } from '@/db';
import { forms, formSteps, formFields } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const allForms = await db.select().from(forms);

        // Get steps and fields for each form
        const formsWithDetails = await Promise.all(
            allForms.map(async (form) => {
                const steps = await db.select()
                    .from(formSteps)
                    .where(eq(formSteps.formId, form.id))
                    .orderBy(formSteps.order);

                const fields = await db.select()
                    .from(formFields)
                    .where(eq(formFields.formId, form.id))
                    .orderBy(formFields.order);

                return { ...form, steps, fields };
            })
        );

        return NextResponse.json(formsWithDetails);
    } catch (error) {
        console.error('Error fetching forms:', error);
        console.error('Database connection details:', {
            hasEnvVar: !!process.env.DATABASE_URL,
            urlLength: process.env.DATABASE_URL?.length,
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
        const { name, slug, pipelineId, isActive } = body;

        if (!name || !slug || !pipelineId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newForm = await db.insert(forms).values({
            name,
            slug,
            pipelineId,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: session.user.id ? parseInt(session.user.id) : undefined,
        }).returning();

        return NextResponse.json(newForm[0], { status: 201 });
    } catch (error) {
        console.error('Error creating form:', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
