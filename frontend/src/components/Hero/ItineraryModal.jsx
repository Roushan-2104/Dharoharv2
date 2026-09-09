import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  Check, 
  Copy, 
  Navigation, 
  Utensils, 
  BookOpen, 
  ChevronRight, 
  RotateCcw,
  Eye,
  Sliders,
  Flame
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function ItineraryModal({ 
  isOpen, 
  onClose, 
  entities = [], 
  onSelectEntity,
  onHighlightRoute,
  activeRoute
}) {
  const { t, language, translateEntityName, translateLocation } = useLanguage();

  // Form State
  const [duration, setDuration] = useState('3'); // '1', '2', '3', '5', '7'
  const [selectedHub, setSelectedHub] = useState('All');
  const [selectedThemes, setSelectedThemes] = useState(['temples', 'food']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);

  if (!isOpen) return null;

  // Available Hubs derived from entities
  const availableHubs = [
    { id: 'All', name: t('itinerary_hub_any') },
    { id: 'Bhubaneswar & Prachi', name: 'Bhubaneswar & Ekamra Kshetra (Central)' },
    { id: 'Puri & Konark', name: 'Puri, Konark & Chilika (Coastal)' },
    { id: 'Sambalpur & Western Odisha', name: 'Sambalpur, Bargarh & Huma (Western Odisha)' },
    { id: 'Mayurbhanj & North', name: 'Mayurbhanj, Similipal & Khiching (Northern Odisha)' },
    { id: 'Ganjam & Chilika', name: 'Ganjam, Tara Tarini & Berhampur (Southern Coast)' },
    { id: 'Jajpur & Biraja', name: 'Jajpur, Ratnagiri & Diamond Triangle (Buddhist Trail)' }
  ];

  // Available Themes
  const themes = [
    { id: 'temples', label: t('itinerary_theme_temples'), icon: '🏛️' },
    { id: 'dance', label: t('itinerary_theme_dance'), icon: '💃' },
    { id: 'food', label: t('itinerary_theme_food'), icon: '🍛' },
    { id: 'crafts', label: t('itinerary_theme_crafts'), icon: '🎨' },
    { id: 'wildlife', label: t('itinerary_theme_wildlife'), icon: '🌿' },
    { id: 'history', label: t('itinerary_theme_history'), icon: '🏰' }
  ];

  const toggleTheme = (themeId) => {
    if (selectedThemes.includes(themeId)) {
      if (selectedThemes.length > 1) {
        setSelectedThemes(selectedThemes.filter(id => id !== themeId));
      }
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const langName = language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : 'English';
      const payload = {
        duration: `${duration} Days`,
        days: parseInt(duration, 10),
        themes: selectedThemes,
        startingRegion: selectedHub === 'All' ? 'Bhubaneswar' : selectedHub,
        startHub: selectedHub,
        customNotes: customPrompt.trim(),
        userPrompt: customPrompt.trim(),
        language: langName
      };

      const response = await axios.post(`${API_BASE_URL}/api/itinerary/generate`, payload);
      const rawData = response.data;
      const itinData = rawData.itinerary || rawData;

      if (itinData && itinData.days) {
        setItinerary(itinData);
        setExpandedDay(1);

        // Auto highlight route if coordinates available
        if (itinData.routeCoordinates && itinData.routeCoordinates.length > 0) {
          onHighlightRoute(itinData.routeCoordinates);
        }
      }
    } catch (err) {
      console.error("Error generating itinerary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyItinerary = () => {
    if (!itinerary) return;

    let text = `✨ DHAROHAR - ${itinerary.title}\n`;
    text += `Duration: ${itinerary.duration} | Focus: ${itinerary.themes?.join(', ') || ''}\n\n`;
    text += `${itinerary.summary || itinerary.subtitle || ''}\n\n`;

    (itinerary.days || []).forEach(d => {
      const dayNum = d.dayNumber || d.day;
      const dayTitle = d.dayTitle || d.title;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📅 DAY ${dayNum}: ${dayTitle} (${d.theme})\n`;
      (d.stops || []).forEach((s, idx) => {
        text += `  ${idx + 1}. ${s.name} [${s.location}]\n`;
        text += `     • Experience: ${s.activity}\n`;
        const food = s.foodTip || s.culinaryTip;
        if (food) text += `     • Cuisine Tip: ${food}\n`;
        const lore = s.loreHighlight || s.culturalLore;
        if (lore) text += `     • Lore: ${lore}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleInspectStop = (stop) => {
    // Find matching entity in database
    const match = entities.find(e => 
      (stop.entityId && e.id === stop.entityId) ||
      e.name.toLowerCase() === (stop.name || '').toLowerCase() ||
      (stop.name || '').toLowerCase().includes(e.name.toLowerCase())
    );

    if (match) {
      onSelectEntity(match);
    } else if (stop.coordinates && stop.coordinates.length >= 2) {
      // Create a virtual entity object for inspection
      onSelectEntity({
        id: `itin-${Date.now()}`,
        name: stop.name,
        category_name: 'Heritage Trail',
        location_context: stop.location,
        coordinates: stop.coordinates,
        description: `${stop.activity || ''}. ${stop.loreHighlight || stop.culturalLore || ''}`.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0A0A12]/95 border border-[#D4AF37]/35 rounded-2xl shadow-[0_12px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#12121E] via-[#0D0D18] to-[#12121E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#F59E0B]/10 border border-[#D4AF37]/40 text-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8E7] via-[#F5D77F] to-[#D4AF37]">
                  {t('itinerary_modal_title')}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#F59E0B]/15 text-[#F5D77F] border border-[#F59E0B]/30">
                  <Sparkles className="w-2.5 h-2.5" /> Darshak AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans line-clamp-1">
                {t('itinerary_modal_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-[#FFF8E7] hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[#D4AF37]/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar text-[#FFF8E7]">
          
          {isLoading ? (
            /* Animated Darshak AI Generation Loader */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#F59E0B] animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37]/20 border-b-[#D4AF37] animate-spin-reverse"></div>
                <Sparkles className="w-8 h-8 text-[#F5D77F] animate-bounce" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="font-cinzel text-lg font-bold text-[#F5D77F]">
                  {t('itinerary_generating')}
                </h3>
                <p className="text-xs text-zinc-400">
                  Connecting sacred sites, route times, and delicious local food stops...
                </p>
              </div>
            </div>
          ) : !itinerary ? (
            /* Generator Form / Preferences Screen */
            <div className="space-y-6">
              
              {/* Duration Options */}
              <div>
                <label className="block font-cinzel text-xs font-bold text-[#F5D77F] uppercase tracking-wider mb-2.5">
                  1. {t('itinerary_duration_label')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: '1', label: t('itinerary_1day'), desc: '2-3 Highlights', icon: '⚡' },
                    { id: '2', label: t('itinerary_2day'), desc: '4-5 Stops', icon: '🌿' },
                    { id: '3', label: t('itinerary_3day'), desc: '6-8 Heritage Sites', icon: '🌟' },
                    { id: '5', label: t('itinerary_5day'), desc: '10-12 Stops', icon: '👑' },
                    { id: '7', label: t('itinerary_7day'), desc: 'Full Expedition', icon: '🔱' },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDuration(option.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
                        duration === option.id
                          ? 'bg-gradient-to-br from-[#D4AF37]/25 to-[#F59E0B]/10 border-[#F59E0B] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                          : 'bg-[#12121E]/60 border-zinc-800 hover:border-[#D4AF37]/40 text-zinc-300 hover:text-[#FFF8E7]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-base">{option.icon}</span>
                        {duration === option.id && (
                          <span className="w-2 h-2 rounded-full bg-[#F5D77F] shadow-[0_0_8px_#F5D77F]"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-cinzel text-xs font-bold text-[#FFF8E7]">
                          {option.label}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                          {option.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Hub / Region */}
              <div>
                <label className="block font-cinzel text-xs font-bold text-[#F5D77F] uppercase tracking-wider mb-2.5">
                  2. {t('itinerary_hub_label')}
                </label>
                <div className="relative">
                  <select
                    value={selectedHub}
                    onChange={(e) => setSelectedHub(e.target.value)}
                    className="w-full px-4 py-3 bg-[#12121E]/80 border border-zinc-700/80 hover:border-[#D4AF37]/50 rounded-xl text-sm text-[#FFF8E7] focus:outline-none focus:border-[#F5D77F] focus:ring-1 focus:ring-[#F5D77F] transition-all cursor-pointer font-sans"
                  >
                    {availableHubs.map(hub => (
                      <option key={hub.id} value={hub.id} className="bg-[#0C0C14] text-[#FFF8E7]">
                        {hub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cultural Themes (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="font-cinzel text-xs font-bold text-[#F5D77F] uppercase tracking-wider">
                    3. {t('itinerary_theme_label')}
                  </label>
                  <span className="text-[11px] text-zinc-400">Select 1 or more</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {themes.map(th => {
                    const isSelected = selectedThemes.includes(th.id);
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => toggleTheme(th.id)}
                        className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#FFF8E7] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                            : 'bg-[#12121E]/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{th.icon}</span>
                          <span className="text-xs font-medium">{th.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                            : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom User Preferences & Notes */}
              <div>
                <label className="block font-cinzel text-xs font-bold text-[#F5D77F] uppercase tracking-wider mb-2">
                  4. {t('itinerary_custom_prompt_label')}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('itinerary_custom_prompt_placeholder')}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#12121E]/80 border border-zinc-700/80 hover:border-[#D4AF37]/50 rounded-xl text-sm text-[#FFF8E7] placeholder-zinc-500 focus:outline-none focus:border-[#F5D77F] focus:ring-1 focus:ring-[#F5D77F] transition-all font-sans resize-none"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-sm text-[#08080C] bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#F59E0B] hover:opacity-95 shadow-[0_4px_25px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('itinerary_generate_btn')}</span>
                </button>
              </div>

            </div>
          ) : (
            /* Generated Itinerary Display */
            <div className="space-y-6 animate-fade-in">
              
              {/* Summary Header Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#181828]/90 via-[#12121E] to-[#181828]/90 border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5D77F]">
                    {itinerary.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40">
                      {itinerary.duration}
                    </span>
                    {itinerary.bestTimeToVisit && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] text-zinc-300 bg-white/5 border border-white/10">
                        🗓️ {itinerary.bestTimeToVisit}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  {itinerary.summary}
                </p>

                {/* Cultural Protocol Tip */}
                {itinerary.culturalProtocol && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-[#F5D77F]/90 font-sans">
                    <Flame className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span><strong>Cultural Note:</strong> {itinerary.culturalProtocol}</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRoute && activeRoute.length > 0) {
                        onHighlightRoute([]);
                      } else if (itinerary.routeCoordinates) {
                        onHighlightRoute(itinerary.routeCoordinates);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeRoute && activeRoute.length > 0
                        ? 'bg-[#F59E0B] text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-[#1A1A2A] text-[#F5D77F] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {activeRoute && activeRoute.length > 0
                        ? t('itinerary_clear_route')
                        : t('itinerary_highlight_route')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyItinerary}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1A2A] text-zinc-300 hover:text-[#FFF8E7] hover:bg-white/10 border border-zinc-700 transition-all flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('itinerary_copied') : t('itinerary_copy_btn')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setItinerary(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-[#F5D77F] hover:bg-white/5 transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('itinerary_reset')}</span>
                </button>
              </div>

              {/* Day-by-Day Accordion Schedule */}
              <div className="space-y-4">
                {itinerary.days?.map((day, dIdx) => {
                  const dayNum = day.dayNumber || day.day || (dIdx + 1);
                  const dayTitle = day.dayTitle || day.title || `Day ${dayNum}`;
                  const isDayExpanded = expandedDay === dayNum;
                  return (
                    <div 
                      key={dayNum}
                      className="rounded-xl border border-zinc-800/80 bg-[#0E0E18]/80 overflow-hidden transition-all duration-300 shadow-md"
                    >
                      {/* Day Header Trigger */}
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isDayExpanded ? null : dayNum)}
                        className="w-full px-4 py-3.5 flex items-center justify-between bg-gradient-to-r from-[#141424] to-[#0E0E18] hover:bg-[#18182A] transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-md font-cinzel text-xs font-bold bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40">
                            {t('itinerary_day')} {dayNum}
                          </span>
                          <div>
                            <h4 className="font-cinzel text-sm font-bold text-[#FFF8E7]">
                              {dayTitle}
                            </h4>
                            <span className="text-[11px] text-zinc-400 font-sans">
                              {day.theme}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 hidden sm:inline">
                            {day.stops?.length || 0} stops
                          </span>
                          <ChevronRight className={`w-4 h-4 text-[#F5D77F] transition-transform duration-200 ${
                            isDayExpanded ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </button>

                      {/* Day Stops Timeline */}
                      {isDayExpanded && (
                        <div className="p-4 sm:p-5 space-y-4 border-t border-zinc-800 bg-[#0A0A12]/90">
                          {day.stops?.map((stop, sIdx) => {
                            const food = stop.foodTip || stop.culinaryTip;
                            const lore = stop.loreHighlight || stop.culturalLore;
                            return (
                              <div 
                                key={sIdx}
                                className="relative pl-6 pb-4 last:pb-0 border-l border-[#D4AF37]/30 last:border-l-transparent group"
                              >
                                {/* Step Node Dot */}
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#08080C] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                                  <span className="text-[8px] font-bold text-[#F5D77F]">{sIdx + 1}</span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-[#141424]/70 border border-zinc-800/80 hover:border-[#D4AF37]/40 transition-all">
                                  
                                  {/* Stop Title & Location */}
                                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                    <div>
                                      <h5 className="font-cinzel text-sm font-bold text-[#FFF8E7] group-hover:text-[#F5D77F] transition-colors">
                                        {translateEntityName(stop.name, stop.location)}
                                      </h5>
                                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-sans">
                                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                                        <span>{translateLocation(stop.location)}</span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleInspectStop(stop)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F5D77F] border border-[#D4AF37]/30 transition-all flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>{t('itinerary_view_stop')}</span>
                                    </button>
                                  </div>

                                  {/* Experience / Activity */}
                                  <div className="space-y-2 text-xs font-sans text-zinc-300">
                                    <div className="flex items-start gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5">
                                      <Compass className="w-3.5 h-3.5 text-[#F5D77F] shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-semibold text-[#FFF8E7]">{t('itinerary_activity')}: </span>
                                        {stop.activity}
                                      </div>
                                    </div>

                                    {/* Food Tip */}
                                    {food && (
                                      <div className="flex items-start gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5 text-[#F5D77F]/90">
                                        <Utensils className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-semibold text-[#F5D77F]">{t('itinerary_food_tip')}: </span>
                                          {food}
                                        </div>
                                      </div>
                                    )}

                                    {/* Lore Highlight */}
                                    {lore && (
                                      <div className="flex items-start gap-2 text-[11px] text-zinc-400 italic pt-1 pl-1">
                                        <BookOpen className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5 not-italic" />
                                        <span>"{lore}"</span>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
