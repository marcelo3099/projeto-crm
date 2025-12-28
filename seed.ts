import { db } from './db/index';
import { users, pipelines, stages, contacts, deals } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Get or Create admin user
    let adminUser = await db.select().from(users).where(eq(users.email, 'admin@crm.com')).limit(1);

    let adminId: number;
    if (adminUser.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [newAdmin] = await db.insert(users).values({
            name: 'Administrador',
            email: 'admin@crm.com',
            password: hashedPassword,
            role: 'ADMIN',
        }).returning();
        adminId = newAdmin.id;
        console.log('✅ Admin user created');
    } else {
        adminId = adminUser[0].id;
        console.log('ℹ️ Admin user already exists');
    }

    // 2. Clear existing data (optional but recommended for clean demo)
    // We keep users to avoid re-logging
    // await db.delete(deals);
    // await db.delete(contacts);
    // await db.delete(stages);
    // await db.delete(pipelines);

    // 3. Create Pipelines
    const pipelineData = [
        { name: 'Venda de Luxo', description: 'Imóveis acima de R$ 2M' },
        { name: 'Locação Residencial', description: 'Apartamentos e casas para aluguel' }
    ];

    const createdPipelines = [];
    for (const p of pipelineData) {
        const [newP] = await db.insert(pipelines).values({
            ...p,
            createdBy: adminId,
        }).returning();
        createdPipelines.push(newP);
    }
    console.log('✅ Pipelines created');

    // 4. Create Stages
    const salesStages = [
        { name: 'Novo Lead', order: 0, color: '#94a3b8' },
        { name: 'Visita Agendada', order: 1, color: '#3b82f6' },
        { name: 'Proposta Enviada', order: 2, color: '#f59e0b' },
        { name: 'Documentação', order: 3, color: '#8b5cf6' },
        { name: 'Contrato Assinado', order: 4, color: '#10b981' },
    ];

    const rentalStages = [
        { name: 'Interesse', order: 0, color: '#94a3b8' },
        { name: 'Análise de Crédito', order: 1, color: '#3b82f6' },
        { name: 'Vistoria', order: 2, color: '#f59e0b' },
        { name: 'Contrato', order: 3, color: '#10b981' },
    ];

    const allStagesCreated = [];

    for (const stage of salesStages) {
        const [s] = await db.insert(stages).values({ ...stage, pipelineId: createdPipelines[0].id }).returning();
        allStagesCreated.push(s);
    }

    for (const stage of rentalStages) {
        const [s] = await db.insert(stages).values({ ...stage, pipelineId: createdPipelines[1].id }).returning();
        allStagesCreated.push(s);
    }
    console.log('✅ Stages created');

    // 5. Create Brazilian Contacts
    const brazilianContacts = [
        { name: 'Ricardo Oliveira', email: 'ricardo.o@gmail.com', phone: '11987654321', company: 'Itaú Unibanco', source: 'INSTAGRAM' },
        { name: 'Ana Beatriz Souza', email: 'anabsouza@outlook.com', phone: '21976543210', company: 'Autônoma', source: 'LANDING_PAGE' },
        { name: 'Marcos Pereira', email: 'marcos.p@yahoo.com.br', phone: '31965432109', company: 'Vale S.A.', source: 'MANUAL' },
        { name: 'Juliana Costa', email: 'jucosta.adv@gmail.com', phone: '11954321098', company: 'Costa & Advogados', source: 'FORM' },
        { name: 'Felipe Mendes', email: 'fmendes@tech.io', phone: '11943210987', company: 'Nubank', source: 'INSTAGRAM' },
        { name: 'Camila Rocha', email: 'camila.rocha@uol.com.br', phone: '13932109876', company: 'Petrobras', source: 'LANDING_PAGE' },
        { name: 'André Luiz Silva', email: 'andre.l@empresa.com.br', phone: '48921098765', company: 'AMBEV', source: 'MANUAL' },
        { name: 'Daniele Martins', email: 'dani.martins@hotmail.com', phone: '11910987654', company: 'Hospital Israelita', source: 'FORM' },
        { name: 'Gustavo Santos', email: 'guto.santos@gmail.com', phone: '21909876543', company: 'Globo', source: 'INSTAGRAM' },
        { name: 'Tatiana Lima', email: 'tati.lima@gmail.com', phone: '11998877665', company: 'XP Inc', source: 'LANDING_PAGE' },
    ];

    const createdContacts = await db.insert(contacts).values(
        brazilianContacts.map(c => ({ ...c, createdBy: adminId }))
    ).returning();
    console.log('✅ Brazilian contacts created');

    // 6. Create Deals
    const sampleDeals = [
        {
            title: 'Cobertura Vila Nova Conceiçao',
            contactId: createdContacts[0].id,
            pipelineId: createdPipelines[0].id,
            stageId: allStagesCreated[1].id, // Visita Agendada
            value: 850000000, // R$ 8.5M
            notes: 'Cliente busca imóvel com pé-direito duplo e vista para o Parque Ibirapuera.',
            createdBy: adminId,
        },
        {
            title: 'Casa de Campo - Bragança',
            contactId: createdContacts[1].id,
            pipelineId: createdPipelines[0].id,
            stageId: allStagesCreated[0].id, // Novo Lead
            value: 240000000, // R$ 2.4M
            notes: 'Interesse em condomínio fechado de alto padrão.',
            createdBy: adminId,
        },
        {
            title: 'Apartamento Jardins - Aluguel',
            contactId: createdContacts[3].id,
            pipelineId: createdPipelines[1].id,
            stageId: allStagesCreated[5].id, // interesse (rental) 
            value: 1200000, // R$ 12k
            notes: 'Doutora Juliana busca apto próximo ao consultório.',
            createdBy: adminId,
        },
        {
            title: 'Mansão Alphaville',
            contactId: createdContacts[4].id,
            pipelineId: createdPipelines[0].id,
            stageId: allStagesCreated[2].id, // Proposta
            value: 1200000000, // R$ 12M
            notes: 'Aguardando retorno da proposta enviada ontem.',
            createdBy: adminId,
        },
        {
            title: 'Studio Pinheiros - Locação',
            contactId: createdContacts[9].id, // Tatiana
            pipelineId: createdPipelines[1].id,
            stageId: allStagesCreated[6].id, // Analise de credito
            value: 450000, // R$ 4.5k
            notes: 'Documentação enviada para a seguradora.',
            createdBy: adminId,
        }
    ];

    await db.insert(deals).values(sampleDeals);
    console.log('✅ Demo deals created');

    console.log('🎉 Seed completed successfully!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    });
