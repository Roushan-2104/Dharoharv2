import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, X, Minimize2, Maximize2, Volume2, VolumeX, 
  Trash2, Compass, MessageSquare, Mic, MicOff, Copy, Check, 
  Landmark, Music, Utensils, Calendar, MapPin, ChevronDown, 
  ArrowRight, ExternalLink, HelpCircle, Layers, Scroll, Compass as ExploreIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function DharoharChatbot() {
  const { 
    t, 
    language, 
    setIsItineraryOpen,
    isChatOpen,
    setIsChatOpen,
    chatInitialQuery,
    setChatInitialQuery
  } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCallout, setShowCallout] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync with global isChatOpen
  useEffect(() => {
    if (isChatOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setShowCallout(false);
      if (chatInitialQuery) {
        handleSendMessage(chatInitialQuery);
        setChatInitialQuery('');
      }
    }
  }, [isChatOpen, chatInitialQuery]);

  // Topic Categories for quick prompt exploration
  const categoryTabs = [
    { id: 'all', label: '✨ All Topics', icon: <Layers className="w-3 h-3" /> },
    { id: 'temples', label: '🏛️ Temples', icon: <Landmark className="w-3 h-3" /> },
    { id: 'arts', label: '🎭 Arts & Dance', icon: <Music className="w-3 h-3" /> },
    { id: 'food', label: '🍲 Food & Lore', icon: <Utensils className="w-3 h-3" /> },
    { id: 'trails', label: '🗺️ Trip Planner', icon: <Compass className="w-3 h-3" /> },
    { id: 'folklore', label: '📜 Folklore', icon: <Scroll className="w-3 h-3" /> },
  ];

  const categorizedPrompts = {
    all: [
      { text: t('bot_quick_1') || '🏛️ Ancient Temples in Puri & Konark', query: 'Tell me about the most ancient and sacred temples in Puri and Konark.' },
      { text: t('bot_quick_2') || '🎭 Odissi & Chhau Dance Heritage', query: 'What is the cultural history and significance of Odissi and Chhau dance?' },
      { text: t('bot_quick_3') || '🍲 Traditional Food & Mahaprasad', query: 'What makes Puri Mahaprasad and traditional Odia sweets so unique?' },
      { text: t('bot_quick_4') || '🌿 Hidden Heritage Spots', query: 'What are some unexplored or secret heritage spots across Odisha?' },
    ],
    temples: [
      { text: 'Konark Wheel Geometry & Astronomy', query: 'Explain the astronomical and sun-dial calculation features of Konark Sun Temple.' },
      { text: 'Jagannath Rath Yatra & Neela Chakra', query: 'What is the history and mysteries behind Jagannath Temple and Rath Yatra rituals?' },
      { text: 'Chausath Yogini Tantric Architecture', query: 'What is the significance of the circular 64 Yogini temple in Hirapur?' },
      { text: 'Lingaraja Kalinga Architecture', query: 'Explain the architectural mastery of Lingaraja Temple in Old Bhubaneswar.' }
    ],
    arts: [
      { text: 'Raghurajpur Pattachitra Craftsmanship', query: 'How is the traditional Pattachitra cloth scroll painting made in Raghurajpur?' },
      { text: 'Mayurbhanj Chhau Martial Dance', query: 'What are the distinctive techniques and stories enacted in Mayurbhanj Chhau?' },
      { text: 'Sambalpuri Ikat Handloom Weaving', query: 'What is the tie-and-dye Ikat weaving process of Sambalpuri sarees?' }
    ],
    food: [
      { text: 'Chhenapoda & Pahala Rasagola History', query: 'What is the origin story of Chhenapoda and Pahala Rasagola in Odisha culinary lore?' },
      { text: '56 Bhog Mahaprasad Tradition', query: 'Explain the 56 Bhog offerings and earthen pot cooking process of Jagannath Mahaprasad.' },
      { text: 'Dalma & Pakhala Living Culture', query: 'What is the cultural and seasonal importance of Pakhala and Dalma in Odisha?' }
    ],
    trails: [
      { text: 'Golden Triangle 3-Day Heritage Route', query: 'Suggest an ideal 3-day itinerary covering Bhubaneswar, Puri, and Konark.' },
      { text: 'Buddhist Diamond Triangle (Ratnagiri)', query: 'How can I plan a heritage trip to Ratnagiri, Lalitgiri, and Udayagiri Buddhist ruins?' },
      { text: 'Tribal & Handloom Cultural Circuit', query: 'What is the best route to explore traditional crafts and handlooms in Odisha?' }
    ],
    folklore: [
      { text: 'Kanchi Abhiyana & Manika Gouduni Legend', query: 'Tell me the inspiring legend of Kanchi Abhiyana and Manika Gouduni yogurt seller.' },
      { text: 'Dharmapada Sacrifice at Konark', query: 'What is the legendary story of 12-year-old Dharmapada and the Konark Temple crown?' },
      { text: 'Ashoka & Kalinga War at Dhauli Hills', query: 'How did the Kalinga War transform Emperor Ashoka at Dhauli Peace Pagoda?' }
    ]
  };

  // Chat messages state with session storage memory
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('dharohar_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    return [
      {
        sender: 'bot',
        text: t('bot_welcome'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          t('bot_quick_1') || '🏛️ Ancient Temples in Puri & Konark',
          t('bot_quick_2') || '🎭 Odissi & Chhau Dance Heritage',
          t('bot_quick_3') || '🍲 Traditional Cuisine & Mahaprasad'
        ]
      }
    ];
  });

  // Save chat to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('dharohar_chat_history', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'or' ? 'or-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Text to Speech
  const speakText = (text, index) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~>]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'or' ? 'or-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Play subtle sound chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  // Send message to backend Gemini API
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { sender: 'user', text: query, time: userTime }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const langName = language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : 'English';
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: query,
        language: langName,
        entityContext: {
          name: "Odisha & Indian Living Heritage",
          category_name: "Temples, Monuments, Classical Arts, Traditions & Festivals",
          description: "Digital Heritage Knowledge repository containing 200+ verified sacred sites, architecture, folklore, and cultural routes."
        }
      });

      const botResponse = res.data.response || "Namaste! I am here to assist your cultural exploration.";
      const matchedEntities = res.data.matchedEntities || [];
      const suggestedQuestions = res.data.suggestedQuestions || [];
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const updatedMessages = [
        ...newMessages,
        {
          sender: 'bot',
          text: botResponse,
          time: botTime,
          matchedEntities: matchedEntities,
          suggestedQuestions: suggestedQuestions,
          isItinerarySuggestion: query.toLowerCase().includes('itinerary') || query.toLowerCase().includes('trip') || query.toLowerCase().includes('tour') || query.toLowerCase().includes('यात्रा') || query.toLowerCase().includes('plan')
        }
      ];

      setMessages(updatedMessages);
      playChime();

      if (voiceEnabled) {
        speakText(botResponse, updatedMessages.length - 1);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackText = language === 'hi' 
        ? "नमस्ते! क्या आप किसी विशिष्ट मंदिर, नृत्य या सांस्कृतिक स्थल के बारे में जानना चाहते हैं? कृपया पुनः पूछें।"
        : language === 'or'
        ? "ନମସ୍କାର! ଆପଣ କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ମନ୍ଦିର, ନୃତ୍ୟ କିମ୍ବା ଐତିହ୍ୟ ସ୍ଥଳ ବିଷୟରେ ଜାଣିବାକୁ ଚାହାନ୍ତି କି? ଦୟାକରି ପୁନର୍ବାର ପଚାରନ୍ତୁ।"
        : "Greetings explorer! Would you like to explore ancient temples, classical dances, or plan a cultural itinerary? Let me know!";

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    sessionStorage.removeItem('dharohar_chat_history');
    setMessages([
      {
        sender: 'bot',
        text: t('bot_welcome'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          t('bot_quick_1') || '🏛️ Ancient Temples in Puri & Konark',
          t('bot_quick_2') || '🎭 Odissi & Chhau Dance Heritage',
          t('bot_quick_3') || '🍲 Traditional Cuisine & Mahaprasad'
        ]
      }
    ]);
  };

  // Helper to render formatted markdown text safely
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-[#F5D77F] font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-3.5 my-1 list-disc text-zinc-200">
            {formattedLine.slice(1)}
          </li>
        );
      }

      if (line.trim().startsWith('>')) {
        return (
          <div key={lIdx} className="border-l-2 border-[#D4AF37] pl-3 py-1 my-1.5 italic text-[#F5D77F]/90 bg-[#D4AF37]/5 rounded-r-lg text-[11px]">
            {formattedLine}
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lIdx} className="h-1.5" />;
      }

      return (
        <p key={lIdx} className="my-1 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* Floating Animated Callout Pill (When Closed) */}
      {!isOpen && showCallout && (
        <div className="relative mb-3 animate-bounce">
          <div className="dharohar-glass px-4 py-2 rounded-full border border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.3)] flex items-center gap-2.5 text-xs font-semibold text-[#FFF8E7] bg-[#12121E]/95 cursor-pointer hover:border-[#F5D77F] transition-all">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]"></span>
            <span onClick={() => { setIsOpen(true); setShowCallout(false); }}>
              {t('bot_callout')}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCallout(false); }}
              className="text-zinc-400 hover:text-zinc-200 ml-1 p-0.5 rounded-full hover:bg-white/10"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-2.5 h-2.5 bg-[#12121E] border-r border-b border-[#D4AF37]/50 rotate-45 absolute -bottom-1.5 right-6"></div>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div 
          className={`dharohar-glass border border-[#D4AF37]/40 shadow-[0_25px_70px_rgba(0,0,0,0.9)] rounded-3xl flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-2xl mb-3 ${
            isExpanded 
              ? 'w-[94vw] sm:w-[580px] h-[85vh] max-h-[800px]' 
              : isMinimized 
              ? 'w-[320px] sm:w-[360px] h-[64px]' 
              : 'w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#171625] via-[#1C1A2E] to-[#121120] px-4 py-3.5 border-b border-[#D4AF37]/25 flex items-center justify-between select-none shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Bot Avatar with Status */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F59E0B] to-[#B45309] p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0E0E17] rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#F5D77F]" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0E0E17] shadow-[0_0_8px_#10B981]"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-cinzel text-sm font-bold text-[#FFF8E7] tracking-wide">
                    {t('bot_title')}
                  </h3>
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
                </div>
                <p className="text-[10px] font-sans text-[#D4AF37]/90 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold">{t('bot_online')}</span> • <span className="text-zinc-400">{t('bot_subtitle')}</span>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 text-zinc-400">
              {/* Voice Read Aloud Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  voiceEnabled ? 'text-[#F5D77F] bg-[#D4AF37]/25 border border-[#D4AF37]/40' : 'hover:text-zinc-200 hover:bg-white/5'
                }`}
                title={voiceEnabled ? t('bot_voice_on') : t('bot_voice_off')}
                aria-label={voiceEnabled ? t('bot_voice_on') : t('bot_voice_off')}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
                title={t('bot_clear')}
                aria-label={t('bot_clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Expand / Minimize Controls */}
              <button
                onClick={() => { setIsExpanded(!isExpanded); setIsMinimized(false); }}
                className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand"}
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
                title={isMinimized ? "Restore" : "Minimize"}
                aria-label={isMinimized ? "Restore chat" : "Minimize chat"}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsChatOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Close"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden if Minimized) */}
          {!isMinimized && (
            <>
              {/* Category Explorer Tabs */}
              <div className="px-3 py-2 bg-[#0E0E18] border-b border-white/5 flex gap-1.5 overflow-x-auto hud-scrollbar shrink-0">
                {categoryTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                        : 'bg-[#151424]/60 text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hud-scrollbar">
                {messages.map((msg, index) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div 
                      key={index}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} transition-all`}
                    >
                      <div className={`flex gap-2.5 max-w-[90%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        
                        {/* Bot Avatar Icon */}
                        {isBot && (
                          <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                            <Bot className="w-4 h-4 text-[#F5D77F]" />
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div 
                          className={`rounded-2xl px-4 py-3 text-xs shadow-md ${
                            isBot 
                              ? 'bg-[#151424]/95 text-zinc-200 border border-[#D4AF37]/25 rounded-tl-sm' 
                              : 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0A0A10] font-medium rounded-tr-sm shadow-[0_4px_15px_rgba(212,175,55,0.3)]'
                          }`}
                        >
                          {isBot ? renderFormattedText(msg.text) : msg.text}

                          {/* Grounded Entity Preview Cards (If returned from DB) */}
                          {isBot && msg.matchedEntities && msg.matchedEntities.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-[#D4AF37]/20 space-y-2">
                              <div className="text-[10px] font-bold text-[#F5D77F] uppercase tracking-wider flex items-center gap-1.5">
                                <Landmark className="w-3 h-3 text-[#F59E0B]" />
                                <span>Verified Heritage Sites Mentioned:</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {msg.matchedEntities.map((entity, eIdx) => (
                                  <div 
                                    key={eIdx}
                                    className="p-2 rounded-xl bg-[#0F0E1A] border border-[#D4AF37]/30 flex items-center justify-between gap-2 hover:border-[#F5D77F] transition-all"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-cinzel text-xs font-bold text-[#FFF8E7] truncate">
                                        {entity.name}
                                      </h4>
                                      <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-[#D4AF37]" />
                                        <span>{entity.location_context || entity.category_name || 'Odisha Heritage'}</span>
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        navigate('/', { state: { selectedEntityId: entity.id, selectedEntity: entity } });
                                        setIsOpen(false);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 text-[#F5D77F] text-[10px] font-semibold border border-[#D4AF37]/40 flex items-center gap-1 shrink-0 cursor-pointer"
                                      title="Locate on Map"
                                    >
                                      <span>Map</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Button to Open Itinerary inside message */}
                          {msg.isItinerarySuggestion && (
                            <button
                              onClick={() => {
                                setIsItineraryOpen(true);
                                setIsOpen(false);
                              }}
                              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/25 to-[#F59E0B]/25 hover:from-[#D4AF37]/40 hover:to-[#F59E0B]/40 border border-[#D4AF37]/50 text-[#F5D77F] font-bold text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>{t('itinerary_btn')} • Launch AI Trip Planner</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Message Tools (Bot Only) */}
                      {isBot && (
                        <div className="flex items-center gap-2.5 mt-1.5 ml-9 text-[10px] text-zinc-500">
                          <span>{msg.time}</span>
                          
                          {/* Listen Button */}
                          <button
                            onClick={() => speakText(msg.text, index)}
                            className={`hover:text-[#F5D77F] transition-colors p-0.5 cursor-pointer flex items-center gap-1 ${
                              speakingIndex === index ? 'text-[#F5D77F] font-bold animate-pulse' : ''
                            }`}
                            title="Read Aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            {speakingIndex === index && <span>Speaking...</span>}
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.text, index)}
                            className="hover:text-[#F5D77F] transition-colors p-0.5 cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {/* Suggested Dynamic Follow-Up Chips */}
                      {isBot && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                          {msg.suggestedQuestions.map((sq, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sq)}
                              className="px-3 py-1 rounded-full bg-[#181728] hover:bg-[#D4AF37]/25 text-[#E6D5A8] border border-[#D4AF37]/35 text-[11px] font-medium transition-all hover:scale-105 cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" />
                              <span>{sq}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading / Typing Indicator */}
                {loading && (
                  <div className="flex items-center gap-2.5 text-xs text-zinc-400 ml-1">
                    <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#F5D77F] animate-spin" />
                    </div>
                    <div className="dharohar-glass px-3.5 py-2 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#FFF8E7] animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] text-[#F5D77F] font-medium ml-1">{t('chat_typing')}</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Categorized Quick Prompts Suggestion Bar */}
              <div className="px-3 py-2 bg-[#0C0B14] border-t border-white/5 flex gap-2 overflow-x-auto hud-scrollbar shrink-0">
                {(categorizedPrompts[activeTab] || categorizedPrompts.all).map((item, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(item.query || item.text)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#141322] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[11px] font-medium text-[#F5D77F] transition-all hover:scale-102 cursor-pointer shadow-sm"
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#11101C] border-t border-[#D4AF37]/20 shrink-0">
                <div className="flex items-center gap-2 bg-[#09090F] px-3.5 py-2 rounded-2xl border border-[#D4AF37]/35 focus-within:border-[#F5D77F] shadow-inner transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    maxLength={1000}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening... speak now" : t('bot_placeholder')}
                    className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    disabled={loading}
                  />

                  {/* Mic Voice Input */}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]' 
                        : 'text-zinc-400 hover:text-[#F5D77F] hover:bg-white/5'
                    }`}
                    title={isListening ? "Stop Listening" : "Speak Query"}
                    aria-label={isListening ? "Stop Listening" : "Voice search"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className={`p-2 rounded-xl transition-all duration-300 cursor-pointer ${
                      inputMessage.trim() && !loading
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0A0A10] font-bold shadow-[0_0_15px_rgba(212,175,55,0.45)] scale-105'
                        : 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed'
                    }`}
                    title={t('chat_send')}
                    aria-label={t('chat_send')}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mt-1.5">
                  <span className="text-[9px] text-zinc-500 font-sans tracking-wide">
                    {t('bot_disclaimer')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sticky Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          setShowCallout(false);
        }}
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F59E0B] to-[#C2410C] text-[#0A0A10] shadow-[0_10px_35px_rgba(212,175,55,0.5)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.7)] transform hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-[#FFF8E7]/40"
        title="Dharohar AI Guide"
        aria-label="Toggle Dharohar AI Guide"
      >
        {/* Glow Pulse Aura */}
        <span className="absolute -inset-1 rounded-2xl bg-[#F59E0B]/35 blur-md group-hover:bg-[#F59E0B]/60 transition-all"></span>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 text-[#0A0A10] group-hover:rotate-90 transition-transform" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-[#0A0A10] group-hover:scale-110 transition-transform" />
              <Sparkles className="w-3.5 h-3.5 text-[#FFF8E7] absolute -top-1.5 -right-1.5 animate-spin [animation-duration:4s]" />
            </>
          )}
        </div>

        {/* Active Live Indicator Badge */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#08080C] shadow-[0_0_8px_#10B981]"></span>
        )}
      </button>

    </div>
  );
}
