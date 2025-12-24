const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('sqlite.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('🌱 Starting database migration...');

// Create all tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Contacts table
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT NOT NULL DEFAULT 'MANUAL',
    created_by INTEGER REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Pipelines table
  CREATE TABLE IF NOT EXISTS pipelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Stages table
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#3b82f6',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Deals table
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
    stage_id INTEGER NOT NULL REFERENCES stages(id),
    value INTEGER DEFAULT 0,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Forms table
  CREATE TABLE IF NOT EXISTS forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Form Fields table
  CREATE TABLE IF NOT EXISTS form_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    step_id INTEGER REFERENCES form_steps(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text',
    is_required INTEGER NOT NULL DEFAULT 0,
    options TEXT,
    help_article_id INTEGER REFERENCES knowledge_articles(id),
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Form Steps table
  CREATE TABLE IF NOT EXISTS form_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Knowledge Articles table
  CREATE TABLE IF NOT EXISTS knowledge_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'general',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Form Submissions table
  CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL REFERENCES forms(id),
    contact_id INTEGER REFERENCES contacts(id),
    deal_id INTEGER REFERENCES deals(id),
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  -- Legacy Leads table (for backwards compatibility)
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'MANUAL',
    status TEXT NOT NULL DEFAULT 'NOVO',
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
`);

console.log('✅ Tables created');

// Seed data
const hashedPassword = bcrypt.hashSync('admin123', 10);

// Insert admin user
const insertUser = db.prepare(`
  INSERT INTO users (name, email, password, role) 
  VALUES (?, ?, ?, ?)
`);
const userResult = insertUser.run('Administrador', 'admin@crm.com', hashedPassword, 'ADMIN');
const adminId = userResult.lastInsertRowid;
console.log('✅ Admin user created');

// Insert default pipeline
const insertPipeline = db.prepare(`
  INSERT INTO pipelines (name, description, created_by) 
  VALUES (?, ?, ?)
`);
const pipelineResult = insertPipeline.run('Vendas', 'Pipeline padrão de vendas', adminId);
const pipelineId = pipelineResult.lastInsertRowid;
console.log('✅ Default pipeline created');

// Insert stages
const insertStage = db.prepare(`
  INSERT INTO stages (pipeline_id, name, "order", color) 
  VALUES (?, ?, ?, ?)
`);

const stages = [
  { name: 'Novo Lead', order: 0, color: '#6b7280' },
  { name: 'Qualificação', order: 1, color: '#3b82f6' },
  { name: 'Proposta', order: 2, color: '#f59e0b' },
  { name: 'Negociação', order: 3, color: '#8b5cf6' },
  { name: 'Fechado', order: 4, color: '#10b981' },
];

const stageIds = [];
stages.forEach(stage => {
  const result = insertStage.run(pipelineId, stage.name, stage.order, stage.color);
  stageIds.push(result.lastInsertRowid);
});
console.log('✅ Stages created');

// Insert sample contacts
const insertContact = db.prepare(`
  INSERT INTO contacts (name, email, phone, company, source, created_by) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

const contactIds = [];
const contact1 = insertContact.run('João Silva', 'joao@example.com', '11999999999', 'Tech Corp', 'MANUAL', adminId);
contactIds.push(contact1.lastInsertRowid);

const contact2 = insertContact.run('Maria Santos', 'maria@example.com', '11988888888', 'Marketing Plus', 'INSTAGRAM', adminId);
contactIds.push(contact2.lastInsertRowid);

console.log('✅ Sample contacts created');

// Insert sample deals
const insertDeal = db.prepare(`
  INSERT INTO deals (title, contact_id, pipeline_id, stage_id, value, notes, created_by) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertDeal.run('Venda - Tech Corp', contactIds[0], pipelineId, stageIds[0], 50000, 'Interessado em nosso produto premium', adminId);
insertDeal.run('Parceria - Marketing Plus', contactIds[1], pipelineId, stageIds[0], 100000, null, adminId);

console.log('✅ Sample deals created');

db.close();

console.log('🎉 Database seed completed!');
console.log('\\n📊 Login credentials:');
console.log('   Email: admin@crm.com');
console.log('   Password: admin123');
