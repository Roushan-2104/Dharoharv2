import React, { useState, useEffect } from 'react';
import { 
  X, Award, Sparkles, CheckCircle2, XCircle, ChevronRight, RotateCcw, 
  Flame, BookOpen, Trophy, Compass, ShieldCheck, Share2, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE = 'http://localhost:3000';

const CATEGORIES = [
  { id: 'all', name: 'All Domains', nameHi: 'समग्र धरोहर', nameOr: 'ସମସ୍ତ ବିଭାଗ', icon: '🏆', color: '#D4AF37' },
  { id: 'architecture', name: 'Architecture & Temples', nameHi: 'स्थापत्य एवं मंदिर', nameOr: 'ସ୍ଥାପତ୍ୟ ଏବଂ ମନ୍ଦିର', icon: '🏛️', color: '#0D9488' },
  { id: 'arts', name: 'Classical Arts & Crafts', nameHi: 'शास्त्रीय कला व शिल्प', nameOr: 'ଶାସ୍ତ୍ରୀୟ କଳା ଓ ହସ୍ତଶିଳ୍ପ', icon: '🎨', color: '#8B5CF6' },
  { id: 'cuisine', name: 'Sacred Food & Lore', nameHi: 'पवित्र प्रसाद व पाक', nameOr: 'ପବିତ୍ର ପ୍ରସାଦ ଓ ଖାଦ୍ୟ', icon: '🍲', color: '#EA580C' },
  { id: 'history', name: 'Dynasties & Legends', nameHi: 'राजवंश व इतिहास', nameOr: 'ରାଜବଂଶ ଓ ଇତିହାସ', icon: '⛵', color: '#10B981' },
];

export default function HeritageQuizModal() {
  const { 
    isQuizOpen, 
    setIsQuizOpen, 
    activeQuizEntity, 
    setActiveQuizEntity, 
    language, 
    t 
  } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isHi = language === 'hi';
  const isOr = language === 'or';

  // Fetch quiz questions from backend API
  useEffect(() => {
    if (!isQuizOpen) return;

    let isMounted = true;
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setUserAnswers([]);
    setIsQuizCompleted(false);
    setStreak(0);
    setMaxStreak(0);
    setSubmissionResult(null);

    const fetchUrl = activeQuizEntity 
      ? `${API_BASE}/api/quizzes/entity/${encodeURIComponent(activeQuizEntity)}`
      : `${API_BASE}/api/quizzes?category=${selectedCategory}&limit=5`;

    fetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error("Network error fetching quiz");
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        const qList = Array.isArray(data) ? data : (data.questions || []);
        setQuestions(qList);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using local fallback questions:", err);
        if (!isMounted) return;
        // Resilient emergency fallback
        setQuestions([
          {
            id: "fallback_1",
            category: "architecture",
            categoryLabel: "Monuments & Sacred Architecture",
            question: "How many carved stone wheels make up the Sun Temple Chariot at Konark?",
            questionHi: "कोणार्क सूर्य मंदिर के रथ पर कुल कितने नक्काशीदार पत्थर के पहिए हैं?",
            questionOr: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ରଥରେ କେତୋଟି ଖୋଦିତ ପଥର ଚକ ରହିଛି?",
            options: ["12 Wheels", "24 Wheels (12 Pairs)", "16 Wheels", "36 Wheels"],
            optionsHi: ["12 पहिए", "24 पहिए (12 जोड़े)", "16 पहिए", "36 पहिए"],
            optionsOr: ["୧୨ଟି ଚକ", "୨୪ଟି ଚକ (୧୨ ଯୋଡ଼ା)", "୧୬ଟି ଚକ", "୩୬ଟି ଚକ"],
            correctIndex: 1,
            points: 10,
            explanation: "The 24 wheels represent the 24 fortnights (Pakshas) of the Hindu solar calendar and act as precise sundials.",
            explanationHi: "ये 24 पहिए हिंदू सौर पंचांग के 24 पक्षों का प्रतिनिधित्व करते हैं और सूर्य की धूपघड़ी का कार्य करते हैं।",
            explanationOr: "ଏହି ୨୪ଟି ଚକ ବର୍ଷର ୨୪ଟି ପକ୍ଷର ପ୍ରତୀକ ଏବଂ ଏହା ସଠିକ୍ ସୂର୍ଯ୍ୟଘଣ୍ଟା ଭାବେ କାର୍ଯ୍ୟ କରେ।"
          }
        ]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isQuizOpen, selectedCategory, activeQuizEntity]);

  if (!isQuizOpen) return null;

  const currentQ = questions[currentIndex] || null;

  // Helper to extract localized text
  const getLocalizedField = (obj, field) => {
    if (!obj) return '';
    if (isOr && obj[`${field}Or`]) return obj[`${field}Or`];
    if (isHi && obj[`${field}Hi`]) return obj[`${field}Hi`];
    return obj[field] || '';
  };

  const getLocalizedOptions = (q) => {
    if (!q) return [];
    if (isOr && q.optionsOr && q.optionsOr.length) return q.optionsOr;
    if (isHi && q.optionsHi && q.optionsHi.length) return q.optionsHi;
    return q.options || [];
  };

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQ) return;

    const correctIdx = currentQ.correctIndex !== undefined 
      ? currentQ.correctIndex 
      : currentQ.correctAnswerIndex;

    const isCorrect = selectedOption === correctIdx;
    const gainedPoints = isCorrect ? (currentQ.points || 10) : 0;

    setIsAnswerSubmitted(true);
    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOptionIndex: selectedOption,
        isCorrect
      }
    ]);

    if (isCorrect) {
      setScore(prev => prev + gainedPoints);
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz Finished - Submit to Backend
      finishAndSubmitQuiz();
    }
  };

  const finishAndSubmitQuiz = () => {
    setIsQuizCompleted(true);
    setSubmitting(true);

    const totalPossibleScore = (questions.length || 1) * 10;
    const submissionPayload = {
      category: selectedCategory,
      score: score,
      total: totalPossibleScore,
      answers: userAnswers,
      userBadge: "Explorer"
    };

    fetch(`${API_BASE}/api/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionPayload)
    })
      .then(res => res.json())
      .then(data => {
        setSubmissionResult(data);
        setSubmitting(false);
      })
      .catch(err => {
        console.warn("Quiz submission error fallback:", err);
        const percentage = Math.round((score / Math.max(1, totalPossibleScore)) * 100);
        setSubmissionResult({
          success: true,
          score,
          total: totalPossibleScore,
          percentage,
          badge: percentage >= 80 ? "Grand Kalinga Scholar" : percentage >= 50 ? "Cultural Heritage Explorer" : "Heritage Apprentice",
          badgeTitleHi: percentage >= 80 ? "महा कलिंग इतिहासकार" : "धरोहर अन्वेषक",
          badgeTitleOr: percentage >= 80 ? "ମହା କଳିଙ୍ଗ ଐତିହାସିକ" : "ଐତିହ୍ୟ ଅନୁସନ୍ଧାନକାରୀ",
          certificateId: `DHAROHAR-${Date.now().toString(36).toUpperCase()}`
        });
        setSubmitting(false);
      });
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setUserAnswers([]);
    setIsQuizCompleted(false);
    setStreak(0);
    setSubmissionResult(null);
    // Trigger reshuffle by re-fetching
    const fetchUrl = activeQuizEntity 
      ? `${API_BASE}/api/quizzes/entity/${encodeURIComponent(activeQuizEntity)}`
      : `${API_BASE}/api/quizzes?category=${selectedCategory}&limit=5`;

    setLoading(true);
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        const qList = Array.isArray(data) ? data : (data.questions || []);
        setQuestions(qList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleShareBadge = () => {
    const shareText = `🎯 I scored ${score}/${(questions.length || 1) * 10} in the Dharohar Heritage Quiz! Test your knowledge on India's living heritage at Dharohar!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const correctIdx = currentQ 
    ? (currentQ.correctIndex !== undefined ? currentQ.correctIndex : currentQ.correctAnswerIndex) 
    : 0;

  const activeCatMeta = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#09090E]/95 border border-[#D4AF37]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-[#FFF8E7]">
        
        {/* Glowing Ambient Header Banner */}
        <div className="relative px-6 py-5 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#141224] via-[#0D0D18] to-[#141224] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black font-cinzel gold-gradient-text tracking-wide uppercase">
                  {isHi ? 'धरोहर ज्ञान क्विज़' : isOr ? 'ଐତିହ୍ୟ ଜ୍ଞାନ କୁଇଜ୍' : 'Heritage Lore Challenge'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40">
                  {isHi ? 'प्रमाणित ज्ञान' : isOr ? 'ପ୍ରାମାଣିକ' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isHi 
                  ? 'प्राचीन स्थापत्य, लोक संस्कृति, पाक परंपरा और ऐतिहासिक गाथाओं की परीक्षा' 
                  : isOr 
                  ? 'ପ୍ରାଚୀନ ସ୍ଥାପତ୍ୟ, ଲୋକ ସଂସ୍କୃତି, ପାରମ୍ପରିକ ଖାଦ୍ୟ ଓ ଐତିହ୍ୟର ପରୀକ୍ଷା' 
                  : 'Test your mastery of sacred monuments, living crafts, and culinary folklore'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsQuizOpen(false);
              setActiveQuizEntity(null);
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 flex items-center justify-center text-zinc-400 hover:text-[#F5D77F] transition-all cursor-pointer"
            aria-label="Close Quiz"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs (Only shown when not locked to specific monument) */}
        {!activeQuizEntity && !isQuizCompleted && (
          <div className="px-5 py-3 border-b border-[#D4AF37]/15 bg-[#0C0B14]/70 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const catName = isOr ? cat.nameOr : isHi ? cat.nameHi : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#08080C] shadow-[0_0_12px_rgba(212,175,55,0.4)] font-bold scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
              <p className="text-sm font-cinzel text-[#F5D77F] tracking-wide">
                {isHi ? 'धरोहर प्रश्न बैंक लोड हो रहा है...' : isOr ? 'ଐତିହ୍ୟ ପ୍ରଶ୍ନାବଳୀ ଖୋଜାଯାଉଛି...' : 'Gathering Sacred Lore Questions...'}
              </p>
            </div>
          ) : isQuizCompleted ? (
            /* ========================================= */
            /* FINAL SCORE & CERTIFICATE SUMMARY SCREEN */
            /* ========================================= */
            <div className="py-4 flex flex-col items-center text-center animate-fade-in-up">
              
              {/* Score Celebration Emblem */}
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37]/20 via-[#F5D77F]/30 to-[#D4AF37]/10 border-2 border-[#D4AF37] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <Trophy className="w-9 h-9 text-[#F5D77F] mb-1 animate-bounce" />
                  <span className="text-xs font-black text-[#F5D77F] tracking-wider">
                    {submissionResult ? `${submissionResult.percentage}%` : `${Math.round((score / Math.max(1, questions.length * 10)) * 100)}%`}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#10B981] border border-white/20 flex items-center justify-center text-xs shadow-md">
                  ✨
                </div>
              </div>

              {/* Title & Badge */}
              <h3 className="text-2xl font-black font-cinzel gold-gradient-text tracking-wider uppercase mb-1">
                {isHi ? 'अभिनंदन! क्विज़ पूर्ण' : isOr ? 'ଅଭିନନ୍ଦନ! କୁଇଜ୍ ସମ୍ପୂର୍ଣ୍ଣ' : 'Lore Mastery Achieved!'}
              </h3>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5D77F] text-sm font-bold my-3 shadow-inner">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {submissionResult 
                    ? (isOr ? submissionResult.badgeTitleOr : isHi ? submissionResult.badgeTitleHi : submissionResult.badge) 
                    : (isHi ? 'धरोहर अन्वेषक' : isOr ? 'ଐତିହ୍ୟ ଅନୁସନ୍ଧାନକାରୀ' : 'Cultural Heritage Explorer')}
                </span>
              </div>

              {/* Performance Stats Grid */}
              <div className="w-full grid grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-2xl bg-[#141224] border border-[#D4AF37]/20 flex flex-col items-center">
                  <span className="text-xs text-zinc-400">{isHi ? 'अर्जित अंक' : isOr ? 'ପ୍ରାପ୍ତ ସ୍କୋର' : 'Points Earned'}</span>
                  <span className="text-xl font-black text-[#F5D77F] mt-1">{score} <span className="text-xs text-zinc-500 font-normal">/ {questions.length * 10}</span></span>
                </div>

                <div className="p-3 rounded-2xl bg-[#141224] border border-[#D4AF37]/20 flex flex-col items-center">
                  <span className="text-xs text-zinc-400">{isHi ? 'सही उत्तर' : isOr ? 'ସଠିକ୍ ଉତ୍ତର' : 'Correct'}</span>
                  <span className="text-xl font-black text-[#10B981] mt-1">
                    {userAnswers.filter(a => a.isCorrect).length} <span className="text-xs text-zinc-500 font-normal">/ {questions.length}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#141224] border border-[#D4AF37]/20 flex flex-col items-center">
                  <span className="text-xs text-zinc-400">{isHi ? 'सर्वोत्तम स्ट्रीक' : isOr ? 'ସର୍ବୋଚ୍ଚ ଷ୍ଟ୍ରିକ୍' : 'Best Streak'}</span>
                  <span className="text-xl font-black text-[#EA580C] mt-1 flex items-center gap-1">
                    🔥 {maxStreak}
                  </span>
                </div>
              </div>

              {/* Digital Certificate Badge Token */}
              {submissionResult && (
                <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#141224] via-[#10101C] to-[#141224] border border-[#D4AF37]/30 text-left my-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-lg">
                      📜
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                        {isHi ? 'धरोहर डिजिटल प्रमाण-पत्र टोकन' : isOr ? 'ଐତିହ୍ୟ ଡିଜିଟାଲ୍ ସାର୍ଟିଫିକେଟ୍' : 'Verified Knowledge Token'}
                      </span>
                      <p className="text-xs font-mono text-zinc-300 font-semibold tracking-wider">
                        {submissionResult.certificateId || `DHAROHAR-CERT-${Date.now().toString(36).toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] text-[#08080C] font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-102 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHi ? 'पुनः खेलें' : isOr ? 'ପୁଣି ଖେଳନ୍ତୁ' : 'Play Another Round'}</span>
                </button>

                <button
                  onClick={handleShareBadge}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#141224] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] font-semibold text-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? (isHi ? 'कॉपी हुआ!' : isOr ? 'କପି ହେଲା!' : 'Copied!') : (isHi ? 'शेयर करें' : isOr ? 'ସେୟାର କରନ୍ତୁ' : 'Share Lore Score')}</span>
                </button>
              </div>

            </div>
          ) : currentQ ? (
            /* ========================================= */
            /* ACTIVE QUESTION PLAYING SCREEN            */
            /* ========================================= */
            <div className="flex flex-col gap-5">
              
              {/* Top Progress & Score Stats Bar */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F5D77F]">
                    {isHi ? 'प्रश्न' : isOr ? 'ପ୍ରଶ୍ନ' : 'Question'} {currentIndex + 1} / {questions.length}
                  </span>
                  {streak > 1 && (
                    <span className="px-2.5 py-1 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/40 text-[#EA580C] flex items-center gap-1 animate-pulse">
                      🔥 {streak} {isHi ? 'स्ट्रीक' : isOr ? 'ଷ୍ଟ୍ରିକ୍' : 'Streak'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{isHi ? 'अंक:' : isOr ? 'ସ୍କୋର:' : 'Score:'}</span>
                  <span className="text-[#F5D77F] font-black text-sm">{score}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] transition-all duration-300"
                  style={{ width: `${((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Statement */}
              <div className="p-4 md:p-5 rounded-2xl bg-[#141224]/90 border border-[#D4AF37]/25 shadow-inner">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]/80 mb-1.5 block">
                  {getLocalizedField(currentQ, 'categoryLabel') || activeCatMeta.name}
                </span>
                <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {getLocalizedField(currentQ, 'question')}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="flex flex-col gap-2.5">
                {getLocalizedOptions(currentQ).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === correctIdx;
                  
                  let optionStyles = "bg-[#101018] hover:bg-[#161626] border-white/10 hover:border-[#D4AF37]/40 text-zinc-200";

                  if (isSelected && !isAnswerSubmitted) {
                    optionStyles = "bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFF8E7] shadow-[0_0_12px_rgba(212,175,55,0.25)]";
                  }

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyles = "bg-[#10B981]/25 border-[#10B981] text-[#A7F3D0] font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    } else if (isSelected && !isCorrect) {
                      optionStyles = "bg-[#E11D48]/25 border-[#E11D48] text-[#FECDD3]";
                    } else {
                      optionStyles = "bg-[#0B0B10]/50 border-white/5 text-zinc-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isAnswerSubmitted && isCorrect
                            ? 'bg-[#10B981] text-white'
                            : isAnswerSubmitted && isSelected && !isCorrect
                            ? 'bg-[#E11D48] text-white'
                            : isSelected
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-white/10 text-zinc-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswerSubmitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#E11D48]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Lore Fact Box (Revealed after answer submission) */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141224] to-[#1A182E] border border-[#D4AF37]/35 text-xs text-zinc-200 animate-fade-in">
                  <div className="flex items-center gap-2 text-[#F5D77F] font-bold mb-1.5">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isHi ? 'ऐतिहासिक तथ्य एवं रहस्य:' : isOr ? 'ଐତିହାସିକ ତଥ୍ୟ ଓ ରହସ୍ୟ:' : 'Sacred Lore & Architecture Fact:'}</span>
                  </div>
                  <p className="leading-relaxed text-zinc-300">
                    {getLocalizedField(currentQ, 'explanation')}
                  </p>
                </div>
              )}

              {/* Action Buttons: Submit Answer or Next Question */}
              <div className="mt-2 flex items-center justify-end gap-3">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className={`py-3 px-6 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                      selectedOption !== null
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] text-[#08080C] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-102 cursor-pointer'
                        : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{isHi ? 'उत्तर लॉक करें' : isOr ? 'ଉତ୍ତର ଲକ୍ କରନ୍ତୁ' : 'Submit Answer'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] text-[#08080C] font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-102 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
                  >
                    <span>{currentIndex + 1 < questions.length ? (isHi ? 'अगला प्रश्न' : isOr ? 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ' : 'Next Question') : (isHi ? 'परिणाम देखें' : isOr ? 'ଫଳାଫଳ ଦେଖନ୍ତୁ' : 'View Lore Results')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400">
              <HelpCircle className="w-10 h-10 text-[#D4AF37] mx-auto mb-2 opacity-50" />
              <p>{isHi ? 'कोई प्रश्न उपलब्ध नहीं है।' : isOr ? 'କୌଣସି ପ୍ରଶ୍ନ ଉପଲବ୍ଧ ନାହିଁ।' : 'No lore questions found for this topic.'}</p>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-6 py-2.5 bg-[#07070B] border-t border-[#D4AF37]/15 flex items-center justify-between text-[11px] text-zinc-500 font-sans">
          <span>🏛️ Dharohar Digital Living Chronicle</span>
          <span className="text-[#D4AF37]/80">AI & Oral Tradition Verified</span>
        </div>

      </div>
    </div>
  );
}
