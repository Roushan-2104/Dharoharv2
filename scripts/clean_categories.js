const { Client } = require('pg');

const DB_URL = "postgresql://postgres.owtcyqernavqkbvpkcxk:rBr+r2S9DBch.e&@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

const foodCategories = [
  'Regional Cuisine',
  'Main dish',
  'Fish curry',
  'Seafood',
  'Fish preparation',
  'Temple cuisine',
  'Pitha',
  'Sweet',
  'Fermented food',
  'Street food',
  'Snack'
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Check if 'Cuisine' exists, if not create it
    let res = await client.query(`SELECT id FROM categories WHERE name = 'Cuisine'`);
    let cuisineId;
    if (res.rows.length === 0) {
      const insertRes = await client.query(`INSERT INTO categories (name) VALUES ('Cuisine') RETURNING id`);
      cuisineId = insertRes.rows[0].id;
    } else {
      cuisineId = res.rows[0].id;
    }

    // Get all IDs of scattered food categories
    const placeholders = foodCategories.map((_, i) => `$${i + 1}`).join(', ');
    const scatteredRes = await client.query(`
      SELECT id FROM categories WHERE name IN (${placeholders})
    `, foodCategories);

    const scatteredIds = scatteredRes.rows.map(row => row.id);

    if (scatteredIds.length > 0) {
      // Re-assign entities to the master 'Cuisine' category
      const updateRes = await client.query(`
        UPDATE entities 
        SET category_id = $1 
        WHERE category_id = ANY($2::uuid[])
      `, [cuisineId, scatteredIds]);
      console.log(`Updated ${updateRes.rowCount} entities to use the unified 'Cuisine' category.`);

      // Delete the old scattered categories
      const deleteRes = await client.query(`
        DELETE FROM categories WHERE id = ANY($1::uuid[])
      `, [scatteredIds]);
      console.log(`Deleted ${deleteRes.rowCount} scattered food categories.`);
    }

    // While we are here, let's also clean up the others for a better UI:
    // 'Art, Dance, and Crafts' -> 'Art & Craft'
    // 'Heritage Sites & Monuments' -> 'Monument'
    // 'Historical Personalities' -> 'Historical Personality'
    // 'Local Legend / Story' -> 'Legend & Story'
    // 'Lesser-Known Location' -> 'Hidden Heritage'
    // 'Regional Traditions' -> 'Tradition'
    // 'Festivals' -> 'Festival'

    const renameMap = {
      'Art, Dance, and Crafts': 'Art & Craft',
      'Heritage Sites & Monuments': 'Monument',
      'Historical Personalities': 'Historical Personality',
      'Local Legend / Story': 'Legend & Story',
      'Lesser-Known Location': 'Hidden Heritage',
      'Regional Traditions': 'Tradition',
      'Festivals': 'Festival'
    };

    for (const [oldName, newName] of Object.entries(renameMap)) {
      await client.query(`UPDATE categories SET name = $1 WHERE name = $2`, [newName, oldName]);
    }
    console.log("Renamed other categories to be UI-friendly.");

    console.log("Cleanup complete!");

  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await client.end();
  }
}

run();
