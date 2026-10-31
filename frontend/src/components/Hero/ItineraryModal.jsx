import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
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
    { id: 'temples', label: t('itinerary_theme_temples') },
    { id: 'dance', label: t('itinerary_theme_dance') },
    { id: 'food', label: t('itinerary_theme_food') },
    { id: 'crafts', label: t('itinerary_theme_crafts') },
    { id: 'wildlife', label: t('itinerary_theme_wildlife') },
    { id: 'history', label: t('itinerary_theme_history') }
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

    let text = `DHAROHAR - ${itinerary.title}\n`;
    text += `Duration: ${itinerary.duration} | Focus: ${itinerary.themes?.join(', ') || ''}\n\n`;
    text += `${itinerary.summary || itinerary.subtitle || ''}\n\n`;

    (itinerary.days || []).forEach(d => {
      const dayNum = d.dayNumber || d.day;
      const dayTitle = d.dayTitle || d.title;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `DAY ${dayNum}: ${dayTitle} (${d.theme})\n`;
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

  const isRouteActive = activeRoute && activeRoute.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)]">
      <div className="relative w-full max-w-[960px] max-h-[90vh] flex flex-col bg-paper text-ink overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-6 px-6 sm:px-10 pt-8 pb-6">
          <div className="min-w-0">
            <h2 className="font-display font-bold tracking-display text-4xl sm:text-5xl text-ink leading-[1.05]">
              {t('itinerary_modal_title')}
            </h2>
            <p className="mt-3 text-base text-ink-2 max-w-[60ch]">
              {t('itinerary_modal_subtitle')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center min-h-[44px] px-2 -mr-2 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-10 custom-scrollbar">

          {isLoading ? (
            /* Generation state */
            <div className="py-16 max-w-md" role="status">
              <h3 className="font-display font-bold tracking-display text-3xl text-ink">
                {t('itinerary_generating')}
              </h3>
              <p className="mt-3 text-base text-ink-2">
                Connecting sacred sites, route times, and delicious local food stops...
              </p>
            </div>
          ) : !itinerary ? (
            /* Generator Form / Preferences Screen */
            <div className="space-y-10">

              {/* Duration Options */}
              <div>
                <label className="block text-[15px] font-medium text-muted mb-3">
                  1. {t('itinerary_duration_label')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-rule border border-rule">
                  {[
                    { id: '1', label: t('itinerary_1day'), desc: '2-3 Highlights' },
                    { id: '2', label: t('itinerary_2day'), desc: '4-5 Stops' },
                    { id: '3', label: t('itinerary_3day'), desc: '6-8 Heritage Sites' },
                    { id: '5', label: t('itinerary_5day'), desc: '10-12 Stops' },
                    { id: '7', label: t('itinerary_7day'), desc: 'Full Expedition' },
                  ].map(option => {
                    const isSelected = duration === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDuration(option.id)}
                        aria-pressed={isSelected}
                        className={`min-h-[64px] p-3 text-left flex flex-col justify-between transition-colors duration-short ease-out ${
                          isSelected
                            ? 'bg-ink text-paper'
                            : 'bg-paper text-ink hover:bg-paper-2'
                        }`}
                      >
                        <span className="text-base font-medium">
                          {option.label}
                        </span>
                        <span className={`text-[13px] mt-1 ${isSelected ? 'text-paper' : 'text-muted'}`}>
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starting Hub / Region */}
              <div>
                <label className="block text-[15px] font-medium text-muted mb-1">
                  2. {t('itinerary_hub_label')}
                </label>
                <select
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  className="w-full min-h-[44px] bg-transparent border-0 border-b border-muted px-0 py-2 text-lg text-ink focus:outline-none focus-visible:border-ink cursor-pointer"
                >
                  {availableHubs.map(hub => (
                    <option key={hub.id} value={hub.id} className="bg-paper text-ink">
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cultural Themes (Multi-select) */}
              <div>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <label className="text-[15px] font-medium text-muted">
                    3. {t('itinerary_theme_label')}
                  </label>
                  <span className="text-[13px] text-muted">Select 1 or more</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-rule border border-rule">
                  {themes.map(th => {
                    const isSelected = selectedThemes.includes(th.id);
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => toggleTheme(th.id)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] px-4 py-3 text-left text-base font-medium flex items-center justify-between gap-3 transition-colors duration-short ease-out ${
                          isSelected
                            ? 'bg-ink text-paper'
                            : 'bg-paper text-ink hover:bg-paper-2'
                        }`}
                      >
                        <span>{th.label}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom User Preferences & Notes */}
              <div>
                <label className="block text-[15px] font-medium text-muted mb-1">
                  4. {t('itinerary_custom_prompt_label')}
                </label>
                <textarea
                  value={customPrompt}
                  maxLength={1000}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('itinerary_custom_prompt_placeholder')}
                  rows={2}
                  className="w-full bg-transparent border-0 border-b border-muted px-0 py-2 text-lg text-ink placeholder:text-muted focus:outline-none focus-visible:border-ink resize-none"
                />
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out w-full sm:w-auto"
                >
                  {t('itinerary_generate_btn')}
                </button>
              </div>

            </div>
          ) : (
            /* Generated Itinerary Display */
            <div className="space-y-10">

              {/* Result header band */}
              <div className="bg-field text-field-ink -mx-6 sm:-mx-10 px-6 sm:px-10 py-8">
                <h3 className="font-display font-bold tracking-display text-3xl sm:text-4xl leading-[1.1]">
                  {itinerary.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[15px] font-medium">
                  <span>{itinerary.duration}</span>
                  {itinerary.bestTimeToVisit && (
                    <span>{itinerary.bestTimeToVisit}</span>
                  )}
                </div>
                <p className="mt-4 text-base sm:text-lg leading-relaxed max-w-[65ch]">
                  {itinerary.summary}
                </p>
              </div>

              {/* Cultural Protocol Tip */}
              {itinerary.culturalProtocol && (
                <div className="bg-paper-2 p-5 text-base text-ink-2 leading-relaxed">
                  <span className="block text-[15px] font-medium text-muted mb-1">Cultural Note</span>
                  {itinerary.culturalProtocol}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-x-6 gap-y-2 flex-wrap pb-4 border-b border-rule">
                <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRoute && activeRoute.length > 0) {
                        onHighlightRoute([]);
                      } else if (itinerary.routeCoordinates) {
                        onHighlightRoute(itinerary.routeCoordinates);
                      }
                    }}
                    className={`inline-flex items-center justify-center min-h-[44px] px-5 font-medium transition-colors duration-short ease-out ${
                      isRouteActive
                        ? 'bg-ink text-paper hover:bg-ink-2'
                        : 'border border-ink bg-paper text-ink hover:bg-paper-2'
                    }`}
                  >
                    {isRouteActive
                      ? t('itinerary_clear_route')
                      : t('itinerary_highlight_route')}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyItinerary}
                    className="inline-flex items-center gap-2 min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out"
                  >
                    {copied && <Check className="w-4 h-4" aria-hidden="true" />}
                    <span>{copied ? t('itinerary_copied') : t('itinerary_copy_btn')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setItinerary(null)}
                  className="inline-flex items-center min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out"
                >
                  {t('itinerary_reset')}
                </button>
              </div>

              {/* Day-by-Day Accordion Schedule */}
              <div className="border-t border-ink">
                {itinerary.days?.map((day, dIdx) => {
                  const dayNum = day.dayNumber || day.day || (dIdx + 1);
                  const dayTitle = day.dayTitle || day.title || `Day ${dayNum}`;
                  const isDayExpanded = expandedDay === dayNum;
                  return (
                    <div
                      key={dayNum}
                      className="border-b border-rule"
                    >
                      {/* Day Header Trigger */}
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isDayExpanded ? null : dayNum)}
                        aria-expanded={isDayExpanded}
                        className="w-full min-h-[64px] py-5 flex items-start justify-between gap-4 text-left text-ink hover:text-mark transition-colors duration-short ease-out"
                      >
                        <div className="min-w-0">
                          <h4 className="font-display font-bold tracking-display text-2xl">
                            {t('itinerary_day')} {dayNum}
                          </h4>
                          <p className="mt-1 text-lg text-ink-2">
                            {dayTitle}
                          </p>
                          {day.theme && (
                            <p className="mt-1 text-[15px] text-muted">
                              {day.theme}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-1">
                          <span className="text-[15px] text-muted hidden sm:inline">
                            {day.stops?.length || 0} stops
                          </span>
                          <ChevronRight
                            aria-hidden="true"
                            className={`w-5 h-5 transition-transform duration-short ease-out ${
                              isDayExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Day Stops */}
                      {isDayExpanded && (
                        <ol className="pb-6">
                          {day.stops?.map((stop, sIdx) => {
                            const food = stop.foodTip || stop.culinaryTip;
                            const lore = stop.loreHighlight || stop.culturalLore;
                            return (
                              <li
                                key={sIdx}
                                className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 border-t border-rule"
                              >
                                <span className="font-display font-bold text-xl text-muted">
                                  {sIdx + 1}
                                </span>

                                <div className="min-w-0">
                                  {stop.timeSlot && (
                                    <span className="block text-[15px] font-medium text-muted">
                                      {stop.timeSlot}
                                    </span>
                                  )}
                                  <h5 className="font-display font-bold tracking-display text-xl text-ink">
                                    {translateEntityName(stop.name, stop.location)}
                                  </h5>
                                  <p className="mt-0.5 text-[15px] text-muted">
                                    {translateLocation(stop.location)}
                                  </p>

                                  <div className="mt-3 space-y-2 text-base text-ink-2 leading-relaxed">
                                    <p>
                                      <span className="font-medium text-ink">{t('itinerary_activity')}: </span>
                                      {stop.activity}
                                    </p>

                                    {/* Food Tip */}
                                    {food && (
                                      <p>
                                        <span className="font-medium text-ink">{t('itinerary_food_tip')}: </span>
                                        {food}
                                      </p>
                                    )}

                                    {/* Lore Highlight */}
                                    {lore && (
                                      <p className="italic">"{lore}"</p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleInspectStop(stop)}
                                    className="mt-3 inline-flex items-center min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out"
                                  >
                                    {t('itinerary_view_stop')}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
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
