const { Client } = require('pg');

const DB_URL = "postgresql://postgres.owtcyqernavqkbvpkcxk:rBr+r2S9DBch.e&@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const res = await client.query(`SELECT id FROM entities`);
    const entities = res.rows;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      
      // Scatter randomly across Odisha: Lat ~19.5 to 22.0, Lng ~82.5 to 87.0
      const randomLat = 19.5 + Math.random() * 2.5;
      const randomLng = 82.5 + Math.random() * 4.5;
      const coords = [randomLat, randomLng];
      
      await client.query(`
        UPDATE entities
        SET coordinates = $1
        WHERE id = $2
      `, [JSON.stringify(coords), entity.id]);
    }

    console.log("Successfully scattered coordinates for demo purposes.");

  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await client.end();
  }
}

run();
