const { Client } = require('pg');
const axios = require('axios');

const DB_URL = "postgresql://postgres.owtcyqernavqkbvpkcxk:rBr+r2S9DBch.e&@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

const ODISHA_CENTER = [20.9517, 85.0985];

// Helper for sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocode(entity) {
  try {
    let query = '';

    // If it's an art, food, or tradition, we prioritize the location/region rather than the name of the dish
    if (entity.category_name === 'Cuisine' || entity.category_name === 'Art & Craft' || entity.category_name === 'Tradition') {
      query = `${entity.location_context || entity.name}, Odisha, India`;
    } else {
      // For Monuments, Hidden Heritage, etc., the name + context is best
      query = `${entity.name}, ${entity.location_context || ''}, Odisha, India`.replace(/,\s*,/g, ',');
    }

    console.log(`[${entity.id}] Geocoding: ${query}`);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Dharohar-SIH-Prototype/1.0 (test@example.com)'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }

    // If failed, try a looser query (just location_context)
    if (entity.location_context) {
      const looseQuery = `${entity.location_context}, Odisha, India`;
      console.log(`[${entity.id}] Retrying looser query: ${looseQuery}`);
      
      await sleep(1200); // Respect rate limit
      
      const retryResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: looseQuery, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'Dharohar-SIH-Prototype/1.0 (test@example.com)' }
      });

      if (retryResponse.data && retryResponse.data.length > 0) {
        const { lat, lon } = retryResponse.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
    }

    // Fallback to center if completely not found
    console.log(`[${entity.id}] Not found. Falling back to Odisha Center.`);
    return ODISHA_CENTER;

  } catch (error) {
    console.error(`[${entity.id}] Geocoding Error:`, error.message);
    return ODISHA_CENTER;
  }
}

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const res = await client.query(`
      SELECT e.id, e.name, e.location_context, c.name as category_name
      FROM entities e
      LEFT JOIN categories c ON e.category_id = c.id
    `);
    
    const entities = res.rows;
    console.log(`Found ${entities.length} entities to geocode.`);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const coords = await geocode(entity);
      
      await client.query(`
        UPDATE entities
        SET coordinates = $1
        WHERE id = $2
      `, [JSON.stringify(coords), entity.id]);
      
      console.log(`Progress: ${i + 1}/${entities.length} - Updated ${entity.name} with coords [${coords}]`);
      
      // Strict 1.2 second wait for Nominatim API limits
      await sleep(1200);
    }

    console.log("Geocoding completed successfully!");

  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await client.end();
  }
}

run();
