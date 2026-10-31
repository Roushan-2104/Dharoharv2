const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate deterministic UUID from name
function generateUUID(name) {
  const hash = crypto.createHash('md5').update(name).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}

// Curated landmarks ground-truth coordinates
const REGION_COORDS = {
  "puri": [19.8049, 85.8179],
  "bhubaneswar": [20.2961, 85.8245],
  "cuttack": [20.4625, 85.8828],
  "konark": [19.8876, 86.0945],
  "sambalpur": [21.4674, 83.9830],
  "bargarh": [21.3333, 83.6167],
  "mayurbhanj": [21.9322, 86.7360],
  "baripada": [21.9322, 86.7360],
  "jajpur": [20.8510, 86.3330],
  "balasore": [21.4934, 86.9135],
  "baleshwar": [21.4934, 86.9135],
  "ganjam": [19.3800, 85.0500],
  "berhampur": [19.3150, 84.7941],
  "koraput": [18.8135, 82.7123],
  "kalahandi": [19.9137, 83.1649],
  "dhenkanal": [20.6593, 85.5960],
  "nayagarh": [20.1250, 85.1050],
  "kendujhar": [21.6289, 85.5817],
  "keonjhar": [21.6289, 85.5817],
  "sundargarh": [22.1200, 84.0300],
  "rourkela": [22.2604, 84.8536],
  "bolangir": [20.7107, 83.4839],
  "balangir": [20.7107, 83.4839],
  "kendrapara": [20.5013, 86.4230],
  "jagatsinghpur": [20.2649, 86.1717],
  "bhadrak": [21.0574, 86.4965],
  "rayagada": [19.1698, 83.4163],
  "malkangiri": [18.3436, 81.8971],
  "nabarangpur": [19.2315, 82.5501],
  "gajapati": [18.8078, 84.1500],
  "paralakhemundi": [18.7770, 84.0910],
  "kandhamal": [20.4500, 84.2333],
  "phulbani": [20.4789, 84.2349],
  "boudh": [20.8407, 84.3267],
  "subarnapur": [20.8400, 83.9200],
  "sonepur": [20.8400, 83.9200],
  "jharsuguda": [21.8555, 84.0062],
  "deogarh": [21.5367, 84.7342],
  "nuapada": [20.8354, 82.5350],
  "khordha": [20.1814, 85.6173],
  "chilika": [19.7167, 85.3167],
  "odisha": [20.5, 84.5]
};

const LANDMARK_COORDINATES = {
  "Jagannath Temple": [19.8049, 85.8179],
  "Puri Jagannath Temple": [19.8049, 85.8179],
  "Shree Jagannath Temple": [19.8049, 85.8179],
  "Konark Sun Temple": [19.8876, 86.0945],
  "Konark / Chandrabhaga": [19.8876, 86.0945],
  "Konark Dance Festival": [19.8876, 86.0945],
  "Lingaraj Temple": [20.2382, 85.8336],
  "Lingaraja Temple": [20.2382, 85.8336],
  "Mukteshvara Temple": [20.2427, 85.8388],
  "Rajarani Temple": [20.2520, 85.8458],
  "Dhauli Shanti Stupa": [20.1923, 85.8544],
  "Dhauli": [20.1923, 85.8544],
  "Udayagiri and Khandagiri Caves": [20.2605, 85.7865],
  "Khandagiri & Udayagiri": [20.2605, 85.7865],
  "Raghurajpur Heritage Crafts Village": [19.8970, 85.8190],
  "Raghurajpur": [19.8970, 85.8190],
  "Pipili Applique Work": [20.1170, 85.8330],
  "Pipili": [20.1170, 85.8330],
  "Tarakasi (Silver Filigree)": [20.4625, 85.8828],
  "Barabati Fort": [20.4850, 85.8650],
  "Cuttack Chandi Temple": [20.4730, 85.8710],
  "Chhau": [21.9322, 86.7360],
  "Mayurbhanj Chhau": [21.9322, 86.7360],
  "Similipal National Park": [21.8000, 86.3333],
  "Samaleswari Temple": [21.4674, 83.9830],
  "Sambalpuri Saree / Handloom": [21.4674, 83.9830],
  "Sambalpuri Folk Dance": [21.4674, 83.9830],
  "Dhanu Yatra (Bargarh)": [21.3333, 83.6167],
  "Biraja Temple (Jajpur)": [20.8510, 86.3330],
  "Biraja Temple": [20.8510, 86.3330],
  "Ratnagiri Buddhist Complex": [20.6410, 86.3350],
  "Udayagiri Buddhist Complex": [20.6480, 86.2690],
  "Lalitgiri Buddhist Complex": [20.5890, 86.2520],
  "Chilika Lake & Kalijai": [19.7167, 85.3167],
  "Chilika": [19.7167, 85.3167],
  "Tara Tarini Temple": [19.4890, 84.8980],
  "Gopalpur-on-Sea": [19.2600, 84.9070],
  "Khiching Kichakeshwari Temple": [21.9210, 85.8380],
  "Nuakhai Festival": [21.4674, 83.9830],
  "Rath Yatra": [19.8049, 85.8179],
  "Mahaprasad": [19.8049, 85.8179],
  "Chhena Poda (Nayagarh)": [20.1250, 85.1050],
  "Rasagulla / Pahala": [20.3550, 85.8900],
  "Dahi Bara Aloo Dum (Cuttack)": [20.4625, 85.8828],
  "Prachi Valley Heritage": [20.0833, 85.9667]
};

function getCoordinates(name, locationContext) {
  const cleanName = (name || '').trim();
  if (LANDMARK_COORDINATES[cleanName]) return LANDMARK_COORDINATES[cleanName];

  for (const [k, v] of Object.entries(LANDMARK_COORDINATES)) {
    if (cleanName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cleanName.toLowerCase())) {
      return v;
    }
  }

  const combined = `${cleanName} ${locationContext || ''}`.toLowerCase();
  for (const [region, coords] of Object.entries(REGION_COORDS)) {
    if (combined.includes(region)) {
      // Add slight jitter so overlapping points don't stack completely
      const jitterLat = (Math.random() - 0.5) * 0.04;
      const jitterLon = (Math.random() - 0.5) * 0.04;
      return [parseFloat((coords[0] + jitterLat).toFixed(4)), parseFloat((coords[1] + jitterLon).toFixed(4))];
    }
  }

  const defaultLat = 19.8 + Math.random() * 1.8;
  const defaultLon = 83.5 + Math.random() * 2.8;
  return [parseFloat(defaultLat.toFixed(4)), parseFloat(defaultLon.toFixed(4))];
}

function parseCSV(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i+1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    values.push(current.trim());
    return values;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

const CATEGORY_MAP = {
  'Art, Dance, and Crafts': 'Art & Craft',
  'Art, Dance & Crafts': 'Art & Craft',
  'Heritage Sites & Monuments': 'Monument',
  'Historical Personalities': 'Historical Personality',
  'Local Legend / Story': 'Legend & Story',
  'Lesser-Known Location': 'Hidden Heritage',
  'Regional Traditions': 'Tradition',
  'Festivals': 'Festival',
  'Regional Cuisine': 'Cuisine',
  'Main dish': 'Cuisine',
  'Fish curry': 'Cuisine',
  'Seafood': 'Cuisine',
  'Fish preparation': 'Cuisine',
  'Temple cuisine': 'Cuisine',
  'Pitha': 'Cuisine',
  'Sweet': 'Cuisine',
  'Fermented food': 'Cuisine',
  'Street food': 'Cuisine',
  'Snack': 'Cuisine'
};

const dataDir = path.resolve(__dirname, '../data');
const csvConfig = [
  { file: 'odisha_art_dance_crafts.csv', defaultCategory: 'Art & Craft' },
  { file: 'odisha_cuisine_by_region.csv', defaultCategory: 'Cuisine' },
  { file: 'odisha_dish_directory_detail.csv', defaultCategory: 'Cuisine' },
  { file: 'odisha_festivals.csv', defaultCategory: 'Festival' },
  { file: 'odisha_heritage_monuments.csv', defaultCategory: 'Monument' },
  { file: 'odisha_historical_personalities.csv', defaultCategory: 'Historical Personality' },
  { file: 'odisha_legends_and_stories.csv', defaultCategory: 'Legend & Story' },
  { file: 'odisha_lesser_known_locations.csv', defaultCategory: 'Hidden Heritage' },
  { file: 'odisha_regional_traditions.csv', defaultCategory: 'Tradition' }
];

const entities = [];
const seenNames = new Set();

csvConfig.forEach(({ file, defaultCategory }) => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(content);

  rows.forEach(row => {
    let rawCat = row['Category'] || row['Data_Category'] || defaultCategory;
    let catName = CATEGORY_MAP[rawCat] || rawCat || defaultCategory;

    let name = row['Name'] || row['Dish'] || row['Location'] || row['Place / Community'] || 'Unknown';
    if (!name || name === 'Unknown' || seenNames.has(name.toLowerCase())) {
      return;
    }
    seenNames.add(name.toLowerCase());

    let loc = row['Location / Context'] || row['Region'] || row['Region / Association'] || row['District'] || 'Odisha';
    let desc = row['Description / Significance'] || row['Story Summary'] || row['What Makes It Special'] || row['Why It Matters'] || '';

    const id = generateUUID(name);
    const coordinates = getCoordinates(name, loc);

    entities.push({
      id,
      name,
      location_context: loc,
      description: desc,
      metadata: { ...row },
      coordinates,
      category_name: catName
    });
  });
});

console.log(`Generated ${entities.length} unique heritage entities.`);

// Now parse relationships from scripts/seed_relationships.js
const seedRelPath = path.join(__dirname, 'seed_relationships.js');
let relationships = [];
if (fs.existsSync(seedRelPath)) {
  const relContent = fs.readFileSync(seedRelPath, 'utf8');
  // Match CURATED_RELATIONSHIPS
  const startIdx = relContent.indexOf('const CURATED_RELATIONSHIPS = [');
  if (startIdx !== -1) {
    const endIdx = relContent.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const code = relContent.slice(startIdx, endIdx + 2) + '\nmodule.exports = CURATED_RELATIONSHIPS;';
      const m = new module.constructor();
      m.paths = module.paths;
      m._compile(code, seedRelPath);
      const rawRels = m.exports;

      const entityNameMap = {};
      entities.forEach(e => {
        entityNameMap[e.name.toLowerCase().trim()] = e;
      });

      rawRels.forEach(r => {
        const sourceEnt = entityNameMap[r.source.toLowerCase().trim()] || entities.find(e => e.name.toLowerCase().includes(r.source.toLowerCase()) || r.source.toLowerCase().includes(e.name.toLowerCase()));
        const targetEnt = entityNameMap[r.target.toLowerCase().trim()] || entities.find(e => e.name.toLowerCase().includes(r.target.toLowerCase()) || r.target.toLowerCase().includes(e.name.toLowerCase()));

        if (sourceEnt && targetEnt) {
          relationships.push({
            id: generateUUID(`${sourceEnt.name}->${targetEnt.name}`),
            source_entity_id: sourceEnt.id,
            target_entity_id: targetEnt.id,
            source_name: sourceEnt.name,
            target_name: targetEnt.name,
            relationship_type: r.type,
            label_en: r.label_en,
            label_hi: r.label_hi,
            label_or: r.label_or,
            lore_en: r.lore_en,
            lore_hi: r.lore_hi,
            lore_or: r.lore_or
          });
        }
      });
      console.log(`Resolved ${relationships.length} curated cultural relationships.`);
    }
  }
}

const outputPath = path.resolve(__dirname, '../backend/offline_data.json');
fs.writeFileSync(outputPath, JSON.stringify({ entities, relationships }, null, 2), 'utf8');
console.log(`Wrote offline data successfully to ${outputPath}`);
