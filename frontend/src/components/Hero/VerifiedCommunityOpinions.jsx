import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, Star, MessageSquareQuote, Lightbulb, 
  Send, User, ThumbsUp, Sparkles, ShieldCheck, Plus, X 
} from 'lucide-react';
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

  return (
    <div className="p-5 border-b border-[#D4AF37]/15 bg-[#0B0A14]">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
            <MessageSquareQuote className="w-4 h-4 text-[#F5D77F]" />
          </div>
          <div>
            <h4 className="font-cinzel text-sm font-bold text-[#FFF8E7] leading-none flex items-center gap-1.5">
              <span>{isHi ? 'सत्यापित जन-अनुभव व समीक्षाएं' : isOr ? 'ପ୍ରମାଣିତ ଯାତ୍ରୀ ଅନୁଭୂତି ଓ ମତାମତ' : 'Verified Community Voices & Reviews'}</span>
            </h4>
            <p className="text-[10px] text-[#D4AF37]/80 font-sans mt-0.5">
              {isHi ? 'इतिहासकारों, स्थानीय निवासियों व यात्रियों के प्रामाणिक अनुभव' : isOr ? 'ଐତିହାସିକ, ସ୍ଥାନୀୟ ବାସିନ୍ଦା ଓ ଯାତ୍ରୀଙ୍କ ସତ୍ୟାପିତ ମତାମତ' : 'Real, verified insights from cultural scholars, locals & explorers'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F5D77F] border border-[#D4AF37]/35 text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          {isFormOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span>{isFormOpen ? (isHi ? 'बंद करें' : 'Close') : (isHi ? 'समीक्षा जोड़ें' : isOr ? 'ମତାମତ ଯୋଡ଼ନ୍ତୁ' : 'Add Review')}</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-3.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Review Dropdown Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-2xl bg-[#12111E] border border-[#D4AF37]/40 space-y-3 animate-fade-in shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-cinzel text-xs font-bold text-[#FFF8E7]">
              {isHi ? 'अपना प्रामाणिक अनुभव साझा करें' : 'Share Your Verified Heritage Experience'}
            </span>
            <span className="text-[9.5px] text-zinc-400">
              for {translateEntityName(activeEntity.name, activeEntity.location_context)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={authorName}
                maxLength={80}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#090812] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Who are you?</label>
              <select
                value={roleTag}
                onChange={e => setRoleTag(e.target.value)}
                className="w-full bg-[#090812] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Cultural Traveler">Cultural Traveler</option>
                <option value="Local Resident">Local Resident</option>
                <option value="Archaeological Scholar">Archaeological / History Scholar</option>
                <option value="Sacred Heritage Pilgrim">Sacred Heritage Pilgrim</option>
                <option value="Hereditary Artisan">Hereditary Artisan / Artist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 mb-1">Your Experience, Lore & Insights *</label>
            <textarea
              required
              rows={3}
              value={opinionText}
              maxLength={2000}
              onChange={e => setOpinionText(e.target.value)}
              placeholder="What makes this place special? What architecture, rituals, or story did you discover?"
              className="w-full bg-[#090812] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-amber-400/90 mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Practical Travel Tip for Visitors (Optional)</span>
            </label>
            <input
              type="text"
              value={travelTip}
              maxLength={500}
              onChange={e => setTravelTip(e.target.value)}
              placeholder="e.g. Visit at sunrise; hire ASI certified guide at East Gate"
              className="w-full bg-[#090812] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Opinions List */}
      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="p-3.5 rounded-2xl bg-[#141220] border border-white/5 h-20" />
          ))}
        </div>
      ) : opinions.length === 0 ? (
        <div className="text-center py-5 text-xs text-zinc-500 italic">
          No verified opinions yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-3">
          {opinions.map((op, idx) => {
            const opText = isHi ? (op.opinion_text_hi || op.opinion_text) : isOr ? (op.opinion_text_or || op.opinion_text) : op.opinion_text;
            const opTip = isHi ? (op.travel_tip_hi || op.travel_tip) : isOr ? (op.travel_tip_or || op.travel_tip) : op.travel_tip;
            const opRole = isHi ? (op.role_tag_hi || op.role_tag) : isOr ? (op.role_tag_or || op.role_tag) : op.role_tag;
            const likes = (op.likes_count || 1) + (likedIds[op.id || idx] || 0);

            return (
              <div 
                key={op.id || idx}
                className="p-3.5 rounded-2xl bg-[#131122] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 transition-all shadow-sm"
              >
                {/* Author & Verification Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B45309] text-[#08080C] font-bold text-xs flex items-center justify-center shrink-0">
                      {op.author_name ? op.author_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-cinzel text-xs font-bold text-[#FFF8E7] truncate">
                          {op.author_name}
                        </span>
                        {op.is_verified !== false && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" title="Verified Heritage Story" />
                        )}
                      </div>
                      <span className="text-[9.5px] text-[#F5D77F]/80 font-medium block truncate">
                        {opRole || 'Verified Explorer'} • <span className="text-zinc-500">{op.visit_time || 'Verified Visit'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {Array.from({ length: Math.min(5, op.rating || 5) }).map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Opinion Text */}
                <p className="text-xs text-zinc-200 font-sans leading-relaxed mb-2.5">
                  "{opText}"
                </p>

                {/* Practical Tip Badge */}
                {opTip && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-1.5 mb-2 text-[11px] text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-snug"><strong className="text-amber-200">Tip:</strong> {opTip}</span>
                  </div>
                )}

                {/* Footer / Likes */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-white/5">
                  {op.is_verified !== false ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Dharohar Verified</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-medium">Community Review</span>
                  )}

                  <button
                    onClick={() => handleLike(op.id || idx)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-[#F5D77F] transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({likes})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
