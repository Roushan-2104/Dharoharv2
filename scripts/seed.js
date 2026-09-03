const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const DB_URL = "postgresql://postgres.owtcyqernavqkbvpkcxk:rBr+r2S9DBch.e&@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // 1. Create Tables
    console.log("Creating tables...");
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DROP TABLE IF EXISTS relationships CASCADE;
      DROP TABLE IF EXISTS entities CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;

      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE entities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        location_context TEXT,
        description TEXT,
        metadata JSONB,
        coordinates JSONB
      );

      CREATE TABLE relationships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        relationship_type TEXT NOT NULL
      );
    `);
    console.log("Tables created successfully.");

    // 2. Setup Categories mapping
    const categoryMapping = {};
    const getCategoryId = async (catName) => {
      if (!catName) catName = 'Uncategorized';
      if (categoryMapping[catName]) return categoryMapping[catName];
      const res = await client.query(`INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [catName]);
      categoryMapping[catName] = res.rows[0].id;
      return res.rows[0].id;
    };

    // 3. Helper to read and insert CSV
    const processCsv = async (fileName, categoryDefaultName) => {
      console.log(`Processing ${fileName}...`);
      const filePath = path.join(__dirname, '../data', fileName);
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
      }

      const records = [];
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => records.push(data))
          .on('end', async () => {
            try {
              for (const row of records) {
                // Determine Category
                let catName = row['Category'] || row['Data_Category'] || categoryDefaultName;
                const catId = await getCategoryId(catName);

                // Determine Name, Location, Description
                let name = row['Name'] || row['Dish'] || row['Location'] || row['Place / Community'] || 'Unknown';
                let loc = row['Location / Context'] || row['Region'] || row['Region / Association'] || row['District'] || '';
                let desc = row['Description / Significance'] || row['Story Summary'] || row['What Makes It Special'] || '';
                
                // Put everything else in metadata
                const metadata = { ...row };

                await client.query(`
                  INSERT INTO entities (category_id, name, location_context, description, metadata)
                  VALUES ($1, $2, $3, $4, $5)
                `, [catId, name, loc, desc, metadata]);
              }
              console.log(`Inserted ${records.length} rows from ${fileName}.`);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
      });
    };

    // 4. Process all CSVs
    await processCsv('odisha_art_dance_crafts.csv', 'Art & Craft');
    await processCsv('odisha_cuisine_by_region.csv', 'Cuisine');
    await processCsv('odisha_dish_directory_detail.csv', 'Cuisine');
    await processCsv('odisha_festivals.csv', 'Festival');
    await processCsv('odisha_heritage_monuments.csv', 'Monument');
    await processCsv('odisha_historical_personalities.csv', 'Historical Personality');
    await processCsv('odisha_legends_and_stories.csv', 'Legend & Story');
    await processCsv('odisha_lesser_known_locations.csv', 'Hidden Heritage');
    await processCsv('odisha_regional_traditions.csv', 'Tradition');

    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

run();
