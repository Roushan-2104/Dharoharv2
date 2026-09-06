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

// Cultural Heritage Knowledge Engine for authentic, detailed answers
function generateCulturalHeritageAnswer(query, targetLanguage, matchedEntities = [], entityContext = null) {
  const q = (query || '').toLowerCase();

  // Helper for language localization
  const isHi = targetLanguage === 'Hindi';
  const isOr = targetLanguage === 'Odia';

  // 1. Specialized Cultural Topics by Query Intent
  // Konark Sun Temple
  if (q.includes('konark') || q.includes('sun temple') || q.includes('कोणार्क') || q.includes('କୋଣାର୍କ') || q.includes('black pagoda')) {
    if (isHi) {
      return `**कोणार्क सूर्य मंदिर (Konark Sun Temple)** 13वीं शताब्दी का एक अद्वितीय कलिंग स्थापत्य चमत्कार है, जिसे पूर्वी गंग वंश के **राजा नरसिंहदेव प्रथम** ने 1250 ईस्वी में बनवाया था।\n\n` +
        `* 🛞 **24 नक्काशीदार पहिए:** ये पहिए केवल सजावट नहीं बल्कि सटीक **सूर्य घड़ियाँ (Sundials)** हैं, जिनकी छाया से पहर और मिनट का सही समय आंका जा सकता है।\n` +
        `* 🐎 **7 घोड़े:** मंदिर को 7 दौड़ते हुए घोड़ों द्वारा खींचे जाने वाले सूर्य देव के विशाल रथ के रूप में गढ़ा गया है, जो सप्ताह के 7 दिनों का प्रतीक हैं।\n` +
        `* 📜 **धर्मपद का बलिदान:** लोककथा के अनुसार, 12 वर्षीय बालक धर्मपद ने 1200 शिल्पकारों की जान बचाने के लिए मंदिर के कलश (शीर्ष) को स्थापित करने के बाद समुद्र में कूदकर आत्मबलिदान दिया था।\n\n` +
        `यह यूनेस्को विश्व धरोहर स्थल (UNESCO World Heritage Site) है। यहाँ घूमने का सबसे उत्तम समय **अक्टूबर से मार्च** है।`;
    } else if (isOr) {
      return `**କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର (Konark Sun Temple)** ୧୩ଶ ଶତାବ୍ଦୀର ଏକ ଅଦ୍ୱିତୀୟ କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ କଳାକୃତି, ଯାହାକୁ ଗଙ୍ଗ ବଂଶର ରାଜା **ପ୍ରଥମ ନରସିଂହଦେବ** ୧୨୫୦ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ ନିର୍ମାଣ କରିଥିଲେ।\n\n` +
        `* 🛞 **୨୪ଟି କଳାତ୍ମକ ଚକ:** ଏହି ଚକଗୁଡ଼ିକ ସୂର୍ଯ୍ୟ ଘଣ୍ଟା ଭାବେ କାର୍ଯ୍ୟ କରେ, ଯାହାର ଛାଇ ଦ୍ୱାରା ସଠିକ୍ ସମୟ ନିର୍ଣ୍ଣୟ କରାଯାଇପାରେ।\n` +
        `* 🐎 **୭ଟି ଘୋଡ଼ା:** ସୂର୍ଯ୍ୟ ଦେବଙ୍କ ବିଶାଳ ରଥକୁ ୭ଟି ଅଶ୍ୱ ଟାଣୁଥିବାର ଭାସ୍କର୍ଯ୍ୟ ରହିଛି, ଯାହା ସପ୍ତାହର ୭ ଦିନକୁ ସୂଚାଏ।\n` +
        `* 📜 **ଧର୍ମପଦଙ୍କ ଆତ୍ମୋତ୍ସର୍ଗ:** ୧୨୦୦ ବଢ଼େଇଙ୍କ ଜୀବନ ରକ୍ଷା ପାଇଁ ୧୨ ବର୍ଷର ବାଳକ ଧର୍ମପଦ ମନ୍ଦିର ଦଉଢ଼ି ବାନ୍ଧି ସମୁଦ୍ରକୁ ଡେଇଁ ପଡ଼ିଥିଲେ।\n\n` +
        `ଏହା ଏକ ୟୁନେସ୍କୋ ବିଶ୍ୱ ଐତିହ୍ୟ ସ୍ଥଳ। ଏଠାକୁ ଭ୍ରମଣ କରିବାର ସର୍ବୋତ୍ତମ ସମୟ ହେଉଛି **ଅକ୍ଟୋବର ରୁ ମାର୍ଚ୍ଚ**।`;
    } else {
      return `**Konark Sun Temple (The Black Pagoda)** is a 13th-century UNESCO World Heritage marvel constructed around 1250 CE by **King Narasimhadeva I** of the Eastern Ganga Dynasty.\n\n` +
        `* 🛞 **24 Intricately Carved Wheels:** Each 10-foot stone wheel functions as an accurate astronomical sundial capable of telling precise time based on shadow alignment.\n` +
        `* 🐎 **7 Galloping Horses:** The temple is designed as a colossal celestial chariot for the Sun God (Surya) drawn by 7 horses symbolizing the days of the week.\n` +
        `* 📜 **Legend of Dharmapada:** Tradition recounts that 12-year-old child prodigy Dharmapada placed the final crownstone (Dadhinauti) to save 1,200 sculptors before sacrificing his life into the Chandrabhaga sea.\n\n` +
        `The temple showcases the pinnacle of Kalinga architecture. Best visited during early morning sunrise or during the Konark Dance Festival in December!`;
    }
  }

  // Jagannath Temple & Puri Rath Yatra
  if (q.includes('puri') || q.includes('jagannath') || q.includes('rath yatra') || q.includes('जगन्नाथ') || q.includes('पुरी') || q.includes('ରଥଯାତ୍ରା') || q.includes('ଜଗନ୍ନାଥ') || q.includes('white pagoda')) {
    if (isHi) {
      return `**श्री जगन्नाथ मंदिर, पुरी (Jagannath Temple, Puri)** भारत के चार धामों में से एक प्रमुख पावन तीर्थ है, जिसका निर्माण 12वीं सदी में **राजा अनंतवर्मन चोडगंग देव** ने करवाया था।\n\n` +
        `* 🚩 **नीलचक्र व ध्वज:** मंदिर के 214 फीट ऊँचे शिखर पर लगा 'पतितपावन ध्वज' हवा के विपरीत दिशा में लहराता है और इसे नित्य प्रतिदिन बदला जाता है।\n` +
        `* 🎪 **विश्वप्रसिद्ध रथयात्रा:** आषाढ़ मास में भगवान जगन्नाथ (नंदीघोष रथ), बलभद्र (तालध्वज) और देवी सुभद्रा (दर्पदलन) अपने 9 दिवसीय प्रवास पर गुंडिचा मंदिर जाते हैं।\n` +
        `* 🍲 **महाप्रसाद (56 भोग):** मंदिर की रसोई दुनिया की सबसे बड़ी पारंपरिक रसोई मानी जाती है, जहाँ एक के ऊपर एक मिट्टी के 7 बर्तन रखकर काष्ठ अग्नि पर भाप से भोजन पकाया जाता है।\n\n` +
        `पुरी का स्वर्ण बालू तट (Golden Beach) और रघुराजपुर हेरिटेज क्राफ्ट गाँव इसके निकटतम प्रमुख आकर्षण हैं।`;
    } else if (isOr) {
      return `**ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ** ଭାରତର ଚାରି ଧାମ ମଧ୍ୟରୁ ଅନ୍ୟତମ ପ୍ରମୁଖ ତୀର୍ଥକ୍ଷେତ୍ର, ଯାହାକୁ ୧୨ଶ ଶତାବ୍ଦୀରେ ରାଜା **ଅନନ୍ତବର୍ମା ଚୋଡ଼ଗଙ୍ଗ ଦେବ** ନିର୍ମାଣ କରିଥିଲେ।\n\n` +
        `* 🚩 **ନୀଳଚକ୍ର ଓ ପତିତପାବନ ବାନା:** ୨୧୪ ଫୁଟ ଉଚ୍ଚ ମନ୍ଦିର ଚୂଡ଼ାରେ ଥିବା ପତିତପାବନ ବାନା ପବନର ବିପରୀତ ଦିଗରେ ଉଡ଼ିଥାଏ ଏବଂ ଏହା ପ୍ରତିଦିନ ସନ୍ଧ୍ୟାରେ ବଦଳାଯାଏ।\n` +
        `* 🎪 **ବିଶ୍ୱପ୍ରସିଦ୍ଧ ରଥଯାତ୍ରା:** ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟାରେ ପ୍ରଭୁ ଜଗନ୍ନାଥ (ନନ୍ଦିଘୋଷ), ବଳଭଦ୍ର (ତାଳଧ୍ୱଜ) ଓ ଦେବୀ ସୁଭଦ୍ରା (ଦର୍ପଦଳନ) ଶ୍ରୀଗୁଣ୍ଡିଚା ମନ୍ଦିରକୁ ଯାତ୍ରା କରନ୍ତି।\n` +
        `* 🍲 **ଛପନ ଭୋଗ ମହାପ୍ରସାଦ:** ବିଶ୍ୱର ସର୍ବବୃହତ ପାରମ୍ପରିକ ରୋଷଘରେ ମାଟି କୁଡୁଆରେ ସପ୍ତ ଭାଣ୍ଡ ପଦ୍ଧତିରେ ପବିତ୍ର ମହାପ୍ରସାଦ ରନ୍ଧନ କରାଯାଏ।\n\n` +
        `ପୁରୀର ଗୋଲ୍ଡେନ୍ ବିଚ୍ ଏବଂ ନିକଟସ୍ଥ ରଘୁରାଜପୁର ଶିଳ୍ପ ଗ୍ରାମ ଏହାର ପ୍ରମୁଖ ଆକର୍ଷଣ।`;
    } else {
      return `**Shree Jagannath Temple in Puri** is one of the sacred Char Dham pilgrimage sites, rebuilt in the 12th century by **King Anantavarman Chodaganga Deva**.\n\n` +
        `* 🚩 **Neela Chakra & Flying Flag:** The 214-foot high sanctum is topped by the sacred alloy Neela Chakra. The Patitapavana flag unfurls against the wind direction and is replaced daily by hereditary servitors.\n` +
        `* 🎪 **Grand Rath Yatra (Chariot Festival):** During the month of Ashadha, Lord Jagannath (Nandighosa chariot), Lord Balabhadra (Taladhwaja), and Devi Subhadra (Darpadalana) ride majestically to Gundicha Temple.\n` +
        `* 🍲 **56 Bhog Mahaprasad:** Prepared in the world's largest traditional kitchen using seven stacked earthen pots steamed over sacred wood fires.\n\n` +
        `Nearby must-visit sites include the Puri Golden Beach and the Raghurajpur Master Artisan Village!`;
    }
  }

  // Food, Cuisine & Sweets (Chhenapoda, Rasagola, Dalma, Pakhala, Mahaprasad)
  if (q.includes('food') || q.includes('cuisine') || q.includes('chhenapoda') || q.includes('rasagola') || q.includes('dalma') || q.includes('pakhala') || q.includes('mahaprasad') || q.includes('bhog') || q.includes('sweet') || q.includes('भोजन') || q.includes('व्यंजन') || q.includes('मिठाई') || q.includes('ଖାଦ୍ୟ') || q.includes('ମହାପ୍ରସାଦ')) {
    if (isHi) {
      return `**ओडिशा के पारंपरिक एवं प्रसिद्ध व्यंजन:**\n\n` +
        `* 🍰 **छेनापोड़ा (Chhenapoda):** नयागढ़ में जन्मी यह भारत की एकमात्र बेक की हुई पारंपरिक पनीर मिठाई है, जिसे साल के पत्तों में लपेटकर रात भर धीमी आंच पर कैरेमेलाइज़ किया जाता है।\n` +
        `* 🍯 **पहाला रसगुल्ला (Pahala Rasagola):** भुवनेश्वर-कटक हाईवे पर मिलने वाला अत्यंत कोमल और हल्के भूरे रंग का ताज़ा रसगुल्ला, जिसे ओडिशा का GI टैग प्राप्त है।\n` +
        `* 🍲 **दालमा (Dalma):** अरहर दाल में कद्दू, कच्चा पपीता, बैंगन डालकर घी व भुने जीरा-मिर्च के तड़के से बना पौष्टिक पारंपरिक व्यंजन।\n` +
        `* 🍚 **पखाला (Pakhala):** पके हुए चावल को पानी में किण्वित (ferment) कर दही, भुनी मछली या साग के साथ परोसा जाने वाला ग्रीष्मकालीन अमृत।\n` +
        `* 🍱 **जगन्नाथ महाप्रसाद:** 56 भोग का पावन नैवेद्य जो मिट्टी के बर्तनों में तैयार होता है।`;
    } else if (isOr) {
      return `**ଓଡ଼ିଶାର ପ୍ରସିଦ୍ଧ ପାରମ୍ପରିକ ଖାଦ୍ୟ:**\n\n` +
        `* 🍰 **ଛେନାପୋଡ଼:** ନୟାଗଡ଼ରୁ ଉତ୍ପତ୍ତି ହୋଇଥିବା ଏହି ଅନନ୍ୟ ମିଷ୍ଟାନ୍ନକୁ ଶାଳ ପତ୍ରରେ ଗୁଡ଼ାଇ ଧୀମା ଆଞ୍ଚରେ ବେକ୍ କରାଯାଏ।\n` +
        `* 🍯 **ପାହାଳ ରସଗୋଲା:** ଭୁବନେଶ୍ୱର-କଟକ ରାସ୍ତାର ପାହାଳ ବଜାରରେ ପ୍ରସ୍ତୁତ ନରମ ଓ ସୁଆଦିଆ ରସଗୋଲା, ଯାହା ଓଡ଼ିଶା ରସଗୋଲା GI ଟ୍ୟାଗ୍ ପ୍ରାପ୍ତ।\n` +
        `* 🍲 **ଡାଲମା:** ଡାଲି ସହିତ ପରିବା ଏବଂ ଶୁଦ୍ଧ ଘିଅ-ଜିରା ଫୁଟଣରେ ପ୍ରସ୍ତୁତ ପୁଷ୍ଟିକର ପାରମ୍ପରିକ ଖାଦ୍ୟ।\n` +
        `* 🍚 **ପଖାଳ:** ଓଡ଼ିଆ ଜୀବନଶୈଳୀର ପ୍ରତୀକ ଏବଂ ଗ୍ରୀଷ୍ମ ଋତୁର ସ୍ୱାସ୍ଥ୍ୟପ୍ରଦ ପାରମ୍ପରିକ ଆହାର (୨୦ ମାର୍ଚ୍ଚ - ପଖାଳ ଦିବସ)।`;
    } else {
      return `**Authentic Flavors of Odisha Heritage Cuisine:**\n\n` +
        `* 🍰 **Chhenapoda (Roasted Cheese Cake):** Originating from Nayagarh, this is India's indigenous baked dessert made by slow-roasting fresh cottage cheese wrapped in Sal leaves.\n` +
        `* 🍯 **Pahala Rasagola:** Soft, velvety golden-brown cottage cheese dumplings simmered in light syrup, celebrated with Odisha's GI status.\n` +
        `* 🍲 **Dalma:** A sacred Ayurvedic-inspired lentil stew cooked with pumpkin, raw papaya, eggplant, and tempered in pure desi ghee and roasted cumin.\n` +
        `* 🍚 **Pakhala:** Fermented probiotic rice water meal seasoned with curd, roasted spices, and served with fried seasonal accompaniments.\n` +
        `* 🍱 **56 Bhog Mahaprasad:** Sacred temple delicacies cooked in stacked earthen pots in Puri.`;
    }
  }

  // Dance, Arts & Craft (Chhau, Odissi, Pattachitra)
  if (q.includes('chhau') || q.includes('dance') || q.includes('odissi') || q.includes('pattachitra') || q.includes('craft') || q.includes('art') || q.includes('raghurajpur') || q.includes('ikat') || q.includes('sambalpuri') || q.includes('नृत्य') || q.includes('कला') || q.includes('ନୃତ୍ୟ') || q.includes('ପଟ୍ଟଚିତ୍ର')) {
    if (isHi) {
      return `**ओडिशा की समृद्ध नृत्य एवं लोक कला परंपराएं:**\n\n` +
        `* 💃 **ओडिसी नृत्य (Odissi):** नाट्यशास्त्र और मंदिर की मूर्तियों से प्रेरित शास्त्रीय नृत्य, जिसमें 'त्रिभंग' मुद्रा और आध्यात्मिक भाव-अभिनय मुख्य है।\n` +
        `* 🎭 **मयूरभंज छऊ (Mayurbhanj Chhau):** यह युद्धकला (Martial Art) और नाट्य का अनूठा सम्मिश्रण है, जो बिना मुखौटे के अत्यंत ऊर्जावान कलाबाजियों और ढोल की थाप पर किया जाता है।\n` +
        `* 🎨 **रघुराजपुर का पट्टाचित्र (Pattachitra):** सूती कपड़े पर इमली के बीज के लेप और प्राकृतिक पत्थरों के रंगों से बनाई जाने वाली बारीक पारंपरिक चित्रकला।\n` +
        `* 🧵 **संबलपुरी इकत हथकरघा (Ikat):** 'बांधकला' (Tie & Dye) की प्राचीन तकनीक से निर्मित विश्वविख्यात संबलपुरी साड़ियाँ।`;
    } else if (isOr) {
      return `**ଓଡ଼ିଶାର ସମୃଦ୍ଧ ନୃତ୍ୟ ଓ ଲୋକକଳା ପରମ୍ପରା:**\n\n` +
        `* 💃 **ଓଡ଼ିଶୀ ନୃତ୍ୟ (Odissi):** ମନ୍ଦିର ଭାସ୍କର୍ଯ୍ୟ ଓ ନାଟ୍ୟଶାସ୍ତ୍ର ଉପରେ ଆଧାରିତ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ, ଯେଉଁଥିରେ 'ତ୍ରିଭଙ୍ଗୀ' ଠାଣି ଓ ଭକ୍ତିଭାବ ପ୍ରମୁଖ।\n` +
        `* 🎭 **ମୟୂରଭଞ୍ଜ ଛଉ (Chhau):** ଏକ ପ୍ରସିଦ୍ଧ ଯୁଦ୍ଧକଳା ଆଧାରିତ ନୃତ୍ୟ, ଯାହା ବିନା ମୁଖାରେ ଶାରୀରିକ କୌଶଳ ଓ ବୀରତ୍ୱପୂର୍ଣ୍ଣ ଅଭିନୟ ସହ ପରିବେଷିତ ହୁଏ।\n` +
        `* 🎨 **ରଘୁରାଜପୁର ପଟ୍ଟଚିତ୍ର (Pattachitra):** ପ୍ରାକୃତିକ ପଥର ରଙ୍ଗ ଓ କନା ଉପରେ ପ୍ରସ୍ତୁତ ପ୍ରାଚୀନ ଚିତ୍ରକଳା।\n` +
        `* 🧵 **ସମ୍ବଲପୁରୀ ବାନ୍ଧକଳା (Ikat Handlooms):** ହସ୍ତତନ୍ତ ବୟନକଳାର ଏକ ବିଶ୍ୱବିଖ୍ୟାତ ପାରମ୍ପରିକ ପଦ୍ଧତି।`;
    } else {
      return `**Odisha's Living Arts & Performing Heritage:**\n\n` +
        `* 💃 **Odissi Classical Dance:** One of India's oldest surviving classical dances, distinguished by its sculpted *Tribhanga* (three-bend posture), lyrical footwork, and temple bas-relief origins.\n` +
        `* 🎭 **Mayurbhanj Chhau:** An energetic martial dance-drama enacted without masks, combining warrior combat drills, dynamic leaps, and epic narratives.\n` +
        `* 🎨 **Raghurajpur Pattachitra:** Heritage scroll paintings on treated cotton fabric using 100% natural mineral pigments and gum, depicting mythological tales.\n` +
        `* 🧵 **Sambalpuri Ikat (Bandhakala):** World-renowned resist tie-and-dye weaving featuring sacred geometric and spiritual motifs (conch, wheel, lotus).`;
    }
  }

  // Itinerary & Travel Planning
  if (q.includes('itinerary') || q.includes('trip') || q.includes('tour') || q.includes('travel') || q.includes('days') || q.includes('visit') || q.includes('plan') || q.includes('route') || q.includes('यात्रा') || q.includes('भ्रमण') || q.includes('ଯାତ୍ରା')) {
    if (isHi) {
      return `**3 दिवसीय सांस्कृतिक गोल्डन ट्रायंगल यात्रा योजना:**\n\n` +
        `* 🏛️ **दिन 1: भुवनेश्वर (मंदिरों का नगर)** - लिंगराज मंदिर, मुक्तेश्वर मंदिर, धौली शांति स्तूप और उदयगिरि-खंडगिरि गुफाएं।\n` +
        `* 🎨 **दिन 2: रघुराजपुर एवं पुरी** - हेरिटेज पट्टाचित्र कला गाँव, जगन्नाथ मंदिर दर्शन, आनंद बाजार में महाप्रसाद और गोल्डन बीच।\n` +
        `* ☀️ **दिन 3: कोणार्क एवं पिपिली** - कोणार्क सूर्य मंदिर का सूर्योदय, चंद्रभागा बीच और पिपिली में एप्लिक शिल्प की खरीदारी।\n\n` +
        `💡 *सुझाव:* आप ऊपर दिए गए **"Itinerary"** बटन से अपने अनुसार 1-दिन, 3-दिन या 5-दिन का विस्तृत रूट मैप तैयार कर सकते हैं!`;
    } else if (isOr) {
      return `**୩ ଦିନିଆ ସାଂସ୍କୃତିକ ଗୋଲ୍ଡେନ୍ ଟ୍ରାଏଙ୍ଗଲ୍ ଯାତ୍ରା ଯୋଜନା:**\n\n` +
        `* 🏛️ **ଦିନ ୧: ଭୁବନେଶ୍ୱର (ଏକାମ୍ର କ୍ଷେତ୍ର)** - ଲିଙ୍ଗରାଜ ମନ୍ଦିର, ମୁକ୍ତେଶ୍ୱର, ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ଖଣ୍ଡଗିରି-ଉଦୟଗିରି।\n` +
        `* 🎨 **ଦିନ ୨: ରଘୁରାଜପୁର ଓ ପୁରୀ** - ରଘୁରାଜପୁର ଶିଳ୍ପ ଗ୍ରାମ, ଶ୍ରୀଜଗନ୍ନାଥ ମନ୍ଦିର ଦର୍ଶନ, ମହାପ୍ରସାଦ ଓ ବେଳାଭୂମି।\n` +
        `* ☀️ **ଦିନ ୩: କୋଣାର୍କ ଓ ପିପିଲି** - କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର, ଚନ୍ଦ୍ରଭାଗା ବେଳାଭୂମି ଓ ପିପିଲି ଚାନ୍ଦୁଆ ଶିଳ୍ପ।\n\n` +
        `💡 *ସୂଚନା:* ଉପରେ ଥିବା **"Itinerary"** ବଟନ୍ ଦବାଇ ଆପଣ ସମ୍ପୂର୍ଣ୍ଣ ମ୍ୟାପ୍ ସହିତ ଯାତ୍ରା ଯୋଜନା କରିପାରିବେ!`;
    } else {
      return `**Recommended 3-Day Golden Heritage Circuit:**\n\n` +
        `* 🏛️ **Day 1: Bhubaneswar (Temple City)** - Explore Lingaraja Temple, Mukteshvara gem, Dhauli Shanti Stupa, and Khandagiri-Udayagiri caves.\n` +
        `* 🎨 **Day 2: Raghurajpur & Puri** - Visit master artisan village of Raghurajpur, seek blessings at Jagannath Temple, savor Mahaprasad, and relax at Puri Golden Beach.\n` +
        `* ☀️ **Day 3: Konark & Pipili** - Marvel at the Konark Sun Temple, visit Chandrabhaga beach, and shop vibrant applique art at Pipili.\n\n` +
        `💡 *Tip:* You can use the dedicated **"Itinerary"** button in the Navbar to customize duration, themes, and interactive routes on the 3D globe!`;
    }
  }

  // 2. If matched specific entity directly by name from DB
  if (matchedEntities && matchedEntities.length > 0) {
    const primary = matchedEntities[0];
    const otherNames = matchedEntities.slice(1).map(e => e.name).join(', ');

    if (isHi) {
      let text = `**${primary.name}** (${primary.category_name || 'विरासत स्थल'}) हमारे सांस्कृतिक इतिहास का एक अत्यंत गौरवशाली अध्याय है।\n\n`;
      if (primary.description) {
        text += `📜 **ऐतिहासिक महत्व:** ${primary.description}\n\n`;
      }
      if (primary.location_context) {
        text += `📍 **स्थान व संदर्भ:** यह मुख्य रूप से **${primary.location_context}** क्षेत्र से संबंधित है।\n\n`;
      }
      if (otherNames) {
        text += `✨ **संबंधित स्थल व परंपराएं:** इससे जुड़े अन्य महत्वपूर्ण स्थलों में **${otherNames}** शामिल हैं।\n\n`;
      }
      text += `यदि आप इसके स्थापत्य, उत्सवों या भ्रमण योजना के बारे में विस्तार से जानना चाहते हैं, तो अवश्य बताएं!`;
      return text;
    } else if (isOr) {
      let text = `**${primary.name}** (${primary.category_name || 'ଐତିହ୍ୟ ସ୍ଥଳ'}) ଆମ ଓଡ଼ିଶା ତଥା ଭାରତର ଏକ ଅମୂଲ୍ୟ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ।\n\n`;
      if (primary.description) {
        text += `📜 **ଐତିହାସିକ ଗୁରୁତ୍ୱ:** ${primary.description}\n\n`;
      }
      if (primary.location_context) {
        text += `📍 **ଅବସ୍ଥିତି ଓ ପରିପ୍ରେକ୍ଷୀ:** ଏହା ମୁଖ୍ୟତଃ **${primary.location_context}** ଅଞ୍ଚଳ ସହିତ ଜଡ଼ିତ।\n\n`;
      }
      if (otherNames) {
        text += `✨ **ସମ୍ପୃକ୍ତ ଐତିହ୍ୟ ସ୍ଥଳ:** ଏହା ସହ ଜଡ଼ିତ ଅନ୍ୟାନ୍ୟ ସ୍ଥଳଗୁଡ଼ିକ ମଧ୍ୟରେ **${otherNames}** ଅନ୍ୟତମ।\n\n`;
      }
      text += `ଏହାର ସ୍ଥାପତ୍ୟ, ପର୍ବପର୍ବାଣି କିମ୍ବା ଯାତ୍ରା ଯୋଜନା ବିଷୟରେ ଆପଣ ଆଉ କ'ଣ ଜାଣିବାକୁ ଚାହାନ୍ତି?`;
      return text;
    } else {
      let text = `**${primary.name}** (${primary.category_name || 'Heritage Treasure'}) represents a profound landmark in India's living cultural legacy.\n\n`;
      if (primary.description) {
        text += `📜 **Historical & Cultural Significance:** ${primary.description}\n\n`;
      }
      if (primary.location_context) {
        text += `📍 **Location & Context:** Located in and around **${primary.location_context}**.\n\n`;
      }
      if (otherNames) {
        text += `✨ **Related Heritage Dimensions:** You can also explore connected heritage sites like **${otherNames}**.\n\n`;
      }
      text += `Would you like to explore its architectural features, major festivals, or plan a day-by-day travel trail to this heritage site?`;
      return text;
    }
  }

  // 3. Fallback General Heritage Guide
  if (isHi) {
    return `नमस्ते! **धरोहर (DHAROHAR)** ज्ञानकोष में आपका स्वागत है।\n\n` +
      `आप मुझसे ओडिशा और भारत के 200+ प्राचीन मंदिरों (जैसे कोणार्क, जगन्नाथ पुरी, लिंगराज, चौसठ योगिनी), शास्त्रीय नृत्य रूपों (ओडिसी, छऊ), पारंपरिक कलाओं (पट्टाचित्र, संबलपुरी हथकरघा), लोक व्यंजनों (छेनापोड़ा, महाप्रसाद) और सांस्कृतिक यात्रा मार्गों के बारे में कुछ भी पूछ सकते हैं।\n\n` +
      `आप किस विशेष स्थल या विषय के बारे में विस्तार से जानना चाहते हैं?`;
  } else if (isOr) {
    return `ନମସ୍କାର! **ଧରୋହର (DHAROHAR)** ଜ୍ଞାନକୋଷକୁ ସ୍ୱାଗତ।\n\n` +
      `ଆପଣ ମୋତେ ଓଡ଼ିଶାର ୨୦୦+ ପ୍ରାଚୀନ ମନ୍ଦିର (ଯଥା: କୋଣାର୍କ, ଜଗନ୍ନାଥ ପୁରୀ, ଲିଙ୍ଗରାଜ, ଚଉଷଠି ଯୋଗିନୀ), ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ (ଓଡ଼ିଶୀ, ଛଉ), ହସ୍ତଶିଳ୍ପ (ପଟ୍ଟଚିତ୍ର, ସମ୍ବଲପୁରୀ ବୟନକଳା), ପାରମ୍ପରିକ ଖାଦ୍ୟ (ଛେନାପୋଡ଼, ମହାପ୍ରସାଦ) କିମ୍ବା ଯାତ୍ରା ଯୋଜନା ବିଷୟରେ ପଚାରିପାରିବେ।\n\n` +
      `ଆପଣ କେଉଁ ବିଷୟରେ ଜାଣିବାକୁ ଚାହାନ୍ତି?`;
  } else {
    return `Namaste! Welcome to **DHAROHAR - Living Heritage Knowledge System**.\n\n` +
      `I can guide you through over 200+ verified sacred temples (Konark, Jagannath Puri, Lingaraja, Chausath Yogini), classical dance traditions (Odissi, Mayurbhanj Chhau), master crafts (Raghurajpur Pattachitra, Sambalpuri Handlooms), indigenous cuisine (Chhenapoda, Mahaprasad), and tailored travel itineraries.\n\n` +
      `What specific heritage topic or monument would you like to explore today?`;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, entityContext, language } = req.body;
    
    const targetLanguage = language || "English";
    const contextName = entityContext?.name || "Indian Cultural Heritage";
    const contextCategory = entityContext?.category_name || "Heritage Dimension";
    const contextDesc = entityContext?.description || "Sacred architecture, performing arts, folklore, and living traditions.";

    // Stop words to avoid false positive substring matches
    const stopWords = new Set([
      'tell', 'me', 'about', 'what', 'where', 'when', 'which', 'who', 'how', 'why',
      'this', 'that', 'these', 'those', 'some', 'have', 'from', 'they', 'them',
      'their', 'your', 'would', 'could', 'should', 'please', 'know', 'give', 'find',
      'here', 'there', 'also', 'into', 'than', 'then', 'like', 'more', 'most', 'much',
      'many', 'good', 'best', 'with', 'without', 'and', 'the', 'for', 'are', 'was',
      'were', 'its', 'itself', 'kya', 'hai', 'kaise', 'batao', 'kahan', 'kab', 'karo', 'hoga'
    ]);

    // Grounding: Search DB for matching entities mentioned in message
    let matchedEntities = [];
    try {
      if (message && message.trim().length > 2) {
        const rawWords = message.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
        const keywords = rawWords.filter(w => w.length >= 3 && !stopWords.has(w));
        
        if (keywords.length > 0) {
          const matchQuery = `
            SELECT e.id, e.name, e.location_context, e.description, e.metadata, e.coordinates, c.name as category_name
            FROM entities e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE ${keywords.map((_, idx) => `LOWER(e.name) LIKE $${idx + 1}`).join(' OR ')}
            LIMIT 4;
          `;
          const params = keywords.map(k => `%${k}%`);
          const dbMatch = await pool.query(matchQuery, params);
          matchedEntities = dbMatch.rows;
        }
      }
    } catch (dbErr) {
      console.warn("DB entity matching for chat failed:", dbErr.message);
    }

    let languageInstruction = "Answer in English as an engaging, authentic, and inspiring Indian cultural historian.";
    if (targetLanguage === "Hindi") {
      languageInstruction = "Answer completely in fluent, respectful Hindi (हिन्दी / देवनागरी लिपि) as a knowledgeable cultural chronicler and storyteller.";
    } else if (targetLanguage === "Odia") {
      languageInstruction = "Answer completely in authentic, fluent Odia (ଓଡ଼ିଆ ଲିପି) as a dedicated heritage chronicler and cultural storyteller.";
    }

    const groundingContext = matchedEntities.length > 0
      ? `\nRelevant Verified Heritage Sites Found in Database:\n` + matchedEntities.map(e => `- ${e.name} (${e.category_name || 'Heritage'}, located in ${e.location_context || 'Odisha'}): ${e.description || ''}`).join('\n')
      : '';

    const systemPrompt = `You are Dharohar AI Guide (also known as Darshak), the Master Cultural Heritage Navigator for DHAROHAR.
Focus Context: ${contextName} (${contextCategory}).
Context Details: ${contextDesc}
${groundingContext}
Language Requirement: ${languageInstruction}
Provide a rich, inspiring, historically accurate, and engaging answer formatted cleanly with markdown bolding (**important terms**), bullet points for highlights, and a warm storytelling tone. Keep it concise (2-3 paragraphs).`;

    const promptText = `${systemPrompt}\n\nExplorer Question: ${message}`;
    
    // Suggested follow-ups based on query
    const defaultFollowUps = targetLanguage === "Hindi"
      ? [
          "यहाँ के प्रमुख उत्सव व अनुष्ठान कौन से हैं?",
          "इसकी स्थापत्य कला की मुख्य विशेषताएं क्या हैं?",
          "यहाँ पहुँचने का सबसे अच्छा समय और मार्ग क्या है?"
        ]
      : targetLanguage === "Odia"
      ? [
          "ଏହାର ସ୍ଥାପତ୍ୟ ଓ ପ୍ରାଚୀନ ଇତିହାସ କ'ଣ?",
          "ଏଠାରେ ପାଳିତ ପ୍ରମୁଖ ପର୍ବପର୍ବାଣି କ'ଣ?",
          "ଏଠାକୁ ଯିବାର ସର୍ବୋତ୍ତମ ସମୟ କେବେ?"
        ]
      : [
          "What is the unique architectural style here?",
          "Which major festivals and rituals happen here?",
          "What is the best itinerary to visit nearby heritage spots?"
        ];

    if (genAI) {
      const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
      
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
          console.warn(`Model ${modelName} failed, attempting next candidate...`);
        }
      }
    }

    // High-intelligence Cultural Heritage Knowledge Engine Synthesis
    const knowledgeResponse = generateCulturalHeritageAnswer(message, targetLanguage, matchedEntities, entityContext);

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
