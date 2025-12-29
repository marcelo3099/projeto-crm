import { pgTable, serial, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ========== USERS ==========
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).default('USER'), // PostgreSQL doesn't have native enum in same way as SQLite strings
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== CONTACTS ==========
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  source: varchar('source', { length: 50 }).notNull().default('MANUAL'),
  preferences: text('preferences'), // JSON: { propertyType, maxPrice, minArea, minBedrooms, etc }
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ========== PIPELINES ==========
export const pipelines = pgTable('pipelines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== STAGES ==========
export const stages = pgTable('stages', {
  id: serial('id').primaryKey(),
  pipelineId: integer('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').notNull().default(0),
  color: text('color').default('#3b82f6'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== DEALS (NOW PROPERTY-CENTRIC) ==========
export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  pipelineId: integer('pipeline_id').notNull().references(() => pipelines.id),
  stageId: integer('stage_id').notNull().references(() => stages.id),
  value: integer('value').default(0),
  location: text('location'),
  propertyType: varchar('property_type', { length: 50 }),
  dealStatus: varchar('deal_status', { length: 20 }).default('AVAILABLE'),
  area: integer('area'), // in m2
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  suites: integer('suites'),
  parkingSpots: integer('parking_spots'),
  features: text('features'), // JSON or comma-separated list
  images: text('images'), // JSON list of URLs
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ========== FORMS ==========
export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  pipelineId: integer('pipeline_id').notNull().references(() => pipelines.id),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== FORM STEPS ==========
export const formSteps = pgTable('form_steps', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== KNOWLEDGE ARTICLES ==========
export const knowledgeArticles = pgTable('knowledge_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').default('general'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== FORM FIELDS ==========
export const formFields = pgTable('form_fields', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  stepId: integer('step_id').references(() => formSteps.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  fieldKey: text('field_key').notNull(),
  fieldType: varchar('field_type', { length: 50 }).notNull().default('text'),
  isRequired: boolean('is_required').notNull().default(false),
  options: text('options'),
  helpArticleId: integer('help_article_id').references(() => knowledgeArticles.id),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== FORM SUBMISSIONS ==========
export const formSubmissions = pgTable('form_submissions', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id),
  contactId: integer('contact_id').references(() => contacts.id),
  dealId: integer('deal_id').references(() => deals.id),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== LEADS (Legacy) ==========
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  source: varchar('source', { length: 50 }).notNull().default('MANUAL'),
  status: varchar('status', { length: 50 }).notNull().default('NOVO'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ========== TYPE EXPORTS ==========
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;

export type FormField = typeof formFields.$inferSelect;
export type NewFormField = typeof formFields.$inferInsert;

export type FormStep = typeof formSteps.$inferSelect;
export type NewFormStep = typeof formSteps.$inferInsert;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type NewKnowledgeArticle = typeof knowledgeArticles.$inferInsert;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
