require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Supabase / PostgreSQL Connection
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables.");
}
const pool = new Pool({
  connectionString: DB_URL,
  ssl: DB_URL && DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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
  const { message, entityContext, language } = req.body;
  
  const targetLanguage = language || "English";
  const contextName = entityContext?.name || "Indian Cultural Heritage";
  const contextCategory = entityContext?.category_name || "Heritage Dimension";
  const contextDesc = entityContext?.description || "Sacred architecture, performing arts, folklore, and living traditions.";

  let languageInstruction = "Answer in English as an engaging, authentic, and inspiring Indian cultural historian.";
  if (targetLanguage === "Hindi") {
    languageInstruction = "Answer completely in fluent, respectful Hindi (हिन्दी / देवनागरी लिपि) as a knowledgeable cultural chronicler and storyteller.";
  } else if (targetLanguage === "Odia") {
    languageInstruction = "Answer completely in authentic, fluent Odia (ଓଡ଼ିଆ ଲିପି) as a dedicated heritage chronicler and cultural storyteller.";
  }

  const systemPrompt = `You are Darshak, the AI Cultural Chronicler for DHAROHAR (Digital Heritage Knowledge System). 
  The explorer is learning about: ${contextName} (${contextCategory}).
  Context: ${contextDesc}
  Language Requirement: ${languageInstruction}
  Keep the response authentic, culturally grounded, and concise (2-3 short paragraphs).`;

  const promptText = `${systemPrompt}\n\nUser Question: ${message}`;
  
  if (genAI) {
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
  }

  // Graceful cultural historian fallback based on target language
  let fallbackText = `Greetings, explorer. ${contextName} represents a profound chapter in our cultural heritage as part of ${contextCategory}. ${contextDesc} Historical traditions and local lore link this timeless heritage to centuries of artistic devotion and community living. What specific architectural or cultural dimension would you like to delve into further?`;
  
  if (targetLanguage === "Hindi") {
    fallbackText = `नमस्ते अन्वेषक! ${contextName} हमारे सांस्कृतिक इतिहास का एक अत्यंत गौरवशाली अध्याय है (${contextCategory})। ${contextDesc} यह ऐतिहासिक विरासत सदियों की कलात्मक साधना और लोक आस्था का प्रतीक है। आप इसके किस विशेष पहलू के बारे में और जानना चाहते हैं?`;
  } else if (targetLanguage === "Odia") {
    fallbackText = `ନମସ୍କାର ଅନୁସନ୍ଧିତ୍ସୁ! ${contextName} ଆମ ଐତିହ୍ୟ ଓ ସଂସ୍କୃତିର ଏକ ଅମୂଲ୍ୟ ଅଧ୍ୟାୟ (${contextCategory})। ${contextDesc} ଏହି ପବିତ୍ର ଐତିହ୍ୟ ଶତାବ୍ଦୀର କଳାତ୍ମକ ସାଧନା ଓ ସାଂସ୍କୃତିକ ଜୀବନଶୈଳୀର ପ୍ରତୀକ। ଆପଣ ଏହାର କେଉଁ ବିଶେଷ ଦିଗ ବିଷୟରେ ଅଧିକ ଜାଣିବାକୁ ଚାହାନ୍ତି?`;
  }

  res.json({
    response: fallbackText
  });
});

app.get('/', (req, res) => {
  res.json({
    status: "ok",
    service: "DHAROHAR Digital Heritage Knowledge System API",
    message: "Backend is active. For the web UI interface, please open http://localhost:5173",
    endpoints: {
      entities: "GET /api/entities",
      connections: "GET /api/entities/:id/connections",
      chat: "POST /api/chat"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}. This is an API backend server.`,
    frontendUrl: "http://localhost:5173",
    validEndpoints: ["/api/entities", "/api/entities/:id/connections", "/api/chat", "/"]
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
