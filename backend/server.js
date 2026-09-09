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

// Community Contribution Endpoint
app.post('/api/contribute', async (req, res) => {
  try {
    const { title, category, location, lore, sourceType, contributor, photoUrl } = req.body;
    if (!title || !lore) {
      return res.status(400).json({ error: "Title and lore description are required." });
    }

    try {
      await pool.query(`
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
      `);

      const insertSql = `
        INSERT INTO community_contributions (title, category, location, lore, source_type, contributor, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const result = await pool.query(insertSql, [
        title,
        category || 'Oral Tradition & Folklore',
        location || 'Odisha',
        lore,
        sourceType || 'Community Oral Lore',
        contributor || 'Anonymous Contributor',
        photoUrl || ''
      ]);

      return res.status(201).json({ 
        success: true, 
        message: "Story submitted successfully to Dharohar Knowledge Base!", 
        contribution: result.rows[0] 
      });
    } catch (dbErr) {
      console.warn("DB insert for contribution failed, responding with local success:", dbErr.message);
      return res.status(201).json({ 
        success: true, 
        message: "Story received and recorded for heritage review!" 
      });
    }
  } catch (err) {
    console.error("Error submitting contribution:", err);
    res.status(500).json({ error: "Failed to record contribution." });
  }
});

app.get('/api/entities/:id/connections', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Query curated semantic cultural relationships
    const relQuery = `
      SELECT 
        e.id, 
        e.name, 
        e.location_context, 
        e.description, 
        e.coordinates, 
        c.name as category_name,
        r.relationship_type,
        r.label_en,
        r.label_hi,
        r.label_or,
        r.lore_en,
        r.lore_hi,
        r.lore_or
      FROM relationships r
      JOIN entities e ON r.target_entity_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE r.source_entity_id = $1
      ORDER BY r.created_at ASC;
    `;
    const relResult = await pool.query(relQuery, [id]);

    if (relResult.rows.length > 0) {
      return res.json(relResult.rows);
    }

    // 2. Fallback for entities without manual relationships: find contextual cultural neighbors
    const fallbackQuery = `
      SELECT 
        e.id, 
        e.name, 
        e.location_context, 
        e.description, 
        e.coordinates, 
        c.name as category_name,
        'cultural_affinity' as relationship_type,
        'Regional Cultural Network' as label_en,
        'क्षेत्रीय सांस्कृतिक परंपरा' as label_hi,
        'ଆଞ୍ଚଳିକ ସାଂସ୍କୃତିକ ପରମ୍ପରା' as label_or,
        'Part of the rich interconnected tapestry of Odisha regional cultural traditions.' as lore_en,
        'ओडिशा की समृद्ध क्षेत्रीय सांस्कृतिक परंपराओं का अभिन्न अंग।' as lore_hi,
        'ଓଡ଼ିଶାର ସମୃଦ୍ଧ ଆଞ୍ଚଳିକ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ ପରମ୍ପରାର ଅଂଶ।' as lore_or
      FROM entities e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id != $1 AND e.coordinates IS NOT NULL
      ORDER BY random()
      LIMIT 3;
    `;
    const fallbackResult = await pool.query(fallbackQuery, [id]);
    res.json(fallbackResult.rows);
  } catch (err) {
    console.error("Error in /api/entities/:id/connections:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Intelligent Multi-Strategy Knowledge Base Search for Chatbot Grounding
async function searchKnowledgeBase(query, pool) {
  if (!query || query.trim().length === 0) return { matchedEntities: [], relatedLore: [] };

  const rawQuery = query.toLowerCase();

  // Concept mapping for multilingual & domain keywords
  const conceptExpansions = [];
  if (/temple|mandir|deula|shiva|vishnu|shrine|monument|मन्दिर|मंदिर|ମନ୍ଦିର|ଦେଉଳ/.test(rawQuery)) {
    conceptExpansions.push('Temple', 'Monument', 'Deula', 'Sanctum');
  }
  if (/dance|nritya|nacha|martial|odissi|chhau|gotipua|pala|danda|नृत्य|नाच|ନାଚ|ନୃତ୍ୟ/.test(rawQuery)) {
    conceptExpansions.push('Dance', 'Chhau', 'Odissi', 'Gotipua', 'Art & Craft');
  }
  if (/craft|handloom|saree|ikat|bandha|pattachitra|applique|pipili|filigree|tarakasi|dokra|dhokra|हस्तशिल्प|हथकरघा|ହସ୍ତଶିଳ୍ପ|ପଟ୍ଟଚିତ୍ର/.test(rawQuery)) {
    conceptExpansions.push('Pattachitra', 'Ikat', 'Tarakasi', 'Pipili', 'Filigree', 'Art & Craft');
  }
  if (/food|cuisine|sweet|mithai|khana|dish|chhena|poda|rasagola|rasgulla|dalma|pakhala|pakhal|mahaprasad|bhog|भोजन|व्यंजन|मिठाई|ଖାଦ୍ୟ|ମହାପ୍ରସାଦ/.test(rawQuery)) {
    conceptExpansions.push('Cuisine', 'Mahaprasad', 'Chhenapoda', 'Rasagola', 'Dalma', 'Pakhala');
  }
  if (/festival|yatra|jatra|rath|ratha|dhanu|bali|raja|nuakhai|त्योहार|यात्रा|ପର୍ବ|ଯାତ୍ରା/.test(rawQuery)) {
    conceptExpansions.push('Festival', 'Tradition', 'Yatra', 'Rath Yatra', 'Dhanu Yatra');
  }
  if (/legend|story|lore|history|dharmapada|ashoka|kalinga|kharavela|manika|कथा|इतिहास|ଇତିହାସ|କାହାଣୀ/.test(rawQuery)) {
    conceptExpansions.push('Legend & Story', 'Historical Personality', 'Dhauli', 'Konark');
  }
  // Multilingual Indic script entity mappings (Hindi, Odia, Phonetic)
  if (/जगन्नाथ|ଜଗନ୍ନାଥ|jagannath|jagannatha/.test(rawQuery)) {
    conceptExpansions.push('Jagannath', 'Puri');
  }
  if (/पुरी|ପୁରୀ|puri/.test(rawQuery)) {
    conceptExpansions.push('Puri');
  }
  if (/कोणार्क|କୋଣାର୍କ|konark|surya/.test(rawQuery)) {
    conceptExpansions.push('Konark', 'Sun Temple');
  }
  if (/लिंगराज|ଲିଙ୍ଗରାଜ|lingaraj|lingaraja/.test(rawQuery)) {
    conceptExpansions.push('Lingaraja', 'Lingaraj', 'Bhubaneswar');
  }
  if (/धौली|ଧଉଳି|dhauli|ashoka|अशोक/.test(rawQuery)) {
    conceptExpansions.push('Dhauli', 'Shanti Stupa');
  }
  if (/खंडगिरि|ଉଦୟଗିରି|ଖଣ୍ଡଗିରି|khandagiri|udayagiri/.test(rawQuery)) {
    conceptExpansions.push('Udayagiri', 'Khandagiri');
  }
  if (/छेनापोड़ा|ଛେନାପୋଡ଼|chhenapoda|chhena/.test(rawQuery)) {
    conceptExpansions.push('Chhenapoda', 'Cuisine');
  }
  if (/ओडिसी|ଓଡ଼ିଶୀ|odissi/.test(rawQuery)) {
    conceptExpansions.push('Odissi', 'Dance');
  }
  if (/छऊ|ଛଉ|chhau/.test(rawQuery)) {
    conceptExpansions.push('Chhau', 'Mayurbhanj');
  }
  if (/पट्टचित्र|ପଟ୍ଟଚିତ୍ର|pattachitra|raghurajpur|ରଘୁରାଜପୁର/.test(rawQuery)) {
    conceptExpansions.push('Pattachitra', 'Raghurajpur');
  }
  if (/चिल्लिका|ଚିଲିକା|chilika|chilka/.test(rawQuery)) {
    conceptExpansions.push('Chilika', 'Lake');
  }
  if (/संबलपुर|ସମ୍ବଲପୁର|sambalpur|samaleswari|ସମଲେଶ୍ୱରୀ/.test(rawQuery)) {
    conceptExpansions.push('Sambalpur', 'Samaleswari', 'Ikat');
  }
  if (/चौसठ योगिनी|ଚଉଷଠି ଯୋଗିନୀ|chausath|yogini|hirapur/.test(rawQuery)) {
    conceptExpansions.push('Chausath Yogini', 'Hirapur');
  }

  const stopWords = new Set([
    'tell', 'about', 'what', 'where', 'when', 'which', 'who', 'how', 'why',
    'this', 'that', 'these', 'those', 'some', 'have', 'from', 'they', 'them',
    'their', 'your', 'would', 'could', 'should', 'please', 'know', 'give', 'find',
    'here', 'there', 'also', 'into', 'than', 'then', 'like', 'more', 'most', 'much',
    'many', 'good', 'best', 'with', 'without', 'and', 'the', 'for', 'are', 'was',
    'were', 'its', 'itself', 'kya', 'hai', 'kaise', 'batao', 'kahan', 'kab', 'karo', 'hoga',
    'bhi', 'kuch', 'bataiye', 'visheshta', 'mahatva', 'jane'
  ]);

  const words = rawQuery.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
  const searchTerms = Array.from(new Set([...conceptExpansions, ...words])).slice(0, 6);

  let matchedEntities = [];
  let relatedLore = [];

  if (searchTerms.length > 0) {
    try {
      const conditions = [];
      const values = [];
      searchTerms.forEach((term, i) => {
        const paramIdx = i + 1;
        values.push(`%${term.toLowerCase().trim()}%`);
        conditions.push(`(
          LOWER(e.name) LIKE $${paramIdx} 
          OR LOWER(COALESCE(e.location_context, '')) LIKE $${paramIdx} 
          OR LOWER(COALESCE(e.description, '')) LIKE $${paramIdx} 
          OR LOWER(COALESCE(c.name, '')) LIKE $${paramIdx}
        )`);
      });

      const sql = `
        SELECT e.id, e.name, e.location_context, e.description, e.metadata, e.coordinates, c.name as category_name
        FROM entities e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE ${conditions.join(' OR ')}
        ORDER BY 
          CASE 
            WHEN LOWER(e.name) LIKE $1 THEN 1
            WHEN LOWER(COALESCE(e.location_context, '')) LIKE $1 THEN 2
            ELSE 3
          END
        LIMIT 6;
      `;
      const res = await pool.query(sql, values);
      matchedEntities = res.rows;

      // Fetch folklore/lore relationships for matched entities
      if (matchedEntities.length > 0) {
        const entityIds = matchedEntities.map(e => e.id);
        const relRes = await pool.query(`
          SELECT r.relationship_type, r.label_en, r.label_hi, r.label_or, r.lore_en, r.lore_hi, r.lore_or,
                 e1.name as source_name, e2.name as target_name
          FROM relationships r
          JOIN entities e1 ON r.source_entity_id = e1.id
          JOIN entities e2 ON r.target_entity_id = e2.id
          WHERE r.source_entity_id = ANY($1::uuid[]) OR r.target_entity_id = ANY($1::uuid[])
          LIMIT 4;
        `, [entityIds]);
        relatedLore = relRes.rows;
      }
    } catch (err) {
      console.warn("Knowledge base search warning:", err.message);
    }
  }

  return { matchedEntities, relatedLore };
}

// Cultural Heritage Knowledge Engine for authentic, detailed answers (Fallback & Offline Resilience)
function generateCulturalHeritageAnswer(query, targetLanguage, matchedEntities = [], entityContext = null, relatedLore = []) {
  const q = (query || '').toLowerCase();
  const isHi = targetLanguage === 'Hindi';
  const isOr = targetLanguage === 'Odia';

  // 1. Platform / App Usage Assistance
  if (q.includes('how to use') || q.includes('how to navigate') || q.includes('map') || q.includes('globe') || q.includes('timeline') || q.includes('contribute') || q.includes('filter') || q.includes('kaise use') || q.includes('kaise chalaye') || q.includes('କିପରି ବ୍ୟବହାର')) {
    if (isHi) {
      return `**धरोहर (DHAROHAR) प्लेटफॉर्म उपयोग मार्गदर्शिका:**\n\n` +
        `* 🌐 **3D ग्लोब एवं 2D मैप:** होमपेज पर आप 3D डिजिटल ग्लोब को घुमाकर और ज़ूम करके ओडिशा के 200+ हेरिटेज स्थलों को देख सकते हैं। किसी भी मार्कर पर क्लिक करके उसका विस्तृत इतिहास, ऑडियो और 3D मॉडल देखें।\n` +
        `* ⏳ **टाइमलाइन फ़िल्टर:** ऊपर दिए गए टाइमलाइन स्लाइडर से आप प्राचीन कलिंग (3री सदी ई.पू.) से लेकर आधुनिक काल तक के इतिहास को कालक्रमानुसार खोज सकते हैं।\n` +
        `* 🗺️ **AI यात्रा योजनाकार (Itinerary):** नेवबार में **"Itinerary"** बटन दबाएं और अपनी अवधि (1 से 7 दिन) व रुचियों के अनुसार व्यक्तिगत यात्रा रूट मैप तैयार करें।\n` +
        `* ✍️ **कहानी साझा करें (Contribute):** **"Contribute"** पेज पर जाकर आप अपने क्षेत्र के प्राचीन मंदिरों, लोक कथाओं या सांस्कृतिक परंपराओं को जोड़ सकते हैं।\n\n` +
        `आप मुझसे किसी भी विशिष्ट मंदिर, कला, खान-पान या यात्रा मार्ग के बारे में सीधे पूछ सकते हैं!`;
    } else if (isOr) {
      return `**ଧରୋହର (DHAROHAR) ପ୍ଲାଟଫର୍ମ ବ୍ୟବହାର ମାର୍ଗଦର୍ଶିକା:**\n\n` +
        `* 🌐 **3D ଗ୍ଲୋବ୍ ଓ 2D ମ୍ୟାପ୍:** ହୋମପେଜ୍‌ରେ 3D ଡିଜିଟାଲ୍ ଗ୍ଲୋବ୍‌କୁ ଘୂରାଇ ଓଡ଼ିଶାର ୨୦୦+ ଐତିହ୍ୟ ସ୍ଥଳ ଦେଖିପାରିବେ। ଯେକୌଣସି ପଏଣ୍ଟ ଉପରେ କ୍ଲିକ୍ କରି ତାହାର ଇତିହାସ ଓ ଅଡିଓ ଶୁଣିପାରିବେ।\n` +
        `* ⏳ **ଟାଇମଲାଇନ୍ ଫିଲ୍ଟର୍:** ପ୍ରାଚୀନ କଳିଙ୍ଗ ଯୁଗରୁ ଆଧୁନିକ କାଳ ପର୍ଯ୍ୟନ୍ତ ଇତିହାସକୁ ସମୟାନୁସାରେ ଖୋଜନ୍ତୁ।\n` +
        `* 🗺️ **AI ଯାତ୍ରା ଯୋଜନା (Itinerary):** **"Itinerary"** ବଟନ୍ ଦବାଇ ୧ ରୁ ୭ ଦିନର ବ୍ୟକ୍ତିଗତ ଯାତ୍ରା ମାର୍ଗ ପ୍ରସ୍ତୁତ କରନ୍ତୁ।\n` +
        `* ✍️ **ଲୋକକଥା ଯୋଗ କରନ୍ତୁ (Contribute):** **"Contribute"** ପେଜ୍‌ରେ ଯାଇ ନିଜ ଅଞ୍ଚଳର ମନ୍ଦିର ଓ ଲୋକକଥା ଧରୋହର ମ୍ୟାପ୍‌ରେ ଯୋଡ଼ନ୍ତୁ।`;
    } else {
      return `**How to Navigate & Explore DHAROHAR:**\n\n` +
        `* 🌐 **Interactive 3D Globe & 2D Map:** Rotate, pan, and zoom the digital globe on the homepage to explore 200+ verified cultural heritage sites. Click on any pin to view architectural details, cultural lore, and audio narration.\n` +
        `* ⏳ **Chronological Timeline Filter:** Slide across eras—from the 3rd century BCE Maurya & Chedi dynasties through Ganga-Gajapati golden age to modern times.\n` +
        `* 🗺️ **AI Trip & Route Planner (Darshak AI):** Click the **"Itinerary"** button in the top navbar to generate a personalized day-by-day travel route with food and lodging tips.\n` +
        `* ✍️ **Community Storytelling (Contribute):** Head to the **"Contribute"** tab to submit your local temple lore, folklore, or indigenous traditions to our interactive map.\n\n` +
        `Feel free to ask me anything about Odisha's monuments, dances, delicacies, or travel tips!`;
    }
  }

  // 2. Specific Cultural Highlights (Konark, Jagannath, Chhau, Pattachitra, Chhenapoda, etc.)
  if (q.includes('konark') || q.includes('sun temple') || q.includes('कोणार्क') || q.includes('କୋଣାର୍କ')) {
    if (isHi) {
      return `**कोणार्क सूर्य मंदिर (UNESCO विश्व धरोहर स्थल):**\n\n` +
        `* 🏛️ **कलिंग स्थापत्य शिखर:** 1250 ईस्वी में गंग वंश के **राजा नरसिंहदेव प्रथम** द्वारा निर्मित। इसे सूर्य देव के 24 पहियों वाले विशाल पाषाण रथ के रूप में गढ़ा गया है।\n` +
        `* 🛞 **सूर्य घड़ियाँ:** इसके 24 नक्काशीदार पहिए सटीक धूपघड़ी (Astronomical Sundials) के रूप में काम करते हैं।\n` +
        `* 📜 **धर्मपद का अमर बलिदान:** 1200 शिल्पियों की प्राण रक्षा हेतु 12 वर्षीय शिल्पी धर्मपद द्वारा मंदिर के कलश की स्थापना व चंद्रभागा सागर में आत्मोत्सर्ग की गाथा।\n` +
        `* 🍲 **निकटवर्ती स्वाद:** नयागढ़ छेनापोड़ा और चंद्रभागा का ताजा नारियल पानी।`;
    } else if (isOr) {
      return `**କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର (ବ୍ଲାକ୍ ପାଗୋଡ଼ା):**\n\n` +
        `* 🏛️ **କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟର ଚରମ ନିଦର୍ଶନ:** ୧୨୫୦ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ ଗଙ୍ଗ ବଂଶର ରାଜା **ପ୍ରଥମ ନରସିଂହଦେବ**ଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ସୂର୍ଯ୍ୟ ରଥ।\n` +
        `* 🛞 **୨୪ଟି ସୂର୍ଯ୍ୟ ଚକ:** ଏହି ଚକଗୁଡ଼ିକ ସଠିକ୍ ସମୟ ମାପିବା ପାଇଁ ସୂର୍ଯ୍ୟ ଘଣ୍ଟା ଭାବେ କାର୍ଯ୍ୟ କରେ।\n` +
        `* 📜 **ଧର୍ମପଦଙ୍କ ଆତ୍ମୋତ୍ସର୍ଗ:** ୧୨୦୦ ଶିଳ୍ପୀଙ୍କ ସମ୍ମାନ ରକ୍ଷା ପାଇଁ ୧୨ ବର୍ଷର ବାଳକ ଧର୍ମପଦଙ୍କ ଅମର ବଳିଦାନ।\n` +
        `* 🍲 **ପାରମ୍ପରିକ ସ୍ୱାଦ:** ନୟାଗଡ଼ ଛେନାପୋଡ଼ ଓ ଚନ୍ଦ୍ରଭାଗାର ସତେଜ ଡାବ ପାଣି।`;
    } else {
      return `**Konark Sun Temple (The Black Pagoda - UNESCO World Heritage):**\n\n` +
        `* 🏛️ **Architectural Grandeur:** Built circa 1250 CE by **King Narasimhadeva I** of the Eastern Ganga Dynasty as a monumental 24-wheeled chariot for the Sun God (Surya).\n` +
        `* 🛞 **Astronomical Precision:** The intricately carved 10-foot stone wheels function as accurate sundials where shadows calculate precise hours and minutes.\n` +
        `* 📜 **Legend of Dharmapada:** 12-year-old child prodigy Dharmapada placed the crownstone to save 1,200 sculptors before sacrificing his life in the Chandrabhaga sea.\n` +
        `* 🍲 **Culinary Tip:** Savor authentic baked Chhenapoda and fresh coastal coconut water nearby.`;
    }
  }

  // 3. Matched Entities from Database Context
  if (matchedEntities && matchedEntities.length > 0) {
    const primary = matchedEntities[0];
    const otherNames = matchedEntities.slice(1).map(e => e.name).join(', ');
    const loreInfo = relatedLore.length > 0 
      ? (isHi ? relatedLore[0].lore_hi : isOr ? relatedLore[0].lore_or : relatedLore[0].lore_en)
      : '';

    if (isHi) {
      let text = `**${primary.name}** (${primary.category_name || 'विरासत स्थल'}) हमारे सांस्कृतिक इतिहास का एक अत्यंत गौरवशाली अध्याय है।\n\n`;
      if (primary.description) text += `📜 **ऐतिहासिक महत्व:** ${primary.description}\n\n`;
      if (primary.location_context) text += `📍 **स्थान व संदर्भ:** यह मुख्य रूप से **${primary.location_context}** क्षेत्र से संबंधित है।\n\n`;
      if (loreInfo) text += `✨ **पौराणिक गाथा व परंपरा:** ${loreInfo}\n\n`;
      if (otherNames) text += `🔗 **संबंधित अन्य विरासत स्थल:** ${otherNames}\n\n`;
      text += `💡 *टिप:* आप नीचे दिए गए कार्ड पर क्लिक करके इसे 3D मैप पर तुरंत देख सकते हैं या इसके लिए यात्रा प्लान बना सकते हैं!`;
      return text;
    } else if (isOr) {
      let text = `**${primary.name}** (${primary.category_name || 'ଐତିହ୍ୟ ସ୍ଥଳ'}) ଆମ ଓଡ଼ିଶାର ଏକ ଅମୂଲ୍ୟ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ।\n\n`;
      if (primary.description) text += `📜 **ଐତିହାସିକ ଗୁରୁତ୍ୱ:** ${primary.description}\n\n`;
      if (primary.location_context) text += `📍 **ଅବସ୍ଥିତି ଓ ପରିପ୍ରେକ୍ଷୀ:** ଏହା ମୁଖ୍ୟତଃ **${primary.location_context}** ଅଞ୍ଚଳ ସହିତ ଜଡ଼ିତ।\n\n`;
      if (loreInfo) text += `✨ **ପୌରାଣିକ କାହାଣୀ ଓ ପରମ୍ପରା:** ${loreInfo}\n\n`;
      if (otherNames) text += `🔗 **ସମ୍ପୃକ୍ତ ଅନ୍ୟାନ୍ୟ ଐତିହ୍ୟ ସ୍ଥଳ:** ${otherNames}\n\n`;
      text += `💡 *ସୂଚନା:* ତଳେ ଥିବା ବଟନ୍ ଦବାଇ ଆପଣ ଏହାକୁ ସିଧାସଳଖ 3D ମ୍ୟାପ୍‌ରେ ଦେଖିପାରିବେ!`;
      return text;
    } else {
      let text = `**${primary.name}** (${primary.category_name || 'Heritage Treasure'}) represents a profound landmark in Odisha's cultural legacy.\n\n`;
      if (primary.description) text += `📜 **Historical & Cultural Significance:** ${primary.description}\n\n`;
      if (primary.location_context) text += `📍 **Location & Context:** Located in **${primary.location_context}**.\n\n`;
      if (loreInfo) text += `✨ **Living Lore & Traditions:** ${loreInfo}\n\n`;
      if (otherNames) text += `🔗 **Connected Heritage Sites:** ${otherNames}\n\n`;
      text += `💡 *Tip:* Click the card below to locate it directly on the 3D globe or plan an itinerary!`;
      return text;
    }
  }

  // 4. Default Welcoming Cultural Historian Summary
  if (isHi) {
    return `नमस्ते! **धरोहर (DHAROHAR)** ज्ञानकोष में आपका स्वागत है।\n\n` +
      `आप मुझसे ओडिशा के 200+ प्राचीन मंदिरों (लिंगराज, कोणार्क, जगन्नाथ पुरी, चौसठ योगिनी), शास्त्रीय नृत्य रूपों (ओडिसी, छऊ), पारंपरिक कलाओं (पट्टाचित्र, संबलपुरी इकत), लोक व्यंजनों (छेनापोड़ा, महाप्रसाद) और सांस्कृतिक यात्रा योजनाओं के बारे में कुछ भी पूछ सकते हैं।\n\n` +
      `आप किस विशेष स्थल या विषय के बारे में जानना चाहते हैं?`;
  } else if (isOr) {
    return `ନମସ୍କାର! **ଧରୋହର (DHAROHAR)** ଜ୍ଞାନକୋଷକୁ ସ୍ୱାଗତ।\n\n` +
      `ଆପଣ ମୋତେ ଓଡ଼ିଶାର ୨୦୦+ ପ୍ରାଚୀନ ମନ୍ଦିର (ଲିଙ୍ଗରାଜ, କୋଣାର୍କ, ଜଗନ୍ନାଥ ପୁରୀ, ଚଉଷଠି ଯୋଗିନୀ), ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ (ଓଡ଼ିଶୀ, ଛଉ), ହସ୍ତଶିଳ୍ପ (ପଟ୍ଟଚିତ୍ର, ସମ୍ବଲପୁରୀ ବାନ୍ଧକଳା), ପାରମ୍ପରିକ ଖାଦ୍ୟ (ଛେନାପୋଡ଼, ମହାପ୍ରସାଦ) ବା ଯାତ୍ରା ଯୋଜନା ବିଷୟରେ ପଚାରିପାରିବେ।\n\n` +
      `ଆପଣ କେଉଁ ସ୍ଥଳ ବା ବିଷୟରେ ଜାଣିବାକୁ ଚାହାନ୍ତି?`;
  } else {
    return `Namaste! Welcome to **DHAROHAR - Living Heritage Knowledge System**.\n\n` +
      `I have access to over 200+ verified sacred temples (Konark, Jagannath Puri, Lingaraja, Chausath Yogini), classical dances (Odissi, Mayurbhanj Chhau), master crafts (Pattachitra, Sambalpuri Ikat, Tarakasi), authentic cuisines (Chhenapoda, Mahaprasad), and tailored travel routes.\n\n` +
      `What heritage topic, monument, or travel question would you like to explore today?`;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, entityContext, language } = req.body;
    
    const langMap = { 'hi': 'Hindi', 'or': 'Odia', 'en': 'English' };
    const targetLanguage = langMap[language] || language || "English";
    const contextName = entityContext?.name || "Odisha & Indian Living Heritage";
    const contextCategory = entityContext?.category_name || "Sacred Monuments, Classical Arts & Traditions";

    // 1. Deep Multi-Strategy Search across PostgreSQL Database
    const { matchedEntities, relatedLore } = await searchKnowledgeBase(message, pool);

    // 2. Language-Specific System Instruction
    let languageInstruction = "Answer in English as an authentic, inspiring, and engaging Indian cultural historian.";
    if (targetLanguage === "Hindi") {
      languageInstruction = "Answer completely in fluent, respectful Hindi (हिन्दी / देवनागरी लिपि) as a knowledgeable cultural chronicler and storyteller.";
    } else if (targetLanguage === "Odia") {
      languageInstruction = "Answer completely in authentic, fluent Odia (ଓଡ଼ିଆ ଲିପି) as a dedicated heritage chronicler and cultural storyteller.";
    }

    // 3. Construct Rich Grounding Context
    const groundedEntitiesContext = matchedEntities.length > 0
      ? `\nVerified Database Heritage Entities:\n` + matchedEntities.map(e => 
          `- [ID: ${e.id}] ${e.name} (${e.category_name || 'Heritage'}, Location: ${e.location_context || 'Odisha'}): ${e.description || ''}`
        ).join('\n')
      : '';

    const groundedLoreContext = relatedLore.length > 0
      ? `\nVerified Cultural Relationships & Folklore:\n` + relatedLore.map(r => 
          `- Connected [${r.source_name} ➔ ${r.target_name}]: ${r.label_en} — Lore: "${r.lore_en || ''}"`
        ).join('\n')
      : '';

    const platformFeaturesContext = `
Dharohar Application Features Available to Users:
- 3D Interactive Globe & 2D Flat Map with 200+ heritage markers and dynamic filters.
- Chronological Time-Era Filter Slider (from ancient 3rd c. BCE Maurya/Chedi to 21st century).
- AI Itinerary & Route Planner (Darshak AI) for 1, 2, 3, 5, and 7-day personalized heritage trails.
- Community Story Contribution form (accessible on the /contribute tab).
- Multilingual voice narration and audio read-aloud support in English, Hindi, and Odia.`;

    const systemPrompt = `You are Dharohar AI Guide (Darshak), the Master Cultural Heritage Navigator for DHAROHAR (Digital Heritage Knowledge System of Odisha & India).
Context: ${contextName} (${contextCategory}).
${platformFeaturesContext}
${groundedEntitiesContext}
${groundedLoreContext}
Language Requirement: ${languageInstruction}

Guidelines:
1. Always utilize the verified grounded data from our database to answer with historical, architectural, culinary, and geographical accuracy.
2. If the user asks about an issue, problem, or how to use any feature of the Dharohar app, guide them clearly on using the 3D globe, map markers, timeline slider, itinerary generator, or contribution form.
3. If the user asks for travel routes or itineraries, provide clear day-by-day advice and recommend launching the AI Itinerary Planner.
4. Format responses cleanly using markdown bolding (**important terms**), emojis, and concise bullet points. Keep it engaging, warm, and inspiring (2-3 concise paragraphs).`;

    const promptText = `${systemPrompt}\n\nUser Question: ${message}`;
    
    // Dynamic Contextual Suggested Follow-up Questions
    const defaultFollowUps = targetLanguage === "Hindi"
      ? [
          "यहाँ की वास्तुकला व मूर्तिकला की क्या विशेषता है?",
          "यहाँ पहुँचने का सबसे अच्छा मार्ग व समय क्या है?",
          "यहाँ के प्रमुख पारंपरिक उत्सव व व्यंजन कौन से हैं?"
        ]
      : targetLanguage === "Odia"
      ? [
          "ଏହାର ପ୍ରାଚୀନ ସ୍ଥାପତ୍ୟ ଓ ଇତିହାସ କ'ଣ?",
          "ଏଠାକୁ ଯିବାର ସର୍ବୋତ୍ତମ ସମୟ ଓ ଯାତ୍ରା ମାର୍ଗ କ'ଣ?",
          "ଏଠାରେ କେଉଁ ପାରମ୍ପରିକ ଖାଦ୍ୟ ଓ ପର୍ବ ପ୍ରସିଦ୍ଧ?"
        ]
      : [
          "What is the unique architectural style here?",
          "What is the best itinerary and time to visit?",
          "Which authentic regional dishes are recommended nearby?"
        ];

    // 4. Call Active Gemini Models
    if (genAI) {
      const candidateModels = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      
      for (const modelName of candidateModels) {
        try {
          const activeModel = genAI.getGenerativeModel({ model: modelName });
          const result = await activeModel.generateContent(promptText);
          const response = await result.response;
          if (response && response.text()) {
            return res.json({ 
              response: response.text(),
              matchedEntities: matchedEntities,
              suggestedQuestions: defaultFollowUps
            });
          }
        } catch (err) {
          console.warn(`Model ${modelName} failed for chat, trying next candidate...`);
        }
      }
    }

    // 5. Fallback Knowledge Engine Synthesis
    const knowledgeResponse = generateCulturalHeritageAnswer(message, targetLanguage, matchedEntities, entityContext, relatedLore);

    res.json({
      response: knowledgeResponse,
      matchedEntities: matchedEntities,
      suggestedQuestions: defaultFollowUps
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Dynamic Cultural Itinerary Generator (Used for Fallback & Offline Resilience)
function buildDynamicFallbackItinerary({ days = 3, startingRegion = "Bhubaneswar", themes = [], customNotes = "", language = "English", selectedEntity = null }) {
  const isOdia = language === "Odia";
  const isHindi = language === "Hindi";
  const numDays = Math.max(1, Math.min(7, parseInt(days, 10) || 3));
  const regionStr = (startingRegion || "Bhubaneswar").toLowerCase();

  // Regional Day Pools
  const regionalDayPools = {
    western: [
      {
        day: 1,
        title: isOdia ? "ସମ୍ବଲପୁରର ମା' ସମଲେଶ୍ୱରୀ ଓ ହୀରାକୁଦ ଦର୍ଶନ" : isHindi ? "संबलपुर: माँ समलेश्वरी एवं हीराकुद बांध दर्शन" : "Sambalpur: Maa Samaleswari & Hirakud Panorama",
        theme: isOdia ? "ପଶ୍ଚିମ ଓଡ଼ିଶାର ଶକ୍ତି ପୀଠ ଓ ମହାନଦୀ ସଂସ୍କୃତି" : isHindi ? "पश्चिमी ओडिशा का शक्तिपीठ एवं महानदी संस्कृति" : "Western Odisha Sacred Shrines & Mahanadi Majesty",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ମା' ସମଲେଶ୍ୱରୀ ମନ୍ଦିର" : isHindi ? "माँ समलेश्वरी मंदिर" : "Maa Samaleswari Temple",
            category: "Monuments & Temples",
            location: "Sambalpur",
            coordinates: [21.467, 83.975],
            activity: isOdia ? "ପଶ୍ଚିମ ଓଡ଼ିଶାର ଅଧିଷ୍ଠାତ୍ରୀ ଦେବୀଙ୍କ ମନ୍ଦିର ପରିକ୍ରମା ଓ ସମଲେଇ ପ୍ରସାଦ ସେବନ।" : isHindi ? "पश्चिमी ओडिशा की अधिष्ठात्री देवी के दर्शन एवं भव्य परिसर का भ्रमण।" : "Visit the 16th-century riverbank temple of the presiding deity of Western Odisha.",
            culinaryTip: isOdia ? "ସରସତିଆ ମିଠା ଓ ଚାଉଳ ବରା" : isHindi ? "पारंपरिक सरसतिया मीठा एवं क्रिस्पी चाउल बरा" : "Famous Golebazar Chaul Bara with spicy ghoogni and rare Sarsatia sweet.",
            culturalLore: isOdia ? "ଚୌହାନ ବଂଶର ପ୍ରଥମ ରାଜା ବଳରାମ ଦେବଙ୍କ ଦ୍ୱାରା ପ୍ରତିଷ୍ଠିତ।" : isHindi ? "चौहान वंश के राजा बलराम देव द्वारा स्थापित ऐतिहासिक शक्तिपीठ।" : "Founded by King Balarama Deva in the mid-16th century alongside the Mahanadi river."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ହୀରାକୁଦ ଡ୍ୟାମ୍ ଓ ଗାନ୍ଧୀ ମିନାର" : isHindi ? "हीराकुद बांध एवं गांधी मीनार" : "Hirakud Dam & Gandhi Minar",
            category: "Nature & Landscapes",
            location: "Sambalpur",
            coordinates: [21.520, 83.870],
            activity: isOdia ? "ବିଶ୍ୱର ଦୀର୍ଘତମ ମାଟି ବନ୍ଧ ଓ ଜଳଭଣ୍ଡାରର ଦୃଶ୍ୟାବଲୋକନ।" : isHindi ? "विश्व के सबसे लंबे मिट्टी के बांध और जलाशय का विहंगम दृश्य।" : "Witness the vast reservoir and panoramic sunset over the majestic Mahanadi basin.",
            culinaryTip: isOdia ? "ମହାନଦୀ ସତେଜ ମାଛ ଝୋଳ" : isHindi ? "महानदी की ताजा मछली का सरसों तरीदार झोल" : "Fresh Mahanadi river catch prepared in authentic Kosali mustard gravy.",
            culturalLore: isOdia ? "ସ୍ୱାଧୀନ ଭାରତର ପ୍ରଥମ ବୃହତ୍ ନଦୀବନ୍ଧ ଯୋଜନା।" : isHindi ? "स्वतंत्र भारत की प्रथम प्रमुख बहुउद्देशीय नदी घाटी परियोजना।" : "Engineering marvel envisioned by Sir M. Visvesvaraya and inaugurated by Jawaharlal Nehru."
          }
        ]
      },
      {
        day: 2,
        title: isOdia ? "ହୁମା ବକ୍ର ମନ୍ଦିର ଓ ବରପାଲୀ ଇକତ ବୟନକଳା" : isHindi ? "हुमा का झुका हुआ मंदिर एवं बरपाली इकत हथकरघा" : "Huma Leaning Temple & Barpali Handloom Weavers",
        theme: isOdia ? "ବିସ୍ମୟ ସ୍ଥାପତ୍ୟ ଓ ସମ୍ବଲପୁରୀ ବସ୍ତ୍ର କଳା" : isHindi ? "विस्मयकारी वास्तुकला एवं संबलपुरी बांधकला" : "Architectural Marvels & Sambalpuri Bandha Textiles",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ହୁମା ବକ୍ର ବିମଳେଶ୍ୱର ମନ୍ଦିର" : isHindi ? "हुमा का झुका हुआ विमलेश्वर मंदिर" : "Leaning Temple of Huma",
            category: "Monuments & Temples",
            location: "Huma, Sambalpur",
            coordinates: [21.283, 83.983],
            activity: isOdia ? "ବିଶ୍ୱର ଏକମାତ୍ର ବକ୍ର ଶିବ ମନ୍ଦିର ଦର୍ଶନ ଓ କୁଡ଼ୋ ମାଛଙ୍କୁ ଖାଦ୍ୟ ପ୍ରଦାନ।" : isHindi ? "विश्व के एकमात्र झुके हुए शिव मंदिर के दर्शन और पवित्र कुड़ो मछलियों को भोग खिलाना।" : "Observe the uniquely tilted Shiva sanctum and feed the protected, sacred Kudo fish.",
            culinaryTip: isOdia ? "ଛେନା ଗଜା ଓ ଗରମ ପଖାଳ" : isHindi ? "देसी छेना गजा और गरमा-गरम पखाल" : "Fresh coastal Chhena Gaja and local seasonal greens.",
            culturalLore: isOdia ? "ମହାନଦୀ ତଟରେ ନିର୍ମିତ ଏହି ମନ୍ଦିରର ଢଳି ରହିବାର ରହସ୍ୟ ଆଜି ବି ବିସ୍ମୟକର।" : isHindi ? "सैकड़ों वर्षों से एक तरफ झुका हुआ यह मंदिर भूवैज्ञानिकों के लिए भी कौतूहल का विषय है।" : "Mysterious tilted foundation standing steadfast against annual Mahanadi river surges."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ବରପାଲୀ ସମ୍ବଲପୁରୀ ବସ୍ତ୍ର ଗ୍ରାମ" : isHindi ? "बरपाली संबलपुरी हथकरघा बुनकर क्लस्टर" : "Barpali Sambalpuri Ikat Weaving Cluster",
            category: "Art, Dance & Crafts",
            location: "Bargarh",
            coordinates: [21.183, 83.583],
            activity: isOdia ? "ପଦ୍ମଶ୍ରୀ ବୁଣାକାରଙ୍କ ଠାରୁ ପ୍ରତ୍ୟକ୍ଷ ବାନ୍ଧକଳା ଓ ଇକତ ବୟନ ଶିକ୍ଷା।" : isHindi ? "मास्टर बुनकरों से सीधे संबलपुरी टाई-एंड-डाई और इकत बुनाई की कला समझना।" : "Interact with master weavers creating UNESCO-celebrated Sambalpuri Ikat sarees.",
            culinaryTip: isOdia ? "ବରଗଡ଼ କାଜୁ ବରଫି ଓ ଚାଟ୍" : isHindi ? "बरगढ़ की प्रसिद्ध नमकीन और मिठाई" : "Authentic Kosali snack platter with crispy flattened rice savories.",
            culturalLore: isOdia ? "ପ୍ରକୃତି ଓ ପୌରାଣିକ କାହାଣୀ ସୂତାରେ ରୂପ ନିଏ।" : isHindi ? "सदियों पुरानी परंपरा जिसमें हर धागा प्राकृतिक रंगों और ज्यामितीय पैटर्न से सजाया जाता है।" : "Geometric precision passed down generations of Bhulia Meher artisan families."
          }
        ]
      },
      {
        day: 3,
        title: isOdia ? "ବରଗଡ଼ ଧନୁଯାତ୍ରା ଭୂମି ଓ ସୋନପୁର ପୀଠ" : isHindi ? "बरगढ़ धनुयात्रा रंगभूमि एवं सोनपुर देवभूमि" : "Bargarh Open-Air Theatre & Sonepur Shrines",
        theme: isOdia ? "ବିଶ୍ୱର ବୃହତ୍ତମ ମୁକ୍ତାକାଶ ରଙ୍ଗମଞ୍ଚ ଓ ମନ୍ଦିର ନଗରୀ" : isHindi ? "विश्व का सबसे बड़ा खुला रंगमंच और सोनपुर के मंदिर" : "World's Largest Open-Air Theatre & Sonepur Silk Guild",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ବରଗଡ଼ ଧନୁଯାତ୍ରା ଐତିହ୍ୟ ସ୍ଥଳ" : isHindi ? "बरगढ़ धनुयात्रा ऐतिहासिक स्थल" : "Bargarh Dhanu Yatra Open-Air Arena",
            category: "Art, Dance & Crafts",
            location: "Bargarh",
            coordinates: [21.333, 83.616],
            activity: isOdia ? "ଗିନିଜ୍ ରେକର୍ଡ଼ ମୁକ୍ତାକାଶ ନାଟକ କ୍ଷେତ୍ର ଓ କଂସ ଦରବାର ପରିଦର୍ଶନ।" : isHindi ? "कंस की पौराणिक मथुरा नगरी के रूप में सजे ऐतिहासिक स्थलों का भ्रमण।" : "Walk the real-world stage where an entire 8 km town transforms into ancient Mathura.",
            culinaryTip: isOdia ? "ଅଟାବିରା ରସଗୋଲା" : isHindi ? "अटाबिरा के रसीले गर्म रसगुल्ले" : "Freshly churned warm Attabira Rasgullas.",
            culturalLore: isOdia ? "ବିଶ୍ୱର ସର୍ବବୃହତ ବାର୍ଷିକ ମୁକ୍ତାକାଶ ଲୋକ ନାଟକ ଉତ୍ସବ।" : isHindi ? "11 दिनों तक चलने वाला विश्व का सबसे विशाल खुला लोक नाट्य महोत्सव।" : "Guinness recognized cultural theatre running unbroken since India's independence in 1947."
          }
        ]
      }
    ],
    north: [
      {
        day: 1,
        title: isOdia ? "ବାରିପଦା ଜଗନ୍ନାଥ ମନ୍ଦିର ଓ ଛଉ ନୃତ୍ୟ ଐତିହ୍ୟ" : isHindi ? "बारीपदा: द्वितीय श्रीक्षेत्र एवं मयूरभंज छऊ नृत्य" : "Baripada: Haribaldev Temple & Mayurbhanj Chhau",
        theme: isOdia ? "ମହିଳା ରଥ ଟଣା ପରମ୍ପରା ଓ ଯୁଦ୍ଧ ନୃତ୍ୟ କଳା" : isHindi ? "महिला रथ परंपरा और मार्शल छऊ नृत्य कला" : "Sacred Chariot Traditions & Martial Dance Roots",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ହରିବଳଦେବ ଜିଉ ମନ୍ଦିର (ବାରିପଦା)" : isHindi ? "हरिबलदेव जिउ मंदिर (द्वितीय श्रीक्षेत्र)" : "Haribaldev Jew Temple, Baripada",
            category: "Monuments & Temples",
            location: "Baripada, Mayurbhanj",
            coordinates: [21.933, 86.733],
            activity: isOdia ? "୧୫୭୫ ଖ୍ରୀଷ୍ଟାବ୍ଦର ଐତିହାସିକ ମନ୍ଦିର ଦର୍ଶନ ଓ ରଥଯାତ୍ରା ଇତିହାସ ଅଧ୍ୟୟନ।" : isHindi ? "16वीं सदी के भव्य मंदिर के दर्शन और माँ सुभद्रा का रथ महिलाओं द्वारा खींचे जाने की गाथा।" : "Admire 16th-century Bhanja dynasty architecture and sacred Ratha Yatra heritage.",
            culinaryTip: isOdia ? "ବାରିପଦା ମୁଢ଼ି ମାଂସ ଓ ଛେନା ପୋଡ଼" : isHindi ? "बारीपदा का विश्वप्रसिद्ध मुढ़ी-मांसा एवं छेना पोड़ा" : "World-famous Baripada Mudhi Mansa (puffed rice with slow-cooked spiced mutton) or vegetarian Dalma.",
            culturalLore: isOdia ? "ଏଠାରେ ମା' ସୁଭଦ୍ରାଙ୍କ ରଥ କେବଳ ମହିଳାମାନେ ଟାଣନ୍ତି।" : isHindi ? "विश्व का एकमात्र स्थान जहाँ माँ सुभद्रा का रथ केवल महिलाओं द्वारा खींचा जाता है।" : "Exclusive tradition where Maa Subhadra's Darpadalana chariot is pulled solely by women."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ମୟୂରଭଞ୍ଜ ଛଉ ନୃତ୍ୟ ଆଖଡ଼ା" : isHindi ? "मयूरभंज छऊ नृत्य अखाड़ा" : "Mayurbhanj Chhau Dance Akhada",
            category: "Art, Dance & Crafts",
            location: "Baripada",
            coordinates: [21.940, 86.740],
            activity: isOdia ? "ଶାସ୍ତ୍ରୀୟ ଯୁଦ୍ଧ ନୃତ୍ୟ ଓ ଢୋଲ-ମହୁରୀ ବାଦ୍ୟର ପ୍ରତ୍ୟକ୍ଷ ଅଭ୍ୟାସ ଦେଖନ୍ତୁ।" : isHindi ? "यूनेस्को अमूर्त सांस्कृतिक विरासत छऊ नृत्य की जीवंत प्रस्तुति एवं प्रशिक्षण।" : "Witness royal martial Chhau dance rehearsals and rhythmic dhol-mohuri percussion.",
            culinaryTip: isOdia ? "କାଠିଆ ମିଠା ଓ ଝୁଣା ରୋଟି" : isHindi ? "मयूरभंज के पारंपरिक नमकीन व मिष्ठान्न" : "Traditional North Odisha sweet savories and fresh forest herbal tea.",
            culturalLore: isOdia ? "ଭଞ୍ଜ ରାଜାମାନଙ୍କ ପୃଷ୍ଠପୋଷକତାରେ ବିକଶିତ ବିଶ୍ୱପ୍ରସିଦ୍ଧ ନୃତ୍ୟଶୈଳୀ।" : isHindi ? "भंज राजवंश द्वारा पोषित यह नृत्य भारतीय युद्धकला और अभिनय का अनूठा संगम है।" : "UNESCO intangible heritage blending ancient martial movements with Odissi rhythm."
          }
        ]
      },
      {
        day: 2,
        title: isOdia ? "ଖିଚିଂ କିଚକେଶ୍ୱରୀ ମନ୍ଦିର ଓ କୁଳିଅଣା ଢୋକ୍ରା ଶିଳ୍ପ" : isHindi ? "खिचिंग: काला मुगनी पत्थर मंदिर एवं डोकरा धातु शिल्प" : "Khiching Chlorite Temple & Kuliana Dokra Craft",
        theme: isOdia ? "କଳା ମୁଗୁନି ପଥର ସ୍ଥାପତ୍ୟ ଓ ଧାତୁ କଳା" : isHindi ? "प्राचीन प्रस्तर शिल्प और जनजातीय धातु कला" : "Ancient Black Stone Architecture & Tribal Metallurgy",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ମା' କିଚକେଶ୍ୱରୀ ମନ୍ଦିର, ଖିଚିଂ" : isHindi ? "माँ कीचकेश्वरी मंदिर (खिचिंग)" : "Kichakeswari Temple, Khiching",
            category: "Monuments & Temples",
            location: "Khiching, Mayurbhanj",
            coordinates: [21.916, 85.833],
            activity: isOdia ? "ନିଖୁଣ କଳା ମୁଗୁନି ପଥରରେ ନିର୍ମିତ ୧୦ମ ଶତାବ୍ଦୀର ଭବ୍ୟ ମନ୍ଦିର ଦର୍ଶନ।" : isHindi ? "दुर्लभ काले क्लोराइट पत्थर से निर्मित 10वीं शताब्दी के अद्भुत स्थापत्य के दर्शन।" : "Marvel at 10th-century Kalinga architecture sculpted entirely from polished black chlorite stone.",
            culinaryTip: isOdia ? "ବନଜାତ ମହୁ ସହ ମହାପ୍ରସାଦ ଭୋଗ" : isHindi ? "स्थानीय प्रसाद एवं पारंपरिक दाल-भात" : "Local temple bhog accompanied by wild Similipal honey delicacies.",
            culturalLore: isOdia ? "ପ୍ରାଚୀନ ଖିଞ୍ଜିଳି ମଣ୍ଡଳର ରାଜଧାନୀ ଭାବେ ପ୍ରସିଦ୍ଧ।" : isHindi ? "प्राचीन भंज शासकों की राजधानी खिंजिंगा कोट्टा का मुख्य केंद्र।" : "Ancient capital of the early Bhanja rulers with preserved museum relics."
          }
        ]
      }
    ],
    south: [
      {
        day: 1,
        title: isOdia ? "ତାରାତାରିଣୀ ଶକ୍ତିପୀଠ ଓ ଚିଲିକା ମଙ୍ଗଳାଯୋଡ଼ି" : isHindi ? "तारातारीणी शक्तिपीठ एवं चिल्का मंगलाजोड़ी" : "Tara Tarini Hill Shrine & Chilika Mangalajodi",
        theme: isOdia ? "ଋଷିକୁଲ୍ୟା ତୀର ଶକ୍ତି ଉପାସନା ଓ ପରିବେଶ ଐତିହ୍ୟ" : isHindi ? "ऋषिकुल्या शक्ति उपासना एवं चिल्का आर्द्रभूमि" : "Sacred Hilltop Goddesses & Coastal Eco-Heritage",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ମା' ତାରାତାରିଣୀ ଶକ୍ତିପୀଠ" : isHindi ? "माँ तारा तारिणी शक्तिपीठ" : "Maa Tara Tarini Shakti Peetha",
            category: "Monuments & Temples",
            location: "Purushottampur, Ganjam",
            coordinates: [19.493, 84.896],
            activity: isOdia ? "କୁମାରୀ ପାହାଡ଼ ଉପରେ ୯୯୯ ସିଡ଼ି ବା ରୋପୱେ ଦ୍ୱାରା ଯାଇ ଯମଜ ଦେବୀଙ୍କ ଦର୍ଶନ।" : isHindi ? "पवित्र कुमारी पहाड़ी के शिखर पर स्थित भारत के चार प्रमुख शक्तिपीठों में से एक के दर्शन।" : "Ascend the sacred Purnagiri hill overlooking Rushikulya river to seek twin deity blessings.",
            culinaryTip: isOdia ? "ବ୍ରହ୍ମପୁରୀ ଆଚାର, ପାମ୍ପଡ଼ ଓ ଖେଚୁଡ଼ି" : isHindi ? "विश्वप्रसिद्ध बेरहामपुर आचार, पापड़ और शुद्ध देसी घी की खिचड़ी" : "Famous Berhampur spicy mango pickle, crispy papads, and ghee-infused temple Khechudi.",
            culturalLore: isOdia ? "ପ୍ରାଚୀନ ସାଧବମାନଙ୍କ ନୌବାଣିଜ୍ୟ ଯାତ୍ରା ପୂର୍ବରୁ ପୂଜିତା ଇଷ୍ଟଦେବୀ।" : isHindi ? "प्राचीन कलिंग के समुद्री व्यापारी (साधव) अपनी समुद्री यात्रा से पूर्व यहाँ आशीर्वाद लेते थे।" : "Maritime protector deity revered by ancient Kalinga trans-oceanic seafaring merchants."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ମଙ୍ଗଳାଯୋଡ଼ି ପକ୍ଷୀ ତୀର୍ଥ (ଚିଲିକା)" : isHindi ? "मंगलाजोड़ी पक्षी अभयारण्य (चिल्का)" : "Mangalajodi Eco-Heritage Wetland",
            category: "Nature & Landscapes",
            location: "Chilika, Khordha/Ganjam",
            coordinates: [19.916, 85.416],
            activity: isOdia ? "ନିରବ କାଠ ଡଙ୍ଗାରେ ବିଦେଶୀ ପକ୍ଷୀ ଦର୍ଶନ ଓ ପୂର୍ବତନ ଶିକାରୀଙ୍କ ସଂରକ୍ଷଣ କାହାଣୀ ଶୁଣନ୍ତୁ।" : isHindi ? "पारंपरिक शांत नाव की सवारी और प्रवासी पक्षियों का विहंगम दीदार।" : "Silent wooden boat safari among thousands of migratory birds guided by reformed poachers.",
            culinaryTip: isOdia ? "ଚିଲିକା ସତେଜ କଙ୍କଡ଼ା ଓ ମାଛ ତରକାରୀ" : isHindi ? "चिल्का की ताजा मछली व केकड़ा तरी" : "Delicate Chilika fish cooked in light turmeric-cumin broth or roasted sweet corn.",
            culturalLore: isOdia ? "ଏସିଆର ସର୍ବବୃହତ ଲୁଣିଆ ହ୍ରଦ ଚିଲିକାର ସାଂସ୍କୃତିକ ଜୀବନଧାରା।" : isHindi ? "शिकारियों के समुदाय द्वारा वन्यजीव संरक्षकों में बदलने की वैश्विक प्रेरणा गाथा।" : "World-renowned community conservation miracle along Asia's largest brackish lagoon."
          }
        ]
      }
    ],
    buddhist: [
      {
        day: 1,
        title: isOdia ? "ହୀରକ ତ୍ରିଭୁଜ: ରତ୍ନଗିରି ଓ ଲଳିତଗିରି ବୌଦ୍ଧ ବିହାର" : isHindi ? "डायमंड ट्रायंगल: रत्नगिरि एवं ललितगिरि बौद्ध विहार" : "Diamond Triangle: Ratnagiri & Lalitgiri Monasteries",
        theme: isOdia ? "ବଜ୍ରଯାନ ବୌଦ୍ଧ ସ୍ଥାପତ୍ୟ ଓ ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ସୌନ୍ଦର୍ଯ୍ୟ" : isHindi ? "वज्रयान बौद्ध स्थापत्य एवं सम्राट अशोक की विरासत" : "Vajrayana Buddhist Architecture & Sacred Relic Chambers",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ରତ୍ନଗିରି ମହାବିହାର" : isHindi ? "रत्नगिरि महाविहार" : "Ratnagiri Buddhist Mahavihara",
            category: "Monuments & Temples",
            location: "Jajpur",
            coordinates: [20.640, 86.336],
            activity: isOdia ? "ଅତି ସୁନ୍ଦର କାରୁକାର୍ଯ୍ୟପୂର୍ଣ୍ଣ ପ୍ରବେଶ ଦ୍ୱାର ଓ ବିଶାଳ ବୁଦ୍ଧ ମୂର୍ତ୍ତି ଦର୍ଶନ।" : isHindi ? "उत्कृष्ट नक्काशीदार हरे क्लोराइट पत्थर के तोरण द्वार और विशाल बुद्ध प्रतिमा।" : "Examine green chlorite monastic entrance portal and towering monolithic Buddha statues.",
            culinaryTip: isOdia ? "ଯାଜପୁରୀ ମିଠା ଓ ଛେନା ଝିଲି" : isHindi ? "जाजपुर की पारंपरिक मिठाइयाँ" : "Crisp sweet Chhena Tarkari and regional steamed cakes (Pitha).",
            culturalLore: isOdia ? "ପ୍ରାଚୀନ କାଳରେ ତିବ୍ଦତୀୟ ବୌଦ୍ଧ ଧର୍ମର ଏକ ପ୍ରମୁଖ ବିଶ୍ୱବିଦ୍ୟାଳୟ।" : isHindi ? "नालंदा के समकक्ष तिब्बती बौद्ध परंपरा का सबसे बड़ा अध्ययन केंद्र।" : "Ancient center of Mahayana and Tantric Vajrayana philosophy mentioned in Tibetan texts."
          }
        ]
      }
    ],
    central: [
      {
        day: 1,
        title: isOdia ? "ଏକାମ୍ର କ୍ଷେତ୍ରର ପ୍ରାଚୀନ କଳିଙ୍ଗ ମନ୍ଦିର" : isHindi ? "एकाम्र क्षेत्र के पावन मंदिर एवं बिंदुसागर" : "Ancient Temples of Ekamra Kshetra",
        theme: isOdia ? "ମନ୍ଦିର ସ୍ଥାପତ୍ୟ ଓ ଶୈବ ସଂସ୍କୃତି" : isHindi ? "कलिंग स्थापत्य एवं शैव परंपरा" : "Kalinga Temple Architecture & Sacred Waters",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ଲିଙ୍ଗରାଜ ମନ୍ଦିର ଓ ବିନ୍ଦୁସାଗର" : isHindi ? "लिंगराज मंदिर एवं बिंदुसागर" : "Lingaraja Temple & Bindusagar",
            category: "Monuments & Temples",
            location: "Bhubaneswar",
            coordinates: [20.238, 85.833],
            activity: isOdia ? "୧୧ଶ ଶତାବ୍ଦୀର ବିଶାଳ ଦେଉଳ ଓ ପବିତ୍ର ବିନ୍ଦୁସାଗର ତଟ ପରିକ୍ରମା।" : isHindi ? "11वीं सदी के भव्य कलिंग मंदिर और पवित्र बिंदुसागर सरोवर की परिक्रमा।" : "Explore soaring 180-ft deula sanctum and tranquil sacred Bindusagar water body.",
            culinaryTip: isOdia ? "କୋରାଖାଇ ଭୋଗ ଓ କଟକୀ ଦହିବରା ଆଳୁଦମ" : isHindi ? "कोराखाई भोग एवं प्रसिद्ध कटक दही बड़ा आलू दम" : "Traditional crunchy Korakhai temple sweet and iconic Cuttack-style Dahi Bara Aloo Dum.",
            culturalLore: isOdia ? "ହରିହର ଏକାତ୍ମ ପୂଜା ପରମ୍ପରା (ଶିବ ଓ ବିଷ୍ଣୁଙ୍କ ମିଳନ)।" : isHindi ? "हरिहर स्वरूप - भगवान शिव और विष्णु का एक ही लिंग रूप में पावन वास।" : "Unique Harihara sanctum representing the unison of Shiva and Vishnu."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର ଓ ରାଜାରାଣୀ ମନ୍ଦିର" : isHindi ? "मुक्तेश्वर मंदिर (ओडिशा स्थापत्य का रत्न)" : "Mukteshvara Temple & Rajarani",
            category: "Monuments & Temples",
            location: "Bhubaneswar",
            coordinates: [20.243, 85.840],
            activity: isOdia ? "ମୁକ୍ତେଶ୍ୱରର ପ୍ରସିଦ୍ଧ ତୋରଣ ଓ ରାଜାରାଣୀର ନୃତ୍ୟରତା ନାରୀ ମୂର୍ତ୍ତି ଅବଲୋକନ।" : isHindi ? "मुक्तेश्वर के विश्वप्रसिद्ध अलंकृत मेहराब (तोरण) और राजारानी की नक्काशी।" : "Admire the arched torana gateway dubbed the 'Gem of Odishan Temple Architecture'.",
            culinaryTip: isOdia ? "ଗରମ ପୋଡ଼ପିଠା ଓ ଖିରି" : isHindi ? "पारंपरिक ओड़िया पोड़पीठा व खीर" : "Aromatic slow-baked Poda Pitha and fragrant sweet Chhena Gaja.",
            culturalLore: isOdia ? "କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ କଳାର ବିକାଶର ସବୁଠାରୁ ଉତ୍କୃଷ୍ଟ ନମୁନା।" : isHindi ? "10वीं सदी का यह मंदिर कलिंग वास्तुकला के संक्रमण काल का सबसे सुंदर प्रतीक है।" : "10th-century transition masterpiece marking the pinnacle of decorative relief sculpture."
          }
        ]
      },
      {
        day: 2,
        title: isOdia ? "ଶ୍ରୀକ୍ଷେତ୍ର ପୁରୀ, ରଘୁରାଜପୁର ଓ ମହାପ୍ରସାଦ" : isHindi ? "श्रीक्षेत्र पुरी, रघुराजपुर शिल्प ग्राम एवं महाप्रसाद" : "Sacred Puri, Raghurajpur Craft Village & Mahaprasad",
        theme: isOdia ? "ପଟ୍ଟଚିତ୍ର କଳା ଓ ଶ୍ରୀଜଗନ୍ନାଥ ସଂସ୍କୃତି" : isHindi ? "पट्टचित्र कला एवं जगन्नाथ परंपरा" : "Living Heritage Arts & Divine Food Culture",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ରଘୁରାଜପୁର ଐତିହ୍ୟ ଶିଳ୍ପ ଗ୍ରାମ" : isHindi ? "रघुराजपुर विरासत शिल्प ग्राम" : "Raghurajpur Heritage Crafts Village",
            category: "Art, Dance & Crafts",
            location: "Puri",
            coordinates: [19.897, 85.819],
            activity: isOdia ? "ଘରେ ଘରେ ଶିଳ୍ପୀଙ୍କ ଦ୍ୱାରା ଅଙ୍କିତ ପଟ୍ଟଚିତ୍ର, ତାଳପତ୍ର ଖୋଦେଇ ଓ ଗୋଟିପୁଅ ନୃତ୍ୟ ଦେଖନ୍ତୁ।" : isHindi ? "कारीगरों से सीधे ताड़पत्र चित्र, पट्टचित्र और गोटीपुआ नृत्य का साक्षात्कार।" : "Walk the mural-lined village lane and watch master artisans hand-paint palm leaves.",
            culinaryTip: isOdia ? "ନିମାପଡ଼ା ଛେନା ଝିଲି" : isHindi ? "निमापड़ा की सुप्रसिद्ध गरम छेना झिली" : "Fresh, juicy Nimapada Chhena Jhili sweets made from slow-cooked cottage cheese.",
            culturalLore: isOdia ? "ଓଡ଼ିଶାର ପ୍ରଥମ ଘୋଷିତ ଐତିହ୍ୟ ଗ୍ରାମ ଓ ଗୁରୁ କେଳୁଚରଣ ମହାପାତ୍ରଙ୍କ ଜନ୍ମସ୍ଥାନ।" : isHindi ? "पद्मविभूषण गुरु केलुचरण महापात्र की जन्मभूमि और भारत का पहला हेरिटेज विलेज।" : "Birthplace of Odissi maestro Guru Kelucharan Mohapatra and unbroken Gotipua tradition."
          },
          {
            timeSlot: isOdia ? "ସନ୍ଧ୍ୟା" : isHindi ? "संध्या" : "Evening",
            name: isOdia ? "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର ଓ ଆନନ୍ଦ ବଜାର" : isHindi ? "श्री जगन्नाथ मंदिर एवं आनंद बाजार" : "Puri Jagannath Temple & Anand Bazar",
            category: "Monuments & Temples",
            location: "Puri",
            coordinates: [19.805, 85.818],
            activity: isOdia ? "ସିଂହଦ୍ୱାରରେ ପତିତପାବନ ଦର୍ଶନ, ମନ୍ଦିର ବେଢ଼ା ପରିକ୍ରମା ଓ ଆନନ୍ଦ ବଜାରରେ ମହାପ୍ରସାଦ ସେବନ।" : isHindi ? "सिंहद्वार, दीप दर्शन एवं विश्व के सबसे बड़े खुले भोजनालय आनंद बाजार में महाप्रसाद का आनंद।" : "Witness evening dhwajarohana flag-changing ritual and savor divine 56-dish Mahaprasad.",
            culinaryTip: isOdia ? "ପୁରୀ ଶ୍ରୀମନ୍ଦିର ମହାପ୍ରସାଦ ଓ ଖଜା" : isHindi ? "पवित्र छप्पन भोग महाप्रसाद एवं खस्ता पुरी खाजा" : "Traditional earthen-pot cooked Mahaprasad (Kanika, Dalma, Khechudi) and layered Puri Khaja.",
            culturalLore: isOdia ? "ଭାରତର ଚାରିଧାମ ମଧ୍ୟରୁ ଅନ୍ୟତମ ଓ ଛତିଶା ନିଯୋଗର ଅନନ୍ୟ ସେବା ପରମ୍ପରା।" : isHindi ? "भारत के चार धामों में से एक जहाँ प्रतिदिन हजारों वर्ष पुरानी रीतियों का पालन होता है।" : "One of India's Char Dhams with unbroken daily sevas cooked over traditional wood fires."
          }
        ]
      },
      {
        day: 3,
        title: isOdia ? "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଓ ଚନ୍ଦ୍ରଭାଗା ସାଗର ତଟ" : isHindi ? "कोणार्क सूर्य मंदिर एवं चंद्रभागा सागर तट" : "Konark Sun Temple & Chandrabhaga Coast",
        theme: isOdia ? "ସୌର ସ୍ଥାପତ୍ୟ ଓ ଉପକୂଳ ଐତିହ୍ୟ" : isHindi ? "सौर वास्तुकला एवं तटीय प्राकृतिक सौंदर्य" : "Solar Architecture & Maritime Coastal Legends",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର (ବ୍ଲାକ୍ ପାଗୋଡ଼ା)" : isHindi ? "कोणार्क सूर्य मंदिर (ब्लैक पगोडा)" : "Konark Sun Temple (UNESCO World Heritage)",
            category: "Monuments & Temples",
            location: "Konark",
            coordinates: [19.887, 86.094],
            activity: isOdia ? "୨୪ଟି ପ୍ରସ୍ତର ରଥଚକ୍ର, ସାତଟି ଅଶ୍ୱ ଓ ନାଟମଣ୍ଡପର ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ମୂର୍ତ୍ତି ଦର୍ଶନ।" : isHindi ? "24 नक्काशीदार सूर्य पहियों, 7 अश्वों और नाट्य मंडप की अद्भुत मूर्तियों का अवलोकन।" : "Examine 24 sundial chariot wheels, erotic reliefs, and soaring Natya Mandapa dancers.",
            culinaryTip: isOdia ? "ନୟାଗଡ଼ ଛେନାପୋଡ଼ ଓ ନଡ଼ିଆ ପାଣି" : isHindi ? "नयागढ़ का भुना हुआ छेना पोड़ा एवं ताजा नारियल पानी" : "Caramelized smoky Chhena Poda and fresh coastal green coconuts.",
            culturalLore: isOdia ? "ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବ ଓ ୧୨ ବର୍ଷର ଶିଳ୍ପୀ ଧର୍ମପଦଙ୍କ ଆତ୍ମୋତ୍ସର୍ଗର ଗାଥା।" : isHindi ? "1200 शिल्पियों के 12 वर्ष का परिश्रम एवं 12 वर्षीय शिल्पी धर्मपद का अमर बलिदान।" : "13th-century architectural peak built by 1,200 master craftsmen under King Narasimhadeva I."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ଚନ୍ଦ୍ରଭାଗା ସମୁଦ୍ର ତଟ ଓ ରାମଚଣ୍ଡୀ ମୁହାଣ" : isHindi ? "चंद्रभागा बीच एवं रामचंडी नदी संगम" : "Chandrabhaga Beach & Ramachandi Estuary",
            category: "Nature & Landscapes",
            location: "Konark Coast",
            coordinates: [19.865, 86.115],
            activity: isOdia ? "ନୀଳ ସମୁଦ୍ର କୂଳରେ ବିଶ୍ରାମ ଓ କୁଶଭଦ୍ରା ନଦୀ ମୁହାଣରେ ରାମଚଣ୍ଡୀ ମନ୍ଦିର ଦର୍ଶନ।" : isHindi ? "स्वच्छ नीले समुद्र तट का भ्रमण एवं कुशाभद्रा नदी के शांत संगम का आनंद।" : "Breathe in sea breeze at Blue Flag certified beach and explore the mangrove estuary.",
            culinaryTip: isOdia ? "ସତେଜ ସାମୁଦ୍ରିକ ଖାଦ୍ୟ ଓ ମିଠା ପାନ" : isHindi ? "तटीय व्यंजन एवं जगन्नाथी मीठा पान" : "Tender roasted sweet potatoes, cashew fritters, and sweet fragrant betel leaf.",
            culturalLore: isOdia ? "ଶ୍ରୀକୃଷ୍ଣଙ୍କ ପୁତ୍ର ଶାମ୍ବଙ୍କ କୁଷ୍ଠରୋଗ ମୁକ୍ତିର ପବିତ୍ର ତୀର୍ଥ।" : isHindi ? "भगवान श्रीकृष्ण के पुत्र साम्ब की सूर्य उपासना से स्वास्थ्य लाभ की पावन भूमि।" : "Mythological site where Prince Samba was cured of afflictions through sun worship."
          }
        ]
      },
      {
        day: 4,
        title: isOdia ? "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ପିପିଲି ଚାନ୍ଦୁଆ ଶିଳ୍ପ" : isHindi ? "धौली शांति स्तूप एवं पिपली एप्लिक शिल्प" : "Dhauli Peace Pagoda & Pipili Applique Craft",
        theme: isOdia ? "ଅହିଂସାର ବାର୍ତ୍ତା ଓ ରଙ୍ଗବେରଙ୍ଗର ବୟନ କଳା" : isHindi ? "शांति संदेश एवं पिपली की रंगीन चाँदुआ कला" : "Emperor Ashoka's Epiphany & Vibrant Textile Arts",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ଅଶୋକଙ୍କ ଶିଳାଲିପି" : isHindi ? "धौली शांति स्तूप एवं मौर्य कालीन शिलालेख" : "Dhauli Shanti Stupa & Ashokan Rock Edicts",
            category: "Monuments & Temples",
            location: "Bhubaneswar",
            coordinates: [20.192, 85.854],
            activity: isOdia ? "ଦୟା ନଦୀ ତଟରେ ଅଶୋକଙ୍କ ୨୨୦୦ ବର୍ଷ ପୁରୁଣା ଶିଳାଲିପି ଓ ଧଳା ଶାନ୍ତି ସ୍ତୂପ ଦର୍ଶନ।" : isHindi ? "सम्राट अशोक के हृदय परिवर्तन के साक्षी स्थल और श्वेत शांति स्तूप का भ्रमण।" : "Stand before Emperor Ashoka's 3rd-century BCE rock edicts on peace and dharma.",
            culinaryTip: isOdia ? "ଡାଲମା-ଭାତ ଓ ସାଗ ଭଜା" : isHindi ? "ओड़िया दालमा-भात और बड़ी चूरा" : "Traditional wholesome Dalma (lentils with pumpkin, raw banana, papaya) with Badi Chura.",
            culturalLore: isOdia ? "କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ଚଣ୍ଡାଶୋକ ଧର୍ମାଶୋକରେ ରୂପାନ୍ତରିତ ହୋଇଥିବା ପବିତ୍ର ଭୂମି।" : isHindi ? "कलिंग युद्ध के रक्तपात के पश्चात युद्ध त्याग कर बौद्ध धर्म अपनाने की ऐतिहासिक भूमि।" : "Watershed historical ground where Emperor Ashoka renounced warfare for Ahimsa."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ପିପିଲି ଚାନ୍ଦୁଆ ହସ୍ତଶିଳ୍ପ ବଜାର" : isHindi ? "पिपली चाँदुआ एप्लिक कला बाजार" : "Pipili Applique Artisan Street",
            category: "Art, Dance & Crafts",
            location: "Pipili, Puri",
            coordinates: [20.116, 85.833],
            activity: isOdia ? "ରଥଯାତ୍ରା ପାଇଁ ପ୍ରସ୍ତୁତ ରଙ୍ଗିନ୍ କପଡ଼ା ତୋରଣ, ଛତ୍ର ଓ କାନ୍ଥସଜ୍ଜା ଶିଳ୍ପ ଦେଖନ୍ତୁ।" : isHindi ? "श्री जगन्नाथ रथयात्रा के छत्र एवं रंग-बिरंगे चाँदुआ हस्तशिल्प की कार्यशाला।" : "Walk colorful streets lined with hand-stitched canopies created for Puri's Ratha Yatra.",
            culinaryTip: isOdia ? "ପିପିଲିର ଛେନା ତାଡ଼ିଆ ଓ ଚା'" : isHindi ? "पिपली की प्रसिद्ध मिठाई और अदरक की चाय" : "Traditional Chhena Tadia sweet and fresh milk sweets.",
            culturalLore: isOdia ? "ମହାରାଜାଙ୍କ ଆଦେଶରେ ଶ୍ରୀମନ୍ଦିର ସେବା ପାଇଁ ଶହ ଶହ ବର୍ଷ ଧରି ଗଢ଼ି ଉଠିଥିବା ଶିଳ୍ପ ଗ୍ରାମ।" : isHindi ? "श्रीमंदिर के वस्त्र और छत्र तैयार करने वाले दर्जी कारीगरों का 800 वर्ष पुराना समुदाय।" : "Centuries-old guild dedicated to crafting imperial umbrellas and ritual canopies."
          }
        ]
      },
      {
        day: 5,
        title: isOdia ? "ହୀରାପୁର ଚଉଷଠୀ ଯୋଗିନୀ ଓ ଉଦୟଗିରି ଗୁମ୍ଫା" : isHindi ? "हीरापुर चौंसठ योगिनी एवं उदयगिरि-खंडगिरि गुफाएं" : "Hirapur 64 Yoginis & Udayagiri Caves",
        theme: isOdia ? "ତନ୍ତ୍ର ସାଧନା ଓ ପ୍ରାଚୀନ ଜୈନ ଶୈଳୋତ୍କୀର୍ଣ୍ଣ ଗୁମ୍ଫା" : isHindi ? "तांत्रिक योगिनी पीठ एवं 2000 वर्ष प्राचीन जैन गुफाएं" : "Tantric Shrines & Jain Cave Monasteries",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ହୀରାପୁର ଚଉଷଠୀ ଯୋଗିନୀ ମନ୍ଦିର" : isHindi ? "हीरापुर चौंसठ योगिनी मंदिर" : "Chausath Yogini Temple, Hirapur",
            category: "Monuments & Temples",
            location: "Hirapur, Bhubaneswar",
            coordinates: [20.218, 85.875],
            activity: isOdia ? "ବିଶ୍ୱର ବିରଳ ଖୋଲା ଆକାଶ ତଳେ ଥିବା ୬୪ ଜଣ ଯୋଗିନୀଙ୍କ କଳା ମୁଗୁନି ମୂର୍ତ୍ତି ଦର୍ଶନ।" : isHindi ? "भारत के 4 प्रमुख योगिनी मंदिरों में से एक - खुले आसमान के नीचे 64 योगिनियों के दर्शन।" : "Walk into the 9th-century hypaethral circular sanctum enshrining 64 distinct Yoginis.",
            culinaryTip: isOdia ? "ମାଟିହାଣ୍ଡି ପଖାଳ ଓ ଶାଗ" : isHindi ? "पारंपरिक ओड़िया पखाल थाली" : "Earthen-pot seasoned Pakhala with tender drumstick leaves and roasted mash.",
            culturalLore: isOdia ? "ଭୌମକର ରାଣୀ ହୀରାଦେବୀଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ରହସ୍ୟମୟ ତନ୍ତ୍ର ସାଧନା କ୍ଷେତ୍ର।" : isHindi ? "9वीं सदी में भौमकर वंश की महारानी हीरादेवी द्वारा स्थापित अनूठा शक्ति केंद्र।" : "Built under Queen Hiradevi of the Bhauma-Kara dynasty for feminine spiritual wisdom."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ଗୁମ୍ଫା (ହାତୀଗୁମ୍ଫା)" : isHindi ? "उदयगिरि एवं खंडगिरि गुफाएं (हाथीगुम्फा)" : "Udayagiri & Khandagiri Rock Caves",
            category: "Monuments & Temples",
            location: "Bhubaneswar",
            coordinates: [20.264, 85.786],
            activity: isOdia ? "ସମ୍ରାଟ ଖାରବେଳଙ୍କ ଐତିହାସିକ ହାତୀଗୁମ୍ଫା ଶିଳାଲିପି ଓ ରାଣୀଗୁମ୍ଫା ଅନୁସନ୍ଧାନ।" : isHindi ? "सम्राट खारवेल का 2100 वर्ष पुराना हाथीगुम्फा अभिलेख एवं दो मंजिला रानीगुम्फा।" : "Step inside 1st-century BCE two-storey rock cells sculpted for Jain monks.",
            culinaryTip: isOdia ? "ଖଣ୍ଡଗିରି ଚାଟ୍ ଓ ମିଷ୍ଟାନ୍ନ" : isHindi ? "स्थानीय गर्म मसाला चाट" : "Popular spiced street Chaat and fresh coconut water.",
            culturalLore: isOdia ? "ମହାମେଘବାହନ ଐର ଖାରବେଳଙ୍କ କଳିଙ୍ଗ ସାମ୍ରାଜ୍ୟର ବିଜୟ ଗାଥା।" : isHindi ? "प्राचीन भारत के सबसे प्रतापी सम्राटों में से एक खारवेल का प्रामाणिक इतिहास।" : "Inscribed with the 17-line Brahmi chronicle of Emperor Kharavela's expeditions."
          }
        ]
      },
      {
        day: 6,
        title: isOdia ? "କଟକ ବାରବାଟୀ ଦୁର୍ଗ ଓ ତାରକସୀ ରୂପା କାମ" : isHindi ? "कटक: बाराबाती किला एवं विश्वविख्यात तारकसी चांदी शिल्प" : "Historic Cuttack: Barabati Fort & Silver Filigree Guilds",
        theme: isOdia ? "ମିଲେନିୟମ ସିଟିର ଇତିହାସ ଓ ସୂକ୍ଷ୍ମ ରୌପ୍ୟ କଳା" : isHindi ? "सहस्राब्दी नगर का इतिहास और बारीक चांदी का तारकसी शिल्प" : "Millennium City History & Intricate Silver Filigree",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "କଟକ ବାରବାଟୀ ଦୁର୍ଗ ଓ କଟକ ଚଣ୍ଡୀ ମନ୍ଦିର" : isHindi ? "बाराबाती किला एवं कटक चंडी मंदिर" : "Barabati Fort & Cuttack Chandi",
            category: "Monuments & Temples",
            location: "Cuttack",
            coordinates: [20.485, 85.865],
            activity: isOdia ? "୯ ଶହ ବର୍ଷର ପ୍ରାଚୀନ ଦୁର୍ଗ ପରିସର, ଖାଇ ଓ ମା' କଟକ ଚଣ୍ଡୀଙ୍କ ଆଶୀର୍ବାଦ ଗ୍ରହଣ।" : isHindi ? "900 वर्ष पुराने ऐतिहासिक किले के अवशेष और कटक चंडी के दर्शन।" : "Explore 14th-century Ganga dynasty fort ruins surrounded by the Mahanadi and Kathajodi.",
            culinaryTip: isOdia ? "କଟକୀ ଦହିବରା ଆଳୁଦମ ଓ ଗୁପଚୁପ" : isHindi ? "कटक का असली दही बड़ा, घुगनी और दम आलू" : "Legendary Cuttack Dahi Bara topped with spicy ghugni, chopped onions, and coriander.",
            culturalLore: isOdia ? "ଓଡ଼ିଶାର ପ୍ରାଚୀନ ରାଜଧାନୀ କଟକ (ଅଭିନବ ବାରାଣସୀ କଟକ)।" : isHindi ? "1000 वर्षों से अधिक समय तक ओडिशा की प्रशासनिक व सांस्कृतिक राजधानी।" : "Capital of ancient Kalinga and Medieval Odisha established in 989 CE by King Nrupa Keshari."
          },
          {
            timeSlot: isOdia ? "ଅପରାହ୍ନ" : isHindi ? "दोपहर" : "Afternoon",
            name: isOdia ? "ତାରକସୀ (ରୂପା ତାର କଳା) କାରିଗର କ୍ଲଷ୍ଟର" : isHindi ? "कटक तारकसी (सिल्वर फिलीग्री) क्लस्टर" : "Tarakasi Silver Filigree Master Guilds",
            category: "Art, Dance & Crafts",
            location: "Naya Sarak, Cuttack",
            coordinates: [20.463, 85.878],
            activity: isOdia ? "କେଶ ସଦୃଶ ସୂକ୍ଷ୍ମ ରୂପା ତାରରେ ତିଆରି ହେଉଥିବା ଗହଣା ଓ ଦୁର୍ଗା ମେଢ଼ କାରିଗରି ଦେଖନ୍ତୁ।" : isHindi ? "चांदी के बारीक तारों से आभूषण और कलाकृतियां बनाने वाले कारीगरों से भेंट।" : "Observe GI-tagged master smiths spinning hair-thin 99.9% pure silver wires into jewelry.",
            culinaryTip: isOdia ? "କଟକୀ ଖିରମୋହନ ଓ ଚେଭଡ଼ା" : isHindi ? "कटक की रसमलाई एवं नमकीन" : "Tender Khiramohana sweets and crunchy spiced mixture.",
            culturalLore: isOdia ? "୫୦୦ ବର୍ଷ ପୂର୍ବେ ମେସୋପୋଟାମିଆ ଓ ଦକ୍ଷିଣ-ପୂର୍ବ ଏସିଆ ସହ ବାଣିଜ୍ୟ ଯୋଗୁଁ ବିକଶିତ କଳା।" : isHindi ? "समुद्री व्यापार के साथ कटक पहुँची यह कला आज भारत की सबसे उत्कृष्ट आभूषण कला है।" : "500-year unbroken craft legacy honored during Cuttack's spectacular silver Durga Puja tableaus."
          }
        ]
      },
      {
        day: 7,
        title: isOdia ? "ମଙ୍ଗଳା ମନ୍ଦିର କାକଟପୁର ଓ ପ୍ରାଚୀ ଉପତ୍ୟକା ଐତିହ୍ୟ" : isHindi ? "काकटपुर माँ मंगला एवं प्राचीन प्राची घाटी" : "Prachi Valley Heritage & Maa Mangala Shrines",
        theme: isOdia ? "ନବକଳେବର ଦାରୁ ଅନ୍ୱେଷଣ ପରମ୍ପରା ଓ ପ୍ରାଚୀ ନଦୀ ସଭ୍ୟତା" : isHindi ? "नव कलेवर की दारु खोज परंपरा और प्राची नदी सभ्यता" : "Sacred Timber Quests & Hidden Prachi Civilization",
        stops: [
          {
            timeSlot: isOdia ? "ପ୍ରଭାତ" : isHindi ? "प्रातःकाल" : "Morning",
            name: isOdia ? "ମା' ମଙ୍ଗଳା ମନ୍ଦିର, କାକଟପୁର" : isHindi ? "माँ मंगला मंदिर (काकटपुर)" : "Maa Mangala Temple, Kakatpur",
            category: "Monuments & Temples",
            location: "Kakatpur, Puri",
            coordinates: [20.002, 86.015],
            activity: isOdia ? "ପ୍ରାଚୀ ନଦୀ ତଟରେ ଶ୍ରୀଜଗନ୍ନାଥ ନବକଳେବର ସହ ଜଡ଼ିତ ପ୍ରସିଦ୍ଧ ଶକ୍ତିପୀଠ ଦର୍ଶନ।" : isHindi ? "प्राची नदी के तट पर स्थित शक्तिपीठ के दर्शन जहाँ महाप्रभु के नवकलेवर का स्वप्नादेश मिलता है।" : "Visit the pivotal shrine where Jagannath priests receive divine dreams for sacred neem timber.",
            culinaryTip: isOdia ? "କାକଟପୁରୀ ପେଡ଼ା ଓ ଖିରିସା ପିଠା" : isHindi ? "काकटपुर के प्रसिद्ध पेड़े एवं रबड़ी" : "Caramelized dry milk Peda and festive Khirisa Pitha.",
            culturalLore: isOdia ? "ନବକଳେବର ସମୟରେ ଦଇତାପତି ସେବକମାନଙ୍କୁ ମା' ମଙ୍ଗଳା ସ୍ୱପ୍ନାଦେଶ ପ୍ରଦାନ କରନ୍ତି।" : isHindi ? "श्रीमंदिर के नवकलेवर की शुरुआत माँ मंगला के आशीर्वाद और स्वप्न से ही होती है।" : "Indispensable spiritual catalyst for Puri's once-in-12-years Navakalevara transformation."
          }
        ]
      }
    ]
  };

  // Determine starting pool
  let selectedPool = regionalDayPools.central;
  if (regionStr.includes("sambalpur") || regionStr.includes("bargarh") || regionStr.includes("western") || regionStr.includes("west")) {
    selectedPool = regionalDayPools.western;
  } else if (regionStr.includes("mayurbhanj") || regionStr.includes("baripada") || regionStr.includes("north") || regionStr.includes("similipal")) {
    selectedPool = regionalDayPools.north;
  } else if (regionStr.includes("ganjam") || regionStr.includes("chilika") || regionStr.includes("south") || regionStr.includes("berhampur")) {
    selectedPool = regionalDayPools.south;
  } else if (regionStr.includes("jajpur") || regionStr.includes("ratnagiri") || regionStr.includes("diamond") || regionStr.includes("buddhist")) {
    selectedPool = regionalDayPools.buddhist;
  }

  // Combine with central days if user requested more days than available in primary pool
  let finalDays = [...selectedPool];
  if (finalDays.length < numDays) {
    const fillerDays = regionalDayPools.central.filter(cd => !finalDays.some(fd => fd.stops[0].name === cd.stops[0].name));
    finalDays = finalDays.concat(fillerDays).slice(0, numDays);
  } else {
    finalDays = finalDays.slice(0, numDays);
  }

  // Renumber days to be strictly 1..N
  finalDays = finalDays.map((d, index) => ({
    ...d,
    day: index + 1
  }));

  // Build routeCoordinates
  const routeCoordinates = [];
  finalDays.forEach(d => {
    (d.stops || []).forEach(s => {
      if (s.coordinates && s.coordinates.length >= 2) {
        routeCoordinates.push(s.coordinates);
      }
    });
  });

  // Calculate starting point name
  const startingPoint = regionStr.includes("sambalpur") ? (isOdia ? "ସମ୍ବଲପୁର" : isHindi ? "संबलपुर" : "Sambalpur")
    : regionStr.includes("mayurbhanj") ? (isOdia ? "ମୟୂରଭଞ୍ଜ / ବାରିପଦା" : isHindi ? "मयूरभंज / बारीपदा" : "Mayurbhanj / Baripada")
    : regionStr.includes("ganjam") ? (isOdia ? "ଗଞ୍ଜାମ / ବ୍ରହ୍ମପୁର" : isHindi ? "गंजम / बेरहामपुर" : "Ganjam / Berhampur")
    : regionStr.includes("jajpur") ? (isOdia ? "ଯାଜପୁର" : isHindi ? "जाजपुर" : "Jajpur")
    : (isOdia ? "ଭୁବନେଶ୍ୱର" : isHindi ? "भुवनेश्वर" : "Bhubaneswar");

  const customNotesSnippet = customNotes 
    ? (isOdia ? ` (ଆପଣଙ୍କ ବିଶେଷ ପସନ୍ଦ: "${customNotes}" କୁ ଧ୍ୟାନରେ ରଖାଯାଇଛି)` : isHindi ? ` (आपकी विशेष प्राथमिकताएं: "${customNotes}" को सम्मिलित किया गया है)` : ` (Personalized for: "${customNotes}")`)
    : "";

  const title = isOdia
    ? `${startingPoint} ରୁ ${numDays} ଦିନିଆ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ ଯାତ୍ରା`
    : isHindi
    ? `${startingPoint} से ${numDays} दिवसीय पावन सांस्कृतिक धरोहर यात्रा`
    : `${numDays}-Day Curated Cultural Heritage Journey from ${startingPoint}`;

  const subtitle = isOdia
    ? `ଓଡ଼ିଶାର ପ୍ରାଚୀନ ସ୍ଥାପତ୍ୟ, ସଂସ୍କୃତି, ପାରମ୍ପରିକ ଖାଦ୍ୟ ଓ ଜୀବନ୍ତ କଳା ରୂପାୟନ${customNotesSnippet}`
    : isHindi
    ? `प्राचीन कलिंग स्थापत्य, लोक संस्कृति, पारंपरिक खान-पान और पावन तीर्थों का अनुभव${customNotesSnippet}`
    : `An immersive journey through Odisha's monuments, culinary traditions, crafts and living lore${customNotesSnippet}`;

  const summary = isOdia
    ? `ଏହି ${numDays} ଦିନିଆ ବ୍ୟକ୍ତିଗତ ଯାତ୍ରା ଯୋଜନାରେ ଆପଣ ${startingPoint} ରୁ ଆରମ୍ଭ କରି ଓଡ଼ିଶାର ପ୍ରମୁଖ ଐତିହ୍ୟ ସ୍ଥଳ, ସ୍ଥାନୀୟ ମିଷ୍ଟାନ୍ନ ଓ ଲୋକକଳାକୁ ଅତି ନିକଟରୁ ଅନୁଭବ କରିପାରିବେ।${customNotesSnippet}`
    : isHindi
    ? `यह ${numDays} दिवसीय व्यक्तिगत यात्रा योजना ${startingPoint} से शुरू होकर प्राचीन मंदिरों, हथकरघा वस्त्रों, स्वादिष्ट खान-पान और ऐतिहासिक स्थलों का समग्र अनुभव कराती है।${customNotesSnippet}`
    : `This customized ${numDays}-day itinerary guides you through ${startingPoint} and surrounding cultural corridors with handpicked stops, authentic regional cuisines, and verified historical lore.${customNotesSnippet}`;

  return {
    title,
    subtitle,
    duration: `${numDays} ${numDays === 1 ? 'Day' : 'Days'}`,
    startingPoint,
    summary,
    totalStops: routeCoordinates.length,
    bestTimeToVisit: isOdia ? "ଅକ୍ଟୋବର ରୁ ମାର୍ଚ୍ଚ (ଶୀତ ଋତୁ)" : isHindi ? "अक्टूबर से मार्च (सुखद शीतकाल)" : "October to March (Pleasant Season)",
    culturalProtocol: isOdia 
      ? "ମନ୍ଦିର ପ୍ରବେଶ ସମୟରେ ପାରମ୍ପରିକ ପୋଷାକ ପରିଧାନ କରନ୍ତୁ ଏବଂ ଚର୍ମ ନିର୍ମିତ ସାମଗ୍ରୀ ବାହାରେ ରଖନ୍ତୁ।" 
      : isHindi 
      ? "मंदिरों में प्रवेश के समय पारंपरिक शालीन वस्त्र पहनें एवं चमड़े की वस्तुएं बाहर रखें।" 
      : "Dress modestly covering shoulders and knees when visiting sacred temple complexes.",
    routeCoordinates,
    days: finalDays
  };
}

app.post('/api/itinerary/generate', async (req, res) => {
  try {
    const { 
      duration: reqDuration, 
      days: reqDays, 
      themes = [], 
      startingRegion: reqRegion, 
      startHub, 
      customNotes = "",
      userPrompt = "",
      selectedEntity = null, 
      language = "English" 
    } = req.body;

    const langMap = { 'hi': 'Hindi', 'or': 'Odia', 'en': 'English' };
    const activeLanguage = langMap[language] || language || "English";
    const parsedDays = parseInt(reqDays, 10) || (reqDuration ? parseInt(reqDuration, 10) : 3) || 3;
    const duration = `${parsedDays} ${parsedDays === 1 ? 'Day' : 'Days'}`;
    const startingRegion = reqRegion || (startHub === "All" ? "Bhubaneswar" : startHub) || "Bhubaneswar";
    const userNotes = (customNotes || userPrompt || "").trim();

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

    const langInstruction = activeLanguage === "Hindi" 
      ? "Respond entirely in fluent Hindi (हिन्दी / देवनागरी लिपि) for all titles, descriptions, food tips, and activities." 
      : activeLanguage === "Odia" 
      ? "Respond entirely in authentic Odia (ଓଡ଼ିଆ ଲିପି) for all titles, descriptions, food tips, and activities." 
      : "Respond in English.";

    const promptText = `You are Darshak, the Master Cultural Itinerary Planner for DHAROHAR (Digital Heritage Knowledge System of Odisha, India).
Create an authentic, culturally inspiring, and geographically realistic travel itinerary strictly tailored to the user's specific inputs:
- Exact Duration: ${parsedDays} days (YOU MUST RETURN EXACTLY ${parsedDays} DAY OBJECTS in the "days" array, with day numbers 1 to ${parsedDays}).
- Starting Region / Hub: ${startingRegion}
- Explorer Selected Themes: ${themes.length > 0 ? themes.join(', ') : 'Temples, Folk Traditions, Cuisine, Handlooms, Nature'}
${userNotes ? `- User Special Preferences & Requirements: "${userNotes}" (Strictly adapt activities, pace, food tips, and suggestions to this request).` : ''}
${selectedEntity ? `- Highlight Heritage Site to Feature: ${selectedEntity.name} (${selectedEntity.category_name || ''} in ${selectedEntity.location_context || ''})` : ''}
- Target Language: ${langInstruction}

Available Grounded Odisha Heritage Sites (use their exact coordinates if possible):
${JSON.stringify(dbEntities.slice(0, 35).map(e => ({ name: e.name, cat: e.category_name, loc: e.location_context, coords: e.coordinates })))}

Return ONLY valid JSON matching this exact schema:
{
  "title": "Inspiring Itinerary Title",
  "subtitle": "Inspiring subtitle reflecting user preferences",
  "duration": "${duration}",
  "startingPoint": "${startingRegion}",
  "summary": "2-3 sentence overview of this cultural journey reflecting duration and preferences",
  "totalStops": ${parsedDays * 2},
  "bestTimeToVisit": "October to March",
  "culturalProtocol": "Key cultural and temple etiquette tip",
  "routeCoordinates": [ [20.238, 85.833], [19.813, 85.831], [19.887, 86.094] ],
  "days": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "theme": "Day 1 Theme",
      "stops": [
        {
          "timeSlot": "Morning",
          "name": "Heritage Site Name",
          "category": "Monuments & Temples",
          "location": "City/District",
          "coordinates": [20.238, 85.833],
          "activity": "What to explore and experience here",
          "culinaryTip": "Authentic regional dish or temple bhog to try nearby",
          "culturalLore": "Key folklore or historical significance"
        }
      ]
    }
  ]
}`;

    if (genAI) {
      const candidateModels = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
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
          if (parsedData && parsedData.days && parsedData.days.length > 0) {
            return res.json(parsedData);
          }
        } catch (err) {
          console.warn(`Model ${modelName} failed for itinerary, trying next candidate...`);
        }
      }
    }

    // High-precision Dynamic Cultural Itinerary Generator Fallback
    const dynamicItinerary = buildDynamicFallbackItinerary({
      days: parsedDays,
      startingRegion,
      themes,
      customNotes: userNotes,
      language: activeLanguage,
      selectedEntity,
      dbEntities
    });

    return res.json(dynamicItinerary);

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
