const path = require('path');
const backendModules = path.resolve(__dirname, '../backend/node_modules');
require(path.join(backendModules, 'dotenv')).config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require(path.join(backendModules, 'pg'));

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("Error: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const client = new Client({
  connectionString: DB_URL,
  ssl: DB_URL && DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Comprehensive Authentic Semantic Cultural Relationships
const CURATED_RELATIONSHIPS = [
  // 1. Konark Sun Temple Hub
  {
    source: "Konark Sun Temple",
    target: "Narasimhadeva I",
    type: "patron_dynasty",
    label_en: "Ganga Dynasty Royal Patronage",
    label_hi: "गंग राजवंश का शाही संरक्षण",
    label_or: "ଗଙ୍ଗ ବଂଶର ରାଜକୀୟ ପୃଷ୍ଠପୋଷକତା",
    lore_en: "Commissioned around 1250 CE by warrior king Langula Narasimhadeva I to celebrate his military victories and devotion to Surya.",
    lore_hi: "1250 ईस्वी में पूर्वी गंग वंश के वीर राजा लांगुला नरसिंहदेव प्रथम ने अपने सैन्य विजय और सूर्य देव के प्रति समर्पण हेतु इस मंदिर का निर्माण करवाया था।",
    lore_or: "୧୨୫୦ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ ଗଙ୍ଗ ବଂଶର ବୀର ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବ ନିଜର ବିଜୟ ଗୌରବ ଓ ସୂର୍ଯ୍ୟ ଉପାସନା ପାଇଁ ଏହି ବିଶାଳ ମନ୍ଦିର ନିର୍ମାଣ କରାଇଥିଲେ।"
  },
  {
    source: "Konark Sun Temple",
    target: "Konark Dance Festival",
    type: "celebrated_festival",
    label_en: "Open-Air Classical Dance Conclave",
    label_hi: "कोणार्क शास्त्रीय नृत्य महोत्सव",
    label_or: "କୋଣାର୍କ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଉତ୍ସବ",
    lore_en: "Held every December against the illuminated stone backdrop of the Sun Temple, uniting world-class exponents of Odissi, Bharatanatyam, and Kathak.",
    lore_hi: "प्रत्येक वर्ष दिसंबर में सूर्य मंदिर की जगमगाती पाषाण पृष्ठभूमि में आयोजित होने वाला विश्वस्तरीय शास्त्रीय नृत्य समारोह।",
    lore_or: "ପ୍ରତିବର୍ଷ ଡିସେମ୍ବର ମାସରେ ସୂର୍ଯ୍ୟ ମନ୍ଦିରର ଆଲୋକିତ ପୃଷ୍ଠଭୂମିରେ ଅନୁଷ୍ଠିତ ହେଉଥିବା ପ୍ରସିଦ୍ଧ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଉତ୍ସବ।"
  },
  {
    source: "Konark Sun Temple",
    target: "Odissi",
    type: "associated_dance",
    label_en: "Sculptural Source of Odissi Mudras",
    label_hi: "ओडिसी नृत्य मुद्राओं का मूर्तिकला स्रोत",
    label_or: "ଓଡ଼ିଶୀ ନୃତ୍ୟ ଭଙ୍ଗୀର ଭାସ୍କର୍ଯ୍ୟ ଉତ୍ସ",
    lore_en: "Over 1,000 intricately carved celestial dancers (Alasa Kanyas) on the Natya Mandapa served as the definitive visual manuscript for the revival of classical Odissi.",
    lore_hi: "नाट्यमंडप पर उकेरी गई 1,000 से अधिक अलसा कन्याओं की नृत्य मुद्राएं 20वीं सदी में शास्त्रीय ओडिसी के पुनरुद्धार का मुख्य आधार बनीं।",
    lore_or: "ନାଟମଣ୍ଡପରେ ଖୋଦିତ ଅଳସକନ୍ୟା ଓ ନୃତ୍ୟାଙ୍ଗନାମାନଙ୍କ ଭଙ୍ଗୀ ଶାସ୍ତ୍ରୀୟ ଓଡ଼ିଶୀ ନୃତ୍ୟର ପୁନରୁଦ୍ଧାର ପାଇଁ ମୁଖ୍ୟ ପ୍ରମାଣ ଥିଲା।"
  },
  {
    source: "Konark Sun Temple",
    target: "Lingaraj Temple",
    type: "architectural_evolution",
    label_en: "Evolution of Kalinga Architecture",
    label_hi: "कलिंग वास्तुकला का स्वर्णिम विकास",
    label_or: "କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟର କ୍ରମବିକାଶ",
    lore_en: "Lingaraj in Old Bhubaneswar established the 11th-century Rekha Deula shikhara geometry that was subsequently engineered into the colossal 24-wheeled chariot of Surya at Konark.",
    lore_hi: "11वीं सदी का लिंगराज मंदिर कलिंग शिखर शैली का आधार बना, जिसे 13वीं सदी में कोणार्क में भव्य पैमाने पर सूर्य के 24 पहियों वाले रथ के रूप में गढ़ा गया।",
    lore_or: "୧୧ଶ ଶତାବ୍ଦୀର ଲିଙ୍ଗରାଜ ମନ୍ଦିରର ରେଖା ଦେଉଳ ଶୈଳୀ ପରବର୍ତ୍ତୀ ସମୟରେ କୋଣାର୍କରେ ୨୪ ଚକ ବିଶିଷ୍ଟ ସୂର୍ଯ୍ୟ ରଥ ଭାବେ ରୂପାନ୍ତରିତ ହୋଇଥିଲା।"
  },
  {
    source: "Konark Sun Temple",
    target: "Stone Carving",
    type: "artisan_lineage",
    label_en: "Hereditary Stonemasons Tradition",
    label_hi: "पारंपरिक पाषाण शिल्पकारी परंपरा",
    label_or: "ବଂଶାନୁକ୍ରମିକ ପ୍ରସ୍ତର ଖୋଦେଇ କଳା",
    lore_en: "The legendary craftsmanship of Bishu Maharana and 1,200 sculptors continues in the thriving stone workshops of Konark and Puri today.",
    lore_hi: "बिशु महाराणा और 1200 शिल्पकारों की गौरवशाली स्थापत्य कला आज भी कोणार्क व पुरी के मूर्तिकारों में जीवित है।",
    lore_or: "ବିଷୁ ମହାରଣା ଓ ୧୨୦୦ ବଢ଼େଇଙ୍କ ଐତିହାସିକ ପ୍ରସ୍ତର କଳା ଆଜି ମଧ୍ୟ କୋଣାର୍କ ଓ ପୁରୀର ପାରମ୍ପରିକ ଶିଳ୍ପୀମାନଙ୍କ ଦ୍ୱାରା ପ୍ରତିଫଳିତ ହେଉଛି।"
  },
  {
    source: "Konark Sun Temple",
    target: "Konark / Chandrabhaga",
    type: "sacred_geography",
    label_en: "Chandrabhaga Sacred Confluence & Lore",
    label_hi: "चंद्रभागा तीर्थ एवं सांब उपासना कथा",
    label_or: "ଚନ୍ଦ୍ରଭାଗା ତୀର୍ଥ ଓ ସାମ୍ବ ଉପାସନା ଗାଥା",
    lore_en: "The temple was built where the sacred Chandrabhaga River met the Bay of Bengal, where Lord Krishna's son Samba was healed of leprosy through Surya worship.",
    lore_hi: "यह मंदिर चंद्रभागा नदी और समुद्र के पावन संगम पर स्थित है, जहां श्रीकृष्ण के पुत्र सांब ने सूर्य उपासना कर कुष्ठ रोग से मुक्ति पाई थी।",
    lore_or: "ଚନ୍ଦ୍ରଭାଗା ନଦୀ ଓ ସାଗର ସଙ୍ଗମରେ ନିର୍ମିତ ଏହି ପବିତ୍ର ସ୍ଥଳରେ ଶ୍ରୀକୃଷ୍ଣଙ୍କ ପୁତ୍ର ସାମ୍ବ ସୂର୍ଯ୍ୟ ଉପାସନା କରି କୁଷ୍ଠରୋଗରୁ ମୁକ୍ତି ଲାଭ କରିଥିଲେ।"
  },

  // 2. Shree Jagannath Temple Hub
  {
    source: "Jagannath Temple",
    target: "Ratha Yatra",
    type: "sacred_festival",
    label_en: "World-Renowned Chariot Festival",
    label_hi: "विश्वप्रसिद्ध रथयात्रा महोत्सव",
    label_or: "ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଶ୍ରୀଗୁଣ୍ଡିଚା ରଥଯାତ୍ରା",
    lore_en: "The divine 9-day summer journey where the Lord of the Universe leaves the sanctum atop grand wooden chariots to embrace all devotees without barrier.",
    lore_hi: "9 दिवसीय पावन ग्रीष्मकालीन उत्सव जिसमें भगवान जगन्नाथ अपने नंदीघोष रथ पर सवार होकर सर्वजन को दर्शन देने गुंडिचा मंदिर पधारते हैं।",
    lore_or: "୯ ଦିନର ପବିତ୍ର ରଥଯାତ୍ରା, ଯେଉଁଥିରେ ମହାପ୍ରଭୁ ଶ୍ରୀଜଗନ୍ନାଥ ନନ୍ଦିଘୋଷ ରଥରେ ବିଜେ କରି ସବୁ ଭକ୍ତଙ୍କୁ ଦର୍ଶନ ଦିଅନ୍ତି।"
  },
  {
    source: "Jagannath Temple",
    target: "Mahaprasad",
    type: "culinary_tradition",
    label_en: "56 Bhog Sacred Temple Cuisine",
    label_hi: "56 भोग पवित्र महाप्रसाद परंपरा",
    label_or: "ଛପନ ଭୋଗ ପବିତ୍ର ମହାପ୍ରସାଦ ପରମ୍ପରା",
    lore_en: "Prepared in the world's largest traditional kitchen in stacked earthen pots (Kudua) using pure wood fire, consecrated directly to Goddess Vimala.",
    lore_hi: "विश्व की सबसे बड़ी पारंपरिक रसोई में मिट्टी के 7 बर्तनों को एक के ऊपर एक रखकर भाप से तैयार किया जाने वाला पावन नैवेद्य।",
    lore_or: "ବିଶ୍ୱର ସର୍ବବୃହତ ପାରମ୍ପରିକ ରୋଷଘରେ ମାଟି କୁଡ଼ୁଆରେ ସପ୍ତଭାଣ୍ଡ ପଦ୍ଧତିରେ କାଠ ନିଆଁରେ ପ୍ରସ୍ତୁତ ପବିତ୍ର ମହାପ୍ରସାଦ।"
  },
  {
    source: "Jagannath Temple",
    target: "Pattachitra",
    type: "artisan_lineage",
    label_en: "Sacred Anasara Patti Dian Paintings",
    label_hi: "अनवसर पट्टचित्र एवं पवित्र पट्टी दिअं",
    label_or: "ଅଣସର ପବିତ୍ର ପଟ୍ଟିଦିଅଁ ଅଙ୍କନ",
    lore_en: "During the 15-day Anasara seclusion following Snana Yatra, hereditary Chitrakaras paint cloth-canvas icons (Patti Dian) worshiped in the sanctum.",
    lore_hi: "स्नान पूर्णिमा के बाद 15 दिनों के अनवसर काल में रघुराजपुर के चित्रकार कपड़े पर 'पट्टी दिअं' चित्र बनाते हैं, जिनकी गर्भगृह में पूजा होती है।",
    lore_or: "ସ୍ନାନ ପୂର୍ଣ୍ଣିମା ପରେ ୧୫ ଦିନର ଅଣସର ସମୟରେ ପାରମ୍ପରିକ ଚିତ୍ରକାରମାନେ କନା ଉପରେ ପବିତ୍ର ପଟ୍ଟିଦିଅଁ ଅଙ୍କନ କରନ୍ତି।"
  },
  {
    source: "Jagannath Temple",
    target: "Pipili Applique Work",
    type: "ritual_craft",
    label_en: "Chariot Canopies & Temple Chandua",
    label_hi: "रथ के पवित्र चंदोवे एवं पीपिली चांदुआ शिल्प",
    label_or: "ରଥର ପବିତ୍ର ଚାନ୍ଦୁଆ ଓ ପିପିଲି ଚାନ୍ଦୁଆ ଶିଳ୍ପ",
    lore_en: "Hereditary tailors of Pipili hand-stitch the colorful applique cloth canopies (Mandani) that drape the majestic chariots of Lord Jagannath, Balabhadra, and Subhadra.",
    lore_hi: "पीपिली के पारंपरिक दर्जी कारीगर तीनों रथों के लिए लाल, पीले, काले और हरे रंगों के विशाल चांदुआ और चंदोवे तैयार करते हैं।",
    lore_or: "ପିପିଲିର ଦରଜୀ କାରିଗରମାନେ ତିନି ରଥ ପାଇଁ ରଙ୍ଗବେରଙ୍ଗର ପବିତ୍ର ଚାନ୍ଦୁଆ, ମଣ୍ଡଣୀ ଓ କନା ପ୍ରସ୍ତୁତ କରନ୍ତି।"
  },
  {
    source: "Jagannath Temple",
    target: "Gotipua",
    type: "associated_dance",
    label_en: "Gotipua & Mahari Sacred Temple Dance",
    label_hi: "गोटीपुआ एवं महारी नृत्य सेवा",
    label_or: "ଗୋଟିପୁଅ ଓ ମାହାରୀ ନୃତ୍ୟ ସେବା",
    lore_en: "Young boys dressed as maidens perform acrobatic Gotipua in temple courtyards, serving as the foundational root of modern classical Odissi.",
    lore_hi: "स्त्री वेष में नन्हें बालकों द्वारा प्रस्तुत की जाने वाली गोटीपुआ नृत्य सेवा मंदिर प्रांगणों में भगवान के सम्मुख की जाती रही है।",
    lore_or: "ଶ୍ରୀମନ୍ଦିର ନାଟମଣ୍ଡପ ଓ ପୁରୀ ଆଖଡ଼ା ଘରେ ବାଳକମାନଙ୍କ ଦ୍ୱାରା ପରିବେଷିତ ଗୋଟିପୁଅ ନୃତ୍ୟ ଓଡ଼ିଶୀର ମୁଖ୍ୟ ମୂଳଦୁଆ।"
  },
  {
    source: "Jagannath Temple",
    target: "Bali Jatra",
    type: "maritime_trade",
    label_en: "Blessings for Ancient Maritime Sadhabas",
    label_hi: "साधव नाविकों की समुद्री यात्रा एवं आशीर्वाद",
    label_or: "ସାଧବ ପୁଅମାନଙ୍କ ବୋଇତ ବାଣିଜ୍ୟ ଓ ଆଶୀର୍ବାଦ",
    lore_en: "Ancient mariners of Kalinga offered prayers at Puri before embarking on transoceanic voyages to Bali, Java, and Sumatra during Kartik Purnima.",
    lore_hi: "कार्तिक पूर्णिमा पर बाली व सुमात्रा की व्यापारिक यात्राओं पर निकलने से पहले कलिंग के साधव नाविक जगन्नाथ मंदिर में आशीर्वाद लेते थे।",
    lore_or: "କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମାରେ ଦକ୍ଷିଣ-ପୂର୍ବ ଏସିଆ ବୋଇତ ଯାତ୍ରା ପୂର୍ବରୁ କଳିଙ୍ଗର ସାଧବମାନେ ଶ୍ରୀଜଗନ୍ନାଥଙ୍କ ଆଶୀର୍ବାଦ ଭିକ୍ଷା କରୁଥିଲେ।"
  },
  {
    source: "Jagannath Temple",
    target: "Chhera Pahara",
    type: "royal_servitude",
    label_en: "Gajapati King's Sacred Sweeping Ritual",
    label_hi: "गजपति महाराजा की छेरा पहंरा सेवा",
    label_or: "ଗଜପତି ମହାରାଜାଙ୍କ ଛେରା ପହଁରା ନୀତି",
    lore_en: "The King of Puri sweeps the chariot floors with a golden broom, demonstrating that even monarchs are humble servitors before the Lord.",
    lore_hi: "पुरी के गजपति महाराज सोने की झाड़ू से रथ के चबूतरे को बुहारते हैं, जो ईश्वर के समक्ष राजसत्ता की विनम्र सेवा का अनुपम प्रतीक है।",
    lore_or: "ପୁରୀ ଗଜପତି ମହାରାଜା ସୁନା ଖଡ଼ିକାରେ ରଥ ଉପରେ ଛେରା ପହଁରା କରି ନିଜକୁ ମହାପ୍ରଭୁଙ୍କ ପ୍ରଥମ ସେବକ ଭାବେ ପ୍ରମାଣିତ କରନ୍ତି।"
  },
  {
    source: "Jagannath Temple",
    target: "Sand Art of Puri",
    type: "living_art",
    label_en: "Golden Beach Sand Sculptures",
    label_hi: "पुरी के स्वर्ण बालू तट की रेत मूर्तिकला",
    label_or: "ପୁରୀ ସୁବର୍ଣ୍ଣ ବେଳାଭୂମିର ବାଲୁକା କଳା",
    lore_en: "Originating with saint Balaram Das carving Jagannath in sand in the 16th century, Puri's golden beach is now world-renowned for contemporary sand art.",
    lore_hi: "16वीं सदी में भक्त बलराम दास द्वारा रेत पर जगन्नाथ की मूर्ति गढ़ने से शुरू हुई यह कला आज विश्वविख्यात हो चुकी है।",
    lore_or: "୧୬ଶ ଶତାବ୍ଦୀରେ ଭକ୍ତ ବଳରାମ ଦାସଙ୍କ ବାଲିରେ ଜଗନ୍ନାଥ ଗଢ଼ିବା ପରମ୍ପରାରୁ ଆଜି ପୁରୀ ବେଳାଭୂମିର ବାଲୁକା କଳା ବିଶ୍ୱପ୍ରସିଦ୍ଧ।"
  },

  // 3. Lingaraj & Ekamra Kshetra (Old Bhubaneswar)
  {
    source: "Lingaraj Temple",
    target: "Mukteswar Temple",
    type: "architectural_evolution",
    label_en: "The Gem of Kalinga Transition",
    label_hi: "कलिंग वास्तुकला का स्वर्णिम रत्न",
    label_or: "କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟର ସ୍ୱର୍ଣ୍ଣିମ ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିର",
    lore_en: "Built in the 10th century, Mukteswar's famed arched torana gateway and graceful shikhara served as the design prototype for the grand Lingaraj deula.",
    lore_hi: "10वीं सदी में निर्मित मुक्तेश्वर का अद्वितीय तोरण द्वार और शिखर लिंगराज के 180 फीट ऊंचे शिखर के निर्माण का मुख्य प्रेरणास्रोत बना।",
    lore_or: "୧୦ମ ଶତାବ୍ଦୀର ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିରର ତୋରଣ ଓ କମନୀୟ ଶିଖର ଲିଙ୍ଗରାଜ ମନ୍ଦିର ନିର୍ମାଣର ମୂଳଦୁଆ ଥିଲା।"
  },
  {
    source: "Lingaraj Temple",
    target: "Rajarani Temple",
    type: "architectural_evolution",
    label_en: "Lyrical Sandstone Nayika Sculptures",
    label_hi: "राजराणी मंदिर की पाषाण नायिकाएं",
    label_or: "ରାଜାରାଣୀ ମନ୍ଦିରର ପାଷାଣ ନାୟିକା ଭାସ୍କର୍ଯ୍ୟ",
    lore_en: "Carved from warm Rajaraniya sandstone with miniature spires, Rajarani shares the refined Somavamshi aesthetic surrounding Lingaraj.",
    lore_hi: "पीले-लाल बलुआ पत्थर से बना राजराणी मंदिर अपनी नक्काशीदार नायिकाओं के साथ लिंगराज के समकालीन सोमवंशी काल का गौरव है।",
    lore_or: "ହଳଦିଆ-ଲାଲ ବାଲୁକା ପଥରରେ ନିର୍ମିତ ରାଜାରାଣୀ ମନ୍ଦିରର ନାୟିକା ମୂର୍ତ୍ତି ଲିଙ୍ଗରାଜ କ୍ଷେତ୍ରର କଳା ସମୃଦ୍ଧିକୁ ଦର୍ଶାଏ।"
  },
  {
    source: "Lingaraj Temple",
    target: "Brahmeswara Temple",
    type: "architectural_evolution",
    label_en: "Panchayatana Temple Style & Inscriptions",
    label_hi: "पंचायतान शैली एवं सोमवंशी शिलालेख",
    label_or: "ପଞ୍ଚାୟତନ ଶୈଳୀ ଓ ସୋମବଂଶୀୟ ଶିଳାଲେଖ",
    lore_en: "Built in 1058 CE with four subsidiary shrines, Brahmeswara contains royal stone inscriptions detailing the dynasty that consecrated Lingaraj.",
    lore_hi: "1058 ईस्वी में निर्मित इस पंचायतान मंदिर में सोमवंशी रानी कोलावती देवी का महत्वपूर्ण शिलालेख संरक्षित है।",
    lore_or: "୧୦୫୮ ଖ୍ରୀଷ୍ଟାବ୍ଦରେ ନିର୍ମିତ ଏହି ପଞ୍ଚାୟତନ ମନ୍ଦିରରେ ସୋମବଂଶର ରାଜକୀୟ ଶିଳାଲେଖ ସଂରକ୍ଷିତ ରହିଛି।"
  },
  {
    source: "Lingaraj Temple",
    target: "Dhauli Rock Edicts",
    type: "spiritual_axis",
    label_en: "Shaivite & Ashokan Buddhist Confluence",
    label_hi: "शैव एवं अशोक कालीन बौद्ध संगम",
    label_or: "ଶୈବ ଓ ଅଶୋକଙ୍କ ବୌଦ୍ଧ ସଂସ୍କୃତିର ସମନ୍ୱୟ",
    lore_en: "Located on opposite banks of the sacred Daya River, Dhauli and Lingaraj illustrate Odisha's timeless synthesis of Shaivism and Buddhism.",
    lore_hi: "दया नदी के दोनों तटों पर स्थित धौली और लिंगराज ओडिशा के शैव और बौद्ध मतों के ऐतिहासिक सद्भाव के साक्षात प्रमाण हैं।",
    lore_or: "ଦୟା ନଦୀ କୂଳରେ ଅବସ୍ଥିତ ଧଉଳି ଓ ଲିଙ୍ଗରାଜ କ୍ଷେତ୍ର ଓଡ଼ିଶାର ଶୈବ ଓ ବୌଦ୍ଧ ସଂସ୍କୃତିର ଏକତ୍ର ସମନ୍ୱୟକୁ ଦର୍ଶାଏ।"
  },

  // 4. Buddhist Heritage Triangle
  {
    source: "Dhauli Rock Edicts",
    target: "Ashoka",
    type: "historical_turning_point",
    label_en: "Emperor Ashoka's Historic Awakening",
    label_hi: "सम्राट अशोक का हृदय परिवर्तन एवं धम्म विजय",
    label_or: "ସମ୍ରାଟ ଅଶୋକଙ୍କ ହୃଦୟ ପରିବର୍ତ୍ତନ ଓ ଧର୍ମାନ୍ତରଣ",
    lore_en: "The bloody Kalinga War in 261 BCE transformed Emperor Ashoka from Chandashoka to Dharmashoka, inspiring his edicts of universal compassion carved here.",
    lore_hi: "261 ईसा पूर्व के कलिंग युद्ध के बाद सम्राट अशोक ने रक्तपात त्याग कर यहीं बौद्ध धम्म अपनाया और शांति के अमर संदेश शिलाओं पर उत्कीर्ण करवाए।",
    lore_or: "ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ରେ କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ସମ୍ରାଟ ଅଶୋକ ଏହିଠାରେ ଅହିଂସା ଓ ବୌଦ୍ଧ ଧର୍ମ ଗ୍ରହଣ କରି ଶିଳାଲେଖ ଖୋଦେଇ କରାଇଥିଲେ।"
  },
  {
    source: "Dhauli Rock Edicts",
    target: "Ratnagiri Buddhist Site",
    type: "buddhist_lineage",
    label_en: "Flourishing of Tantric Buddhist Monasteries",
    label_hi: "रत्नगिरि तांत्रिक बौद्ध महाविहार का विकास",
    label_or: "ରତ୍ନଗିରି ବୌଦ୍ଧ ମହାବିହାରର ପ୍ରସାର",
    lore_en: "The royal adoption of Buddhism at Dhauli catalyzed the establishment of the great monastic university and carved green chlorite doorways at Ratnagiri.",
    lore_hi: "धौली में बौद्ध धर्म के विस्तार के बाद जाजपुर की पहाड़ियों में रत्नगिरि जैसे विशाल महाविहार स्थापित हुए, जो तंत्रयान के वैश्विक केंद्र बने।",
    lore_or: "ଧଉଳିରୁ ଆରମ୍ଭ ହୋଇଥିବା ବୌଦ୍ଧ ଧାରା ରତ୍ନଗିରିରେ ବିଶ୍ୱପ୍ରସିଦ୍ଧ ବୌଦ୍ଧ ବିଶ୍ୱବିଦ୍ୟାଳୟ ଓ କାରୁକାର୍ଯ୍ୟପୂର୍ଣ୍ଣ ପ୍ରବେଶ ଦ୍ୱାର ଭାବେ ବିକଶିତ ହେଲା।"
  },
  {
    source: "Ratnagiri Buddhist Site",
    target: "Lalitagiri (Naltigiri) Buddhist Ruins",
    type: "diamond_triangle",
    label_en: "Diamond Triangle Monastic Circuit",
    label_hi: "डायमंड ट्रायंगल बौद्ध पीठ एवं पवित्र धातु मंजूषा",
    label_or: "ହୀରାକୂଟ ବୌଦ୍ଧ ତ୍ରିକୋଣ ଓ ପବିତ୍ର ଅସ୍ଥି ମଞ୍ଜୁଷା",
    lore_en: "Lalitagiri is the oldest site of the Diamond Triangle where sacred caskets containing holy relics (believed to be of Gautama Buddha) were unearthed.",
    lore_hi: "ललितगिरि डायमंड ट्रायंगल का सबसे प्राचीन स्थल है जहाँ भगवान बुद्ध के पवित्र अस्थि अवशेषों वाली स्वर्ण व चांदी की धातु मंजूषाएं प्राप्त हुईं।",
    lore_or: "ଲଳିତଗିରି ହେଉଛି ପ୍ରାଚୀନତମ ବୌଦ୍ଧ ସ୍ଥଳ, ଯେଉଁଠାରୁ ଭଗବାନ ବୁଦ୍ଧଙ୍କ ପବିତ୍ର ଅସ୍ଥି ମଞ୍ଜୁଷା ଖନନରୁ ମିଳିଥିଲା।"
  },
  {
    source: "Ratnagiri Buddhist Site",
    target: "Udayagiri Buddhist Site",
    type: "diamond_triangle",
    label_en: "Rock-Cut Stupas & Ancient Stele",
    label_hi: "उदयगिरि के पाषाण स्तूप एवं बौद्ध विहार",
    label_or: "ଉଦୟଗିରିର ପ୍ରସ୍ତର ସ୍ତୂପ ଓ ବୌଦ୍ଧ ବିହାର",
    lore_en: "Udayagiri features sprawling monasteries and colossal stone images of Avalokiteshwara forming an unbroken academic network with Ratnagiri.",
    lore_hi: "उदयगिरि में विस्तृत महाविहार और अवलोकितेश्वर की विशाल पाषाण प्रतिमाएं रत्नगिरि के साथ मिलकर प्राचीन शिक्षा केंद्र बनाती थीं।",
    lore_or: "ଉଦୟଗିରିରେ ବିଶାଳ ବୌଦ୍ଧ ସ୍ତୂପ, ମହାବିହାର ଓ ଅବଲୋକିତେଶ୍ୱରଙ୍କ ପ୍ରତିମା ରତ୍ନଗିରି ସହିତ ଏକ ପ୍ରମୁଖ ଶିକ୍ଷା କେନ୍ଦ୍ର ଗଠନ କରିଥିଲା।"
  },
  {
    source: "Udayagiri and Khandagiri Caves",
    target: "Kharavela",
    type: "ancient_dynasty",
    label_en: "Emperor Kharavela's Hathigumpha Inscription",
    label_hi: "सम्राट खारवेल का हाथीगुम्फा शिलालेख",
    label_or: "ମହାମେଘବାହନ ଖାରବେଳଙ୍କ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ",
    lore_en: "Carved in the 1st century BCE, these rock-cut Jain monastic retreats feature King Kharavela's celebrated 17-line Brahmi chronicle of Kalinga's imperial reign.",
    lore_hi: "ईसा पूर्व पहली सदी में जैन भिक्षुओं के लिए तराशी गई इन गुफाओं में सम्राट खारवेल का 17 पंक्तियों वाला ऐतिहासिक ब्राह्मी शिलालेख उत्कीर्ण है।",
    lore_or: "ଖ୍ରୀଷ୍ଟପୂର୍ବ ପ୍ରଥମ ଶତାବ୍ଦୀରେ ଜୈନ ସନ୍ନ୍ୟାସୀଙ୍କ ପାଇଁ ଖୋଦିତ ଏହି ଗୁମ୍ଫାରେ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ୧୭ ଧାଡ଼ି ବିଶିଷ୍ଟ ପ୍ରସିଦ୍ଧ ହାତୀଗୁମ୍ଫା ଅଭିଲେଖ ରହିଛି।"
  },

  // 5. Cuttack Crafts, Maritime & Cuisine
  {
    source: "Tarakasi (Silver Filigree)",
    target: "Barabati Fort",
    type: "artisan_lineage",
    label_en: "Mahanadi Maritime & Royal Silver Craft",
    label_hi: "बाराबती दुर्ग और कटक की तारकशी कला",
    label_or: "ବାରବାଟୀ ଦୁର୍ଗ ଓ କଟକର ରୂପା ତାରକସି କଳା",
    lore_en: "Centuries-old silver filigree craft developed under royal patronage along the Mahanadi, shaping Cuttack's famed silver tableaus (Chandi Medha) during Durga Puja.",
    lore_hi: "कटक के बाराबती दुर्ग के संरक्षण में विकसित हुई तारकशी (चांदी की महीन नक्काशी) आज भी दुर्गा पूजा के चांदी के मेढ़ों में चमकती है।",
    lore_or: "କଟକର ୫୦୦ ବର୍ଷ ପୁରୁଣା ରୂପା ତାରକସି କଳା ବାରବାଟୀ ଦୁର୍ଗର ଐତିହାସିକ ପୃଷ୍ଠପୋଷକତାରେ ବିକଶିତ ହୋଇ ଦୁର୍ଗାପୂଜା ଚାନ୍ଦି ମେଢ଼କୁ ଶୋଭିତ କରେ।"
  },
  {
    source: "Tarakasi (Silver Filigree)",
    target: "Bali Jatra",
    type: "maritime_trade",
    label_en: "Festive Commerce & Cultural Fair",
    label_hi: "बाली जात्रा का पारंपरिक शिल्प व्यापार",
    label_or: "ବାଲିଯାତ୍ରାର ପାରମ୍ପରିକ ଶିଳ୍ପ ବାଣିଜ୍ୟ",
    lore_en: "Held on the vast sandbanks of the Mahanadi river, Bali Jatra has served as the historic trade fair showcasing Cuttack's silver filigree and textiles for generations.",
    lore_hi: "महानदी तट पर लगने वाली एशिया की सबसे बड़ी खुली व्यापार मेला 'बाली जात्रा' कटक के तारकशी और हस्तशिल्प का प्रमुख केंद्र है।",
    lore_or: "ମହାନଦୀ କୂଳରେ ଅନୁଷ୍ଠିତ ଏସିଆର ସର୍ବବୃହତ ମୁକ୍ତାକାଶ ବାଣିଜ୍ୟ ମେଳା ବାଲିଯାତ୍ରାରେ ତାରକସି ଶିଳ୍ପ ପ୍ରଦର୍ଶିତ ହୁଏ।"
  },
  {
    source: "Bali Jatra",
    target: "Boita Bandana Ritual",
    type: "maritime_ritual",
    label_en: "Kartik Purnima Miniature Boat Floating",
    label_hi: "कार्तिक पूर्णिमा बोइत बंदाण नौका उत्सव",
    label_or: "କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା ଡଙ୍ଗା ଭସା ଓ ବୋଇତ ବନ୍ଦାଣ",
    lore_en: "Millions of people across Odisha wake before sunrise on Kartik Purnima to float miniature boats made of banana bark and cork with betel leaves and brass lamps.",
    lore_hi: "कार्तिक पूर्णिमा की भोर में कदली के छाल और सोला से बनी छोटी-छोटी नौकाओं में दीप जलाकर जल में तैराने की गौरवशाली परंपरा।",
    lore_or: "କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା ପ୍ରଭାତରେ କଦଳୀ ପାଟୁକା ଓ ସୋଲ ଡଙ୍ଗାରେ ଦୀପ ଓ ପାନ ଗୁଆ ଦେଇ ଭସାଇବା କଳିଙ୍ଗ ନୌବାଣିଜ୍ୟର ଜୀବନ୍ତ ସ୍ମାରକ।"
  },
  {
    source: "Dahi Bara Aloo Dum",
    target: "Cuttack",
    type: "culinary_identity",
    label_en: "Iconic Street Culinary Heritage",
    label_hi: "कटक का प्रसिद्ध दही बड़ा आलू दम",
    label_or: "କଟକର ପ୍ରସିଦ୍ଧ ଦହିବରା ଆଳୁଦମ",
    lore_en: "Served with spicy aloo dum, ghuguni, and a glass of cooling dahi pani, this beloved street dish represents the warm, hospitable soul of the Millennium City.",
    lore_hi: "दही में भीगे उड़द दाल के बड़े, तीखे आलू दम, घुगुनी और पुदीना-दही पानी के साथ परोसा जाने वाला कटक का आत्मा-तुल्य व्यंजन।",
    lore_or: "ଦହିରେ ଭିଜା ବିରି ବରା, ରାଗ ଆଳୁଦମ ଓ ଘୁଗୁନି ସହିତ ପରିବେଷିତ କଟକର ଏହି ଖାଦ୍ୟ ସମଗ୍ର ଭାରତରେ ପରିଚିତ।"
  },

  // 6. Northern Odisha: Mayurbhanj Chhau & Wilderness
  {
    source: "Chhau",
    target: "Mayurbhanj / Baripada",
    type: "martial_heritage",
    label_en: "Bhanja Dynasty Maskless Martial Dance",
    label_hi: "भंज राजवंश का संरक्षण एवं बिना मुखौटे का छऊ",
    label_or: "ଭଞ୍ଜ ରାଜବଂଶ ଓ ମୟୂରଭଞ୍ଜର ବିନା ମୁଖା ଛଉ ନୃତ୍ୟ",
    lore_en: "Mayurbhanj Chhau is performed without masks, relying on exceptional physical stamina, sword-and-shield combat steps, and theatrical facial expressions.",
    lore_hi: "मयूरभंज का छऊ नृत्य बिना मुखौटे के अत्यंत ऊर्जावान युद्ध मुद्राओं, तलवारबाजी और नगाड़ों की थाप पर किया जाता है।",
    lore_or: "ମୟୂରଭଞ୍ଜ ଛଉ ନୃତ୍ୟ ବିନା ମୁଖାରେ ଖଣ୍ଡା-ଢ଼ାଲ ଯୁଦ୍ଧ କୌଶଳ ଓ ଶାରୀରିକ ସାମର୍ଥ୍ୟ ସହ ରାମାୟଣ-ମହାଭାରତର ଆଖ୍ୟାନ ପରିବେଷଣ କରେ।"
  },
  {
    source: "Mayurbhanj / Similipal",
    target: "Mayurbhanj / Baripada",
    type: "nature_and_royalty",
    label_en: "Similipal Biosphere & Bhanja Royal Legacy",
    label_hi: "सिमिलिपाल बायोस्फीयर एवं भंज राजप्रासाद",
    label_or: "ଶିମିଳିପାଳ ଜୈବମଣ୍ଡଳ ଓ ଭଞ୍ଜ ରାଜପ୍ରାସାଦ",
    lore_en: "Encompassing ancient sal forests, waterfalls, and indigenous tribal clans, Similipal cradles the wild natural heritage of Mayurbhanj's royal capital Baripada.",
    lore_hi: "प्राचीन शाल वनों और जलप्रपातों से घिरा सिमिलिपाल मयूरभंज की समृद्ध प्राकृतिक और जनजातीय धरोहर का केंद्र है।",
    lore_or: "ପ୍ରାଚୀନ ଶାଳ ଜଙ୍ଗଲ ଓ ଜଳପ୍ରପାତରେ ପରିପୂର୍ଣ୍ଣ ଶିମିଳିପାଳ ମୟୂରଭଞ୍ଜ ରାଜପ୍ରାସାଦ ବାରିପଦାର ପ୍ରାକୃତିକ ସମ୍ପଦ।"
  },

  // 7. Western Odisha: Sambalpuri Handloom & Folk Traditions
  {
    source: "Sambalpuri Ikat (Bandha) Weaving",
    target: "Sambalpur",
    type: "weaver_lineage",
    label_en: "Bandhakala Tie-and-Dye Textile Mastery",
    label_hi: "संबलपुरी बांधकला हथकरघा परंपरा",
    label_or: "ସମ୍ବଲପୁରୀ ବାନ୍ଧକଳା ଇକତ ବୟନ ଶିଳ୍ପ",
    lore_en: "Centuries of Bhulia artisan heritage weave mythological verses and temple borders into GI-tagged Sambalpuri cotton and silk sarees using resist dyeing.",
    lore_hi: "पश्चिमी ओडिशा के भुलिया बुनकरों द्वारा शंख, चक्र और फूलों के रूपांकनों से निर्मित जीआई-टैग संबलपुरी इकत साड़ियां भारत की गौरवशाली धरोहर हैं।",
    lore_or: "ପଶ୍ଚିମ ଓଡ଼ିଶାର ଭୁଲିଆ ବୁଣାକାରମାନଙ୍କ ଦ୍ୱାରା ହାତରେ ବୁଣାଯାଉଥିବା ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଜିଆଇ ଟ୍ୟାଗ୍ ପ୍ରାପ୍ତ ସମ୍ବଲପୁରୀ ବାନ୍ଧ ଶାଢ଼ୀ।"
  },
  {
    source: "Sambalpur",
    target: "Nuakhai",
    type: "agrarian_festival",
    label_en: "First Harvest Offering & Family Reunion",
    label_hi: "नुआखाई: नई फसल का पहला भोग एवं एकता पर्व",
    label_or: "ନୂଆଁଖାଇ: ନବାନ୍ନ ଲାଗି ଓ ପାରିବାରିକ ମିଳନ ପର୍ବ",
    lore_en: "Observed on Panchami tithi after Ganesh Puja, the agrarian festival of Nuakhai sees families gather to offer the first cooked grains of new rice to Maa Samaleswari.",
    lore_hi: "गणेश चतुर्थी के अगले दिन मनाया जाने वाला पश्चिमी ओडिशा का सबसे बड़ा कृषि पर्व, जहाँ परिवार नई फसल का पहला अन्न मां समलेश्वरी को अर्पित करते हैं।",
    lore_or: "ଗଣେଶ ପୂଜାର ପରଦିନ ପାଳିତ ପଶ୍ଚିମ ଓଡ଼ିଶାର ମହାନ କୃଷି ଭିତ୍ତିକ ଗଣପର୍ବ, ଯେଉଁଥିରେ ନୂଆ ଧାନର ପ୍ରଥମ ଅନ୍ନ ମା' ସମଲେଶ୍ୱରୀଙ୍କୁ ଅର୍ପଣ କରାଯାଏ।"
  },
  {
    source: "Bargarh / Nrusimhanath",
    target: "Sambalpur",
    type: "folk_ritual",
    label_en: "Dhanu Yatra & Gandhamardan Lore",
    label_hi: "धनु यात्रा खुला रंगमंच एवं गंधमार्दन पर्वत",
    label_or: "ଧନୁଯାତ୍ରା ମୁକ୍ତାକାଶ ରଙ୍ଗମଞ୍ଚ ଓ ଗନ୍ଧମାର୍ଦ୍ଦନ ଗାଥା",
    lore_en: "Bargarh transforms into the world's largest open-air theater during Dhanu Yatra, while Nrusimhanath preserves ancient Ayurvedic legends on Gandhamardan Hill.",
    lore_hi: "बरगढ़ शहर धनु यात्रा के दौरान कंस की मथुरा नगरी में बदल जाता है, जबकि निकटवर्ती नृसिंहनाथ में गंधमार्दन पर्वत की आयुर्वेदिक परंपराएं जीवित हैं।",
    lore_or: "ବରଗଡ଼ ସହର ଧନୁଯାତ୍ରା ସମୟରେ ବିଶ୍ୱର ସର୍ବବୃହତ ମୁକ୍ତାକାଶ ରଙ୍ଗମଞ୍ଚରେ ପରିଣତ ହୁଏ ଏବଂ ନୃସିଂହନାଥରେ ଗନ୍ଧମାର୍ଦ୍ଦନ ପର୍ବତର ଔଷଧୀୟ ମାହାତ୍ମ୍ୟ ରହିଛି।"
  },

  // 8. Culinary Heritage & Sweet Confectionery Roots
  {
    source: "Chhena Poda",
    target: "Kantilo, Nayagarh",
    type: "culinary_origin",
    label_en: "Birthplace of Roasted Cottage Cheese Dessert",
    label_hi: "नयागढ़: भारत की बेक की हुई पनीर मिठाई की जन्मस्थली",
    label_or: "ଛେନାପୋଡ଼ର ଜନ୍ମସ୍ଥଳୀ ନୟାଗଡ଼ ଓ କଣ୍ଟିଲୋ ନୀଳମାଧବ",
    lore_en: "Invented in Dashapalla, Nayagarh by slow-baking sweetened fresh cottage cheese wrapped in Sal leaves overnight, Chhena Poda is India's indigenous cheesecake.",
    lore_hi: "नयागढ़ में शाल के पत्तों में लपेटकर रात भर धीमी आंच पर कैरेमेलाइज़ कर बनाई गई यह अनोखी मिठाई भारत का गौरव है।",
    lore_or: "ନୟାଗଡ଼ ଜିଲ୍ଲାରେ ଶାଳ ପତ୍ରରେ ଗୁଡ଼ାଇ କୋଇଲା ନିଆଁରେ ଧୀମା ଆଞ୍ଚରେ ବେକ୍ କରି ପ୍ରସ୍ତୁତ କରାଯାଉଥିବା ଭାରତର ଅଦ୍ୱିତୀୟ ମିଷ୍ଟାନ୍ନ।"
  },
  {
    source: "Chhena Jhili",
    target: "Pipili Applique Work",
    type: "coastal_trail",
    label_en: "Nimapada Golden Sweet Route",
    label_hi: "निमापड़ा की प्रसिद्ध छेना झिली मिष्ठान यात्रा",
    label_or: "ନିମାପଡ଼ାର ପ୍ରସିଦ୍ଧ ଛେନା ଝିଲି ଓ ଶିଳ୍ପ ପଥ",
    lore_en: "Located near Pipili on the highway to Konark, Nimapada's soft, syrupy Chhena Jhili is the quintessential stop for cultural travelers visiting coastal shrines.",
    lore_hi: "कोणार्क जाने वाले मार्ग पर निमापड़ा की रसीली और कोमल छेना झिली ओडिशा के पारंपरिक मिष्ठान धरोहर की प्रमुख पहचान है।",
    lore_or: "କୋଣାର୍କ ଯିବା ରାସ୍ତାରେ ନିମାପଡ଼ାର ନରମ ଓ ରସାଳ ଛେନା ଝିଲି ଓଡ଼ିଶାର ଏକ ପ୍ରମୁଖ ପାରମ୍ପରିକ ମିଷ୍ଟାନ୍ନ।"
  },
  {
    source: "Pakhala Bhata",
    target: "Dalma",
    type: "culinary_staple",
    label_en: "Nutritional & Seasonal Soul Food of Odisha",
    label_hi: "पखाला भात एवं पारंपरिक ओड़िया दालमा",
    label_or: "ପଖାଳ ଭାତ ଓ ପାରମ୍ପରିକ ଡାଲମା",
    lore_en: "Fermented probiotic water-rice paired with wholesome Ayurvedic lentil stew cooked with raw papaya, pumpkin, and roasted cumin.",
    lore_hi: "किण्वित चावल (पखाला) और घी-जीरा के तड़के वाली पौष्टिक दालमा ओड़िया संस्कृति का दैनिक जीवन दायिनी आहार है।",
    lore_or: "ପାରମ୍ପରିକ ପଖାଳ ଓ ଶୁଦ୍ଧ ଘିଅ-ଜିରା ଫୁଟଣରେ ପ୍ରସ୍ତୁତ ପୁଷ୍ଟିକର ଡାଲମା ଓଡ଼ିଆ ଜୀବନଶୈଳୀର ପ୍ରାଣ।"
  },

  // 9. Classical Literature & Dance Music
  {
    source: "Odissi",
    target: "Jayadeva",
    type: "literary_source",
    label_en: "Gita Govinda Devotional Compositions",
    label_hi: "गीत गोविंद एवं जयदेव की अमर रचनाएं",
    label_or: "ଗୀତ ଗୋବିନ୍ଦ ଓ କବି ଜୟଦେବଙ୍କ ଅମର କାବ୍ୟ",
    lore_en: "12th-century poet Jayadeva's Sanskrit lyric poem Gita Govinda composed in Kenduli village forms the central lyrical and emotional core (Abhinaya) of Odissi dance.",
    lore_hi: "12वीं सदी के महाकवि जयदेव द्वारा रचित 'गीत गोविंद' के श्लोक ओडिसी नृत्य के अभिनय और भाव समर्पण की आत्मा हैं।",
    lore_or: "୧୨ଶ ଶତାବ୍ଦୀରେ କେନ୍ଦୁଲି ଶାସନରେ କବି ଜୟଦେବଙ୍କ ଦ୍ୱାରା ରଚିତ ଗୀତ ଗୋବିନ୍ଦ ଓଡ଼ିଶୀ ନୃତ୍ୟର ମୁଖ୍ୟ ଭାବ ଓ ଅଭିନୟର ଆତ୍ମା।"
  },
  {
    source: "Odissi",
    target: "Kelucharan Mohapatra",
    type: "master_guru",
    label_en: "Master Guru of the Classical Renaissance",
    label_hi: "गुरु केलुचरण महापात्र एवं ओडिसी पुनरुद्धार",
    label_or: "ଗୁରୁ କେଳୁଚରଣ ମହାପାତ୍ର ଓ ଓଡ଼ିଶୀର ବିଶ୍ୱବିଜୟ",
    lore_en: "Born in Raghurajpur, Padma Vibhushan Guru Kelucharan Mohapatra revived, structured, and elevated classical Odissi to international concert stages worldwide.",
    lore_hi: "रघुराजपुर में जन्मे पद्म विभूषण गुरु केलुचरण महापात्र ने मंदिर नृत्य परंपरा को शास्त्रीय स्वरूप देकर विश्व मंच पर प्रतिष्ठित किया।",
    lore_or: "ରଘୁରାଜପୁରର ମାଟିରେ ଜନ୍ମିତ ପଦ୍ମବିଭୂଷଣ ଗୁରୁ କେଳୁଚରଣ ମହାପାତ୍ର ଓଡ଼ିଶୀ ନୃତ୍ୟକୁ ଶାସ୍ତ୍ରୀୟ ମର୍ଯ୍ୟାଦା ଦେଇ ବିଶ୍ୱବିଖ୍ୟାତ କରିଥିଲେ।"
  }
];

async function seedRelationships() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Ensure columns exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
        relationship_type VARCHAR(100) NOT NULL,
        label_en VARCHAR(255) NOT NULL,
        label_hi VARCHAR(255),
        label_or VARCHAR(255),
        lore_en TEXT,
        lore_hi TEXT,
        lore_or TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS label_en VARCHAR(255);
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS label_hi VARCHAR(255);
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS label_or VARCHAR(255);
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS lore_en TEXT;
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS lore_hi TEXT;
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS lore_or TEXT;
      ALTER TABLE relationships ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    // Fetch all entities into a name-to-id map
    const { rows: entities } = await client.query(`SELECT id, name FROM entities`);
    console.log(`Fetched ${entities.length} entities from database.`);

    const findEntity = (searchName) => {
      const lowerSearch = searchName.toLowerCase().trim();
      // Exact match
      const exact = entities.find(e => e.name.toLowerCase().trim() === lowerSearch);
      if (exact) return exact;

      // Substring match
      const partial = entities.find(e => {
        const eLower = e.name.toLowerCase();
        return eLower.includes(lowerSearch) || lowerSearch.includes(eLower);
      });
      return partial || null;
    };

    // Clear previous seed relationships
    await client.query(`DELETE FROM relationships`);
    console.log("Cleared existing relationships.");

    let insertedCount = 0;

    for (const rel of CURATED_RELATIONSHIPS) {
      const sourceEntity = findEntity(rel.source);
      const targetEntity = findEntity(rel.target);

      if (!sourceEntity || !targetEntity) {
        console.warn(`Could not match: "${rel.source}" -> "${rel.target}" (found: ${sourceEntity?.name} -> ${targetEntity?.name})`);
        continue;
      }

      if (sourceEntity.id === targetEntity.id) continue;

      // Forward link
      await client.query(`
        INSERT INTO relationships (
          source_entity_id, target_entity_id, relationship_type,
          label_en, label_hi, label_or,
          lore_en, lore_hi, lore_or
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        sourceEntity.id, targetEntity.id, rel.type,
        rel.label_en, rel.label_hi, rel.label_or,
        rel.lore_en, rel.lore_hi, rel.lore_or
      ]);
      insertedCount++;

      // Reciprocal / Reverse link
      await client.query(`
        INSERT INTO relationships (
          source_entity_id, target_entity_id, relationship_type,
          label_en, label_hi, label_or,
          lore_en, lore_hi, lore_or
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        targetEntity.id, sourceEntity.id, rel.type,
        rel.label_en, rel.label_hi, rel.label_or,
        rel.lore_en, rel.lore_hi, rel.lore_or
      ]);
      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} bidirectional semantic cultural relationships into Supabase!`);

  } catch (err) {
    console.error("Error seeding relationships:", err);
  } finally {
    await client.end();
  }
}

seedRelationships();
