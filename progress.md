# DHAROHAR (Digital Heritage Knowledge System) — Project Status & Handover Documentation

> **Smart India Hackathon (SIH) 2026**  
> **Theme Alignment:** Ideas that showcase the rich cultural heritage and traditions of India  
> **Current Prototype Focus:** Odisha (Scalable Pan-India Architecture)  
> **Last Updated:** September 3, 2026  

---

## 1. Executive Summary & Vision

**DHAROHAR** is an interactive, connected digital heritage knowledge platform. Rather than acting as a static tourism directory or isolated encyclopedia, DHAROHAR models culture as a **connected, living graph**:

$$\text{Monument} \longrightarrow \text{Historical Personality} \longrightarrow \text{Architectural Style} \longrightarrow \text{Classical Dance} \longrightarrow \text{Festivals} \longrightarrow \text{Culinary Arts} \longrightarrow \text{Oral Lore}$$

### Core Journey Loop
$$\textbf{Discover} \longrightarrow \textbf{Learn} \longrightarrow \textbf{Experience} \longrightarrow \textbf{Contribute} \longrightarrow \textbf{Preserve}$$

---

## 2. Complete Technology Stack & Dependency Inventory

### 2.1. Frontend (`frontend/package.json`)

| Package Name | Exact Version | Purpose & Description |
| :--- | :--- | :--- |
| **react** | `^19.2.8` | Core UI framework for component tree and reactive state. |
| **react-dom** | `^19.2.8` | DOM renderer for React 19. |
| **react-router-dom** | `^7.18.3` | Client-side routing (`/`, `/discover`, `/contribute`). |
| **three** | `^0.185.1` | WebGL 3D graphics library powering the interactive Earth globe. |
| **@react-three/fiber** | `^9.7.0` | React renderer for Three.js scene graphs and animation loops. |
| **@react-three/drei** | `^10.7.8` | Three.js helper components (`OrbitControls`, `Stars`, `Html`, `Line`). |
| **leaflet** | `^1.9.4` | Mobile-friendly interactive 2D mapping library. |
| **react-leaflet** | `^5.0.0` | React bindings for Leaflet map containers, markers, and tiles. |
| **lucide-react** | `^1.39.0` | Comprehensive, consistent icon system for UI elements. |
| **axios** | `^1.20.0` | Promise-based HTTP client for API communications. |
| **vite** *(dev)* | `^8.2.2` | High-speed frontend build tool and local dev server (HMR). |
| **tailwindcss** *(dev)*| `^3.4.19` | Utility-first CSS framework for responsive layout and styling. |
| **postcss** *(dev)* | `^8.5.26` | CSS transformation pipeline tool. |
| **autoprefixer** *(dev)*| `^10.5.4` | PostCSS plugin to parse CSS and add vendor prefixes. |
| **oxlint** *(dev)* | `^1.79.0` | High-performance JavaScript/JSX linter. |
| **@vitejs/plugin-react** *(dev)* | `^6.1.0` | Babel/Fast-Refresh plugin for Vite React support. |
| **@types/react** *(dev)* | `^19.2.18` | TypeScript definitions for React. |
| **@types/react-dom** *(dev)* | `^19.2.4` | TypeScript definitions for React DOM. |

### 2.2. Backend (`backend/package.json`)

| Package Name | Exact Version | Purpose & Description |
| :--- | :--- | :--- |
| **express** | `^5.2.1` | Next-generation Node.js REST API framework. |
| **pg** | `^8.23.0` | PostgreSQL client for Node.js (connecting to Supabase). |
| **cors** | `^2.8.6` | Express middleware for enabling Cross-Origin Resource Sharing. |
| **dotenv** | `^17.4.2` | Loads environment variables from `.env` into `process.env`. |
| **@google/generative-ai** | `^0.24.1` | Official Google Gemini SDK for conversational AI guidance. |
| **nodemon** *(dev)* | `^3.1.14` | Process supervisor for automatic server restarts on file changes. |

### 2.3. Cloud Services & External APIs

| Service | Endpoint / Integration | Description |
| :--- | :--- | :--- |
| **Supabase PostgreSQL** | `aws-0-ap-southeast-1.pooler.supabase.com:5432` | Cloud PostgreSQL database hosting heritage entities and categories. |
| **Google Gemini API** | Model pipeline: `gemini-1.5-flash`, `gemini-2.0-flash` | Generative AI guide grounding responses in entity metadata. |
| **Esri ArcGIS Tiles** | `server.arcgisonline.com/.../World_Imagery/MapServer` | High-resolution satellite tile layer for the 2D atlas. |
| **Wikipedia Commons API** | `en.wikipedia.org/w/api.php` | Dynamic resolution of full-color photographic heritage assets. |
| **Google Fonts** | `Cinzel Decorative`, `Cinzel`, `Plus Jakarta Sans` | Curated Indic-futuristic and editorial typography. |

---

## 3. Project Architecture & Directory Structure

```
Dharoharv2/
├── .gitignore                   # Root Git ignore (protects node_modules, envs, builds)
├── progress.md                  # This complete documentation & handover file
├── Digital_Heritage_Knowledge_System_Full_Document.docx  # Original SIH reference
├── docx_content.txt             # Plain text dump of SIH requirements document
│
├── backend/                     # Express REST API Server
│   ├── package.json             # Backend dependencies & metadata
│   ├── server.js                # Main server: DB pooling, Gemini AI, API routes
│   └── node_modules/            # Installed backend packages (git-ignored)
│
├── frontend/                    # Vite + React 19 Frontend
│   ├── index.html               # Entry HTML with Cinzel & Jakarta typography
│   ├── vite.config.js           # Vite build and dev server configuration
│   ├── tailwind.config.js       # Tailwind setup with Indian jewel tone tokens
│   ├── postcss.config.js        # PostCSS configuration
│   ├── package.json             # Frontend dependencies & scripts
│   ├── public/
│   │   ├── favicon.svg          # Dharma chakra / Indic emblem icon
│   │   └── textures/            # High-res 3D Earth textures
│   │       ├── earth-blue-marble.jpg
│   │       ├── earth-topology.png
│   │       └── earth-water.png
│   └── src/
│       ├── main.jsx             # React DOM entry point
│       ├── App.jsx              # Router & layout setup
│       ├── index.css            # Indic-futuristic design tokens & glassmorphism
│       ├── utils/
│       │   └── geo.js           # Spherical coordinate conversion (latLongToVector3)
│       ├── components/
│       │   ├── Layout/
│       │   │   └── StructuralGrid.jsx   # Ambient cosmic & warm gold atmosphere
│       │   ├── Navigation/
│       │   │   └── Navbar.jsx           # Top header with chakra emblem & language switch
│       │   └── Hero/
│       │       ├── HeroSection.jsx      # Main 3D/2D switchboard & category manager
│       │       ├── Earth.jsx            # 3D R3F Earth globe with daylight corona
│       │       ├── CameraFramer.jsx     # Smooth camera lerping between wide & focused
│       │       ├── Connections.jsx      # 3D glowing golden Bezier relational arcs
│       │       ├── Map2D.jsx            # 2D Leaflet satellite atlas view
│       │       ├── Connections2D.jsx    # 2D golden dashed relational polylines
│       │       ├── BottomHUD.jsx        # Cultural Dimensions category carousel
│       │       └── RightPanel.jsx       # Darshak AI Cultural Chronicler sliding drawer
│       └── pages/
│           ├── MapPage.jsx              # Landing page wrapper for HeroSection
│           ├── DiscoverPage.jsx         # Anusandhan editorial archive & live search
│           └── ContributePage.jsx       # Jan Sahayog community story registry
│
├── scripts/                     # Database utilities & migration scripts
│   ├── seed.js                  # Initial database seeding script
│   ├── scatter.js               # Geographic scatter & coordinates normalizer
│   ├── geocode.js               # Geocoding resolution script
│   └── package.json             # Script helper dependencies
└── data/                        # Local raw data & seed definitions
```

---

## 4. Completed Milestones (What Is Done)

### 4.1. Indic-Futuristic Visual Design Overhaul
- Transformed from a cold, cyberpunk/military terminal look into a warm, prestigious **Indic-Futuristic Cultural System**.
- Implemented **Cinzel** and **Cinzel Decorative** serif headings paired with **Plus Jakarta Sans** body typography.
- Replaced stark pitch-black (`#09090B`) with **Deep Cosmic Obsidian & Temple Bronze** (`#08080C` to `#121118`).
- Created an **Indian Jewel Tone Palette**:
  - 🏛️ Saffron Gold / Temple Gold (`#D4AF37`, `#F59E0B`)
  - 💃 Peacock Teal (`#0D9488`)
  - 🎭 Terracotta Crimson (`#E11D48`)
  - 🍲 Sandstone Amber (`#D97706`)
  - 📜 Lapis Lazuli (`#3B82F6`)
  - 🧶 Lotus Rose (`#EC4899`)
  - 🌿 Sacred Tulsi Emerald (`#10B981`)

### 4.2. Interactive 3D Globe with Sunlight Alignment
- **Daylight Alignment**: Fixed camera initialization to default directly to the daylight side centered on India (`[0.67, 2.63, -7.0]`), resolving the previous dark-side initialization issue.
- **Golden Atmospheric Corona**: Realistic atmospheric scattering with warm golden rim glow.
- **Pulsing Jewel Markers**: Interactive nodes on the globe showing cultural category colors, animated beacon ripples, and hover tooltip cards.
- **Dynamic Cultural Arcs (`Connections.jsx`)**: 3D parabolic curves rendered with glowing golden lines representing historical and cultural links (e.g., Konark $\rightarrow$ Kalinga Architecture $\rightarrow$ Odissi Dance).

### 4.3. 2D Satellite Atlas (`Map2D.jsx`)
- High-resolution Esri World Imagery satellite view.
- Custom Leaflet glowing pulsating markers with popups/tooltips.
- Seamless toggle between 3D Globe and 2D Atlas in the top-right header.

### 4.4. Cultural Dimensions HUD (`BottomHUD.jsx`)
- Replaced military layer selectors with a floating **Cultural Dimensions** carousel.
- Categorized icons for Monuments, Performing Arts, Culinary Lore, Festivals, and Traditional Crafts.
- Instant filtering of markers on both 3D and 2D maps.

### 4.5. Darshak AI Cultural Chronicler (`RightPanel.jsx`)
- Sliding exhibit card displaying **full-color, high-res photography** fetched via Wikipedia API (with grayscale filters removed).
- **Verified Record Badges**: Displays Archaeological Survey of India (ASI) provenance.
- **Quick Exploration Chips**: One-click questions like *"Tell me the sacred lore"*, *"What is the architectural significance?"*.
- **Resilient AI Pipeline**: Multi-model fallback (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) with an authentic, grounded cultural historian fallback so demo presentations never crash.

### 4.6. Anusandhan Curated Archive (`DiscoverPage.jsx`)
- Full editorial cultural catalog with instant live search and category chips.
- Grid of cultural cards with location tags, reference codes, and direct *"Explore on Map"* shortcuts.

### 4.7. Jan Sahayog Community Registry (`ContributePage.jsx`)
- Community submission form for preserving oral folklore, lesser-known village monuments, forgotten artisan traditions, and culinary recipes.
- Provenance lineage selector (Family Elder Lore, Temple Palm-leaf Pothi, Artisan Tradition).
- Celebratory modal acknowledging the contributor's addition to India's national heritage registry.

### 4.8. Backend REST API (`server.js`)
- `GET /api/entities`: Fetches all heritage entities joined with category names from Supabase.
- `GET /api/entities/:id/connections`: Dynamically retrieves related cultural nodes for drawing relational arcs.
- `POST /api/chat`: Generates grounded conversational historian answers via Google Gemini.

---

## 5. Outstanding Tasks & Roadmap (What Needs To Be Done)

The following items are outlined in the SIH Reference Document (`docx_content.txt`) and represent the next logical development phases:

### Phase 1: High Priority (Hackathon MVP Polish)
1. **Connect `Jan Sahayog` Form to Supabase Database**:
   - *Current State:* Form simulates submission in React state.
   - *Action Needed:* Add a `POST /api/contributions` route in `backend/server.js` and a `contributions` table in Supabase with columns (`title`, `category`, `location`, `lore`, `source_type`, `contributor`, `status = 'pending_review'`).
2. **Audio Immersion Soundscape**:
   - *Current State:* Audio button in `Navbar.jsx` toggles icon state.
   - *Action Needed:* Add a lightweight audio loop of ambient Indian classical sitar / temple chimes (e.g. via HTML5 Audio element or Howler.js).
3. **Multi-Language Content Strings (i18n)**:
   - *Current State:* Language switcher cycles between `EN`, `हि`, and `ଓଡ଼ି`.
   - *Action Needed:* Create a translation dictionary (`src/locales/`) for UI labels and pass language preference to the AI prompt in `/api/chat` so Darshak responds in Hindi or Odia.

### Phase 2: Medium Priority (Deep Cultural Features)
4. **Historical Evolution / Time Machine Slider**:
   - Add a historical timeline slider on the 3D map (e.g. *3rd Century BCE Kalinga War $\rightarrow$ 8th-11th Century Somavamshi Temple Boom $\rightarrow$ 13th Century Eastern Ganga Dynasty (Konark) $\rightarrow$ Modern Living Traditions*).
5. **Pan-India Expansion of Seed Data**:
   - Expand `scripts/seed.js` to include heritage entities across Tamil Nadu, Rajasthan, Kerala, Uttar Pradesh, and Northeast India.
6. **Provenance & Source Trust Scores**:
   - Add clear visual tags distinguishing between:
     - `ASI Official Record`
     - `Peer-Reviewed Academic Historian`
     - `Local Community Lore / Oral Tradition`

### Phase 3: Engagement & Scaling (Post-Hackathon Vision)
7. **Personalized Heritage Itinerary Generator**:
   - Allow users to input available travel time, starting city (e.g. Bhubaneswar), and interests (temples vs. textiles vs. food) to generate a cultural pilgrimage route.
8. **Heritage Badges & Cultural Quizzes**:
   - Gamified trivia quizzes on Odissi mudras, temple architecture components (Vimana, Jagamohana), and regional sweets (Chhena Poda, Rasagola).

---

## 6. Developer Onboarding & Quick-Start Guide

### 6.1. Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node v20/v22).
- **npm**: `v9.0.0` or higher.

### 6.2. Running the Project Locally

#### 1. Start the Backend API
```bash
cd backend
npm install
node server.js
```
*The server will run on [http://localhost:3000](http://localhost:3000).*

#### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*The Vite dev server will run on [http://localhost:5173](http://localhost:5173).*

#### 3. Building for Production
```bash
cd frontend
npm run build
```
*Builds optimized, chunked production assets into `frontend/dist/`.*

### 6.3. Database Connection Details
The backend communicates with a Supabase PostgreSQL instance using connection pooling:
- **Host**: `aws-0-ap-southeast-1.pooler.supabase.com:5432`
- **Database**: `postgres`
- **SSL**: `rejectUnauthorized: false` (Required for Supabase pooled connections).

---

## 7. Database Schema Overview

```sql
-- Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Entities Table
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INT REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  location_context VARCHAR(255),
  coordinates FLOAT8[], -- [latitude, longitude]
  description TEXT,
  metadata JSONB
);

-- Connections Table (Relationships)
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  source_id UUID REFERENCES entities(id),
  target_id UUID REFERENCES entities(id),
  relationship_type VARCHAR(100) -- e.g. 'architectural_influence', 'associated_dance'
);
```

---

## 8. Summary Checklist for Any New Contributor

- [x] Root `.gitignore` configured to prevent committing `node_modules` and local environment files.
- [x] Express backend running cleanly on port 3000.
- [x] Vite frontend running cleanly on port 5173.
- [x] Production build succeeds with 0 errors.
- [x] 3D globe defaults to daylight side centered on India.
- [x] Full-color heritage photography and resilient AI fallback configured.
- [ ] Connect `Jan Sahayog` form submission to Supabase table.
- [ ] Add ambient temple/classical audio loop to audio immersion toggle.
- [ ] Populate Hindi & Odia localization files.
