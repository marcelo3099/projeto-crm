import { NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeArticles } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const articles = await db.select()
            .from(knowledgeArticles)
            .orderBy(desc(knowledgeArticles.createdAt));

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching knowledge articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
