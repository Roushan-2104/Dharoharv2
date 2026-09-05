import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Image as ImageIcon, Send, Sparkles, MapPin, ShieldCheck, MessageSquare } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function RightPanel({ activeEntity, setActiveEntity }) {
  const { language, t, translateCategory, translateEntityName, translateLocation, translateEntityDescription } = useLanguage();
  const [wikiImage, setWikiImage] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    t('chat_prompt_1'),
    t('chat_prompt_2'),
    t('chat_prompt_3')
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!activeEntity) return;

    setWikiImage(null);
    setLoadingImg(true);
    setMessages([{
      sender: 'ai',
      text: t('chat_intro', { name: translateEntityName(activeEntity.name, activeEntity.location_context) })
    }]);
    
    const searchQuery = encodeURIComponent(activeEntity.name);

    axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json&origin=*`)
      .then(searchRes => {
        if (searchRes.data.query.search.length > 0) {
          const exactTitle = searchRes.data.query.search[0].title;
          return axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(exactTitle)}&pithumbsize=1200&format=json&origin=*`);
        }
        throw new Error("No Wikipedia page found");
      })
      .then(imageRes => {
        const pages = imageRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
          setWikiImage(pages[pageId].thumbnail.source);
        }
      })
      .catch(err => {
        console.log("Could not fetch Wikipedia image");
      })
      .finally(() => {
        setLoadingImg(false);
      });

  }, [activeEntity, language]);

  const sendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: queryText,
        entityContext: activeEntity,
        language: language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : 'English'
      });

      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: language === 'or'
          ? "ଦର୍ଶକ ବର୍ତ୍ତମାନ ଚିନ୍ତନ କରୁଛନ୍ତି। ଦୟାକରି କିଛି ସମୟ ପରେ ପୁନର୍ବାର ପଚାରନ୍ତୁ।"
          : language === 'hi'
          ? "दर्शक इस समय प्राचीन अभिलेखों का अवलोकन कर रहा है। कृपया कुछ क्षणों बाद पुनः पूछें।"
          : "Darshak is momentarily reflecting. Please try asking again in a moment." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendQuery(inputMessage);
  };

  return (
    <div 
      className={`fixed top-20 right-0 h-[calc(100vh-80px)] w-full sm:w-[480px] md:w-[520px] bg-[#0C0C14]/95 backdrop-blur-2xl transform transition-custom duration-500 flex flex-col z-40 border-l border-[#D4AF37]/25 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] ${
        activeEntity ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-[#D4AF37]/20 bg-[#10101A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <h2 className="heritage-badge text-[9px] text-[#F5D77F] tracking-[0.25em]">
              {t('hud_subtitle')}
            </h2>
          </div>
          <h3 className="text-2xl font-cinzel font-bold text-[#FFF8E7] leading-tight">
            {translateEntityName(activeEntity?.name, activeEntity?.location_context)}
          </h3>
        </div>
        <button 
          onClick={() => setActiveEntity(null)}
          className="p-2 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors text-zinc-400 hover:text-[#FFF8E7]"
          title={t('panel_close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Full-Color Hero Image Section */}
        <div className="relative w-full h-64 bg-[#08080C] flex items-center justify-center overflow-hidden border-b border-[#D4AF37]/20">
          {loadingImg ? (
            <div className="animate-pulse flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-[#D4AF37] mb-2 animate-spin" />
              <span className="heritage-badge text-zinc-400">{t('panel_loading_img')}</span>
            </div>
          ) : wikiImage ? (
            <div className="relative w-full h-full group">
              <img 
                src={wikiImage} 
                alt={activeEntity?.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Vignette Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C14] via-transparent to-black/30" />
            </div>
          ) : (
            <div className="flex flex-col items-center text-zinc-600">
              <ImageIcon className="w-10 h-10 mb-2 text-zinc-600" />
              <span className="heritage-badge text-zinc-500">{t('panel_record_progress')}</span>
            </div>
          )}
          
          {/* Overlaid Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <span className="bg-[#101018]/90 text-[#F5D77F] heritage-badge px-3 py-1.5 rounded-full border border-[#D4AF37]/40 shadow-lg backdrop-blur-md">
              {translateCategory(activeEntity?.category_name)}
            </span>
            <span className="bg-[#101018]/90 text-zinc-300 text-[11px] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{t('panel_verified')}</span>
            </span>
          </div>
        </div>

        {/* Text Description & Location */}
        <div className="p-6 border-b border-[#D4AF37]/15 bg-[#0E0E16]">
          <div className="flex items-center gap-2 text-zinc-300 text-xs mb-4">
            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="font-medium">{translateLocation(activeEntity?.location_context)}</span>
          </div>
          
          <p className="text-zinc-300 leading-relaxed text-sm font-sans mb-6">
            {translateEntityDescription(
              activeEntity?.description,
              activeEntity?.name,
              activeEntity?.category_name,
              activeEntity?.location_context
            )}
          </p>
          
          <a 
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(activeEntity?.name || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 bg-[#141320] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 text-[#F5D77F] transition-all text-xs font-semibold tracking-wider"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('panel_wiki_view')}</span>
          </a>
        </div>

        {/* Darshak AI Heritage Guide Chat */}
        <div className="flex flex-col bg-[#09090F]">
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#12121D]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="font-cinzel text-sm font-bold text-[#FFF8E7] block leading-none">
                  {t('chat_header_title')}
                </span>
                <span className="text-[10px] text-[#F5D77F]/80 tracking-wider font-sans">
                  {t('chat_header_sub')}
                </span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              {t('panel_ai_status')}
            </span>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] bg-[#161524] text-zinc-300 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-all shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 space-y-4 max-h-72 min-h-48 overflow-y-auto no-scrollbar">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-semibold rounded-br-none shadow-[0_4px_15px_rgba(212,175,55,0.2)]'
                      : 'bg-[#141322] text-zinc-200 border border-[#D4AF37]/20 rounded-bl-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-[#141322] border border-[#D4AF37]/20 rounded-2xl rounded-bl-none w-auto max-w-xs">
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="text-[10px] text-zinc-400 italic ml-1">{t('chat_typing')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#D4AF37]/20 bg-[#0E0E18] flex items-center gap-2">
            <input 
              type="text"
              placeholder={t('chat_placeholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#151422] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs text-[#FFF8E7] placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
            <button 
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-40 disabled:hover:shadow-none"
              title={t('chat_send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
