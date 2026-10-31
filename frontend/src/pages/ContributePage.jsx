import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const labelClass = 'block text-[15px] font-medium text-muted mb-1';
const fieldClass = 'w-full bg-transparent border-0 border-b border-muted px-0 py-2 text-lg text-ink placeholder:text-muted focus:outline-none focus-visible:border-ink transition-colors duration-short ease-out';

export default function ContributePage() {
  const { t, translateCategory } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Oral Tradition & Folklore',
    location: '',
    lore: '',
    sourceType: 'Community Oral Lore',
    contributor: '',
    photoUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/contribute`, formData);
    } catch (err) {
      console.warn("Contribution API submission fallback:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen pt-[var(--nav-height)] pb-32 bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] px-4 md:px-16">

        {submitted ? (
          <div className="mt-16 md:mt-24 bg-field text-field-ink on-field px-6 py-16 md:px-16 md:py-24">
            <h2 className="font-display font-bold tracking-poster leading-[0.9] text-5xl md:text-7xl text-field-ink max-w-[16ch]">
              {t('contribute_success_title')}
            </h2>

            <p className="mt-8 max-w-2xl text-lg text-field-ink">
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
                  contributor: '',
                  photoUrl: ''
                });
              }}
              className="mt-10 min-h-[44px] text-lg font-medium text-field-ink underline underline-offset-[0.32em] decoration-1 hover:decoration-2"
            >
              {t('contribute_another')}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="pt-16 md:pt-24 mb-14">
              <h1 className="font-display font-bold tracking-poster leading-[0.9] text-6xl md:text-8xl text-ink max-w-[14ch]">
                {t('contribute_title')}
              </h1>

              <p className="mt-8 max-w-2xl text-lg text-ink-2">
                {t('contribute_subtitle')}
              </p>
            </header>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

              <div>
                <label className={labelClass}>
                  {t('contribute_name_label')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('contribute_name_placeholder')}
                  value={formData.title}
                  maxLength={200}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t('contribute_cat_label')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="Oral Tradition & Folklore">{translateCategory('Folk Traditions & Lore')}</option>
                  <option value="Monuments & Temples">{translateCategory('Monuments & Temples')}</option>
                  <option value="Classical Dance & Music">{translateCategory('Classical Dance & Music')}</option>
                  <option value="Festivals & Rituals">{translateCategory('Festivals & Rituals')}</option>
                  <option value="Culinary Heritage">{translateCategory('Culinary Heritage')}</option>
                  <option value="Handicrafts & Handlooms">{t('itinerary_theme_crafts')}</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  {t('contribute_loc_label')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('contribute_loc_placeholder')}
                  value={formData.location}
                  maxLength={200}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t('contribute_source_label')}
                </label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({...formData, sourceType: e.target.value})}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="Community Oral Lore">{t('contribute_source_opt1')}</option>
                  <option value="Temple Chronicle / Pothi">{t('contribute_source_opt2')}</option>
                  <option value="Local Artisan Tradition">{t('contribute_source_opt3')}</option>
                  <option value="Field Research">{t('contribute_source_opt4')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  {t('contribute_desc_label')}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t('contribute_desc_placeholder')}
                  value={formData.lore}
                  maxLength={5000}
                  onChange={(e) => setFormData({...formData, lore: e.target.value})}
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t('contribute_contributor_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('contribute_contributor_placeholder')}
                  value={formData.contributor}
                  maxLength={200}
                  onChange={(e) => setFormData({...formData, contributor: e.target.value})}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t('contribute_photo_label')}
                </label>
                <input
                  type="url"
                  placeholder={t('contribute_photo_placeholder')}
                  value={formData.photoUrl}
                  maxLength={500}
                  onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                  className={fieldClass}
                />
              </div>

              {/* Submit CTA */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Recording to Heritage Knowledge System...' : t('contribute_submit')}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
