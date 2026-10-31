import React, { createContext, useContext, useState, useEffect } from 'react';
import { allEntityTranslations, locationTranslations } from './heritageTranslations';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    nav_map: "Heritage Map",
    nav_discover: "Explore",
    nav_contribute: "Share a Story",
    nav_knowledge_live: "200+ Verified Sites",
    nav_title: "Dharohar",
    nav_subtitle: "Explore India's living heritage",
    hero_lede: "Odisha is the first state on the globe, with {count} temples, crafts, festivals and foods.",
    view_highlights: "Highlights",
    view_all: "All",
    nav_quiz: "Quiz",
    quiz_btn: "Heritage Quiz",
    lang_name: "English",
    audio_mute: "Mute Ambient Sitar",
    audio_play: "Play Ambient Temple Sitar",

    // Hero Section & HUD
    hero_3d: "3D Globe",
    hero_2d: "2D Map",
    hero_search_placeholder: "Search temples, festivals, art forms, food, stories...",
    hero_search_no_results: "No heritage places found",
    hero_search_hint: "Search across 200+ sacred sites, art forms & folk stories",
    hud_subtitle: "Heritage Categories",
    hud_all: "All",

    // Categories
    cat_all: "All",
    cat_monuments: "Monuments & Temples",
    cat_dance: "Classical Dance & Music",
    cat_festivals: "Festivals & Rituals",
    cat_cuisine: "Food & Culinary",
    cat_traditions: "Folk Traditions & Stories",
    cat_crafts: "Arts, Dance & Crafts",
    cat_heritage: "Heritage",
    cat_monument: "Monuments & Architecture",
    cat_art: "Art, Dance & Crafts",
    cat_tradition: "Regional Traditions",
    cat_personality: "Historical Figures",
    cat_legends: "Folklore & Legends",
    cat_hidden: "Hidden & Nature Spots",

    // Right Panel
    panel_overview: "Overview",
    panel_connections: "Connections",
    panel_chronicler: "AI Guide",
    panel_cultural_matrix: "Connected Traditions",
    panel_location: "Location",
    panel_category: "Category",
    panel_coordinates: "Coordinates",
    panel_verified: "Verified Heritage",
    panel_wiki_view: "Read on Wikipedia",
    panel_no_desc: "Detailed story and background coming soon.",
    panel_close: "Close Panel",
    panel_loading_img: "Loading Image...",
    panel_record_progress: "Photo Coming Soon",
    panel_living_threads: "Living Cultural Threads",
    panel_living_threads_sub: "Verified Knowledge Graph Relations",
    panel_hop_arc: "Follow Cultural Arc",
    panel_ask_ai_title: "Curious about this heritage?",
    panel_ask_ai_sub: "Ask Dharohar AI for oral lore, architectural secrets & festival dates",
    panel_ask_ai_btn: "Ask Dharohar AI Guide",
    panel_no_connections: "Connecting regional heritage traditions...",
    
    // Chat & Darshak AI
    chat_header_title: "Darshak AI",
    chat_header_sub: "AI Heritage Guide • Live",
    chat_intro: "Namaste! I am Darshak, your AI Heritage Guide. Explore with me the living history, sacred architecture, and timeless stories of {name}. How may I help you today?",
    chat_prompt_1: "Tell me the history and origin story",
    chat_prompt_2: "What makes the architecture special?",
    chat_prompt_3: "Which festivals are celebrated here?",
    chat_placeholder: "Ask Darshak anything about this place...",
    chat_typing: "Darshak is finding details...",
    chat_send: "Send",
    panel_ai_status: "AI Guide • Live",
    lang_switch_tooltip: "Switch Language",

    // Discover Page
    discover_badge: "Discover • Heritage Guide",
    discover_title: "Explore India's Sacred Heritage",
    discover_subtitle: "Search and explore India's most iconic temples, folk arts, festivals, traditional recipes, and local stories in one place.",
    discover_search_placeholder: "Search temples, festivals, art forms, or regional stories...",
    discover_showing: "Showing",
    discover_of: "of",
    discover_entries: "heritage places & stories",
    discover_no_results: "No Heritage Records Found",
    discover_clear_search: "Reset Search & Filters",
    discover_view_map: "View on Map",
    discover_read_more: "Read Details",
    discover_ref: "ID",
    discover_loading: "Loading Heritage Places...",
    discover_card_lore: "History & Story",
    discover_open_detail: "View Details",
    discover_close_modal: "Close",
    discover_modal_explore: "Explore on 3D Globe",
    discover_ask_darshak: "Ask Darshak AI",

    // Contribute Page
    contribute_badge: "Community Stories • Share Heritage",
    contribute_title: "Share a Story, Preserve Our Heritage",
    contribute_subtitle: "Know a hidden temple, folk art, festival, or traditional recipe from your hometown? Share it with the community.",
    contribute_form_heading: "Submit Your Heritage Story",
    contribute_name_label: "Name of Place, Art or Tradition *",
    contribute_name_placeholder: "e.g. Danda Nata Dance, Prachi Valley, Chausath Yogini...",
    contribute_cat_label: "Category *",
    contribute_cat_select: "Select a category",
    contribute_loc_label: "City, Village or District *",
    contribute_loc_placeholder: "e.g. Raghurajpur, Puri, Odisha...",
    contribute_source_label: "Where did you learn this? (Source) *",
    contribute_source_opt1: "Family Elders / Local Folklore",
    contribute_source_opt2: "Temple Records / Ancient Manuscripts",
    contribute_source_opt3: "Local Artists & Performers",
    contribute_source_opt4: "Personal Visit / Field Research",
    contribute_desc_label: "Tell the Story, History & Significance *",
    contribute_desc_placeholder: "Share the story, history, local traditions, rituals, or what visitors should know...",
    contribute_contributor_label: "Your Name / Organization",
    contribute_contributor_placeholder: "e.g. Rahul Sharma",
    contribute_photo_label: "Photo / Document Link (Optional)",
    contribute_photo_placeholder: "https://... image link",
    contribute_submit: "Submit Story",
    contribute_submitting: "Saving your story...",
    contribute_success_title: "Story Submitted Successfully!",
    contribute_success_msg: "Thank you for contributing to Dharohar! Our team will review your submission and add it to the interactive map shortly.",
    contribute_another: "Share Another Story",

    // Itinerary Generator
    itinerary_btn: "Itinerary",
    itinerary_modal_title: "AI Trip & Route Planner",
    itinerary_modal_subtitle: "Get a personalized, day-by-day travel plan powered by Darshak AI.",
    itinerary_duration_label: "Trip Duration",
    itinerary_1day: "1 Day (Quick Highlights)",
    itinerary_2day: "2 Days (Weekend Getaway)",
    itinerary_3day: "3 Days (Popular Heritage Trail)",
    itinerary_5day: "5 Days (Complete Explorer)",
    itinerary_7day: "7 Days (Grand Cultural Expedition)",
    itinerary_hub_label: "Starting City / Region",
    itinerary_hub_any: "Any Region (Auto-select)",
    itinerary_theme_label: "What would you like to explore?",
    itinerary_theme_temples: "Temples & Architecture",
    itinerary_theme_dance: "Dance, Music & Folk Arts",
    itinerary_theme_food: "Local Food & Cuisine",
    itinerary_theme_crafts: "Handicrafts & Handlooms",
    itinerary_theme_wildlife: "Nature, Coastal & Sacred Groves",
    itinerary_theme_history: "Forts, History & Tribal Heritage",
    itinerary_custom_prompt_label: "Custom Preferences & Special Requests (Optional)",
    itinerary_custom_prompt_placeholder: "e.g., Traveling with family/elders, seeking vegetarian Odia temple food, photography spots, relaxed pace, specific monuments...",
    itinerary_generate_btn: "Generate My Travel Plan",
    itinerary_generating: "Darshak AI is creating your personalized travel route...",
    itinerary_day: "Day",
    itinerary_activity: "What to see & do",
    itinerary_food_tip: "Food Recommendation",
    itinerary_lore_highlight: "Story & Significance",
    itinerary_view_stop: "Locate on Map",
    itinerary_highlight_route: "Show Route on Map",
    itinerary_clear_route: "Clear Route",
    itinerary_copy_btn: "Copy Plan",
    itinerary_copied: "Copied to Clipboard!",
    itinerary_reset: "Plan New Trip",

    // Dharohar AI Sticky Chatbot
    bot_title: "Dharohar AI Guide",
    bot_subtitle: "Your Living Heritage Navigator",
    bot_welcome: "Namaste! I am your Dharohar AI Guide. I can guide you through ancient temples, folk dances, vibrant festivals, traditional cuisine, and hidden heritage trails across Odisha and India. How may I assist your cultural journey today?",
    bot_quick_1: "Ancient Temples in Puri & Konark",
    bot_quick_2: "Odissi & Chhau Dance Heritage",
    bot_quick_3: "Traditional Cuisine & Mahaprasad",
    bot_quick_4: "Hidden Heritage Spots in Odisha",
    bot_quick_5: "Suggest a 3-Day Heritage Trip",
    bot_placeholder: "Ask anything about heritage, history, rituals, food...",
    bot_callout: "Ask Dharohar AI Guide!",
    bot_clear: "Clear Chat",
    bot_online: "Live Guide",
    bot_voice_on: "Voice On",
    bot_voice_off: "Voice Off",
    bot_disclaimer: "Powered by Dharohar AI & Gemini Knowledge System"
  },

  hi: {
    // Navbar
    nav_map: "धरोहर मानचित्र",
    nav_discover: "खोजें",
    nav_contribute: "गाथा जोड़ें",
    nav_knowledge_live: "200+ सत्यापित स्थल",
    nav_title: "धरोहर",
    nav_subtitle: "भारत की जीवंत सांस्कृतिक धरोहर",
    hero_lede: "इस ग्लोब पर ओडिशा पहला राज्य है, जिसमें {count} मंदिर, शिल्प, त्योहार और व्यंजन हैं।",
    view_highlights: "मुख्य स्थल",
    view_all: "सभी",
    nav_quiz: "क्विज़",
    quiz_btn: "धरोहर ज्ञान क्विज़",
    lang_name: "हिन्दी",
    audio_mute: "सितार संगीत बंद करें",
    audio_play: "पारंपरिक सितार संगीत सुनें",

    // Hero Section & HUD
    hero_3d: "3D ग्लोब",
    hero_2d: "2D मानचित्र",
    hero_search_placeholder: "मंदिर, त्योहार, कला, पारंपरिक भोजन या स्थान खोजें...",
    hero_search_no_results: "कोई धरोहर स्थल नहीं मिला",
    hero_search_hint: "200+ पवित्र स्थलों, कला रूपों और लोकगाथाओं में खोजें",
    hud_subtitle: "धरोहर श्रेणियां",
    hud_all: "सभी",

    // Categories
    cat_all: "सभी",
    cat_monuments: "स्मारक एवं मंदिर",
    cat_dance: "शास्त्रीय नृत्य एवं संगीत",
    cat_festivals: "त्योहार एवं उत्सव",
    cat_cuisine: "पारंपरिक खान-पान",
    cat_traditions: "लोक परंपराएं एवं कथाएं",
    cat_crafts: "कला, नृत्य एवं शिल्प",
    cat_heritage: "धरोहर",
    cat_monument: "स्मारक एवं स्थापत्य",
    cat_art: "कला, नृत्य एवं शिल्प",
    cat_tradition: "क्षेत्रीय परंपराएं",
    cat_personality: "ऐतिहासिक विभूतियाँ",
    cat_legends: "लोककथाएं एवं पौराणिक प्रसंग",
    cat_hidden: "प्राकृतिक व अज्ञात स्थल",

    // Right Panel
    panel_overview: "विवरण",
    panel_connections: "संबंध",
    panel_chronicler: "दर्शक AI",
    panel_cultural_matrix: "संबंधित परंपराएं",
    panel_location: "स्थान",
    panel_category: "श्रेणी",
    panel_coordinates: "निर्देशांक",
    panel_verified: "सत्यापित धरोहर",
    panel_wiki_view: "विकिपीडिया पर पढ़ें",
    panel_no_desc: "विस्तृत विवरण व कथा जल्द उपलब्ध होगी।",
    panel_close: "पैनल बंद करें",
    panel_loading_img: "तस्वीर लोड हो रही है...",
    panel_record_progress: "तस्वीर जल्द आ रही है",
    panel_living_threads: "जीवंत सांस्कृतिक सूत्र",
    panel_living_threads_sub: "प्रमाणित ज्ञान ग्राफ संबंध",
    panel_hop_arc: "सांस्कृतिक पथ का अनुसरण करें",
    panel_ask_ai_title: "इस धरोहर के बारे में और जानना चाहते हैं?",
    panel_ask_ai_sub: "धरोहर एआई से लोककथाओं, स्थापत्य रहस्यों और उत्सवों के बारे में पूछें",
    panel_ask_ai_btn: "धरोहर एआई से पूछें",
    panel_no_connections: "क्षेत्रीय सांस्कृतिक परंपराओं को जोड़ा जा रहा है...",

    // Chat & Darshak AI
    chat_header_title: "दर्शक AI",
    chat_header_sub: "AI धरोहर मार्गदर्शक • लाइव",
    chat_intro: "नमस्ते! मैं 'दर्शक' हूँ, धरोहर का आपका AI मार्गदर्शक। मेरे साथ {name} के इतिहास, स्थापत्य और रोचक कथाओं की खोज करें। मैं आपकी क्या सहायता कर सकता हूँ?",
    chat_prompt_1: "इसका इतिहास और उत्पत्ति की कहानी बताएं",
    chat_prompt_2: "इसकी स्थापत्य कला में क्या खास है?",
    chat_prompt_3: "यहाँ कौन-से प्रमुख त्योहार मनाए जाते हैं?",
    chat_placeholder: "दर्शक से इसके इतिहास, स्थापत्य या कहानी के बारे में पूछें...",
    chat_typing: "दर्शक जानकारी खोज रहा है...",
    chat_send: "भेजें",
    panel_ai_status: "AI मार्गदर्शक • लाइव",
    lang_switch_tooltip: "भाषा बदलें",

    // Discover Page
    discover_badge: "धरोहर खोजें • संपूर्ण गाइड",
    discover_title: "भारत की जीवंत धरोहर का अन्वेषण करें",
    discover_subtitle: "प्रसिद्ध मंदिरों, लोक कलाओं, त्योहारों, पारंपरिक व्यंजनों और लोकगाथाओं को एक ही स्थान पर आसानी से खोजें।",
    discover_search_placeholder: "मंदिर, कला, त्योहार, व्यंजन या स्थान खोजें...",
    discover_showing: "प्रदर्शित",
    discover_of: "कुल",
    discover_entries: "धरोहर स्थल व गाथाएं",
    discover_no_results: "कोई धरोहर नहीं मिली",
    discover_clear_search: "फ़िल्टर हटाएं",
    discover_view_map: "मानचित्र पर देखें",
    discover_read_more: "विवरण पढ़ें",
    discover_ref: "ID",
    discover_loading: "धरोहर लोड हो रही है...",
    discover_card_lore: "इतिहास एवं गाथा",
    discover_open_detail: "विवरण देखें",
    discover_close_modal: "बंद करें",
    discover_modal_explore: "3D ग्लोब पर देखें",
    discover_ask_darshak: "दर्शक AI से पूछें",

    // Contribute Page
    contribute_badge: "जन सहयोग • अपनी धरोहर साझा करें",
    contribute_title: "एक कहानी साझा करें, अपनी धरोहर संजोएं",
    contribute_subtitle: "अपने शहर या गाँव के किसी मंदिर, लोक कला, त्योहार या पारंपरिक व्यंजन की कहानी धरोहर से साझा करें।",
    contribute_form_heading: "अपनी कहानी सबमिट करें",
    contribute_name_label: "स्थान, कला या परंपरा का नाम *",
    contribute_name_placeholder: "उदा. दंड नाट, प्राची घाटी, बिरजा मंदिर...",
    contribute_cat_label: "श्रेणी *",
    contribute_cat_select: "श्रेणी चुनें",
    contribute_loc_label: "शहर, गाँव या जिला *",
    contribute_loc_placeholder: "उदा. रघुराजपुर, पुरी, जाजपुर...",
    contribute_source_label: "यह जानकारी कहाँ से मिली? (स्रोत) *",
    contribute_source_opt1: "परिवार के बुजुर्ग / लोककथाएं",
    contribute_source_opt2: "मंदिर के दस्तावेज / प्राचीन ग्रंथ",
    contribute_source_opt3: "स्थानीय कलाकार व शिल्पकार",
    contribute_source_opt4: "व्यक्तिगत भ्रमण / शोध",
    contribute_desc_label: "कहानी, इतिहास और महत्व बताएं *",
    contribute_desc_placeholder: "स्थान की कहानी, इतिहास, परंपराएं या पर्यटकों के लिए जरूरी बातें साझा करें...",
    contribute_contributor_label: "आपका नाम / संस्था",
    contribute_contributor_placeholder: "उदा. राहुल शर्मा",
    contribute_photo_label: "तस्वीर या दस्तावेज लिंक (वैकल्पिक)",
    contribute_photo_placeholder: "https://... फोटो का लिंक",
    contribute_submit: "कहानी सबमिट करें",
    contribute_submitting: "सहेजा जा रहा है...",
    contribute_success_title: "कहानी सफलतापूर्वक सबमिट हो गई!",
    contribute_success_msg: "धरोहर में योगदान के लिए धन्यवाद। आपकी कहानी की समीक्षा के बाद इसे जल्द ही मानचित्र पर जोड़ दिया जाएगा।",
    contribute_another: "एक और कहानी साझा करें",

    // Itinerary Generator
    itinerary_btn: "यात्रा योजना (Itinerary)",
    itinerary_modal_title: "AI यात्रा योजनाकार",
    itinerary_modal_subtitle: "दर्शक AI द्वारा तैयार की गई अपनी व्यक्तिगत सांस्कृतिक यात्रा योजना प्राप्त करें।",
    itinerary_duration_label: "यात्रा की अवधि",
    itinerary_1day: "1 दिन (मुख्य आकर्षण)",
    itinerary_2day: "2 दिन (सप्ताहांत यात्रा)",
    itinerary_3day: "3 दिन (लोकप्रिय विरासत मार्ग)",
    itinerary_5day: "5 दिन (संपूर्ण यात्रा)",
    itinerary_7day: "7 दिन (महा-सांस्कृतिक यात्रा)",
    itinerary_hub_label: "प्रारंभिक शहर / क्षेत्र",
    itinerary_hub_any: "सभी क्षेत्र (स्वतः चयन)",
    itinerary_theme_label: "आप क्या देखना पसंद करेंगे?",
    itinerary_theme_temples: "मंदिर एवं स्थापत्य",
    itinerary_theme_dance: "नृत्य, संगीत व लोक कलाएं",
    itinerary_theme_food: "पारंपरिक खान-पान",
    itinerary_theme_crafts: "हस्तशिल्प व हथकरघा",
    itinerary_theme_wildlife: "प्रकृति व तटीय धरोहर",
    itinerary_theme_history: "इतिहास, किले व जनजातीय संस्कृति",
    itinerary_custom_prompt_label: "विशेष प्राथमिकताएं व आवश्यकताएं (वैकल्पिक)",
    itinerary_custom_prompt_placeholder: "उदा. परिवार/बुजुर्गों के साथ यात्रा, शुद्ध शाकाहारी मंदिर भोग, फोटोग्राफी, आरामदायक गति, विशिष्ट मंदिर...",
    itinerary_generate_btn: "मेरी यात्रा प्लान तैयार करें",
    itinerary_generating: "दर्शक AI आपका यात्रा मार्ग तैयार कर रहा है...",
    itinerary_day: "दिन",
    itinerary_activity: "क्या देखें व अनुभव करें",
    itinerary_food_tip: "खान-पान सलाह",
    itinerary_lore_highlight: "इतिहास व पौराणिक गाथा",
    itinerary_view_stop: "मानचित्र पर देखें",
    itinerary_highlight_route: "मानचित्र पर मार्ग दिखाएं",
    itinerary_clear_route: "मार्ग हटाएं",
    itinerary_copy_btn: "प्लान कॉपी करें",
    itinerary_copied: "कॉपी हो गया!",
    itinerary_reset: "नई यात्रा प्लान करें",

    // Dharohar AI Sticky Chatbot
    bot_title: "धरोहर साथी AI",
    bot_subtitle: "आपका सांस्कृतिक एवं विरासत मार्गदर्शक",
    bot_welcome: "नमस्ते! मैं आपका 'धरोहर साथी AI' हूँ। ओडिशा और भारत के प्राचीन मंदिरों, लोक नृत्यों, त्योहारों, खान-पान या अनसुने ऐतिहासिक स्थलों के बारे में मुझसे कुछ भी पूछें। मैं आपकी सांस्कृतिक यात्रा में कैसे सहायता करूँ?",
    bot_quick_1: "पुरी और कोणार्क के प्रसिद्ध मंदिर",
    bot_quick_2: "छऊ और ओडिसी नृत्य परंपरा",
    bot_quick_3: "पारंपरिक ओडिया व्यंजन व महाप्रसाद",
    bot_quick_4: "ओडिशा के अनूठे व अनसुने स्थल",
    bot_quick_5: "3 दिवसीय सांस्कृतिक यात्रा का सुझाव दें",
    bot_placeholder: "विरासत, मंदिर, कला, भोजन या संस्कृति के बारे में पूछें...",
    bot_callout: "धरोहर AI साथी से पूछें!",
    bot_clear: "बातचीत साफ़ करें",
    bot_online: "सक्रिय मार्गदर्शक",
    bot_voice_on: "आवाज़ चालू",
    bot_voice_off: "आवाज़ बंद",
    bot_disclaimer: "धरोहर AI एवं जेमिनी नॉलेज सिस्टम द्वारा संचालित"
  },

  or: {
    // Navbar
    nav_map: "ଐତିହ୍ୟ ମାନଚିତ୍ର",
    nav_discover: "ଅନୁସନ୍ଧାନ",
    nav_contribute: "କାହାଣୀ ଯୋଡ଼ନ୍ତୁ",
    nav_knowledge_live: "୨୦୦+ ସତ୍ୟାପିତ ସ୍ଥାନ",
    nav_title: "ଧରୋହର",
    nav_subtitle: "ଭାରତର ଜୀବନ୍ତ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ",
    hero_lede: "ଏହି ଗ୍ଲୋବରେ ଓଡ଼ିଶା ପ୍ରଥମ ରାଜ୍ୟ, ଯେଉଁଥିରେ {count}ଟି ମନ୍ଦିର, ଶିଳ୍ପ, ପର୍ବ ଓ ଖାଦ୍ୟ ରହିଛି।",
    view_highlights: "ମୁଖ୍ୟ ସ୍ଥଳ",
    view_all: "ସମସ୍ତ",
    nav_quiz: "କୁଇଜ୍",
    quiz_btn: "ଐତିହ୍ୟ ଜ୍ଞାନ କୁଇଜ୍",
    lang_name: "ଓଡ଼ିଆ",
    audio_mute: "ସୀତାର ବାଦ୍ୟ ବନ୍ଦ କରନ୍ତୁ",
    audio_play: "ପାରମ୍ପରିକ ମନ୍ଦିର ସୀତାର ବାଦ୍ୟ ଶୁଣନ୍ତୁ",

    // Hero Section & HUD
    hero_3d: "୩D ଗ୍ଲୋବ୍",
    hero_2d: "୨D ମାନଚିତ୍ର",
    hero_search_placeholder: "ମନ୍ଦିର, ପର୍ବ, କଳା, ଖାଦ୍ୟ ବା ସ୍ଥାନ ଖୋଜନ୍ତୁ...",
    hero_search_no_results: "କୌଣସି ଐତିହ୍ୟ ସ୍ଥାନ ମିଳିଲା ନାହିଁ",
    hero_search_hint: "୨୦୦+ ପବିତ୍ର ସ୍ଥଳୀ, କଳା ଓ ଲୋକକଥାରେ ଅନୁସନ୍ଧାନ କରନ୍ତୁ",
    hud_subtitle: "ଐତିହ୍ୟ ବିଭାଗ",
    hud_all: "ସମସ୍ତ",

    // Categories
    cat_all: "ସମସ୍ତ",
    cat_monuments: "ସ୍ମାରକୀ ଓ ମନ୍ଦିର",
    cat_dance: "ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଓ ସଙ୍ଗୀତ",
    cat_festivals: "ପର୍ବପର୍ବାଣି ଓ ଉତ୍ସବ",
    cat_cuisine: "ପାରମ୍ପରିକ ଖାଦ୍ୟ",
    cat_traditions: "ଲୋକ ପରମ୍ପରା ଓ କିମ୍ବଦନ୍ତୀ",
    cat_crafts: "କଳା, ନୃତ୍ୟ ଓ ଶିଳ୍ପ",
    cat_heritage: "ଐତିହ୍ୟ",
    cat_monument: "ସ୍ମାରକୀ ଓ ସ୍ଥାପତ୍ୟ",
    cat_art: "କଳା, ନୃତ୍ୟ ଓ ଶିଳ୍ପ",
    cat_tradition: "ଆଞ୍ଚଳିକ ପରମ୍ପରା",
    cat_personality: "ଐତିହାସିକ ବ୍ୟକ୍ତିତ୍ୱ",
    cat_legends: "ଲୋକକଥା ଓ ପୌରାଣିକ କାହାଣୀ",
    cat_hidden: "ଅନାଲୋଚିତ ଓ ପ୍ରାକୃତିକ ସ୍ଥାନ",

    // Right Panel
    panel_overview: "ବିବରଣୀ",
    panel_connections: "ସମ୍ପର୍କ",
    panel_chronicler: "ଦର୍ଶକ AI",
    panel_cultural_matrix: "ସମ୍ପର୍କିତ ପରମ୍ପରା",
    panel_location: "ସ୍ଥାନ",
    panel_category: "ବିଭାଗ",
    panel_coordinates: "ନିର୍ଦ୍ଦେଶାଙ୍କ",
    panel_verified: "ସତ୍ୟାପିତ ଐତିହ୍ୟ",
    panel_wiki_view: "ଉଇକିପିଡ଼ିଆରେ ପଢ଼ନ୍ତୁ",
    panel_no_desc: "ବିସ୍ତୃତ ତଥ୍ୟ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ।",
    panel_close: "ପ୍ୟାନେଲ୍ ବନ୍ଦ କରନ୍ତୁ",
    panel_loading_img: "ଫଟୋ ଲୋଡ୍ ହେଉଛି...",
    panel_record_progress: "ଫଟୋ ଶୀଘ୍ର ଆସୁଛି",
    panel_living_threads: "ଜୀବନ୍ତ ସାଂସ୍କୃତିକ ସମ୍ପର୍କ ସୂତ୍ର",
    panel_living_threads_sub: "ପ୍ରମାଣିତ ଜ୍ଞାନ ଗ୍ରାଫ୍ ସମ୍ପର୍କ",
    panel_hop_arc: "ସାଂସ୍କୃତିକ ପଥ ଅନୁସରଣ କରନ୍ତୁ",
    panel_ask_ai_title: "ଏହି ଐତିହ୍ୟ ବିଷୟରେ ଅଧିକ ଜାଣିବାକୁ ଚାହାନ୍ତି କି?",
    panel_ask_ai_sub: "ଧରୋହର AI କୁ ଲୋକକଥା, ସ୍ଥାପତ୍ୟ ରହସ୍ୟ ଓ ପର୍ବପର୍ବାଣି ବିଷୟରେ ପଚାରନ୍ତୁ",
    panel_ask_ai_btn: "ଧରୋହର AI କୁ ପଚାରନ୍ତୁ",
    panel_no_connections: "ଆଞ୍ଚଳିକ ଐତିହ୍ୟ ପରମ୍ପରା ସଂଯୋଗ କରାଯାଉଛି...",

    // Chat & Darshak AI
    chat_header_title: "ଦର୍ଶକ AI",
    chat_header_sub: "AI ଐତିହ୍ୟ ମାର୍ଗଦର୍ଶକ • ଲାଇଭ୍",
    chat_intro: "ନମସ୍କାର! ମୁଁ 'ଦର୍ଶକ', ଧରୋହରର ଆପଣଙ୍କ AI ମାର୍ଗଦର୍ଶକ। ମୋ ସହିତ {name}ର ଇତିହାସ, ସ୍ଥାପତ୍ୟ ଓ କାହାଣୀର ଅନୁସନ୍ଧାନ କରନ୍ତୁ। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    chat_prompt_1: "ଏହାର ଇତିହାସ ଓ କିମ୍ବଦନ୍ତୀ କୁହନ୍ତୁ",
    chat_prompt_2: "ଏହାର ସ୍ଥାପତ୍ୟ କଳାର ବିଶେଷତ୍ୱ କ'ଣ?",
    chat_prompt_3: "ଏଠାରେ କେଉଁ ପ୍ରମୁଖ ପର୍ବ ପାଳନ କରାଯାଏ?",
    chat_placeholder: "ଦର୍ଶକଙ୍କୁ ଏହି ସ୍ଥାନ ବିଷୟରେ ପଚାରନ୍ତୁ...",
    chat_typing: "ଦର୍ଶକ ତଥ୍ୟ ଅନୁସନ୍ଧାନ କରୁଛନ୍ତି...",
    chat_send: "ପଠାନ୍ତୁ",
    panel_ai_status: "AI ମାର୍ଗଦର୍ଶକ • ଲାଇଭ୍",
    lang_switch_tooltip: "ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ",

    // Discover Page
    discover_badge: "ଅନୁସନ୍ଧାନ • ସମ୍ପୂର୍ଣ୍ଣ ଗାଇଡ୍",
    discover_title: "ଭାରତର ଜୀବନ୍ତ ଐତିହ୍ୟ ଆବିଷ୍କାର କରନ୍ତୁ",
    discover_subtitle: "ପ୍ରସିଦ୍ଧ ମନ୍ଦିର, ଶାସ୍ତ୍ରୀୟ କଳା, ଲୋକ ପରମ୍ପରା, ପର୍ବପର୍ବାଣି ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟକୁ ଗୋଟିଏ ସ୍ଥାନରେ ଖୋଜନ୍ତୁ।",
    discover_search_placeholder: "ମନ୍ଦିର, ପରମ୍ପରା, କଳା କିମ୍ବା କାହାଣୀ ଖୋଜନ୍ତୁ...",
    discover_showing: "ପ୍ରଦର୍ଶିତ",
    discover_of: "ମୋଟ",
    discover_entries: "ଐତିହ୍ୟ ସ୍ଥାନ ଓ କାହାଣୀ",
    discover_no_results: "କୌଣସି ଐତିହ୍ୟ ତଥ୍ୟ ମିଳିଲା ନାହିଁ",
    discover_clear_search: "ଫିଲ୍ଟର୍ ହଟାନ୍ତୁ",
    discover_view_map: "ମାନଚିତ୍ରରେ ଦେଖନ୍ତୁ",
    discover_read_more: "ବିବରଣୀ ପଢ଼ନ୍ତୁ",
    discover_ref: "ID",
    discover_loading: "ଐତିହ୍ୟ ଲୋଡ୍ ହେଉଛି...",
    discover_card_lore: "ଇତିହାସ ଓ କାହାଣୀ",
    discover_open_detail: "ବିବରଣୀ ଦେଖନ୍ତୁ",
    discover_close_modal: "ବନ୍ଦ କରନ୍ତୁ",
    discover_modal_explore: "୩D ଗ୍ଲୋବ୍‌ରେ ଦେଖନ୍ତୁ",
    discover_ask_darshak: "ଦର୍ଶକ AI କୁ ପଚାରନ୍ତୁ",

    // Contribute Page
    contribute_badge: "ଜନ ସହଯୋଗ • ନିଜ ଐତିହ୍ୟ ଯୋଡ଼ନ୍ତୁ",
    contribute_title: "ଏକ କାହାଣୀ ସଂରକ୍ଷଣ କରନ୍ତୁ, ଆମ ଐତିହ୍ୟ ସମୃଦ୍ଧ କରନ୍ତୁ",
    contribute_subtitle: "ନିଜ ଗ୍ରାମ ବା ସହରର କୌଣସି ମନ୍ଦିର, ଲୋକ କଳା, ପର୍ବ କିମ୍ବା ପାରମ୍ପରିକ ଖାଦ୍ୟର କାହାଣୀ ଧରୋହରରେ ସାମିଲ କରନ୍ତୁ।",
    contribute_form_heading: "ଆପଣଙ୍କ କାହାଣୀ ସାମିଲ କରନ୍ତୁ",
    contribute_name_label: "ସ୍ଥାନ, କଳା କିମ୍ବା ପରମ୍ପରାର ନାମ *",
    contribute_name_placeholder: "ଯଥା: ଦଣ୍ଡ ନାଟ, ପ୍ରାଚୀ ଉପତ୍ୟକା, ବିରଜା ମନ୍ଦିର...",
    contribute_cat_label: "ବିଭାଗ *",
    contribute_cat_select: "ବିଭାଗ ବାଛନ୍ତୁ",
    contribute_loc_label: "ସହର, ଗ୍ରାମ କିମ୍ବା ଜିଲ୍ଲା *",
    contribute_loc_placeholder: "ଯଥା: ରଘୁରାଜପୁର, ପୁରୀ, ଯାଜପୁର...",
    contribute_source_label: "ଏହି ତଥ୍ୟ କେଉଁଠାରୁ ପାଇଲେ? (ଉତ୍ସ) *",
    contribute_source_opt1: "ପରିବାରର ବୟୋଜ୍ୟେଷ୍ଠ / ଲୋକକଥା",
    contribute_source_opt2: "ମନ୍ଦିର ଅଭିଲେଖ / ପୁରାତନ ଗ୍ରନ୍ଥ",
    contribute_source_opt3: "ସ୍ଥାନୀୟ କାରିଗର ଓ କଳାକାର",
    contribute_source_opt4: "ବ୍ୟକ୍ତିଗତ ପରିଦର୍ଶନ / ଅନୁସନ୍ଧାନ",
    contribute_desc_label: "କାହାଣୀ, ଇତିହାସ ଓ ମହତ୍ତ୍ୱ କୁହନ୍ତୁ *",
    contribute_desc_placeholder: "କାହାଣୀ, ଇତିହାସ, ସାମୁଦାୟିକ ମହତ୍ତ୍ୱ ବା ଭ୍ରମଣକାରୀଙ୍କ ପାଇଁ ଜରୁରୀ ସୂଚନା ଲେଖନ୍ତୁ...",
    contribute_contributor_label: "ଆପଣଙ୍କ ନାମ / ସଂଗଠନ",
    contribute_contributor_placeholder: "ଯଥା: ରାହୁଲ ଶର୍ମା",
    contribute_photo_label: "ଫଟୋ ଲିଙ୍କ (ଐଚ୍ଛିକ)",
    contribute_photo_placeholder: "https://... ଫଟୋ ଲିଙ୍କ",
    contribute_submit: "କାହାଣୀ ସାମିଲ କରନ୍ତୁ",
    contribute_submitting: "ସଂରକ୍ଷଣ ହେଉଛି...",
    contribute_success_title: "କାହାଣୀ ସଫଳତାର ସହ ସାମିଲ ହେଲା!",
    contribute_success_msg: "ଧରୋହରରେ ଯୋଗଦାନ କରିଥିବାରୁ ଧନ୍ୟବାଦ। ଆପଣଙ୍କ ତଥ୍ୟକୁ ସତ୍ୟାପନ କରାଯାଇ ଖୁବ୍ ଶୀଘ୍ର ମାନଚିତ୍ରରେ ସାମିଲ କରାଯିବ।",
    contribute_another: "ଆଉ ଏକ କାହାଣୀ ସାମିଲ କରନ୍ତୁ",

    // Itinerary Generator
    itinerary_btn: "ଯାତ୍ରା ଯୋଜନା (Itinerary)",
    itinerary_modal_title: "AI ଯାତ୍ରା ଯୋଜନାକାରୀ",
    itinerary_modal_subtitle: "ଦର୍ଶକ AI ଦ୍ୱାରା ପ୍ରସ୍ତୁତ ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ସାଂସ୍କୃତିକ ଯାତ୍ରା ଯୋଜନା ପାଆନ୍ତୁ।",
    itinerary_duration_label: "ଯାତ୍ରା ଅବଧି",
    itinerary_1day: "୧ ଦିନ (ମୁଖ୍ୟ ଆକର୍ଷଣ)",
    itinerary_2day: "୨ ଦିନ (ସପ୍ତାହାନ୍ତ ଭ୍ରମଣ)",
    itinerary_3day: "୩ ଦିନ (ଲୋକପ୍ରିୟ ଐତିହ୍ୟ ଯାତ୍ରା)",
    itinerary_5day: "୫ ଦିନ (ସମ୍ପୂର୍ଣ୍ଣ ଯାତ୍ରା)",
    itinerary_7day: "୭ ଦିନ (ମହା ସାଂସ୍କୃତିକ ଯାତ୍ରା)",
    itinerary_hub_label: "ଆରମ୍ଭ ସହର / ଅଞ୍ଚଳ",
    itinerary_hub_any: "ସମସ୍ତ ଅଞ୍ଚଳ (ସ୍ୱତଃ ଚୟନ)",
    itinerary_theme_label: "ଆପଣ କ'ଣ ଦେଖିବାକୁ ପସନ୍ଦ କରିବେ?",
    itinerary_theme_temples: "ମନ୍ଦିର ଓ ସ୍ଥାପତ୍ୟ",
    itinerary_theme_dance: "ନୃତ୍ୟ, ସଙ୍ଗୀତ ଓ ଲୋକ କଳା",
    itinerary_theme_food: "ପାରମ୍ପରିକ ଖାଦ୍ୟ",
    itinerary_theme_crafts: "ହସ୍ତଶିଳ୍ପ ଓ ବୟନକଳା",
    itinerary_theme_wildlife: "ପ୍ରକୃତି ଓ ଉପକୂଳ ଐତିହ୍ୟ",
    itinerary_theme_history: "ଇତିହାସ, ଦୁର୍ଗ ଓ ଜନଜାତି ସଂସ୍କୃତି",
    itinerary_custom_prompt_label: "ବିଶେଷ ପସନ୍ଦ ଓ ଆବଶ୍ୟକତା (ଇଚ୍ଛାଧୀନ)",
    itinerary_custom_prompt_placeholder: "ଉଦା. ପରିବାର/ବୟସ୍କଙ୍କ ସହ ଯାତ୍ରା, ନିରାମିଷ ମନ୍ଦିର ପ୍ରସାଦ, ଫଟୋଗ୍ରାଫି, ସହଜ ଯାତ୍ରା, ନିର୍ଦ୍ଦିଷ୍ଟ ମନ୍ଦିର...",
    itinerary_generate_btn: "ମୋ ଯାତ୍ରା ଯୋଜନା ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    itinerary_generating: "ଦର୍ଶକ AI ଆପଣଙ୍କ ଯାତ୍ରା ମାର୍ଗ ପ୍ରସ୍ତୁତ କରୁଛି...",
    itinerary_day: "ଦିନ",
    itinerary_activity: "କ'ଣ ଦେଖିବେ ଓ ଅନୁଭବ କରିବେ",
    itinerary_food_tip: "ଖାଦ୍ୟ ପରାମର୍ଶ",
    itinerary_lore_highlight: "ଇତିହାସ ଓ ପୌରାଣିକ କାହାଣୀ",
    itinerary_view_stop: "ମାନଚିତ୍ରରେ ଦେଖନ୍ତୁ",
    itinerary_highlight_route: "ମାର୍ଗ ଦେଖାନ୍ତୁ",
    itinerary_clear_route: "ମାର୍ଗ ହଟାନ୍ତୁ",
    itinerary_copy_btn: "ପ୍ଲାନ କପି କରନ୍ତୁ",
    itinerary_copied: "କପି ହୋଇଗଲା!",
    itinerary_reset: "ନୂତନ ଯାତ୍ରା ଯୋଜନା କରନ୍ତୁ",

    // Dharohar AI Sticky Chatbot
    bot_title: "ଧରୋହର ସାଥୀ AI",
    bot_subtitle: "ଆପଣଙ୍କ ସାଂସ୍କୃତିକ ଓ ଐତିହ୍ୟ ପଥପ୍ରଦର୍ଶକ",
    bot_welcome: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ 'ଧରୋହର ସାଥୀ AI'। ଓଡ଼ିଶା ତଥା ଭାରତର ପ୍ରାଚୀନ ମନ୍ଦିର, ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ, ପର୍ବପର୍ବାଣି, ପାରମ୍ପରିକ ଖାଦ୍ୟ ବା ଅନାବିଷ୍କୃତ ଐତିହ୍ୟ ସ୍ଥଳ ବିଷୟରେ ମୋତେ ପଚାରନ୍ତୁ। ଆଜି ଆପଣଙ୍କ ସାଂସ୍କୃତିକ ଯାତ୍ରାରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିବି?",
    bot_quick_1: "ପୁରୀ ଓ କୋଣାର୍କର ପ୍ରସିଦ୍ଧ ମନ୍ଦିର",
    bot_quick_2: "ଛଉ ଓ ଓଡ଼ିଶୀ ନୃତ୍ୟ ପରମ୍ପରା",
    bot_quick_3: "ପାରମ୍ପରିକ ଓଡ଼ିଆ ଖାଦ୍ୟ ଓ ମହାପ୍ରସାଦ",
    bot_quick_4: "ଓଡ଼ିଶାର ଅନାବିଷ୍କୃତ ଐତିହ୍ୟ ସ୍ଥଳ",
    bot_quick_5: "୩ ଦିନର ସାଂସ୍କୃତିକ ଯାତ୍ରା ଯୋଜନା",
    bot_placeholder: "ଐତିହ୍ୟ, ମନ୍ଦିର, କଳା, ଖାଦ୍ୟ ବା ସଂସ୍କୃତି ବିଷୟରେ ପଚାରନ୍ତୁ...",
    bot_callout: "ଧରୋହର AI ସାଥୀଙ୍କୁ ପଚାରନ୍ତୁ!",
    bot_clear: "ଚାଟ୍ ସଫା କରନ୍ତୁ",
    bot_online: "ସକ୍ରିୟ ମାର୍ଗଦର୍ଶକ",
    bot_voice_on: "ସ୍ୱର ଚାଲୁ",
    bot_voice_off: "ସ୍ୱର ବନ୍ଦ",
    bot_disclaimer: "ଧରୋହର AI ଏବଂ ଜେମିନି ନଲେଜ୍ ସିଷ୍ଟମ୍ ଦ୍ୱାରା ପରିଚାଳିତ"
  }
};

// Comprehensive entity name translation dictionary
const entityNameMap = {
  // Monuments & Temples
  "Konark Sun Temple": { hi: "कोणार्क सूर्य मंदिर", or: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର" },
  "Jagannath Temple": { hi: "जगन्नाथ मंदिर, पुरी", or: "ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ" },
  "Lingaraja Temple": { hi: "लिंगराज मंदिर", or: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର" },
  "Barabati Fort": { hi: "बाराबाटी किला", or: "ବାରବାଟୀ ଦୁର୍ଗ" },
  "Chausath Yogini Temple": { hi: "चौसठ योगिनी मंदिर", or: "ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିର" },
  "Dhauli Shanti Stupa": { hi: "धौली शांति स्तूप", or: "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ" },
  "Udayagiri and Khandagiri Caves": { hi: "उदयगिरि एवं खंडगिरि गुफाएं", or: "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ଗୁମ୍ଫା" },
  "Ratnagiri Buddhist Complex": { hi: "रत्नगिरि बौद्ध विहार", or: "ରତ୍ନଗିରି ବୌଦ୍ଧ ପୀଠ" },
  "Ratnagiri Buddhist Site": { hi: "रत्नगिरि बौद्ध महाविहार", or: "ରତ୍ନଗିରି ବୌଦ୍ଧ ପୀଠ" },
  "Biraja Temple": { hi: "बिरजा मंदिर, जाजपुर", or: "ବିରଜା ମନ୍ଦିର, ଯାଜପୁର" },
  "Tara Tarini Temple": { hi: "तारा तारिणी शक्तिपीठ", or: "ତାରା ତାରିଣୀ ଶକ୍ତିପୀଠ" },
  "Brahmeswara Temple": { hi: "ब्रह्मेश्वर मंदिर", or: "ବ୍ରହ୍ମେଶ୍ୱର ମନ୍ଦିର" },
  "Ananta Vasudeva Temple": { hi: "अनंत वासुदेव मंदिर", or: "ଅନନ୍ତ ବାସୁଦେବ ମନ୍ଦିର" },
  "Varahi Temple": { hi: "वाराही देवी मंदिर (चौरासी)", or: "ବାରାହୀ ମନ୍ଦିର (ଚୌରାଶୀ)" },
  "Belgadia Palace": { hi: "बेलगाड़िया राजमहल", or: "ବେଲଗାଡ଼ିଆ ରାଜପ୍ରାସାଦ" },
  "Potagarh Fort": { hi: "पोतागढ़ ऐतिहासिक दुर्ग", or: "ପୋତାଗଡ଼ ଐତିହାସିକ ଦୁର୍ଗ" },
  "Ravana Chhaya Rock Paintings": { hi: "रावण छाया शैलचित्र (सीताभंजी)", or: "ରାବଣ ଛାୟା ଶୈଳଚିତ୍ର (ସୀତାଭଞ୍ଜି)" },
  "Rock Shelter Paintings": { hi: "प्राचीन शैलचित्र गुफाएं", or: "ପ୍ରାଚୀନ ଶୈଳଚିତ୍ର" },

  // Arts, Dance & Craft
  "Chhau": { hi: "छऊ नृत्य (मयूरभंज)", or: "ଛଉ ନୃତ୍ୟ (ମୟୂରଭଞ୍ଜ)" },
  "Chhau Ritual Martial Tradition": { hi: "छऊ मार्शल नृत्य परंपरा", or: "ଛଉ ସାମରିକ ନୃତ୍ୟ ପରମ୍ପରା" },
  "Odissi": { hi: "ओडिसी शास्त्रीय नृत्य", or: "ଓଡ଼ିଶୀ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ" },
  "Odissi Dance": { hi: "ओडिसी शास्त्रीय नृत्य", or: "ଓଡ଼ିଶୀ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ" },
  "Gotipua": { hi: "गोटीपुआ नृत्य परंपरा", or: "ଗୋଟିପୁଅ ନୃତ୍ୟ" },
  "Pattachitra": { hi: "पट्टचित्र चित्रकला", or: "ପଟ୍ଟଚିତ୍ର କଳା" },
  "Sambalpuri Bandha": { hi: "संबलपुरी बांधा इकत", or: "ସମ୍ବଲପୁରୀ ବାନ୍ଧ ଇକତ" },
  "Pipili Applique Work": { hi: "पिपिली एप्लिक कला (चांदुआ)", or: "ପିପିଲି ଚାନ୍ଦୁଆ କାମ" },
  "Tarakasi (Silver Filigree)": { hi: "तारकसी (चांदी की महीन कारीगरी)", or: "ତାରକସି (ରୂପା ତାର କାମ)" },
  "Dhokra Craft": { hi: "ढोकरा धातु शिल्प", or: "ଢୋକରା କାଷ୍ଟିଂ ଶିଳ୍ପ" },
  "Papier Mâché Craft": { hi: "पेपर मेशी हस्तशिल्प", or: "କାଗଜ ମଣ୍ଡ ଶିଳ୍ପ (ପେପର ମେସି)" },
  "Sand Art of Puri": { hi: "पुरी की बालू कला (सैंड आर्ट)", or: "ପୁରୀ ବାଲୁକା କଳା" },
  "Jhoti/Chita Floor Art": { hi: "झोटी / चिता पारंपरिक अल्पना", or: "ଝୋଟି / ଚିତା ପାରମ୍ପରିକ ଅଳ୍ପନା" },
  "Kapdaganda Weaving Tradition": { hi: "कपड़ागंडा डोंगरिया शॉल", or: "କାପଡ଼ାଗଣ୍ଡା ଡଙ୍ଗରିଆ ଶାଲ୍" },

  // Rituals, Customs & Traditions
  "Nabakalebara": { hi: "नव कलेवर अनुष्ठान", or: "ନବକଳେବର" },
  "Chhera Pahara": { hi: "छेरा पहंरा (स्वर्ण झाड़ू सेवा)", or: "ଛେରା ପହଁରା" },
  "Anasara": { hi: "अणसर (एकांतवास काल)", or: "ଅଣସର (ଅନବସର)" },
  "Mahaprasad Tradition": { hi: "महाप्रसाद परंपरा (आनंद बाजार)", or: "ମହାପ୍ରସାଦ ପରମ୍ପରା" },
  "Ratha Nirmana": { hi: "रथ निर्माण शिल्प परंपरा", or: "ରଥ ନିର୍ମାଣ ପରମ୍ପରା" },
  "Debasnana Purnima": { hi: "देवस्नान पूर्णिमा", or: "ଦେବସ୍ନାନ ପୂର୍ଣ୍ଣିମା" },
  "Suna Vesha": { hi: "सुना वेश (स्वर्ण शृंगार)", or: "ସୁନାବେଶ (ରାଜାଧିରାଜ ବେଶ)" },
  "Chhatisha Niyog": { hi: "छतीशा नियोग (सेवक व्यवस्था)", or: "ଛତିଶା ନିଯୋଗ" },
  "Rukuna Rath Yatra": { hi: "रुकुणा रथ यात्रा (लिंगराज)", or: "ରୁକୁଣା ରଥଯାତ୍ରା" },
  "Chait Parab": { hi: "चैत परब (आदिवासी वसंतोत्सव)", or: "ଚୈତ ପରବ" },
  "Karamsani": { hi: "करमसानी पूजा", or: "କରମସାନୀ ପୂଜା" },
  "Kandhen Budhi Yatra Ritual": { hi: "कांधेन बूढ़ी जात्रा", or: "କାନ୍ଧେନ ବୁଢ଼ୀ ଯାତ୍ରା" },
  "Niyamgiri Sacred-Hill Tradition": { hi: "नियमगिरि पवित्र पर्वत परंपरा", or: "ନିୟମଗିରି ପବିତ୍ର ପର୍ବତ ପରମ୍ପରା" },
  "Bonda Tribal Customs": { hi: "बोंडा जनजाति परंपराएं", or: "ବୋଣ୍ଡା ଜନଜାତି ପରମ୍ପରା" },
  "Santhal Dance-Music Tradition": { hi: "संथाल नृत्य एवं संगीत परंपरा", or: "ସାନ୍ତାଳ ନୃତ୍ୟ ଓ ସଙ୍ଗୀତ" },
  "Gond Warrior Heritage": { hi: "गोंड वीर परंपरा एवं संस्कृति", or: "ଗୋଣ୍ଡ ବୀର ସାଂସ୍କୃତିକ ଐତିହ୍ୟ" },
  "Bhumia Marriage Customs": { hi: "भूमिया विवाह परंपराएं", or: "ଭୂମିଆ ବିବାହ ପରମ୍ପରା" },
  "Boita Bandana Ritual": { hi: "बोइत बंदाण (नौका वंदन)", or: "ବୋଇତ ବନ୍ଦାଣ" },
  "Sitalsasthi Procession": { hi: "शीतल षष्ठी शिव-पार्वती विवाह", or: "ଶୀତଳଷଷ୍ଠୀ ଯାତ୍ରା" },
  "Sal Puja": { hi: "साल पूजा (प्रकृति वंदन)", or: "ସାଲ ପୂଜା" },
  "Bhitarkanika Fishing Community Traditions": { hi: "भीतरकणिका तटीय लोक जीवन", or: "ଭିତରକନିକା ମତ୍ସ୍ୟଜୀବୀ ପରମ୍ପରା" },
  "Community Grain-Offering Ritual": { hi: "नवान्न अर्पण विधि (नुआखाई)", or: "ନୂଆଁ ଧାନ ଅର୍ପଣ ପରମ୍ପରା" },
  "Danda Yatra": { hi: "दंड यात्रा (शैव तपस्या पर्व)", or: "ଦଣ୍ଡ ଯାତ୍ରା" },
  "Danda Nata": { hi: "दंड नाट लोक नाट्य", or: "ଦଣ୍ଡ ନାଟ" },
  "Grama Devi (Village Deity) Worship": { hi: "ग्राम देवी पूजा परंपरा", or: "ଗ୍ରାମ ଦେବତୀ ପୂଜା" },
  "Khond Earth-Centered Ritual Tradition": { hi: "खोंड धरणी माता पूजा", or: "କନ୍ଧ ଧରଣୀ ପୂଜା ପରମ୍ପରା" },
  "Nuakhai Bhetghat": { hi: "नुआखाई भेंटघाट (सद्भाव पर्व)", or: "ନୂଆଁଖାଇ ଭେଟଘାଟ" },
  "Oraon Agricultural Tradition": { hi: "उरांव कृषि परंपरा", or: "ଓରାଓଁ କୃଷି ପରମ୍ପରା" },

  // Festivals
  "Ratha Yatra": { hi: "रथ यात्रा (पुरी)", or: "ରଥଯାତ୍ରା (ପୁରୀ)" },
  "Saraswati Puja": { hi: "सरस्वती पूजा", or: "ସରସ୍ୱତୀ ପୂଜା" },
  "Bali Jatra": { hi: "बाली जात्रा (कटक)", or: "ବାଲିଯାତ୍ରା (କଟକ)" },
  "Prathamastami": { hi: "प्रथमाष्टमी (ज्येष्ठ संतान उत्सव)", or: "ପ୍ରଥମାଷ୍ଟମୀ" },
  "Toshali National Crafts Mela": { hi: "तोषाली राष्ट्रीय शिल्प मेला", or: "ତୋଷାଳୀ ଜାତୀୟ ହସ୍ତଶିଳ୍ପ ମେଳା" },
  "Raja Parba": { hi: "रज पर्व (धरती उत्सव)", or: "ରଜ ପର୍ବ" },
  "Nuakhai": { hi: "नुआखाई (कृषि उत्सव)", or: "ନୂଆଁଖାଇ" },
  "Dhanu Jatra": { hi: "धनु जात्रा (विश्व का सबसे बड़ा खुला रंगमंच)", or: "ଧନୁଯାତ୍ରା (ବରଗଡ଼)" },

  // Cuisine & Dishes
  "Pakhala Bhata": { hi: "पखाल भात (पारंपरिक किण्वित चावल)", or: "ପଖାଳ ଭାତ" },
  "Dalma": { hi: "दालमा (दाल एवं देशी सब्जियां)", or: "ଡାଲମା" },
  "Chhena Poda": { hi: "छेना पोड़ा (बेक्ड कॉटेज चीज़ मिष्ठान)", or: "ଛେନାପୋଡ଼" },
  "Machha Besara": { hi: "माछा बेसरा (सरसों ग्रेवी मछली)", or: "ମାଛ ବେସର" },
  "Chingudi Jhola": { hi: "चिंगुड़ी झोला (तटीय झींगा करी)", or: "ଚିଙ୍ଗୁଡ଼ି ଝୋଳ" },
  "Machha Munda Chhenchda": { hi: "माछा मुंड छेंछड़ा", or: "ମାଛ ମୁଣ୍ଡ ଛେଞ୍ଚଡ଼ା" },
  "Korakhai": { hi: "कोराखाई (लिंगराज मंदिर भोग)", or: "କୋରାଖାଇ" },
  "Chhena Jhili": { hi: "छेना झिली (निमापड़ा)", or: "ଛେନା ଝିଲି" },
  "Mahaprasad": { hi: "महाप्रसाद (छप्पन भोग)", or: "ମହାପ୍ରସାଦ (ଛପନ ଭୋଗ)" },
  "Poda Pitha": { hi: "पोड़ा पीठा", or: "ପୋଡ଼ ପିଠା" },
  "Enduri Pitha": { hi: "एंदुरी पीठा (हल्दी पत्ता)", or: "ଏନ୍ଦୁରି ପିଠା" },
  "Dahi Bara Aloo Dum": { hi: "दही बड़ा आलू दम (कटक)", or: "ଦହିବରା ଆଳୁଦମ" },

  // Personalities
  "Narasimhadeva I": { hi: "राजा लांगुला नरसिंह देव प्रथम", or: "ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବ (ପ୍ରଥମ)" },
  "Prataparudra Deva": { hi: "गजपति प्रतापरुद्र देव", or: "ଗଜପତି ପ୍ରତାପରୁଦ୍ର ଦେବ" },
  "Surendra Sai": { hi: "वीर सुरेंद्र साय (स्वाधीनता सेनानी)", or: "ବୀର ସୁରେନ୍ଦ୍ର ସାଏ" },
  "Jayanta Mahapatra": { hi: "जयंत महापात्र (प्रख्यात साहित्यकार)", or: "ଜୟନ୍ତ ମହାପାତ୍ର" },

  // Natural & Hidden Heritage
  "Badaghagra Waterfall": { hi: "बड़ाघागरा जलप्रपात (क्योंझर)", or: "ବଡ଼ଘାଗରା ଜଳପ୍ରପାତ" },
  "Belghar": { hi: "बेलघर घाटी (कंधमाल)", or: "ବେଲଘର ଉପତ୍ୟକା" },
  "Nrusimhanath": { hi: "नृसिंहनाथ धाम (गंधमार्दन पर्वत)", or: "ନୃସିଂହନାଥ ଧାମ" },
  "Harishankar": { hi: "हरिशंकर तीर्थ (झरना एवं मंदिर)", or: "ହରିଶଙ୍କର ତୀର୍ଥ" },
  "Jirang / Chandragiri": { hi: "जीरांग / चंद्रगिरि बौद्ध मठ", or: "ଜୀରାଙ୍ଗ / ଚନ୍ଦ୍ରଗିରି ବୌଦ୍ଧ ମଠ" },
  "Duduma & Rani Duduma": { hi: "दुदुमा एवं रानी दुदुमा जलप्रपात", or: "ଦୁଦୁମା ଓ ରାଣୀ ଦୁଦୁମା ଜଳପ୍ରପାତ" },
  "Huma": { hi: "हुमा (विश्वप्रसिद्ध झुका हुआ शिव मंदिर)", or: "ହୁମା (ବକ୍ର ଶିବ ମନ୍ଦିର)" },
  "Deomali": { hi: "देवमाली (ओडिशा का सर्वोच्च पर्वत शिखर)", or: "ଦେଓମାଳୀ (ସର୍ବୋଚ୍ଚ ଶୃଙ୍ଗ)" },
  "Minajhola": { hi: "मिनाझोला (त्रिवेणी संगम)", or: "ମିନାଝୋଲା (ତ୍ରିବେଣୀ ସଙ୍ଗମ)" },
  "Mandasaru Silent Valley": { hi: "मंदसारू साइलेंट वैली (कंधमाल)", or: "ମନ୍ଦସାରୁ ନୀରବ ଉପତ୍ୟକା" },
  "Bargarh / Nrusimhanath": { hi: "बरगढ़ / नृसिंहनाथ तीर्थ", or: "ବରଗଡ଼ / ନୃସିଂହନାଥ ପୀଠ" },
  "Mayurbhanj / Baripada": { hi: "मयूरभंज / बारीपदा राज परंपरा", or: "ମୟୂରଭଞ୍ଜ / ବାରିପଦା" },
  "Taptapani, Ganjam": { hi: "तप्तपानी (प्राकृतिक उष्ण गंधक कुंड)", or: "ତପ୍ତପାଣି (ଉଷ୍ଣ ପ୍ରସ୍ରବଣ)" },
  "Ganjam": { hi: "गंजाम लोक संस्कृति", or: "ଗଞ୍ଜାମ ଲୋକ ସଂସ୍କୃତି" },
  "Puri": { hi: "श्रीक्षेत्र पुरी", or: "ଶ୍ରୀକ୍ଷେତ୍ର ପୁରୀ" }
};

// Comprehensive location translation dictionary
const locationMap = {
  "Bhubaneswar / central Odisha": { hi: "भुवनेश्वर / मध्य ओडिशा", or: "ଭୁବନେଶ୍ୱର / ମଧ୍ୟ ଓଡ଼ିଶା" },
  "Bhubaneswar / Old Town association": { hi: "भुवनेश्वर (पुराना शहर / एकाग्र क्षेत्र)", or: "ଭୁବନେଶ୍ୱର (ପୁରୁଣା ସହର)" },
  "Chaurasi, Puri": { hi: "चौरासी, पुरी", or: "ଚୌରାଶୀ, ପୁରୀ" },
  "Sitabhanji, Kendujhar": { hi: "सीताभंजी, क्योंझर", or: "ସୀତାଭଞ୍ଜି, କେନ୍ଦୁଝର" },
  "Western Odisha": { hi: "पश्चिमी ओडिशा", or: "ପଶ୍ଚିମ ଓଡ଼ିଶା" },
  "Northern Odisha": { hi: "उत्तरी ओडिशा", or: "ଉତ୍ତର ଓଡ଼ିଶା" },
  "Southern Odisha": { hi: "दक्षिणी ओडिशा", or: "ଦକ୍ଷିଣ ଓଡ଼ିଶା" },
  "Coastal Odisha": { hi: "तटीय ओडिशा", or: "ଉପକୂଳ ଓଡ଼ିଶା" },
  "Central Odisha": { hi: "मध्य ओडिशा", or: "ମଧ୍ୟ ଓଡ଼ିଶା" },
  "Western": { hi: "पश्चिमी अंचल", or: "ପଶ୍ଚିମାଞ୍ଚଳ" },
  "Southern": { hi: "दक्षिणी अंचल", or: "ଦକ୍ଷିଣାଞ୍ଚଳ" },
  "Coastal": { hi: "तटीय अंचल", or: "ଉପକୂଳାଞ୍ଚଳ" },
  "Across Odisha; especially prominent in summer": { hi: "समस्त ओडिशा में (विशेष रूप से ग्रीष्मकाल में)", or: "ସମଗ୍ର ଓଡ଼ିଶା (ବିଶେଷତଃ ଖରାଦିନେ)" },
  "Coastal & central Odisha": { hi: "तटीय एवं मध्य ओडिशा", or: "ଉପକୂଳ ଓ ମଧ୍ୟ ଓଡ଼ିଶା" },
  "Across Odisha; central/coastal visibility": { hi: "समस्त ओडिशा (तटीय एवं मध्य क्षेत्र)", or: "ସମଗ୍ର ଓଡ଼ିଶା" },
  "Odisha-wide; especially associated with Nayagarh": { hi: "ओडिशा भर में (विशेषकर नयागढ़ का प्रसिद्ध)", or: "ଓଡ଼ିଶା ବ୍ୟାପୀ (ନୟାଗଡ଼ ସହିତ ଜଡ଼ିତ)" },
  "Across Odisha": { hi: "समस्त ओडिशा", or: "ସମଗ୍ର ଓଡ଼ିଶା" },
  "Puri": { hi: "पुरी", or: "ପୁରୀ" },
  "Bhubaneswar": { hi: "भुवनेश्वर", or: "ଭୁବନେଶ୍ୱର" },
  "Cuttack": { hi: "कटक", or: "କଟକ" },
  "Mayurbhanj": { hi: "मयूरभंज", or: "ମୟୂରଭଞ୍ଜ" },
  "Sambalpur": { hi: "संबलपुर", or: "ସମ୍ବଲପୁର" },
  "Jajpur": { hi: "जाजपुर", or: "ଯାଜପୁର" },
  "Ganjam": { hi: "गंजाम", or: "ଗଞ୍ଜାମ" },
  "Koraput": { hi: "कोरापुट", or: "କୋରାପୁଟ" },
  "Malkangiri": { hi: "मलकानगिरि", or: "ମାଲକାନଗିରି" },
  "Keonjhar": { hi: "क्योंझर", or: "କେନ୍ଦୁଝର" },
  "Baripada": { hi: "बारीपदा", or: "ବାରିପଦା" },
  "Bargarh": { hi: "बरगढ़", or: "ବରଗଡ଼" },
  "Nayagarh": { hi: "नयागढ़", or: "ନୟାଗଡ଼" },
  "Raghurajpur": { hi: "रघुराजपुर (विरासत शिल्प ग्राम)", or: "ରଘୁରାଜପୁର (ଐତିହ୍ୟ ଗ୍ରାମ)" }
};

// Rich multilingual description dictionary for entities
const entityDescriptionMap = {
  "Konark Sun Temple": {
    hi: "13वीं शताब्दी में निर्मित कोणार्क सूर्य मंदिर को सूर्य देव के 24 विशाल नक्काशीदार पहियों वाले दिव्य रथ के रूप में गढ़ा गया है। यह कलिंग वास्तुकला का विश्वप्रसिद्ध शिखर है।",
    or: "ତ୍ରୟୋଦଶ ଶତାବ୍ଦୀରେ ନିର୍ମିତ ବିଶ୍ୱପ୍ରସିଦ୍ଧ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର, ଯାହା ସୂର୍ଯ୍ୟ ଦେବତାଙ୍କ ୨୪ଟି ବିଶାଳ ପଥର ଚକ ବିଶିଷ୍ଟ ରଥ ସଦୃଶ କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟର ଅଦ୍ୱିତୀୟ ନିଦର୍ଶନ।"
  },
  "Jagannath Temple": {
    hi: "पुरी का श्री जगन्नाथ मंदिर चार धामों में से एक है, जो 12वीं शताब्दी की कलिंग स्थापत्य शैली और महाप्रभु जगन्नाथ, बलभद्र व सुभद्रा की नित्य लीलाओं का केंद्र है।",
    or: "ପୁରୀର ପବିତ୍ର ଶ୍ରୀଜଗନ୍ନାଥ ମନ୍ଦିର ଚାରିଧାମ ମଧ୍ୟରୁ ଅନ୍ୟତମ, ଯାହା ଦ୍ୱାଦଶ ଶତାବ୍ଦୀର କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଶୈଳୀ ଓ ମହାପ୍ରଭୁଙ୍କ ନିତ୍ୟ ସେବା ପରମ୍ପରାର ପ୍ରାଣକେନ୍ଦ୍ର।"
  },
  "Lingaraja Temple": {
    hi: "11वीं शताब्दी में निर्मित लिंगराज मंदिर भुवनेश्वर का सबसे विशाल मंदिर है, जो भगवान हरिहर (शिव एवं विष्णु के एकात्म रूप) को समर्पित है।",
    or: "ଏକାଦଶ ଶତାବ୍ଦୀରେ ନିର୍ମିତ ଲିଙ୍ଗରାଜ ମନ୍ଦିର ଭୁବନେଶ୍ୱରର ସର୍ବବୃହତ ମନ୍ଦିର, ଯାହା ଭଗବାନ ହରିହର (ଶିବ ଓ ବିଷ୍ଣୁ)ଙ୍କୁ ସମର୍ପିତ।"
  },
  "Nabakalebara": {
    hi: "पुरी जगन्नाथ मंदिर का वह अलौकिक अनुष्ठान जिसमें हर 12 से 19 वर्ष में जोड़े अधिक मास में काष्ठ निर्मित चतुर्धा विग्रहों का नव कलेवर (पुनर्जन्म) होता है।",
    or: "ପୁରୀ ଜଗନ୍ନାଥ ମନ୍ଦିରର ଅଲୌକିକ ରୀତିନୀତି ଯେଉଁଥିରେ ପ୍ରତି ୧୨ ରୁ ୧୯ ବର୍ଷରେ ଯୋଡ଼ା ଆଷାଢ଼ ମାସରେ ଚତୁର୍ଦ୍ଧା ମୂର୍ତ୍ତିଙ୍କର ନବକଳେବର ଅନୁଷ୍ଠିତ ହୋଇଥାଏ।"
  },
  "Chhera Pahara": {
    hi: "रथ यात्रा के दौरान पुरी के गजपति महाराजा द्वारा सोने के हत्थे वाली झाड़ू से रथों पर बुहारी लगाने की विनम्र सेवा, जो प्रभु के सम्मुख सब की समानता दर्शाती है।",
    or: "ରଥଯାତ୍ରା ସମୟରେ ଗଜପତି ମହାରାଜାଙ୍କ ଦ୍ୱାରା ସୁନା ଖଡ଼ିକାରେ ରଥ ଉପରେ କରାଯାଉଥିବା ପବିତ୍ର ଛେରା ପହଁରା ସେବା।"
  },
  "Anasara": {
    hi: "देवस्नान पूर्णिमा पर 108 घड़ों के जल से स्नान के बाद महाप्रभु 14 दिनों तक अणसर (एकांतवास) में रहते हैं, जहाँ केवल गुप्त उपचार भोग अर्पित होता है।",
    or: "ଦେବସ୍ନାନ ପୂର୍ଣ୍ଣିମାର ୧୦୮ ଗରା ଜଳରେ ସ୍ନାନ ପରେ ମହାପ୍ରଭୁ ୧୪ ଦିନ ଧରି ଅଣସର ଘରେ ବିଜେ ହୋଇ ଗୁପ୍ତ ଉପଚାର ଗ୍ରହଣ କରନ୍ତି।"
  },
  "Suna Vesha": {
    hi: "बाहुड़ा यात्रा के उपरांत एकादशी तिथि पर सिंहद्वार पर तीनों रथों पर विराजमान विग्रहों का विशुद्ध स्वर्ण आभूषणों से अलौकिक राज राजेश्वर शृंगार।",
    or: "ବାହୁଡ଼ା ଯାତ୍ରା ପରେ ଏକାଦଶୀ ତିଥିରେ ରଥ ଉପରେ ଶ୍ରୀଜିଉମାନଙ୍କର ବିଶୁଦ୍ଧ ସ୍ୱର୍ଣ୍ଣ ଅଳଙ୍କାରରେ ଅପୂର୍ବ ସୁନାବେଶ ବା ରାଜାଧିରାଜ ବେଶ।"
  },
  "Odissi": {
    hi: "ओडिशा का विश्वप्रसिद्ध शास्त्रीय नृत्य, जो प्राचीन मंदिर मूर्तियों की त्रिभंग मुद्रा, भाव-विभोर लावण्य और गीत गोविंद के भजनों पर आधारित है।",
    or: "ଭାରତର ପ୍ରାଚୀନ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ମଧ୍ୟରୁ ଅନ୍ୟତମ, ଯାହା ମନ୍ଦିର ମୂର୍ତ୍ତିର ତ୍ରିଭଙ୍ଗୀ ମୁଦ୍ରା ଓ ଗୀତଗୋବିନ୍ଦର ଭାବପୂର୍ଣ୍ଣ ଅଭିନୟରେ ସମୃଦ୍ଧ।"
  },
  "Chhau": {
    hi: "मयूरभंज का पारंपरिक मुखौटा-रहित मार्शल लोक नृत्य, जो तीव्र गति, वीरतापूर्ण छलांग और प्रकृति व पौराणिक गाथाओं के अभिनय के लिए विख्यात है।",
    or: "ମୟୂରଭଞ୍ଜର ଐତିହାସିକ ସାମରିକ ଲୋକ ନୃତ୍ୟ, ଯାହା ଯୁଦ୍ଧ କୌଶଳ, ପୌରାଣିକ ଆଖ୍ୟାନ ଓ ନିଖୁଣ ଅଙ୍ଗଭଙ୍ଗୀ ପାଇଁ ବିଶ୍ୱପ୍ରସିଦ୍ଧ।"
  },
  "Gotipua": {
    hi: "कम उम्र के बालक जब स्त्री वेशभूषा धारण कर भगवान जगन्नाथ की स्तुति में कलात्मक एक्रोबैटिक नृत्य प्रस्तुत करते हैं, जो ओडिसी की मूल जननी है।",
    or: "କିଶୋର ବାଳକମାନଙ୍କ ଦ୍ୱାରା ନାରୀ ବେଶରେ ଜଗନ୍ନାଥଙ୍କ ଉଦ୍ଦେଶ୍ୟରେ ପରିବେଷିତ ପାରମ୍ପରିକ ଭକ୍ତିରସାତ୍ମକ ବାନ୍ଧ ନୃତ୍ୟ।"
  },
  "Pakhala Bhata": {
    hi: "पानी में भिगोया और हल्का किण्वित किया हुआ सुगंधित चावल, जिसे भुनी हुई देसी सब्जियों, सागा, बड़ी चूरा और मछली के साथ खाया जाता है।",
    or: "ଓଡ଼ିଶାର ପ୍ରାଣ ସଦୃଶ ତୋରାଣି ଦିଆ ଫେଣ୍ଟା ପଖାଳ, ଯାହା ଶାଗ ଭଜା, ବଡ଼ିଚୁରା, ଆଳୁ ଭର୍ତ୍ତା ଓ ଭଜା ମାଛ ସହିତ ଖରାଦିନେ ପରିବେଷଣ କରାଯାଏ।"
  },
  "Dalma": {
    hi: "अरहर व मूंग दाल में कच्चा पपीता, कद्दू, बैंगन, अरबी पकाकर भुने जीरा-लाल मिर्च और शुद्ध देसी घी के छौंक से तैयार दिव्य ओडिया व्यंजन।",
    or: "ହରଡ଼ ଓ ମୁଗ ଡାଲି ସହିତ ଦେଶୀ ପନିପରିବା ସିଝାଇ, ଭଜା ଜିରା-ଲଙ୍କା ଗୁଣ୍ଡ ଓ ଦେଶୀ ଘିଅ ଛୁଙ୍କରେ ପ୍ରସ୍ତୁତ ଓଡ଼ିଶାର ପ୍ରସିଦ୍ଧ ଡାଲମା।"
  },
  "Chhena Poda": {
    hi: "ताजे छेने को चीनी, इलायची और काजू के साथ मिलाकर साल के पत्तों में घंटों धीमी आंच पर बेक कर बनाया गया विश्वप्रसिद्ध ओडिया मिष्ठान।",
    or: "ନୟାଗଡ଼ର ପାରମ୍ପରିକ ପୋଡ଼ା ପିଠା ଶୈଳୀରେ ତାଜା ଛେନା, ଚିନି ଓ ଗୁଜୁରାତି ମିଶାଇ କାଠ ନିଆଁରେ ବେକ୍ କରାଯାଇଥିବା ସୁସ୍ୱାଦୁ ଛେନାପୋଡ଼।"
  },
  "Machha Besara": {
    hi: "राई (सरसों) के दाने, लहसुन और सूखी आम की खटाई (अंबुला) की तीखी सुगंधित ग्रेवी में तली हुई ताजी रोहू या कतला मछली का पारंपरिक व्यंजन।",
    or: "ସୋରିଷ, ରସୁଣ ଓ ଆମ୍ବୁଲ ଖଟାର ସୁବାସିତ ଝୋଳରେ ପ୍ରସ୍ତୁତ ଓଡ଼ିଶାର ପାରମ୍ପରିକ ମାଛ ବେସର।"
  },
  "Chingudi Jhola": {
    hi: "तटीय ओडिशा का लजीज झींगा करी, जो गर्म खड़े मसालों, सरसों तेल और कटे आलुओं के साथ गाढ़ी तरी में पकाया जाता है।",
    or: "ଚିଲିକା ଓ ଉପକୂଳ ଓଡ଼ିଶାର ତାଜା ଚିଙ୍ଗୁଡ଼ିରେ ଗରମ ମସଲା ଓ ଆଳୁ ମିଶାଇ ପ୍ରସ୍ତୁତ ସୁସ୍ୱାଦୁ ଚିଙ୍ଗୁଡ଼ି ଝୋଳ।"
  },
  "Machha Munda Chhenchda": {
    hi: "मछली के सिर को कद्दू, परवल, आलू और चने की दाल के साथ धीमी आंच पर भूनकर तैयार किया जाने वाला पारंपरिक उत्सव व्यंजन।",
    or: "ଭଜା ମାଛ ମୁଣ୍ଡ ସହିତ କଖାରୁ, ପୋଟଳ, ଆଳୁ ଓ ବୁଟ ଡାଲି ମିଶାଇ ପ୍ରସ୍ତୁତ ବିବାହ ତଥା ପର୍ବର ସ୍ୱତନ୍ତ୍ର ମାଛ ମୁଣ୍ଡ ଛେଞ୍ଚଡ଼ା।"
  },
  "Korakhai": {
    hi: "भुने हुए धान की खील (खई), गुड़, इलायची और नारियल के टुकड़ों से तैयार लिंगराज मंदिर का प्रसिद्ध सूखा प्रसाद।",
    or: "ଭୁବନେଶ୍ୱର ଲିଙ୍ଗରାଜ ମନ୍ଦିରର ପ୍ରସିଦ୍ଧ ଶୁଖିଲା ଭୋଗ, ଯାହା ଖଇ, ଗୁଡ଼, ଅଳେଇଚ ଓ ନଡ଼ିଆ ଖଣ୍ଡରେ ତିଆରି ହୋଇଥାଏ।"
  },
  "Ratha Yatra": {
    hi: "आषाढ़ शुक्ल द्वितीया पर पुरी में आयोजित विश्वविख्यात रथ यात्रा, जिसमें भगवान जगन्नाथ, बलभद्र और सुभद्रा अपने विशाल काष्ठ रथों पर गुंडिचा मंदिर पधारते हैं।",
    or: "ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟାରେ ଅନୁଷ୍ଠିତ ବିଶ୍ୱପ୍ରସିଦ୍ଧ ପୁରୀ ରଥଯାତ୍ରା, ଯେଉଁଥିରେ ଚତୁର୍ଦ୍ଧା ମୂର୍ତ୍ତି ତାଳଧ୍ୱଜ, ଦେବଦଳନ ଓ ନନ୍ଦିଘୋଷ ରଥରେ ଗୁଣ୍ଡିଚା ମନ୍ଦିର ଯାତ୍ରା କରନ୍ତି।"
  },
  "Bali Jatra": {
    hi: "कटक में महानदी तट पर आयोजित प्राचीन नौवहन मेला, जो कलिंग के साहसी साधवों (व्यापारियों) की बाली, जावा व सुमात्रा समुद्री यात्राओं का स्मरण कराता है।",
    or: "କଟକ ମହାନଦୀ କୂଳରେ ଆୟୋଜିତ ଏସିଆର ବୃହତ୍ତମ ମୁକ୍ତାକାଶ ମେଳା, ଯାହା ପ୍ରାଚୀନ କଳିଙ୍ଗର ବୋଇତ ବାଣିଜ୍ୟ ଗୌରବର ସ୍ମାରକ।"
  },
  "Nuakhai": {
    hi: "पश्चिमी ओडिशा का प्रमुख कृषि लोकपर्व, जिसमें भाद्रपद शुक्ल पंचमी को धरती माँ और ग्राम देवी को नए धान का प्रथम अन्न अर्पण कर परिवार सहित ग्रहण किया जाता है।",
    or: "ପଶ୍ଚିମ ଓଡ଼ିଶାର ମହାନ୍ କୃଷିଭିତ୍ତିକ ଗଣପର୍ବ, ଯେଉଁଥିରେ ଇଷ୍ଟଦେବୀଙ୍କ ପାଖରେ ନୂଆ ଅନ୍ନ ଲାଗି କରାଯାଇ ପରିବାରବର୍ଗ ଏକତ୍ର ନୂଆଁ ଖାଆନ୍ତି।"
  },
  "Raja Parba": {
    hi: "ज्येष्ठ माह के संक्रांति पर मनाया जाने वाला नारीत्व और धरती माता के उर्वरता विश्राम का तीन दिवसीय अनूठा उत्सव, जिसमें झूले और पोड़ा पीठा का आनंद लिया जाता है।",
    or: "ଧରିତ୍ରୀ ମାତାଙ୍କ ବିଶ୍ରାମ ଓ ନାରୀତ୍ୱର ଉତ୍ସବ, ଯେଉଁଥିରେ ଦୋଳି ଖେଳ, ପୋଡ଼ା ପିଠା ଓ ପାନ ଖାଇବାର ଆନନ୍ଦମୟ ତିନିଦିନିଆ ପରମ୍ପରା ପାଳିତ ହୁଏ।"
  },
  "Sambalpuri Bandha": {
    hi: "पश्चिमी ओडिशा की प्रसिद्ध टाई-एंड-डाई इकत हथकरघा बुनाई, जिसमें धागों को बुनने से पहले रंगों से ज्यामितीय व पारंपरिक रूपांकनों में रंगा जाता है।",
    or: "ସୂତାକୁ ପ୍ରଥମେ ବାନ୍ଧି ରଙ୍ଗ କରି ଅତି ଚମତ୍କାର ଭାବେ ବୁଣାଯାଉଥିବା ପଶ୍ଚିମ ଓଡ଼ିଶାର ବିଶ୍ୱବିଖ୍ୟାତ ସମ୍ବଲପୁରୀ ଇକତ ବାନ୍ଧ ଶାଢ଼ୀ।"
  },
  "Pattachitra": {
    hi: "रघुराजपुर की कपड़े व ताड़पत्र पर प्राकृतिक रंगों से चित्रित प्राचीन चित्रकला परंपरा, जिसमें जगन्नाथ लीला और रामायण-महाभारत की कथाएं अंकित होती हैं।",
    or: "ରଘୁରାଜପୁରର ପ୍ରାଚୀନ କପଡ଼ା ଓ ତାଳପତ୍ର ଉପରେ ପ୍ରାକୃତିକ ରଙ୍ଗରେ ଅଙ୍କିତ ପବିତ୍ର ଜଗନ୍ନାଥ ସଂସ୍କୃତି ଓ ପୌରାଣିକ ପଟ୍ଟଚିତ୍ର କଳା।"
  },
  "Pipili Applique Work": {
    hi: "पिपिली की विश्वप्रसिद्ध चांदुआ कारीगरी, जिसमें रंगीन कपड़ों की परतों को सिलकर रथ यात्रा की छतरियों, तोरण और मंदिर ध्वजों का निर्माण किया जाता है।",
    or: "ପିପିଲିର ପ୍ରସିଦ୍ଧ ଚାନ୍ଦୁଆ କାମ, ଯେଉଁଥିରେ ରଙ୍ଗବେରଙ୍ଗର କପଡ଼ା ଯୋଡ଼ି ରଥର କନା, ଛତ୍ର, ତ୍ରାସ ଓ ତୋରଣ ନିର୍ମାଣ କରାଯାଏ।"
  },
  "Tarakasi (Silver Filigree)": {
    hi: "कटक की 500 वर्ष पुरानी बारीक चांदी के तारों की कारीगरी, जिसमें चांदी को महीन तारों में ढालकर देवी दुर्गा के मुकुट, गहने और कलाकृतियां गढ़ी जाती हैं।",
    or: "କଟକର ୫୦୦ ବର୍ଷ ପୁରୁଣା ରୂପା ତାରକସି କାମ, ଯେଉଁଥିରେ ସୂକ୍ଷ୍ମ ରୂପା ତାର ଦ୍ୱାରା ଦୁର୍ଗାପୂଜାର ମେଢ଼, ଅଳଙ୍କାର ଓ ମନମୁଗ୍ଧକର କଳାକୃତି ଗଢ଼ାଯାଏ।"
  },
  "Narasimhadeva I": {
    hi: "13वीं शताब्दी के महान पूर्वी गंग वंश के शासक, जिन्होंने अपनी युद्ध विजय और सूर्य उपासना की स्मृति में भव्य कोणार्क सूर्य मंदिर का निर्माण कराया था।",
    or: "ତ୍ରୟୋଦଶ ଶତାବ୍ଦୀର ପୂର୍ବ ଗଙ୍ଗ ବଂଶର ପ୍ରତାପୀ ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବ, ଯିଏ ଅମର କୀର୍ତ୍ତି କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ନିର୍ମାଣ କରାଇଥିଲେ।"
  },
  "Surendra Sai": {
    hi: "संबलपुर के महान स्वतंत्रता संग्राम सेनानी, जिन्होंने ब्रिटिश हुकूमत के विरुद्ध पश्चिमी ओडिशा के घने जंगलों से दशकों तक ऐतिहासिक छापामार युद्ध लड़ा।",
    or: "ସମ୍ବଲପୁରର ଅପରାଜେୟ ବିପ୍ଳବୀ ସ୍ୱାଧୀନତା ସଂଗ୍ରାମୀ, ଯିଏ ବ୍ରିଟିଶ ଶାସନ ବିରୋଧରେ ଦୀର୍ଘ ବର୍ଷ ଧରି ବୀରତ୍ୱପୂର୍ଣ୍ଣ ଗେରିଲା ଯୁଦ୍ଧ ଚଳାଇଥିଲେ।"
  },
  "Duduma & Rani Duduma": {
    hi: "कोरापुट जिले में मचकुंड नदी पर 175 मीटर ऊंचा विशाल दुदुमा जलप्रपात और पास का शांत रानी दुदुमा प्रपात, जो घने वनों से घिरा मनोरम स्थल है।",
    or: "କୋରାପୁଟ ଜିଲ୍ଲାର ମାଛକୁଣ୍ଡ ନଦୀରେ ୧୭୫ ମିଟର ଉଚ୍ଚ ମନୋରମ ଦୁଦୁମା ଓ ନିକଟସ୍ଥ ରାଣୀ ଦୁଦୁମା ଜଳପ୍ରପାତ।"
  },
  "Huma": {
    hi: "संबलपुर के पास महानदी तट पर स्थित विश्व का दुर्लभ झुका हुआ शिव मंदिर, जहाँ मंदिर के गर्भगृह से लेकर कलश तक सभी संरचनाएं एक ओर झुकी हुई हैं।",
    or: "ସମ୍ବଲପୁର ନିକଟସ୍ଥ ମହାନଦୀ କୂଳରେ ଅବସ୍ଥିତ ବିଶ୍ୱର ବିରଳ ବକ୍ର ଶିବ ମନ୍ଦିର, ଯାହାର ସମ୍ପୂର୍ଣ୍ଣ ଗଠନ ଏକ ନିର୍ଦ୍ଦିଷ୍ଟ କୋଣରେ ଢଳି ରହିଛି।"
  },
  "Deomali": {
    hi: "कोरापुट जिले के पूर्वी घाट में स्थित 1,672 मीटर ऊंचा पर्वत शिखर, जो ओडिशा का सबसे ऊंचा पर्वत और अद्भुत जैव-विविधता का केंद्र है।",
    or: "କୋରାପୁଟ ଜିଲ୍ଲାର ପୂର୍ବଘାଟ ପର୍ବତମାଳାରେ ଅବସ୍ଥିତ ୧,୬୭୨ ମିଟର ଉଚ୍ଚ ଦେଓମାଳୀ ଶୃଙ୍ଗ, ଯାହା ଓଡ଼ିଶାର ସର୍ବୋଚ୍ଚ ପର୍ବତ।"
  }
};

// Category translation mapper
export const getCategoryTranslation = (categoryName, lang = 'en') => {
  if (!categoryName) return '';
  const cat = categoryName.trim().toLowerCase();
  const dict = translations[lang] || translations.en;

  if (cat === 'all') return dict.cat_all;
  if (cat.includes('monument') || cat.includes('temple') || cat.includes('architecture')) return dict.cat_monuments;
  if (cat.includes('dance') || cat.includes('music') || cat.includes('classical')) return dict.cat_dance;
  if (cat.includes('festival') || cat.includes('ritual') || cat.includes('fair')) return dict.cat_festivals;
  if (cat.includes('food') || cat.includes('culinary') || cat.includes('cuisine')) return dict.cat_cuisine;
  if (cat.includes('personality') || cat.includes('figure') || cat.includes('historical personality')) return dict.cat_personality;
  if (cat.includes('legend') || cat.includes('lore') || cat.includes('story')) return dict.cat_legends;
  if (cat.includes('hidden') || cat.includes('nature') || cat.includes('natural')) return dict.cat_hidden;
  if (cat.includes('tradition') || cat.includes('custom') || cat.includes('folk')) return dict.cat_traditions;
  if (cat.includes('craft') || cat.includes('handloom') || cat.includes('art')) return dict.cat_crafts;
  
  return categoryName;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('dharohar_language') || 'en';
  });
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState('');
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeQuizEntity, setActiveQuizEntity] = useState(null);

  const openQuizForEntity = (entityNameOrId) => {
    setActiveQuizEntity(entityNameOrId || null);
    setIsQuizOpen(true);
  };
  const [visitedSites, setVisitedSites] = useState(() => {
    try {
      const saved = localStorage.getItem('dharohar_visited_sites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleVisited = (entity, userNotes = '') => {
    if (!entity || !entity.id) return;
    setVisitedSites(prev => {
      const exists = prev.some(item => item.id === entity.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== entity.id);
      } else {
        const newItem = {
          id: entity.id,
          name: entity.name,
          category_name: entity.category_name,
          location_context: entity.location_context,
          coordinates: entity.coordinates,
          description: entity.description,
          visitedAt: new Date().toISOString(),
          notes: userNotes || ''
        };
        updated = [newItem, ...prev];
      }
      try {
        localStorage.setItem('dharohar_visited_sites', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isVisited = (entityId) => {
    if (!entityId) return false;
    return visitedSites.some(item => item.id === entityId);
  };

  const openChatWithQuery = (query) => {
    if (query) setChatInitialQuery(query);
    setIsChatOpen(true);
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('dharohar_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params = {}) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    Object.keys(params).forEach(paramKey => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });

    return text;
  };

  const translateCategory = (catName) => {
    return getCategoryTranslation(catName, language);
  };

  const translateEntityName = (name, loc = '') => {
    if (!name) return '';
    
    // Handle 'Unknown' dishes by location
    if (name === 'Unknown' || name === 'unknown') {
      if (loc.includes('Western')) return language === 'hi' ? 'पश्चिमी ओडिशा पारंपरिक खान-पान' : language === 'or' ? 'ପଶ୍ଚିମ ଓଡ଼ିଶା ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Western Odisha Regional Cuisine';
      if (loc.includes('Southern')) return language === 'hi' ? 'दक्षिणी ओडिशा पारंपरिक खान-पान' : language === 'or' ? 'ଦକ୍ଷିଣ ଓଡ଼ିଶା ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Southern Odisha Regional Cuisine';
      if (loc.includes('Central')) return language === 'hi' ? 'मध्य ओडिशा पारंपरिक खान-पान' : language === 'or' ? 'ମଧ୍ୟ ଓଡ଼ିଶା ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Central Odisha Regional Cuisine';
      if (loc.includes('Coastal')) return language === 'hi' ? 'तटीय ओडिशा पारंपरिक खान-पान' : language === 'or' ? 'ଉପକୂଳ ଓଡ଼ିଶା ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Coastal Odisha Regional Cuisine';
      if (loc.includes('Northern')) return language === 'hi' ? 'उत्तरी ओडिशा पारंपरिक खान-पान' : language === 'or' ? 'ଉତ୍ତର ଓଡ଼ିଶା ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Northern Odisha Regional Cuisine';
      return language === 'hi' ? 'ओडिशा का पारंपरिक व्यंजन' : language === 'or' ? 'ଓଡ଼ିଆ ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Odisha Traditional Cuisine';
    }

    if (language === 'en') return name;
    
    // 1. Direct match in allEntityTranslations
    if (allEntityTranslations[name]?.name?.[language]) {
      return allEntityTranslations[name].name[language];
    }

    // 2. Direct match in entityNameMap
    if (entityNameMap[name] && entityNameMap[name][language]) {
      return entityNameMap[name][language];
    }
    
    // 3. Partial substring match in allEntityTranslations
    for (const [key, val] of Object.entries(allEntityTranslations)) {
      if (val.name?.[language] && (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase()))) {
        return val.name[language];
      }
    }

    // 4. Partial substring match in entityNameMap
    for (const [key, mapping] of Object.entries(entityNameMap)) {
      if (mapping[language] && (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase()))) {
        return mapping[language];
      }
    }

    return name;
  };

  const translateLocation = (loc) => {
    if (!loc) return '';
    if (language === 'en') return loc;

    // 1. Direct match in locationTranslations
    if (locationTranslations[loc]?.[language]) {
      return locationTranslations[loc][language];
    }

    // 2. Direct match in locationMap
    if (locationMap[loc]?.[language]) {
      return locationMap[loc][language];
    }

    // 3. Substring replace using locationTranslations
    let result = loc;
    for (const [key, mapping] of Object.entries(locationTranslations)) {
      if (mapping[language] && result.toLowerCase().includes(key.toLowerCase())) {
        result = result.replace(new RegExp(key, 'gi'), mapping[language]);
      }
    }

    for (const [key, mapping] of Object.entries(locationMap)) {
      if (mapping[language] && result.toLowerCase().includes(key.toLowerCase())) {
        result = result.replace(new RegExp(key, 'gi'), mapping[language]);
      }
    }

    return result;
  };

  const translateEntityDescription = (desc, name = '', category = '', location = '') => {
    // 1. Check for 'Unknown' cuisine descriptions
    if (name === 'Unknown' || name === 'unknown') {
      if (location.includes('Western')) {
        return language === 'hi'
          ? 'पश्चिमी ओडिशा का पारंपरिक खान-पान जिसमें करदी (किण्वित बांस), अरिसा पीठा, काकरा, गुलगुला, चाउल बरा और स्थानीय साग-भात के अनूठे व्यंजन शामिल हैं।'
          : language === 'or'
          ? 'ପଶ୍ଚିମ ଓଡ଼ିଶାର ପାରମ୍ପରିକ ଖାଦ୍ୟ ଯେଉଁଥିରେ କରଦି (ବାଉଁଶ କରଡ଼ି), ଆରିସା ପିଠା, କାକରା, ଚାଉଳ ବରା, ମାଟିହାଣ୍ଡି ମାଂସ ଓ ସ୍ଥାନୀୟ ଶାଗ-ଭାତର ଅପୂର୍ବ ସ୍ୱାଦ ରହିଛି।'
          : 'Distinctive cuisine of Western Odisha featuring Kardi (fermented bamboo shoots), Arisa Pitha, Kakara, Chaul Bara, and seasonal forest produce.';
      }
      if (location.includes('Southern')) {
        return language === 'hi'
          ? 'दक्षिणी ओडिशा का भोजन तटीय और जनजातीय संस्कृति का सुंदर मिश्रण है, जिसमें मांडिया (बाजरा), इमली, बांस के कोंपल, ताजी मछली और मंडा पीठा प्रमुख हैं।'
          : language === 'or'
          ? 'ଦକ୍ଷିଣ ଓଡ଼ିଶାର ଖାଦ୍ୟଶୈଳୀରେ ଉପକୂଳ ଓ ଆଦିବାସୀ ସଂସ୍କୃତିର ପ୍ରଭାବ ଦେଖିବାକୁ ମିଳେ; ଯେଉଁଥିରେ ମାଣ୍ଡିଆ, କାନ୍ଦୁଲ ଡାଲି, ଆମ୍ବୁଲ ଖଟା, ମାଛ ତରକାରୀ ଓ ମଣ୍ଡା ପିଠା ପ୍ରଧାନ।'
          : 'Rich culinary heritage of Southern Odisha blending tribal millet preparations, fresh fish, bamboo shoots, and traditional pithas.';
      }
      if (location.includes('Central')) {
        return language === 'hi'
          ? 'मध्य ओडिशा (भुवनेश्वर-कटक) का संतुलित भोजन जिसमें दिव्य दालमा, पखाल, माछा मुंड छेंछड़ा, दही बड़ा आलू दम, घुगुनी और छैना झिली शामिल हैं।'
          : language === 'or'
          ? 'ମଧ୍ୟ ଓଡ଼ିଶା (ଭୁବନେଶ୍ୱର-କଟକ)ର ସୁସନ୍ତୁଳିତ ଖାଦ୍ୟ ଯେଉଁଥିରେ ଡାଲମା, ଘାଣ୍ଟ ତରକାରୀ, ମାଛ ମୁଣ୍ଡ ଛେଞ୍ଚଡ଼ା, ଦହିବରା ଆଳୁଦମ, ଘୁଗୁନି ଓ ନିମାପଡ଼ା ଛେନା ଝିଲି ବିଶେଷ ପ୍ରସିଦ୍ଧ।'
          : 'Everyday balanced cuisine of Central Odisha famous for temple-style Dalma, Pakhala, Machha Munda Chhenchda, and Cuttack Dahi Bara Aloo Dum.';
      }
      if (location.includes('Coastal')) {
        return language === 'hi'
          ? 'तटीय ओडिशा का समृद्ध भोजन जिसमें ताजे समुद्री झींगे, केकड़ा, माछा बेसरा, पखाल भात, पोड़ा पीठा और श्रीक्षेत्र का महाप्रसाद प्रमुख हैं।'
          : language === 'or'
          ? 'ଉପକୂଳ ଓଡ଼ିଶାର ସମୃଦ୍ଧ ଖାଦ୍ୟ ସଂସ୍କୃତି ଯେଉଁଥିରେ ଚିଲିକା ଚିଙ୍ଗୁଡ଼ି ଝୋଳ, ମାଛ ବେସର, ପଖାଳ ଭାତ, ପୋଡ଼ ପିଠା ଓ ପୁରୀ ଶ୍ରୀମନ୍ଦିର ମହାପ୍ରସାଦ ସର୍ବପ୍ରଧାନ।'
          : 'Seafood and rice-rich coastal cuisine featuring Chilika Chingudi Jhola, Machha Besara, Pakhala Bhata, and temple Mahaprasad.';
      }
    }

    // 2. Direct match in allEntityTranslations
    if (name && allEntityTranslations[name]?.desc?.[language]) {
      return allEntityTranslations[name].desc[language];
    }

    // 3. Direct match in entityDescriptionMap
    if (name && entityDescriptionMap[name]?.[language]) {
      return entityDescriptionMap[name][language];
    }

    // 4. Substring match in allEntityTranslations
    for (const [key, val] of Object.entries(allEntityTranslations)) {
      if (val.desc?.[language]) {
        if (name && (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase()))) {
          return val.desc[language];
        }
        if (desc && (desc.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(desc.toLowerCase().slice(0, 30)))) {
          return val.desc[language];
        }
      }
    }

    // 5. Substring match in entityDescriptionMap
    for (const [key, mapping] of Object.entries(entityDescriptionMap)) {
      if (name && (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase()))) {
        if (mapping[language]) return mapping[language];
      }
    }

    // If English and description exists and is not 'NO_DESC'
    if (language === 'en') {
      if (desc && desc !== 'NO_DESC' && desc.trim().length > 0) {
        return desc;
      }
      return `${name || 'This cultural heritage tradition'} is an integral part of India's living cultural heritage, deeply woven into the regional history, sacred lore, and community traditions of ${location || 'Odisha'}.`;
    }

    // 6. Natural Indic fallback for Hindi
    if (language === 'hi') {
      const translatedName = translateEntityName(name, location);
      const translatedCat = translateCategory(category);
      const translatedLoc = translateLocation(location);

      return `${translatedName || 'यह सांस्कृतिक धरोहर'} (${translatedCat || 'धरोहर आयाम'}) भारत की जीवंत सांस्कृतिक परंपरा का एक अत्यंत महत्वपूर्ण अंग है। यह ${translatedLoc ? translatedLoc + ' के' : 'ओडिशा के'} लोक जीवन, धार्मिक आस्था और ऐतिहासिक धरोहर से गहराई से जुड़ा हुआ है।`;
    }

    // 7. Natural Indic fallback for Odia
    if (language === 'or') {
      const translatedName = translateEntityName(name, location);
      const translatedCat = translateCategory(category);
      const translatedLoc = translateLocation(location);

      return `${translatedName || 'ଏହି ସାଂସ୍କୃତିକ ଐତିହ୍ୟ'} (${translatedCat || 'ଐତିହ୍ୟ ବିଭାଗ'}) ଭାରତ ତଥା ଓଡ଼ିଶାର ଜୀବନ୍ତ ସାଂସ୍କୃତିକ ପରମ୍ପରାର ଏକ ଅମୂଲ୍ୟ ଅଂଶ। ଏହା ${translatedLoc ? translatedLoc + 'ର' : 'ଆମ'} ପାରମ୍ପରିକ ଲୋକଜୀବନ, ଧାର୍ମିକ ବିଶ୍ୱାସ ଓ ଐତିହାସିକ ଗୌରବ ସହିତ ଅଙ୍ଗାଙ୍ଗୀ ଭାବେ ଜଡ଼ିତ।`;
    }

    return desc || t('panel_no_desc');
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      translateCategory,
      translateEntityName,
      translateLocation,
      translateEntityDescription,
      isItineraryOpen,
      setIsItineraryOpen,
      isChatOpen,
      setIsChatOpen,
      chatInitialQuery,
      setChatInitialQuery,
      openChatWithQuery,
      visitedSites,
      toggleVisited,
      isVisited,
      isPassportOpen,
      setIsPassportOpen,
      isQuizOpen,
      setIsQuizOpen,
      activeQuizEntity,
      setActiveQuizEntity,
      openQuizForEntity
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
