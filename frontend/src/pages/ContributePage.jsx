import React, { useState } from 'react';
import { Feather, CheckCircle2, UploadCloud, Sparkles, MapPin, BookOpen, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ContributePage() {
  const { t, translateCategory } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Oral Tradition & Folklore',
    location: '',
    lore: '',
    sourceType: 'Community Oral Lore',
    contributor: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => setSubmitted(true), 400);
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 pb-32 flex items-center justify-center">
      <div className="w-full max-w-3xl dharohar-card rounded-3xl p-8 md:p-12 relative border border-[#D4AF37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        
        {/* Subtle Decorative Golden Corner Accents */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60 rounded-tl-sm" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60 rounded-tr-sm" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60 rounded-bl-sm" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60 rounded-br-sm" />

        {submitted ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-[#F5D77F]" />
            </div>

            <span className="heritage-badge text-[#F5D77F] tracking-[0.25em]">
              {t('contribute_success_title')}
            </span>

            <h2 className="text-3xl md:text-5xl font-cinzel font-black text-[#FFF8E7] mt-2 mb-4">
              {t('contribute_success_title')}
            </h2>

            <p className="text-zinc-300 mb-10 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-sans">
              {t('contribute_success_msg')}
            </p>

            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  title: '',
                  category: 'Oral Tradition & Folklore',
                  location: '',
                  lore: '',
                  sourceType: 'Community Oral Lore',
                  contributor: ''
                });
              }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] px-8 py-3.5 rounded-full font-bold text-xs heritage-badge hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
            >
              {t('contribute_another')}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <span className="w-8 h-[1.5px] bg-[#D4AF37]" />
                <span className="heritage-badge text-[#F5D77F] tracking-[0.25em]">
                  {t('contribute_badge')}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-cinzel font-black text-[#FFF8E7] leading-tight mb-3">
                {t('contribute_title')}
              </h1>

              <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
                {t('contribute_subtitle')}
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_name_label')}
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder={t('contribute_name_placeholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-600" 
                  />
                </div>

                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_cat_label')}
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all"
                  >
                    <option value="Oral Tradition & Folklore">{translateCategory('Folk Traditions & Lore')}</option>
                    <option value="Monuments & Temples">{translateCategory('Monuments & Temples')}</option>
                    <option value="Classical Dance & Music">{translateCategory('Classical Dance & Music')}</option>
                    <option value="Festivals & Rituals">{translateCategory('Festivals & Rituals')}</option>
                    <option value="Culinary Heritage">{translateCategory('Culinary Heritage')}</option>
                    <option value="Handicrafts & Handlooms">{translateCategory('Handicrafts & Handlooms')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_loc_label')}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required 
                      type="text" 
                      placeholder={t('contribute_loc_placeholder')}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-600" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_source_label')}
                  </label>
                  <select 
                    value={formData.sourceType}
                    onChange={(e) => setFormData({...formData, sourceType: e.target.value})}
                    className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all"
                  >
                    <option value="Community Oral Lore">{t('contribute_source_opt1')}</option>
                    <option value="Temple Chronicle / Pothi">{t('contribute_source_opt2')}</option>
                    <option value="Local Artisan Tradition">{t('contribute_source_opt3')}</option>
                    <option value="Field Research">{t('contribute_source_opt4')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                  {t('contribute_desc_label')}
                </label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder={t('contribute_desc_placeholder')}
                  value={formData.lore}
                  onChange={(e) => setFormData({...formData, lore: e.target.value})}
                  className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl p-5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-600 resize-none font-sans leading-relaxed" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_contributor_label')}
                  </label>
                  <input 
                    type="text" 
                    placeholder={t('contribute_contributor_placeholder')}
                    value={formData.contributor}
                    onChange={(e) => setFormData({...formData, contributor: e.target.value})}
                    className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl px-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-600" 
                  />
                </div>

                <div>
                  <label className="block heritage-badge text-[#F5D77F] mb-2 text-[10px]">
                    {t('contribute_photo_label')}
                  </label>
                  <div className="relative">
                    <UploadCloud className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="url" 
                      placeholder={t('contribute_photo_placeholder')}
                      className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-600" 
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-[#08080C] font-bold text-xs heritage-badge shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Feather className="w-4 h-4" />
                  <span>{t('contribute_submit')}</span>
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
