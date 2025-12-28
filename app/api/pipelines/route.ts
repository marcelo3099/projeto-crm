import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pipelines, stages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const allPipelines = await db.select().from(pipelines);

        // Get stages for each pipeline
        const pipelinesWithStages = await Promise.all(
            allPipelines.map(async (pipeline) => {
                const pipelineStages = await db.select()
                    .from(stages)
                    .where(eq(stages.pipelineId, pipeline.id))
                    .orderBy(stages.order);

                return { ...pipeline, stages: pipelineStages };
            })
        );

        return NextResponse.json(pipelinesWithStages);
    } catch (error) {
        console.error('Error fetching pipelines:', error);
        console.error('Database connection details:', {
            hasEnvVar: !!process.env.DATABASE_URL,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([], { status: 200 });
    }
}
