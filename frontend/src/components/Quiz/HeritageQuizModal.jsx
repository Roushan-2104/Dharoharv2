import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE = 'http://localhost:3000';

const CATEGORIES = [
  { id: 'all', name: 'All Domains', nameHi: 'समग्र धरोहर', nameOr: 'ସମସ୍ତ ବିଭାଗ' },
  { id: 'architecture', name: 'Architecture & Temples', nameHi: 'स्थापत्य एवं मंदिर', nameOr: 'ସ୍ଥାପତ୍ୟ ଏବଂ ମନ୍ଦିର' },
  { id: 'arts', name: 'Classical Arts & Crafts', nameHi: 'शास्त्रीय कला व शिल्प', nameOr: 'ଶାସ୍ତ୍ରୀୟ କଳା ଓ ହସ୍ତଶିଳ୍ପ' },
  { id: 'cuisine', name: 'Sacred Food & Lore', nameHi: 'पवित्र प्रसाद व पाक', nameOr: 'ପବିତ୍ର ପ୍ରସାଦ ଓ ଖାଦ୍ୟ' },
  { id: 'history', name: 'Dynasties & Legends', nameHi: 'राजवंश व इतिहास', nameOr: 'ରାଜବଂଶ ଓ ଇତିହାସ' },
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
    const shareText = `I scored ${score}/${(questions.length || 1) * 10} in the Dharohar Heritage Quiz! Test your knowledge on India's living heritage at Dharohar!`;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)]">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-paper text-ink overflow-hidden">

        {/* Header */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 flex items-start justify-between gap-6">
          <div>
            <h2 className="font-display font-bold tracking-display text-4xl md:text-5xl text-ink">
              {isHi ? 'धरोहर ज्ञान क्विज़' : isOr ? 'ଐତିହ୍ୟ ଜ୍ଞାନ କୁଇଜ୍' : 'Heritage Lore Challenge'}
            </h2>
            <p className="mt-2 text-base text-ink-2">
              {isHi
                ? 'प्राचीन स्थापत्य, लोक संस्कृति, पाक परंपरा और ऐतिहासिक गाथाओं की परीक्षा'
                : isOr
                ? 'ପ୍ରାଚୀନ ସ୍ଥାପତ୍ୟ, ଲୋକ ସଂସ୍କୃତି, ପାରମ୍ପରିକ ଖାଦ୍ୟ ଓ ଐତିହ୍ୟର ପରୀକ୍ଷା'
                : 'Test your mastery of sacred monuments, living crafts, and culinary folklore'}
            </p>
          </div>

          <button
            onClick={() => {
              setIsQuizOpen(false);
              setActiveQuizEntity(null);
            }}
            className="shrink-0 min-h-[44px] px-2 -mr-2 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
            aria-label="Close Quiz"
          >
            Close
          </button>
        </div>

        {/* Category Filter Tabs (Only shown when not locked to specific monument) */}
        {!activeQuizEntity && !isQuizCompleted && (
          <div className="px-6 md:px-8 border-b border-rule flex items-stretch overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const catName = isOr ? cat.nameOr : isHi ? cat.nameHi : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[44px] px-4 text-[15px] font-medium whitespace-nowrap transition-colors duration-short ease-out cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-paper'
                      : 'bg-paper text-ink hover:bg-paper-2'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 px-6 md:px-8 py-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-16">
              <p className="text-base text-muted">
                {isHi ? 'धरोहर प्रश्न बैंक लोड हो रहा है...' : isOr ? 'ଐତିହ୍ୟ ପ୍ରଶ୍ନାବଳୀ ଖୋଜାଯାଉଛି...' : 'Gathering Sacred Lore Questions...'}
              </p>
            </div>
          ) : isQuizCompleted ? (
            /* ========================================= */
            /* FINAL SCORE & CERTIFICATE SUMMARY SCREEN */
            /* ========================================= */
            <div className="flex flex-col">

              {/* Result band: the percentage is the hero */}
              <div className="bg-field text-field-ink px-6 md:px-8 py-8 -mx-6 md:-mx-8 -mt-6">
                <p className="text-[15px] font-medium text-field-ink">
                  {isHi ? 'अभिनंदन! क्विज़ पूर्ण' : isOr ? 'ଅଭିନନ୍ଦନ! କୁଇଜ୍ ସମ୍ପୂର୍ଣ୍ଣ' : 'Lore Mastery Achieved!'}
                </p>
                <p className="mt-2 font-display font-bold tracking-display text-8xl leading-none text-field-ink">
                  {submissionResult ? `${submissionResult.percentage}%` : `${Math.round((score / Math.max(1, questions.length * 10)) * 100)}%`}
                </p>
                <h3 className="mt-4 font-display font-bold tracking-display text-3xl text-field-ink">
                  {submissionResult
                    ? (isOr ? submissionResult.badgeTitleOr : isHi ? submissionResult.badgeTitleHi : submissionResult.badge)
                    : (isHi ? 'धरोहर अन्वेषक' : isOr ? 'ଐତିହ୍ୟ ଅନୁସନ୍ଧାନକାରୀ' : 'Cultural Heritage Explorer')}
                </h3>
              </div>

              {/* Performance Stats */}
              <dl className="grid grid-cols-3 gap-6 mt-8">
                <div>
                  <dt className="text-[15px] font-medium text-muted">{isHi ? 'अर्जित अंक' : isOr ? 'ପ୍ରାପ୍ତ ସ୍କୋର' : 'Points Earned'}</dt>
                  <dd className="mt-1 font-display font-bold tracking-display text-4xl text-ink">
                    {score} <span className="text-base font-sans font-normal text-muted">/ {questions.length * 10}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-[15px] font-medium text-muted">{isHi ? 'सही उत्तर' : isOr ? 'ସଠିକ୍ ଉତ୍ତର' : 'Correct'}</dt>
                  <dd className="mt-1 font-display font-bold tracking-display text-4xl text-ink">
                    {userAnswers.filter(a => a.isCorrect).length} <span className="text-base font-sans font-normal text-muted">/ {questions.length}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-[15px] font-medium text-muted">{isHi ? 'सर्वोत्तम स्ट्रीक' : isOr ? 'ସର୍ବୋଚ୍ଚ ଷ୍ଟ୍ରିକ୍' : 'Best Streak'}</dt>
                  <dd className="mt-1 font-display font-bold tracking-display text-4xl text-ink">
                    {maxStreak}
                  </dd>
                </div>
              </dl>

              {/* Digital Certificate Token */}
              {submissionResult && (
                <div className="mt-8 pt-5 border-t border-rule">
                  <p className="text-[15px] font-medium text-muted">
                    {isHi ? 'धरोहर डिजिटल प्रमाण-पत्र टोकन' : isOr ? 'ଐତିହ୍ୟ ଡିଜିଟାଲ୍ ସାର୍ଟିଫିକେଟ୍' : 'Knowledge Token'}
                  </p>
                  <p className="mt-1 text-base font-mono text-ink break-all">
                    {submissionResult.certificateId || `DHAROHAR-CERT-${Date.now().toString(36).toUpperCase()}`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <button
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
                >
                  {isHi ? 'पुनः खेलें' : isOr ? 'ପୁଣି ଖେଳନ୍ତୁ' : 'Play Another Round'}
                </button>

                <button
                  onClick={handleShareBadge}
                  className="min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                >
                  {copiedLink ? (isHi ? 'कॉपी हुआ!' : isOr ? 'କପି ହେଲା!' : 'Copied!') : (isHi ? 'शेयर करें' : isOr ? 'ସେୟାର କରନ୍ତୁ' : 'Share Lore Score')}
                </button>
              </div>

            </div>
          ) : currentQ ? (
            /* ========================================= */
            /* ACTIVE QUESTION PLAYING SCREEN            */
            /* ========================================= */
            <div className="flex flex-col gap-6">

              {/* Counter, streak and score */}
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-6">
                  <span className="text-[15px] font-medium text-muted">
                    {isHi ? 'प्रश्न' : isOr ? 'ପ୍ରଶ୍ନ' : 'Question'}{' '}
                    <span className="font-display font-bold text-xl text-ink">{currentIndex + 1}</span> / {questions.length}
                  </span>
                  {streak > 1 && (
                    <span className="text-[15px] font-medium text-muted">
                      {isHi ? 'स्ट्रीक' : isOr ? 'ଷ୍ଟ୍ରିକ୍' : 'Streak'}{' '}
                      <span className="font-display font-bold text-xl text-ink">{streak}</span>
                    </span>
                  )}
                </div>

                <span className="text-[15px] font-medium text-muted">
                  {isHi ? 'अंक:' : isOr ? 'ସ୍କୋର:' : 'Score:'}{' '}
                  <span className="font-display font-bold text-xl text-ink">{score}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-paper-3 overflow-hidden">
                <div
                  className="h-full bg-ink"
                  style={{ width: `${((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Statement */}
              <div>
                <span className="text-[15px] font-medium text-muted block mb-2">
                  {getLocalizedField(currentQ, 'categoryLabel') || activeCatMeta.name}
                </span>
                <h3 className="font-display font-bold tracking-display text-3xl text-ink">
                  {getLocalizedField(currentQ, 'question')}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="flex flex-col border-t border-b border-rule divide-y divide-rule">
                {getLocalizedOptions(currentQ).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === correctIdx;
                  const isWrongChoice = isAnswerSubmitted && isSelected && !isCorrect;

                  let optionStyles = "bg-paper text-ink hover:bg-paper-2";

                  if (isSelected && !isAnswerSubmitted) {
                    optionStyles = "bg-ink text-paper";
                  }

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyles = "bg-field text-field-ink";
                    } else if (isWrongChoice) {
                      optionStyles = "bg-paper text-mark";
                    } else {
                      optionStyles = "bg-paper text-muted";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full min-h-[56px] px-4 py-3 text-left text-base transition-colors duration-short ease-out flex items-center justify-between gap-4 cursor-pointer disabled:cursor-default ${optionStyles}`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-display font-bold text-xl w-5 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={isWrongChoice ? 'line-through' : ''}>{opt}</span>
                      </span>

                      {isAnswerSubmitted && (isCorrect || isWrongChoice) && (
                        <span className="shrink-0 flex items-center gap-2 text-[15px] font-medium">
                          {isWrongChoice && <span>Your answer</span>}
                          {isCorrect && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Lore Fact (Revealed after answer submission) */}
              {isAnswerSubmitted && (
                <div className="bg-paper-2 p-5">
                  <p className="text-[15px] font-medium text-muted mb-2">
                    {isHi ? 'ऐतिहासिक तथ्य एवं रहस्य:' : isOr ? 'ଐତିହାସିକ ତଥ୍ୟ ଓ ରହସ୍ୟ:' : 'Sacred Lore & Architecture Fact:'}
                  </p>
                  <p className="text-base leading-relaxed text-ink-2">
                    {getLocalizedField(currentQ, 'explanation')}
                  </p>
                </div>
              )}

              {/* Action Buttons: Submit Answer or Next Question */}
              <div className="flex items-center justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isHi ? 'उत्तर लॉक करें' : isOr ? 'ଉତ୍ତର ଲକ୍ କରନ୍ତୁ' : 'Submit Answer'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
                  >
                    {currentIndex + 1 < questions.length ? (isHi ? 'अगला प्रश्न' : isOr ? 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ' : 'Next Question') : (isHi ? 'परिणाम देखें' : isOr ? 'ଫଳାଫଳ ଦେଖନ୍ତୁ' : 'View Lore Results')}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="py-12">
              <p className="text-base text-muted">{isHi ? 'कोई प्रश्न उपलब्ध नहीं है।' : isOr ? 'କୌଣସି ପ୍ରଶ୍ନ ଉପଲବ୍ଧ ନାହିଁ।' : 'No lore questions found for this topic.'}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
