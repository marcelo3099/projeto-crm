import { NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeArticles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Public endpoint - no auth required
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const [article] = await db.select()
            .from(knowledgeArticles)
            .where(eq(knowledgeArticles.slug, slug))
            .limit(1);

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }
}
