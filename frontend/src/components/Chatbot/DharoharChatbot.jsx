import React, { useState, useRef, useEffect } from 'react';
import {
  Send, X, Minimize2, Maximize2, Volume2, VolumeX,
  Trash2, Mic, MicOff, Copy, Check, ChevronDown
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
  const [, setShowCallout] = useState(true); // callout bubble removed; setter still called by open handlers
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
    { id: 'all', label: 'All topics' },
    { id: 'temples', label: 'Temples' },
    { id: 'arts', label: 'Arts & dance' },
    { id: 'food', label: 'Food & lore' },
    { id: 'trails', label: 'Trip planner' },
    { id: 'folklore', label: 'Folklore' },
  ];

  const categorizedPrompts = {
    all: [
      { text: t('bot_quick_1') || 'Ancient Temples in Puri & Konark', query: 'Tell me about the most ancient and sacred temples in Puri and Konark.' },
      { text: t('bot_quick_2') || 'Odissi & Chhau Dance Heritage', query: 'What is the cultural history and significance of Odissi and Chhau dance?' },
      { text: t('bot_quick_3') || 'Traditional Food & Mahaprasad', query: 'What makes Puri Mahaprasad and traditional Odia sweets so unique?' },
      { text: t('bot_quick_4') || 'Hidden Heritage Spots', query: 'What are some unexplored or secret heritage spots across Odisha?' },
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
          t('bot_quick_1') || 'Ancient Temples in Puri & Konark',
          t('bot_quick_2') || 'Odissi & Chhau Dance Heritage',
          t('bot_quick_3') || 'Traditional Cuisine & Mahaprasad'
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
          t('bot_quick_1') || 'Ancient Temples in Puri & Konark',
          t('bot_quick_2') || 'Odissi & Chhau Dance Heritage',
          t('bot_quick_3') || 'Traditional Cuisine & Mahaprasad'
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
          return <strong key={pIdx} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-5 my-1 list-disc">
            {formattedLine.slice(1)}
          </li>
        );
      }

      if (line.trim().startsWith('>')) {
        return (
          <div key={lIdx} className="bg-paper-2 px-3 py-2 my-2 italic text-ink">
            {formattedLine}
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-1 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  const iconButton = 'inline-flex items-center justify-center w-11 h-11 shrink-0 cursor-pointer transition-colors duration-short ease-out';

  return (
    <div className="fixed bottom-6 right-6 z-40 md:bottom-12 md:right-16 flex flex-col items-end pointer-events-auto">

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          className={`bg-paper text-ink border border-rule flex flex-col overflow-hidden mb-3 ${
            isExpanded
              ? 'w-[94vw] sm:w-[580px] h-[85vh] max-h-[800px]'
              : isMinimized
              ? 'w-[94vw] sm:w-[440px] h-auto'
              : 'w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className={`pl-4 pr-1 py-2 flex items-center justify-between gap-2 select-none shrink-0 ${isMinimized ? '' : 'border-b border-rule'}`}>
            <div className="min-w-0">
              <h3 className="font-display font-bold tracking-display text-2xl leading-tight text-ink">
                {t('bot_title')}
              </h3>
              <p className="text-[15px] font-medium text-muted">
                {t('bot_subtitle')}
              </p>
            </div>

            {/* Header Controls */}
            <div className="flex items-center text-ink shrink-0">
              {/* Voice Read Aloud Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`${iconButton} ${
                  voiceEnabled ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-2'
                }`}
                title={voiceEnabled ? t('bot_voice_on') : t('bot_voice_off')}
                aria-label={voiceEnabled ? t('bot_voice_on') : t('bot_voice_off')}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className={`${iconButton} hover:bg-paper-2`}
                title={t('bot_clear')}
                aria-label={t('bot_clear')}
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {/* Expand / Minimize Controls */}
              <button
                onClick={() => { setIsExpanded(!isExpanded); setIsMinimized(false); }}
                className={`${iconButton} hover:bg-paper-2 hidden sm:inline-flex`}
                title={isExpanded ? "Collapse" : "Expand"}
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={`${iconButton} hover:bg-paper-2`}
                title={isMinimized ? "Restore" : "Minimize"}
                aria-label={isMinimized ? "Restore chat" : "Minimize chat"}
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-short ease-out ${isMinimized ? 'rotate-180' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsChatOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className={`${iconButton} hover:bg-paper-2`}
                title="Close"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden if Minimized) */}
          {!isMinimized && (
            <>
              {/* Category Explorer Tabs */}
              <div className="flex overflow-x-auto border-b border-rule shrink-0">
                {categoryTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[44px] px-4 whitespace-nowrap text-[15px] font-medium cursor-pointer transition-colors duration-short ease-out ${
                      activeTab === tab.id
                        ? 'bg-ink text-paper'
                        : 'bg-paper text-ink hover:bg-paper-2'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {messages.map((msg, index) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      {/* Message */}
                      <div
                        className={`text-base ${
                          isBot
                            ? 'w-full text-ink-2'
                            : 'max-w-[85%] bg-ink text-paper px-4 py-3'
                        }`}
                      >
                        {isBot ? renderFormattedText(msg.text) : msg.text}

                        {/* Grounded Entity Preview Cards (If returned from DB) */}
                        {isBot && msg.matchedEntities && msg.matchedEntities.length > 0 && (
                          <div className="mt-4">
                            <div className="text-[15px] font-medium text-muted mb-1">
                              Heritage sites mentioned
                            </div>
                            <ul className="border-t border-rule">
                              {msg.matchedEntities.map((entity, eIdx) => (
                                <li
                                  key={eIdx}
                                  className="py-3 border-b border-rule flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-display font-bold tracking-display text-xl text-ink truncate">
                                      {entity.name}
                                    </h4>
                                    <p className="text-[15px] text-muted truncate">
                                      {entity.location_context || entity.category_name || 'Odisha Heritage'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigate('/', { state: { selectedEntityId: entity.id, selectedEntity: entity } });
                                      setIsOpen(false);
                                    }}
                                    className="min-h-[44px] px-1 shrink-0 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                                    title="Locate on Map"
                                  >
                                    Map
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Button to Open Itinerary inside message */}
                        {msg.isItinerarySuggestion && (
                          <button
                            onClick={() => {
                              setIsItineraryOpen(true);
                              setIsOpen(false);
                            }}
                            className="mt-4 inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
                          >
                            {t('itinerary_btn')}
                          </button>
                        )}
                      </div>

                      {/* Message Tools (Bot Only) */}
                      {isBot && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted">
                          <span className="mr-2">{msg.time}</span>

                          {/* Listen Button */}
                          <button
                            onClick={() => speakText(msg.text, index)}
                            className={`inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-2 cursor-pointer transition-colors duration-short ease-out ${
                              speakingIndex === index ? 'text-mark' : 'hover:text-ink'
                            }`}
                            title="Read Aloud"
                          >
                            <Volume2 className="w-4 h-4" />
                            {speakingIndex === index && <span>Speaking...</span>}
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.text, index)}
                            className="inline-flex items-center justify-center w-11 h-11 hover:text-ink cursor-pointer transition-colors duration-short ease-out"
                            title="Copy Response"
                          >
                            {copiedIndex === index ? <Check className="w-4 h-4 text-ink" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}

                      {/* Suggested Dynamic Follow-Up Chips */}
                      {isBot && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.suggestedQuestions.map((sq, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sq)}
                              className="min-h-[44px] px-4 py-2 text-left text-[15px] font-medium border border-rule bg-paper text-ink hover:bg-paper-2 cursor-pointer transition-colors duration-short ease-out"
                            >
                              {sq}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading / Typing Indicator */}
                {loading && (
                  <div className="text-base text-muted">
                    {t('chat_typing')}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Categorized Quick Prompts Suggestion Bar */}
              <div className="flex overflow-x-auto border-t border-rule shrink-0">
                {(categorizedPrompts[activeTab] || categorizedPrompts.all).map((item, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(item.query || item.text)}
                    className="min-h-[44px] px-4 whitespace-nowrap text-[15px] font-medium bg-paper text-ink hover:bg-paper-2 border-r border-rule last:border-r-0 cursor-pointer transition-colors duration-short ease-out"
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="px-4 pt-2 pb-3 border-t border-rule shrink-0">
                <div className="flex items-end gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    maxLength={1000}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening... speak now" : t('bot_placeholder')}
                    className="flex-1 min-w-0 bg-transparent border-0 border-b border-muted px-0 py-2 text-lg text-ink placeholder:text-muted focus:outline-none focus-visible:border-ink disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />

                  {/* Mic Voice Input */}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`${iconButton} ${
                      isListening
                        ? 'bg-mark text-mark-ink'
                        : 'bg-paper text-ink hover:bg-paper-2'
                    }`}
                    title={isListening ? "Stop Listening" : "Speak Query"}
                    aria-label={isListening ? "Stop Listening" : "Voice search"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className={`${iconButton} bg-ink text-paper hover:bg-ink-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={t('chat_send')}
                    aria-label={t('chat_send')}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <p className="mt-2 text-[13px] text-muted">
                  {t('bot_disclaimer')}
                </p>
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
        className="inline-flex items-center justify-center min-h-[52px] px-6 bg-ink text-paper font-medium border border-paper hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
        title="Dharohar AI Guide"
        aria-label="Toggle Dharohar AI Guide"
      >
        {isOpen ? 'Close' : 'Ask the guide'}
      </button>

    </div>
  );
}
