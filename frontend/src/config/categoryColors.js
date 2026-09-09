// Unified Heritage Category Jewel Palette
// Harmonized with dark space/satellite theme and Indian classical aesthetics

export const HERITAGE_CATEGORY_COLORS = {
  // Sacred Architecture & Temples (Saffron Sun Gold)
  'Monument': '#F59E0B',
  'Monuments & Temples': '#F59E0B',

  // Master Crafts & Handlooms (Mayur Peacock Teal)
  'Art & Craft': '#0D9488',
  'Handicrafts & Handlooms': '#0D9488',

  // Living Cuisine & Mahaprasad (Terracotta Spice Orange)
  'Cuisine': '#EA580C',
  'Culinary Heritage': '#EA580C',

  // Sacred Processions & Fairs (Kumkum Crimson Rose)
  'Festival': '#E11D48',
  'Festivals & Rituals': '#E11D48',

  // Classical Performing Arts, Dances & Lore (Royal Amethyst Violet)
  'Tradition': '#8B5CF6',
  'Classical Dance & Music': '#8B5CF6',
  'Folk Traditions & Lore': '#8B5CF6',

  // Royal Dynasties & Historical Figures (Lapis Lazuli Cobalt)
  'Historical Personality': '#3B82F6',

  // Sacred Mythology & Oral Lore (Lotus Pink)
  'Legend & Story': '#EC4899',

  // Tantric Shrines, Caves & Undiscovered Sites (Sacred Tulsi Emerald)
  'Hidden Heritage': '#10B981',
};

export const getCategoryColor = (categoryName) => {
  if (!categoryName) return '#D4AF37';
  return HERITAGE_CATEGORY_COLORS[categoryName] || '#D4AF37';
};

// Curated Top Featured Highlights across Odisha & Eastern India (Avoids map clutter)
export const FEATURED_HERITAGE_KEYWORDS = [
  'konark', 'jagannath', 'lingaraj', 'mukteswar', 'dhauli', 'chausath yogini',
  'rajarani', 'barabati', 'samaleswari', 'taratarini', 'biraja', 'khiching',
  'udayagiri', 'khandagiri', 'ratnagiri', 'lalitagiri', 'ranipur', 'kapilash',
  'pattachitra', 'raghurajpur', 'sambalpuri', 'tarakasi', 'pipili', 'dhokra',
  'chhenapoda', 'mahaprasad', 'rasagola', 'dalma', 'pakhala',
  'rath yatra', 'dhanu yatra', 'bali yatra', 'nuakhai',
  'odissi', 'chhau', 'gotipua',
  'kharavela', 'ashoka', 'narasimhadeva', 'dharmapada', 'chilika'
];

export const isFeaturedEntity = (entity) => {
  if (!entity || !entity.name) return false;
  const name = entity.name.toLowerCase();
  const loc = (entity.location_context || '').toLowerCase();
  return FEATURED_HERITAGE_KEYWORDS.some(kw => name.includes(kw) || loc.includes(kw));
};
