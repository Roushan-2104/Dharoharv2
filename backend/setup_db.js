// Sets up Dharohar's tables in their own Postgres schema and fills them from offline_data.json.
// Safe to re-run: it only creates what is missing and updates records by id. It never touches
// tables outside the schema, so other tables in the same database are left alone.
// Run with: npm run setup-db   (or in Docker: docker compose exec backend npm run setup-db)
require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const offlineData = require('./offline_data.json');

const DB_URL = process.env.DATABASE_URL;
const SCHEMA = process.env.DB_SCHEMA || 'dharohar';

if (!DB_URL) {
  console.error('DATABASE_URL is not set. Add it to .env first.');
  process.exit(1);
}
if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) {
  console.error(`DB_SCHEMA "${SCHEMA}" must be lowercase letters, digits and underscores.`);
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    connectionTimeoutMillis: 10000,
    ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  await client.connect();
  console.log(`Connected. Setting up schema "${SCHEMA}"...`);

  try {
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
    await client.query(`SET LOCAL search_path TO ${SCHEMA}`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS entities (
        id UUID PRIMARY KEY,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        location_context TEXT,
        description TEXT,
        metadata JSONB,
        coordinates DOUBLE PRECISION[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS relationships (
        id UUID PRIMARY KEY,
        source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        relationship_type TEXT,
        label_en TEXT, label_hi TEXT, label_or TEXT,
        lore_en TEXT, lore_hi TEXT, lore_or TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS community_contributions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        location TEXT,
        lore TEXT NOT NULL,
        source_type TEXT,
        contributor TEXT,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS entity_opinions (
        id SERIAL PRIMARY KEY,
        entity_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        role_tag TEXT DEFAULT 'Verified Heritage Traveler',
        rating INTEGER DEFAULT 5,
        visit_time TEXT,
        opinion_text TEXT NOT NULL,
        travel_tip TEXT,
        is_verified BOOLEAN DEFAULT TRUE,
        likes_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS quiz_scores (
        id SERIAL PRIMARY KEY,
        category TEXT,
        score INTEGER,
        total INTEGER,
        percentage INTEGER,
        badge TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories, then entities and relationships, upserted by id
    const categoryIds = {};
    for (const name of new Set(offlineData.entities.map(e => e.category_name).filter(Boolean))) {
      const res = await client.query(
        `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name]
      );
      categoryIds[name] = res.rows[0].id;
    }

    for (const e of offlineData.entities) {
      await client.query(
        `INSERT INTO entities (id, category_id, name, location_context, description, metadata, coordinates)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name,
           location_context = EXCLUDED.location_context, description = EXCLUDED.description,
           metadata = EXCLUDED.metadata, coordinates = EXCLUDED.coordinates`,
        [e.id, categoryIds[e.category_name] || null, e.name, e.location_context, e.description,
         e.metadata || null, Array.isArray(e.coordinates) ? e.coordinates : null]
      );
    }

    for (const r of offlineData.relationships) {
      await client.query(
        `INSERT INTO relationships (id, source_entity_id, target_entity_id, relationship_type,
           label_en, label_hi, label_or, lore_en, lore_hi, lore_or)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET source_entity_id = EXCLUDED.source_entity_id,
           target_entity_id = EXCLUDED.target_entity_id, relationship_type = EXCLUDED.relationship_type,
           label_en = EXCLUDED.label_en, label_hi = EXCLUDED.label_hi, label_or = EXCLUDED.label_or,
           lore_en = EXCLUDED.lore_en, lore_hi = EXCLUDED.lore_hi, lore_or = EXCLUDED.lore_or`,
        [r.id, r.source_entity_id, r.target_entity_id, r.relationship_type,
         r.label_en, r.label_hi, r.label_or, r.lore_en, r.lore_hi, r.lore_or]
      );
    }

    await client.query('COMMIT');
    const counts = await client.query(
      `SELECT (SELECT count(*) FROM ${SCHEMA}.entities) AS entities,
              (SELECT count(*) FROM ${SCHEMA}.relationships) AS relationships,
              (SELECT count(*) FROM ${SCHEMA}.categories) AS categories`
    );
    console.log('Done:', counts.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
