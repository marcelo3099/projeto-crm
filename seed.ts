import { db } from './index';
import { users, pipelines, stages, contacts, deals } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
        name: 'Administrador',
        email: 'admin@crm.com',
        password: hashedPassword,
        role: 'ADMIN',
    }).returning();
    console.log('✅ Admin user created');

    // 2. Create default pipeline
    const [defaultPipeline] = await db.insert(pipelines).values({
        name: 'Vendas',
        description: 'Pipeline padrão de vendas',
        createdBy: adminUser.id,
    }).returning();
    console.log('✅ Default pipeline created');

    // 3. Create stages for the pipeline
    const stageData = [
        { name: 'Novo Lead', order: 0, color: '#6b7280' },
        { name: 'Qualificação', order: 1, color: '#3b82f6' },
        { name: 'Proposta', order: 2, color: '#f59e0b' },
        { name: 'Negociação', order: 3, color: '#8b5cf6' },
        { name: 'Fechado', order: 4, color: '#10b981' },
    ];

    for (const stage of stageData) {
        await db.insert(stages).values({
            pipelineId: defaultPipeline.id,
            ...stage,
        });
    }
    console.log('✅ Stages created');

    // 4. Create sample contacts
    const sampleContacts = [
        {
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '11999999999',
            company: 'Tech Corp',
            source: 'MANUAL' as const,
            createdBy: adminUser.id,
        },
        {
            name: 'Maria Santos',
            email: 'maria@example.com',
            phone: '11988888888',
            company: 'Marketing Plus',
            source: 'INSTAGRAM' as const,
            createdBy: adminUser.id,
        },
    ];

    const createdContacts = await db.insert(contacts).values(sampleContacts).returning();
    console.log('✅ Sample contacts created');

    // 5. Create sample deals
    const firstStage = await db.select().from(stages).where(eq(stages.pipelineId, defaultPipeline.id)).limit(1);

    await db.insert(deals).values([
        {
            title: 'Venda - Tech Corp',
            contactId: createdContacts[0].id,
            pipelineId: defaultPipeline.id,
            stageId: firstStage[0].id,
            value: 50000, // R$ 500,00
            notes: 'Interessado em nosso produto premium',
            createdBy: adminUser.id,
        },
        {
            title: 'Parceria - Marketing Plus',
            contactId: createdContacts[1].id,
            pipelineId: defaultPipeline.id,
            stageId: firstStage[0].id,
            value: 100000, // R$ 1.000,00
            createdBy: adminUser.id,
        },
    ]);
    console.log('✅ Sample deals created');

    console.log('🎉 Seed completed!');
    console.log('\n📊 Login credentials:');
    console.log('   Email: admin@crm.com');
    console.log('   Password: admin123');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    });
