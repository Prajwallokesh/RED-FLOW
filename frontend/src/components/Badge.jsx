import React from 'react';
import { Award, Star, Sparkles } from 'lucide-react';

/**
 * Computes donor recognition badge tier from donationCount.
 * 
 * Rules:
 * - 0: None
 * - 1-2: Bronze
 * - 3-4: Silver
 * - 5-9: Gold
 * - 10+: Platinum
 */
export const getBadgeLevel = (donationCount = 0) => {
  if (donationCount >= 10) return 'platinum';
  if (donationCount >= 5)  return 'gold';
  if (donationCount >= 3)  return 'silver';
  if (donationCount >= 1)  return 'bronze';
  return 'none';
};

export const BADGE_DETAILS = {
  bronze: {
    label: 'Bronze Donor',
    min: 1,
    next: 3,
    color: '#CD7F32',
    bg: 'rgba(205,127,50,0.12)',
    border: '#CD7F32',
    description: 'First milestone reached! Verified life-saver.',
  },
  silver: {
    label: 'Silver Donor',
    min: 3,
    next: 5,
    color: '#757575',
    bg: 'rgba(117,117,117,0.14)',
    border: '#9E9E9E',
    description: '3+ verified donations. Champion of the blood supply chain.',
  },
  gold: {
    label: 'Gold Guardian',
    min: 5,
    next: 10,
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.15)',
    border: '#D4AF37',
    description: '5+ verified donations. Pillar of community emergency support.',
  },
  platinum: {
    label: 'Platinum Hero',
    min: 10,
    next: null,
    color: '#007C91',
    bg: 'rgba(0,124,145,0.15)',
    border: '#00ACC1',
    description: '10+ lifetime donations! Elite lifesaver status.',
  },
  none: {
    label: 'First Donation Awaited',
    min: 0,
    next: 1,
    color: '#6C757D',
    bg: 'rgba(108,117,125,0.08)',
    border: '#E0E0E0',
    description: 'Complete your first blood donation to earn your Bronze badge.',
  },
};

const Badge = ({ level, donationCount, size = 'md', showDetails = false }) => {
  const currentLevel = level || getBadgeLevel(donationCount);
  const badge = BADGE_DETAILS[currentLevel] || BADGE_DETAILS.none;

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const iconSize = isSmall ? 12 : isLarge ? 24 : 16;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: badge.bg,
      border: `1px solid ${badge.border}`,
      color: badge.color,
      borderRadius: 100,
      padding: isSmall ? '2px 8px' : isLarge ? '8px 16px' : '4px 12px',
      fontWeight: 800,
      fontSize: isSmall ? 10 : isLarge ? 15 : 12,
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
    }}>
      {currentLevel === 'platinum' ? (
        <Sparkles size={iconSize} />
      ) : currentLevel === 'gold' ? (
        <Star size={iconSize} />
      ) : (
        <Award size={iconSize} />
      )}
      <span>{badge.label}</span>
    </div>
  );
};

export default Badge;
