import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formFields } from '@/db/schema';
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
        const { stepId, label, fieldKey, fieldType, isRequired, options, helpArticleId, order } = body;

        if (!label || !fieldKey) {
            return NextResponse.json({ error: 'Label and fieldKey are required' }, { status: 400 });
        }

        const newField = await db.insert(formFields).values({
            formId: parseInt(params.id),
            stepId: stepId || null,
            label,
            fieldKey,
            fieldType: fieldType || 'text',
            isRequired: isRequired || false,
            options: options ? JSON.stringify(options) : null,
            helpArticleId: helpArticleId || null,
            order: order || 0,
        }).returning();

        return NextResponse.json(newField[0], { status: 201 });
    } catch (error) {
        console.error('Error creating field:', error);
        return NextResponse.json({ error: 'Failed to create field' }, { status: 500 });
    }
}
