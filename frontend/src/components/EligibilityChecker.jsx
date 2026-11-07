import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Heart, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ELIGIBILITY_QUESTIONS } from '../data/eligibilityQuestions';
import { HUMAN_BODY_PATH } from '../data/humanSilhouettePath';

const EligibilityChecker = () => {
  const { isAuthenticated, user } = useAuth();
  // Mode: 1 = initial banner (no human), 2 = question flow (with human), 3 = analysis completion (with human)
  const [step, setStep] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFading, setIsFading] = useState(false);

  const totalQuestions = ELIGIBILITY_QUESTIONS.length;
  const currentQ = ELIGIBILITY_QUESTIONS[questionIndex];

  // Calculate health percentage
  const answeredIds = Object.keys(answers);
  const correctCount = answeredIds.reduce((acc, id) => {
    const q = ELIGIBILITY_QUESTIONS.find((item) => item.id === Number(id));
    return q && answers[id] === q.expectedAnswer ? acc + 1 : acc;
  }, 0);

  const healthPercentage =
    step === 1
      ? 0
      : Math.round((correctCount / totalQuestions) * 100);

  const handleStart = () => {
    setIsFading(true);
    setTimeout(() => {
      setStep(2);
      setQuestionIndex(0);
      setAnswers({});
      setIsFading(false);
    }, 180);
  };

  const handleAnswer = (choice) => {
    const updated = { ...answers, [currentQ.id]: choice };
    setAnswers(updated);

    setIsFading(true);
    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        setQuestionIndex((prev) => prev + 1);
      } else {
        setStep(3);
      }
      setIsFading(false);
    }, 180);
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setIsFading(true);
      setTimeout(() => {
        setQuestionIndex((prev) => prev - 1);
        setIsFading(false);
      }, 150);
    } else {
      setStep(1);
    }
  };

  const handleRestart = () => {
    setIsFading(true);
    setTimeout(() => {
      setStep(1);
      setQuestionIndex(0);
      setAnswers({});
      setIsFading(false);
    }, 180);
  };

  return (
    <section className="rf-home-eligibility-section" id="check-eligibility">
      <div className="rf-new-container">
        {step === 1 ? (
          /* ── STEP 1: INITIAL STATE ON HOME PAGE (NO HUMAN FIGURE, BEAUTIFULLY DESIGNED SECTION) ── */
          <div className="rf-elig-landing-wrap">
            <h2 className="rf-home-eligibility-title">
              Who Can <span style={{ color: '#DC2626' }}>Donate Blood?</span>
            </h2>

            <p className="rf-home-eligibility-desc">
              Donating blood is a simple, safe and life-saving act. But not everyone may be eligible to donate.
            </p>

            <p className="rf-home-eligibility-desc" style={{ marginTop: 2 }}>
              There are several parameters that determine the eligibility of an individual to donate blood. Guidelines laid down by the{' '}
              <a
                href="https://en.wikipedia.org/wiki/Blood_donation_in_India"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0284C7', textDecoration: 'underline' }}
              >
                Ministry of Health, Government of India
              </a>{' '}
              have to be followed by blood banks for donor screening.
            </p>

            {/* Action Buttons: Check Eligibility & Find Nearby Camps (kept in ONE LINE on responsive) */}
            <div className="rf-elig-landing-btns">
              <button
                type="button"
                onClick={handleStart}
                className="rf-btn-elig-primary"
              >
                Check Eligibility
              </button>

              <Link
                to={isAuthenticated ? (user?.role === 'donor' ? '/donor' : '/donor') : '/register'}
                className="rf-btn-elig-secondary"
              >
                Find Nearby Camps
              </Link>
            </div>

            {/* Notes for Consideration (5) Card from Statutory Guidelines */}

          </div>
        ) : (
          /* ── STEP 2 & 3: INTERACTIVE FLOW (SHOWS HUMAN FIGURE WHEN USER CLICKS CHECK ELIGIBILITY) ── */
          <div className="rf-home-eligibility-grid">
            {/* Left Column: Questionnaire or Results */}
            <div className={`rf-home-eligibility-content ${isFading ? 'rf-fading-content' : ''}`}>
              {step === 2 && currentQ && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="rf-elig-question-meta">
                      <span className="rf-elig-meta-badge">
                        Question {questionIndex + 1} of {totalQuestions}
                      </span>
                      <span className="rf-elig-meta-cat">
                        {currentQ.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                      title="Exit Quiz"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <h2 className="rf-home-eligibility-title" style={{ fontSize: 'clamp(20px, 3.8vw, 26px)', marginBottom: 12 }}>
                    {currentQ.question}
                  </h2>

                  <p className="rf-home-eligibility-desc">
                    {currentQ.rationale}
                  </p>

                  <div className="rf-home-eligibility-btns rf-elig-step2-btns" style={{ marginTop: 22 }}>
                    <div className="rf-elig-choice-row">
                      <button
                        type="button"
                        onClick={() => handleAnswer('yes')}
                        className="rf-btn-elig-primary"
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswer('no')}
                        className="rf-btn-elig-secondary"
                      >
                        No
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleBack}
                      className="rf-btn-elig-back"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="rf-clean-tag" style={{ marginBottom: 14 }}>
                    {healthPercentage === 100 ? (
                      <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                        <CheckCircle2 size={15} /> 100% Eligible to Donate
                      </span>
                    ) : (
                      <span style={{ color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                        <AlertCircle size={15} /> Clinical Review Required
                      </span>
                    )}
                  </div>

                  <h2 className="rf-home-eligibility-title">
                    Your donation analysis is <span style={{ color: '#DC2626' }}>complete</span>.
                  </h2>

                  <p className="rf-home-eligibility-desc">
                    According to our analysis your eligibility of donating blood is{' '}
                    <strong style={{ color: '#DC2626', fontSize: '18px' }}>
                      {healthPercentage}%
                    </strong>.
                  </p>

                  <p className="rf-home-eligibility-subtext">
                    A doctor will re-verify donor eligibility before actual blood donation.
                  </p>

                  <div className="rf-home-eligibility-btns rf-elig-result-btns" style={{ marginTop: 22 }}>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="rf-btn-elig-primary"
                    >
                      <RotateCcw size={15} />
                      <span>Start Over</span>
                    </button>

                    <Link
                      to={healthPercentage === 100 ? (isAuthenticated ? "/donor" : "/register") : (isAuthenticated ? "/donor" : "/register")}
                      className="rf-btn-elig-secondary"
                    >
                      {healthPercentage === 100 ? (
                        <>
                          <Heart size={15} style={{ color: '#DC2626' }} />
                          <span>{isAuthenticated ? "Go to Donor Console" : "Register as Donor"}</span>
                        </>
                      ) : (
                        <span>Find Nearby Camps</span>
                      )}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Complete Human Body Silhouette with Verified Fingers on Both Hands & Dynamic Liquid Fill */}
            <div className="rf-home-eligibility-visual">
              <div className="rf-home-silhouette-wrap">
                <div style={{ position: 'relative', width: '110px', height: '275px' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="110"
                    height="275"
                    viewBox="0 0 109 274.876"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  >
                    {/* Base Neutral Layer */}
                    <path
                      d={HUMAN_BODY_PATH}
                      transform="translate(-6.215 -10.268)"
                      fill="#E2E8F0"
                    />
                    {/* Dynamic Blood Fill Layer */}
                    <g
                      style={{
                        clipPath: `inset(${100 - healthPercentage}% 0 0 0)`,
                        transition: 'clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <path
                        d={HUMAN_BODY_PATH}
                        transform="translate(-6.215 -10.268)"
                        fill="#DC2626"
                      />
                    </g>
                  </svg>
                </div>

                <div className="rf-home-silhouette-footer">
                  <span className="rf-home-silhouette-label">
                    Health Readiness: <strong>{healthPercentage}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EligibilityChecker;
