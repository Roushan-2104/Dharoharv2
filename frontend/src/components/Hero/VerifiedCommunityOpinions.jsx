import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function VerifiedCommunityOpinions({ activeEntity }) {
  const { language, translateEntityName } = useLanguage();
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState({});

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [roleTag, setRoleTag] = useState('Cultural Traveler');
  const [rating, setRating] = useState(5);
  const [visitTime, setVisitTime] = useState('Recent Visit');
  const [opinionText, setOpinionText] = useState('');
  const [travelTip, setTravelTip] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isHi = language === 'hi';
  const isOr = language === 'or';

  useEffect(() => {
    if (!activeEntity?.id) return;

    setLoading(true);
    setSuccessMsg('');
    axios.get(`${API_BASE_URL}/api/entities/${activeEntity.id}/opinions`)
      .then(res => {
        setOpinions(res.data || []);
      })
      .catch(err => {
        console.warn("Failed to fetch opinions:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeEntity?.id]);

  const handleLike = (id) => {
    setLikedIds(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !opinionText.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        authorName: authorName.trim(),
        roleTag: roleTag || 'Cultural Traveler',
        rating: Number(rating) || 5,
        visitTime: visitTime || 'Recent Visit',
        opinionText: opinionText.trim(),
        travelTip: travelTip.trim()
      };

      const res = await axios.post(`${API_BASE_URL}/api/entities/${activeEntity.id}/opinions`, payload);
      
      if (res.data?.opinion) {
        setOpinions(prev => [res.data.opinion, ...prev]);
      }

      setAuthorName('');
      setOpinionText('');
      setTravelTip('');
      setIsFormOpen(false);
      setSuccessMsg(
        isHi 
          ? 'आपका अनुभव सफलतापूर्वक जुड़ गया है!' 
          : isOr 
          ? 'ଆପଣଙ୍କ ଅନୁଭୂତି ସଫଳତାର ସହ ଯୋଡ଼ାଗଲା!' 
          : 'Your experience has been published to Dharohar!'
      );
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error("Failed to submit opinion:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeEntity) return null;

  const textLink = 'min-h-[44px] inline-flex items-center font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer';
  const fieldClass = 'w-full bg-transparent border-0 border-b border-muted px-0 py-2 text-[17px] text-ink placeholder:text-muted focus:outline-none focus-visible:border-ink';
  const labelClass = 'block text-[15px] font-medium text-muted';

  return (
    <section className="mt-14">

      <div className="flex items-end justify-between gap-4">
        <h3 className="text-3xl">
          {isHi ? 'जन-अनुभव व समीक्षाएं' : isOr ? 'ଯାତ୍ରୀ ଅନୁଭୂତି ଓ ମତାମତ' : 'Community voices'}
        </h3>
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          aria-expanded={isFormOpen}
          className={`${textLink} shrink-0`}
        >
          {isFormOpen ? (isHi ? 'बंद करें' : 'Close') : (isHi ? 'समीक्षा जोड़ें' : isOr ? 'ମତାମତ ଯୋଡ଼ନ୍ତୁ' : 'Add a review')}
        </button>
      </div>

      {successMsg && (
        <p role="status" className="mt-4 bg-paper-2 px-4 py-3 text-ink">{successMsg}</p>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mt-6 bg-paper-2 px-5 py-6 flex flex-col gap-5">
          <p className="font-display font-bold tracking-display text-xl">
            {isHi ? 'अपना अनुभव साझा करें' : 'Share your experience'}
            <span className="block mt-1 font-sans font-normal tracking-normal text-[15px] text-muted">
              {translateEntityName(activeEntity.name, activeEntity.location_context)}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className={labelClass}>Your name *
              <input
                type="text"
                required
                value={authorName}
                maxLength={80}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`mt-1 ${fieldClass}`}
              />
            </label>

            <label className={labelClass}>Who are you?
              <select
                value={roleTag}
                onChange={e => setRoleTag(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              >
                <option value="Cultural Traveler">Cultural Traveler</option>
                <option value="Local Resident">Local Resident</option>
                <option value="Archaeological Scholar">Archaeological / History Scholar</option>
                <option value="Sacred Heritage Pilgrim">Sacred Heritage Pilgrim</option>
                <option value="Hereditary Artisan">Hereditary Artisan / Artist</option>
              </select>
            </label>
          </div>

          <label className={labelClass}>Your experience, lore and insights *
            <textarea
              required
              rows={3}
              value={opinionText}
              maxLength={2000}
              onChange={e => setOpinionText(e.target.value)}
              placeholder="What makes this place special? What architecture, rituals, or story did you discover?"
              className={`mt-1 ${fieldClass}`}
            />
          </label>

          <label className={labelClass}>A practical tip for visitors (optional)
            <input
              type="text"
              value={travelTip}
              maxLength={500}
              onChange={e => setTravelTip(e.target.value)}
              placeholder="e.g. Visit at sunrise; hire ASI certified guide at East Gate"
              className={`mt-1 ${fieldClass}`}
            />
          </label>

          <div className="flex items-center gap-6">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Post review'}
            </button>
            <button type="button" onClick={() => setIsFormOpen(false)} className={textLink}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-4 text-muted" role="status">Loading reviews</p>
      ) : opinions.length === 0 ? (
        <p className="mt-4 text-muted">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="mt-5">
          {opinions.map((op, idx) => {
            const opText = isHi ? (op.opinion_text_hi || op.opinion_text) : isOr ? (op.opinion_text_or || op.opinion_text) : op.opinion_text;
            const opTip = isHi ? (op.travel_tip_hi || op.travel_tip) : isOr ? (op.travel_tip_or || op.travel_tip) : op.travel_tip;
            const opRole = isHi ? (op.role_tag_hi || op.role_tag) : isOr ? (op.role_tag_or || op.role_tag) : op.role_tag;
            const likes = (op.likes_count || 1) + (likedIds[op.id || idx] || 0);
            const rating = Math.min(5, op.rating || 5);

            return (
              <li key={op.id || idx} className="py-5 border-t border-rule">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display font-bold tracking-display text-xl leading-tight">{op.author_name}</p>
                  <p className="shrink-0 text-[15px] text-muted">{rating} of 5</p>
                </div>
                <p className="mt-1 text-[15px] text-muted">
                  {opRole || 'Explorer'}{op.visit_time ? `, ${op.visit_time}` : ''}
                </p>

                <blockquote className="mt-3 text-[17px] leading-relaxed text-ink-2">{opText}</blockquote>

                {opTip && (
                  <p className="mt-3 bg-paper-2 px-4 py-3 text-[16px] text-ink-2">
                    <span className="font-medium text-ink">Tip: </span>{opTip}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-4 text-[15px]">
                  <span className="text-muted">
                    {op.is_verified !== false ? 'Curated by Dharohar' : 'Community review'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLike(op.id || idx)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 text-ink hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    <span>Helpful, {likes}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
}
