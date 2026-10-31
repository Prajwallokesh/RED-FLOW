import React, { useState, useEffect, useRef } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SCROLLABLE & INTERACTIVE BLOOD DROPLET
 * Pure SVG blood droplet with smooth scroll-reactive and wheel/tap liquid fill.
 * Faithfully matches the user's reference image:
 * - Empty top, crimson red liquid body with fluid surface wave
 * - Sad crying face with teardrops during shortage (< 70% fill)
 * - Transitions to happy smile with blushing cheeks when filled (>= 70%)
 * - Scroll-linked fill + direct tap/wheel interaction
 * ─────────────────────────────────────────────────────────────────────────────
 */
const ScrollableBloodDrop = ({ containerRef }) => {
  // Fill ratio: 0.28 (2M unit shortage) to 0.96 (100% sufficient)
  const [fillLevel, setFillLevel] = useState(0.32);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = containerRef?.current || dropRef.current;
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start filling when section top is at 80% viewport height
      // Reach full fill when section travels into middle/past viewport
      const startPoint = windowHeight * 0.85;
      const endPoint = windowHeight * 0.15;
      const totalTravel = (startPoint - endPoint) + (rect.height * 0.8);
      const currentTravel = startPoint - rect.top;

      const rawProgress = currentTravel / (totalTravel || 1);
      const clamped = Math.min(Math.max(rawProgress, 0), 1);

      // Smooth interpolation: 0.28 (shortage) -> 0.96 (replenished)
      const calculatedFill = 0.28 + clamped * (0.96 - 0.28);
      setFillLevel(calculatedFill);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // Direct wheel over droplet to manually fill / empty
  const handleWheel = (e) => {
    setFillLevel(prev => {
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      return Math.min(Math.max(prev + delta, 0.25), 0.96);
    });
  };

  // Direct tap/click to toggle between shortage and full supply
  const handleToggle = () => {
    setFillLevel(prev => (prev > 0.65 ? 0.28 : 0.95));
  };

  // SVG Coordinates mapping: Top tip at y=22, Bottom base at y=268
  const topY = 22;
  const bottomY = 268;
  const totalH = bottomY - topY;
  const liquidHeight = totalH * fillLevel;
  const liquidY = bottomY - liquidHeight;

  const isFull = fillLevel >= 0.70;

  return (
    <div
      ref={dropRef}
      className="rf-pure-blood-drop-wrap"
      onWheel={handleWheel}
      onClick={handleToggle}
      title="Scroll page or click droplet to fill blood supply"
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <svg
        viewBox="0 0 240 295"
        className="rf-pure-blood-drop-svg"
        role="img"
        aria-label="Scrollable blood liquid droplet"
      >
        <defs>
          {/* Droplet Silhouette Clip Path */}
          <clipPath id="pureDropPath">
            <path d="M 120 22 C 120 22, 215 130, 215 185 C 215 238, 172 268, 120 268 C 68 268, 25 238, 25 185 C 25 130, 120 22, 120 22 Z" />
          </clipPath>

          {/* Blood Liquid Gradient */}
          <linearGradient id="pureBloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Ground Oval Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Ground Shadow Ellipse */}
        <ellipse cx="120" cy="282" rx="58" ry="9" fill="url(#groundShadow)" />

        {/* Droplet Outline Base */}
        <path
          d="M 120 22 C 120 22, 215 130, 215 185 C 215 238, 172 268, 120 268 C 68 268, 25 238, 25 185 C 25 130, 120 22, 120 22 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {/* Liquid Interior */}
        <g clipPath="url(#pureDropPath)">
          {/* Empty Top Portion (Clean tinted off-white) */}
          <rect x="0" y="0" width="240" height="295" fill="#F8FAFC" />

          {/* Rising Liquid Red Blood */}
          <rect
            x="0"
            y={liquidY}
            width="240"
            height={liquidHeight + 50}
            fill="url(#pureBloodGrad)"
            style={{ transition: 'y 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />

          {/* Liquid Surface Wave Crest */}
          <path
            d={`M 0 ${liquidY} Q 60 ${liquidY - 5}, 120 ${liquidY} T 240 ${liquidY} L 240 ${liquidY + 12} L 0 ${liquidY + 12} Z`}
            fill="#F87171"
            opacity="0.9"
            style={{ transition: 'd 0.18s ease-out' }}
          />

          {/* Light Reflection Curve */}
          <path
            d="M 58 75 C 48 115, 48 160, 54 185"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* ── Expressive Mascot Face (Matches Reference Screenshot) ── */}
          {/* Eyes with white specular dots */}
          <circle cx="95" cy="154" r="7.5" fill="#0F172A" />
          <circle cx="145" cy="154" r="7.5" fill="#0F172A" />
          <circle cx="97.5" cy="152" r="2.5" fill="#FFFFFF" />
          <circle cx="147.5" cy="152" r="2.5" fill="#FFFFFF" />

          {/* Shortage State: Crying Sad Face (< 70% fill) */}
          {!isFull && (
            <g style={{ transition: 'opacity 0.2s ease' }}>
              {/* Downward Sad Frown */}
              <path
                d="M 106 186 Q 120 172, 134 186"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Blue Tear Drops running down under the eyes */}
              <ellipse cx="86" cy="166" rx="4.5" ry="7.5" fill="#60A5FA" />
              <ellipse cx="154" cy="166" rx="4.5" ry="7.5" fill="#60A5FA" />
              {/* Stray Tear Drops */}
              <circle cx="83" cy="180" r="3.2" fill="#93C5FD" />
              <circle cx="157" cy="180" r="3.2" fill="#93C5FD" />
              <circle cx="88" cy="192" r="2" fill="#BFDBFE" />
              <circle cx="152" cy="192" r="2" fill="#BFDBFE" />
            </g>
          )}

          {/* Replenished State: Happy Smiling Face (>= 70% fill) */}
          {isFull && (
            <g style={{ transition: 'opacity 0.2s ease' }}>
              {/* Big Joyful Smile with white teeth */}
              <path
                d="M 102 174 Q 120 195, 138 174 Z"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Cute Blushing Cheeks */}
              <ellipse cx="78" cy="162" rx="9" ry="5.5" fill="#FDA4AF" opacity="0.85" />
              <ellipse cx="162" cy="162" rx="9" ry="5.5" fill="#FDA4AF" opacity="0.85" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default ScrollableBloodDrop;
