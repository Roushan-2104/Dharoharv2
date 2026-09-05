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

app.post('/api/itinerary/generate', async (req, res) => {
  try {
    const { duration = "3 Days", themes = [], startingRegion = "Bhubaneswar", selectedEntity = null, language = "English" } = req.body;

    // Fetch active database entities for grounding
    let dbEntities = [];
    try {
      const dbRes = await pool.query(`
        SELECT e.id, e.name, e.location_context, e.description, e.coordinates, c.name as category_name
        FROM entities e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.coordinates IS NOT NULL
        LIMIT 60;
      `);
      dbEntities = dbRes.rows;
    } catch (e) {
      console.warn("DB fetch in itinerary route failed, continuing with grounding...");
    }

    const langInstruction = language === "Hindi" 
      ? "Respond entirely in fluent Hindi (हिन्दी / देवनागरी लिपि) for all titles, descriptions, food tips, and activities." 
      : language === "Odia" 
      ? "Respond entirely in authentic Odia (ଓଡ଼ିଆ ଲିପି) for all titles, descriptions, food tips, and activities." 
      : "Respond in English.";

    const promptText = `You are Darshak, the Master Cultural Itinerary Planner for DHAROHAR (Digital Heritage Knowledge System of Odisha, India).
Create an authentic, culturally inspiring, and geographically realistic travel itinerary.
- Duration: ${duration}
- Starting Hub: ${startingRegion || 'Bhubaneswar'}
- Selected Heritage Highlight: ${selectedEntity ? selectedEntity.name + ' (' + (selectedEntity.category_name || '') + ')' : 'None'}
- Explorer Interests/Themes: ${themes.length > 0 ? themes.join(', ') : 'Temples, Folk Traditions, Cuisine, Handlooms, Nature'}
- Target Language: ${langInstruction}

Available Grounded Odisha Heritage Sites (use their exact coordinates if possible):
${JSON.stringify(dbEntities.slice(0, 30).map(e => ({ name: e.name, cat: e.category_name, loc: e.location_context, coords: e.coordinates })))}

Return ONLY valid JSON matching this exact schema:
{
  "title": "Itinerary Title",
  "subtitle": "Inspiring subtitle",
  "duration": "${duration}",
  "startingPoint": "${startingRegion || 'Bhubaneswar'}",
  "summary": "2-3 sentence overview of this cultural journey",
  "totalStops": 6,
  "routeCoordinates": [ [20.238, 85.833], [19.813, 85.831], [19.887, 86.094] ],
  "days": [
    {
      "day": 1,
      "title": "Day Title",
      "theme": "Day Theme",
      "stops": [
        {
          "timeSlot": "Morning",
          "name": "Heritage Site Name",
          "category": "Monuments & Temples",
          "location": "City/District",
          "coordinates": [20.238, 85.833],
          "activity": "What to explore and experience here",
          "culinaryTip": "Authentic regional dish to try nearby",
          "culturalLore": "Key folklore or historical significance"
        }
      ]
    }
  ]
}`;

    if (genAI) {
      const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
      for (const modelName of candidateModels) {
        try {
          const activeModel = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await activeModel.generateContent(promptText);
          const responseText = result.response.text();
          const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedData = JSON.parse(cleanJson);
          return res.json(parsedData);
        } catch (err) {
          console.warn(`Model ${modelName} failed for itinerary, trying fallback...`);
        }
      }
    }

    // Curated Cultural Itinerary Fallback Matrix
    const isOdia = language === "Odia";
    const isHindi = language === "Hindi";

    const fallbackItinerary = {
      title: isOdia 
        ? "ସ୍ୱର୍ଣ୍ଣ ତ୍ରିଭୁଜ ପବିତ୍ର ଐତିହ୍ୟ ପରିକ୍ରମା" 
        : isHindi 
        ? "स्वर्ण त्रिभुज पावन सांस्कृतिक धरोहर यात्रा" 
        : "Golden Triangle Sacred Heritage Trail",
      subtitle: isOdia 
        ? "ଭୁବନେଶ୍ୱର, ପୁରୀ, ରଘୁରାଜପୁର ଓ କୋଣାର୍କର ଚିରନ୍ତନ ଯାତ୍ରା" 
        : isHindi 
        ? "भुवनेश्वर, पुरी, रघुराजपुर और कोणार्क की कालजयी यात्रा" 
        : "An inspiring journey across Ekamra Kshetra, Puri Jagannath, Raghurajpur & Konark",
      duration: duration,
      startingPoint: startingRegion || (isOdia ? "ଭୁବନେଶ୍ୱର" : isHindi ? "भुवनेश्वर" : "Bhubaneswar"),
      summary: isOdia 
        ? "ଓଡ଼ିଶାର ପ୍ରାଚୀନ କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ, ଶ୍ରୀଜଗନ୍ନାଥ ସଂସ୍କୃତି, ପଟ୍ଟଚିତ୍ର କଳା ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟଶୈଳୀର ଏକ ଅପୂର୍ବ ଯାତ୍ରା।" 
        : isHindi 
        ? "ओडिशा की प्राचीन कलिंग वास्तुकला, जगन्नाथ संस्कृति, पट्टचित्र कला और पारंपरिक खान-पान का एक अविस्मरणीय अनुभव।" 
        : "Explore ancient Kalinga temple architecture, sacred Jagannath traditions, Raghurajpur artisan heritage, and coastal Odia cuisine.",
      totalStops: 6,
      routeCoordinates: [
        [20.238, 85.833],
        [20.264, 85.836],
        [20.192, 85.854],
        [19.897, 85.819],
        [19.805, 85.818],
        [19.887, 86.094]
      ],
      days: [
        {
          day: 1,
          title: isOdia ? "ଦିବସ ୧: ଏକାମ୍ର କ୍ଷେତ୍ରର ପ୍ରାଚୀନ ସ୍ଥାପତ୍ୟ" : isHindi ? "दिवस 1: एकाम्र क्षेत्र की प्राचीन स्थापत्य कला" : "Day 1: Ancient Temples of Ekamra Kshetra",
          theme: isOdia ? "ମନ୍ଦିର ସ୍ଥାପତ୍ୟ ଓ ବିନ୍ଦୁସାଗର" : isHindi ? "मंदिर स्थापत्य एवं बिंदुसागर" : "Temple Architecture & Sacred Waters",
          stops: [
            {
              timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
              name: isOdia ? "ଲିଙ୍ଗରାଜ ମନ୍ଦିର" : isHindi ? "लिंगराज मंदिर" : "Lingaraja Temple",
              category: "Monuments & Temples",
              location: "Bhubaneswar",
              coordinates: [20.238, 85.833],
              activity: isOdia ? "୧୧ଶ ଶତାବ୍ଦୀର ବିଶାଳ ଦେଉଳ ଓ କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଦର୍ଶନ।" : isHindi ? "11वीं शताब्दी के विशाल कलिंग स्थापत्य और गर्भ गृह के दर्शन।" : "Marvel at 11th-century soaring Kalinga deula architecture and intricate stone carvings.",
              culinaryTip: isOdia ? "କୋରାଖାଇ ଏବଂ ଦହିବରା ଆଳୁଦମ" : isHindi ? "कोराखाई भोग एवं कटक स्टाइल दही बड़ा आलू दम" : "Traditional Korakhai temple sweet & Dahi Bara Aloo Dum",
              culturalLore: isOdia ? "ହରିହର ଏକାତ୍ମ ପୂଜା ପରମ୍ପରା ଓ ଅଶୋକାଷ୍ଟମୀ ରୁକୁଣା ରଥ।" : isHindi ? "हरिहर एकात्म पूजा एवं अशोक अष्टमी रुकुणा रथ परंपरा।" : "Dedicated to Harihara (unison of Shiva and Vishnu)."
            },
            {
              timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
              name: isOdia ? "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ" : isHindi ? "धौली शांति स्तूप" : "Dhauli Shanti Stupa",
              category: "Monuments & Temples",
              location: "Bhubaneswar",
              coordinates: [20.192, 85.854],
              activity: isOdia ? "ସମ୍ରାଟ ଅଶୋକଙ୍କ ଶିଳାଲିପି ଓ ଶାନ୍ତି ସ୍ତୂପ ପରିଦର୍ଶନ।" : isHindi ? "सम्राट अशोक के प्राचीन शिलालेख एवं शांति स्तूप का भ्रमण।" : "Explore Emperor Ashoka's rock edicts and panoramic stupa views overlooking Daya river.",
              culinaryTip: isOdia ? "ଓଡ଼ିଆ ଦାଲମା ଓ ପଖାଳ ଭାତ" : isHindi ? "पारंपरिक ओड़िया दालमा एवं ताजा पखाल" : "Authentic temple-style Dalma and aromatic rice",
              culturalLore: isOdia ? "କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ଅଶୋକଙ୍କ ଧର୍ମାନ୍ତରଣର ଐତିହାସିକ ସ୍ଥଳ।" : isHindi ? "कलिंग युद्ध के उपरांत सम्राट अशोक के हृदय परिवर्तन का स्थल।" : "Historic site marking Emperor Ashoka's embrace of Buddhism."
            }
          ]
        },
        {
          day: 2,
          title: isOdia ? "ଦିବସ ୨: ଶ୍ରୀକ୍ଷେତ୍ର ପୁରୀ ଓ ରଘୁରାଜପୁର ଐତିହ୍ୟ" : isHindi ? "दिवस 2: श्रीक्षेत्र पुरी एवं रघुराजपुर शिल्प विरासत" : "Day 2: Sacred Puri & Raghurajpur Artisans",
          theme: isOdia ? "ପଟ୍ଟଚିତ୍ର ଓ ମହାପ୍ରସାଦ ପରମ୍ପରା" : isHindi ? "पट्टचित्र एवं महाप्रसाद परंपरा" : "Living Arts & Sacred Cuisine",
          stops: [
            {
              timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
              name: isOdia ? "ରଘୁରାଜପୁର ଐତିହ୍ୟ ଶିଳ୍ପ ଗ୍ରାମ" : isHindi ? "रघुराजपुर विरासत शिल्प ग्राम" : "Raghurajpur Heritage Crafts Village",
              category: "Art, Dance & Crafts",
              location: "Puri",
              coordinates: [19.897, 85.819],
              activity: isOdia ? "କାରିଗରମାନଙ୍କ ଠାରୁ ପ୍ରତ୍ୟକ୍ଷ ପଟ୍ଟଚିତ୍ର ଓ ତାଳପତ୍ର ଚିତ୍ର ଦେଖନ୍ତୁ।" : isHindi ? "कारीगरों से सीधे पट्टचित्र, ताड़पत्र कला और गोटीपुआ नृत्य सीखें।" : "Witness master artisans creating palm-leaf Pattachitra and Gotipua dance heritage.",
              culinaryTip: isOdia ? "ନିମାପଡ଼ା ଛେନା ଝିଲି" : isHindi ? "निमापड़ा की प्रसिद्ध छेना झिली" : "Fresh Nimapada Chhena Jhili sweets",
              culturalLore: isOdia ? "ପ୍ରତ୍ୟେକ ଘର ଜଣେ ଜଣେ କଳାକାରଙ୍କ ସୃଷ୍ଟିର ସଂଗ୍ରହାଳୟ।" : isHindi ? "गाँव का हर घर एक जीवित कला संग्रहालय है।" : "Centuries-old unbroken lineage of Pattachitra and mask makers."
            },
            {
              timeSlot: isOdia ? "ସନ୍ଧ୍ୟା" : isHindi ? "संध्या" : "Evening",
              name: isOdia ? "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର" : isHindi ? "श्री जगन्नाथ मंदिर" : "Jagannath Temple, Puri",
              category: "Monuments & Temples",
              location: "Puri",
              coordinates: [19.805, 85.818],
              activity: isOdia ? "ଶ୍ରୀମନ୍ଦିର ବେଢ଼ା ପରିକ୍ରମା ଓ ଆନନ୍ଦ ବଜାର ମହାପ୍ରସାଦ ସେବନ।" : isHindi ? "श्रीमंदिर परिक्रमा, दीप दर्शन एवं आनंद बाजार में महाप्रसाद का आनंद।" : "Experience evening arati, Singhadwara rituals, and Anand Bazar Mahaprasad.",
              culinaryTip: isOdia ? "ପୁରୀ ଶ୍ରୀମନ୍ଦିର ମହାପ୍ରସାଦ ଓ ଖଜା" : isHindi ? "पवित्र महाप्रसाद (छप्पन भोग) एवं पुरी खाजा" : "Divine Mahaprasad & crispy Puri Khaja",
              culturalLore: isOdia ? "ଛତିଶା ନିଯୋଗ ଓ ନବକଳେବରର ଅଲୌକିକ ପରମ୍ପରା।" : isHindi ? "छतीशा नियोग एवं नवकलेवर की पावन परंपरा।" : "One of India's Char Dhams with unbroken daily seva traditions."
            }
          ]
        },
        {
          day: 3,
          title: isOdia ? "ଦିବସ ୩: କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଓ ଚନ୍ଦ୍ରଭାଗା ତୀର" : isHindi ? "दिवस 3: कोणार्क सूर्य मंदिर एवं चंद्रभागा तट" : "Day 3: Sun Temple Grandeur & Coastal Lore",
          theme: isOdia ? "ସୌର ସ୍ଥାପତ୍ୟ ଓ ସାଗର ସଙ୍ଗମ" : isHindi ? "सौर वास्तुकला एवं सागर तट" : "Solar Architecture & Maritime Breeze",
          stops: [
            {
              timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
              name: isOdia ? "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର" : isHindi ? "कोणार्क सूर्य मंदिर" : "Konark Sun Temple",
              category: "Monuments & Temples",
              location: "Konark",
              coordinates: [19.887, 86.094],
              activity: isOdia ? "୨୪ଟି ଖୋଦିତ ସୂର୍ଯ୍ୟ ରଥ ଚକ୍ର ଓ ନାଟମଣ୍ଡପ ଦର୍ଶନ।" : isHindi ? "24 विशाल नक्काशीदार पहियों और नाट्यमंडप की मूर्तियां देखें।" : "Explore the UNESCO World Heritage 24-wheeled chariot of Surya and Natya Mandapa.",
              culinaryTip: isOdia ? "ଛେନାପୋଡ଼ ଓ ଚିଲିକା ଚିଙ୍ଗୁଡ଼ି ତରକାରୀ" : isHindi ? "नयागढ़ छेना पोड़ा एवं तटीय समुद्री व्यंजन" : "Smoky baked Chhena Poda & coastal fish curry",
              culturalLore: isOdia ? "ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବ ଓ ଧର୍ମପଦଙ୍କ ଅମର ବଳିଦାନ।" : isHindi ? "राजा लांगुला नरसिंह देव एवं 12 वर्षीय शिल्पी धर्मपद की गाथा।" : "Legend of master architect Dharmapada and Ganga dynasty patronage."
            }
          ]
        }
      ]
    };

    return res.json(fallbackItinerary);
  } catch (error) {
    console.error("Itinerary Generation Error:", error);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: "ok",
    service: "DHAROHAR Digital Heritage Knowledge System API",
    message: "Backend is active. For the web UI interface, please open http://localhost:5173",
    endpoints: {
      entities: "GET /api/entities",
      connections: "GET /api/entities/:id/connections",
      chat: "POST /api/chat",
      itinerary: "POST /api/itinerary/generate"
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
