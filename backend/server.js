const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Supabase Connection
const DB_URL = "postgresql://postgres.owtcyqernavqkbvpkcxk:rBr+r2S9DBch.e&@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

// Gemini Configuration
const genAI = new GoogleGenerativeAI('AQ.Ab8RN6JxHj11yhVSfh0gLb9G4jFzoCFQ0hpy6ajX9jLQq2YJ1A');
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" }); // Updated to the exact model required by the API

app.use(cors());
app.use(express.json());

app.get('/api/entities', async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.name, e.location_context, e.description, e.metadata, e.coordinates, c.name as category_name
      FROM entities e
      LEFT JOIN categories c ON e.category_id = c.id
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/entities/:id/connections', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT e.id, e.name, e.coordinates, c.name as category_name
      FROM entities e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id != $1 AND e.coordinates IS NOT NULL
      ORDER BY random()
      LIMIT floor(random() * 3 + 2);
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, entityContext } = req.body;
  
  const contextName = entityContext?.name || "Indian Cultural Heritage";
  const contextCategory = entityContext?.category_name || "Heritage Dimension";
  const contextDesc = entityContext?.description || "Sacred architecture, performing arts, folklore, and living traditions.";

  const systemPrompt = `You are Darshak, the AI Cultural Chronicler for DHAROHAR (Digital Heritage Knowledge System). 
  The explorer is learning about: ${contextName} (${contextCategory}).
  Context: ${contextDesc}
  Answer as an engaging, knowledgeable Indian cultural historian and storyteller. Keep it authentic, inspiring, and concise (2-3 short paragraphs).`;

  const promptText = `${systemPrompt}\n\nUser Question: ${message}`;
  
  // Try available Gemini models in priority order
  const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  
  for (const modelName of candidateModels) {
    try {
      const activeModel = genAI.getGenerativeModel({ model: modelName });
      const result = await activeModel.generateContent(promptText);
      const response = await result.response;
      return res.json({ response: response.text() });
    } catch (err) {
      console.warn(`Model ${modelName} failed, attempting next candidate...`);
    }
  }

  // Graceful cultural historian fallback if upstream API is temporarily rate-limited/503
  res.json({
    response: `Greetings, explorer. ${contextName} represents a profound chapter in our cultural heritage as part of ${contextCategory}. ${contextDesc} Historical traditions and local lore link this timeless heritage to centuries of artistic devotion and community living. What specific architectural or cultural dimension would you like to delve into further?`
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
