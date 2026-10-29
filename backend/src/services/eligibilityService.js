'use strict';

const RULE_DAYS = 90;

/**
 * Checks a donor's donation interval and status eligibility.
 * 
 * Rules:
 * 1. 90-day minimum gap between donations.
 * 2. Eligible if lastDonationDate is null OR today - lastDonationDate >= 90 days.
 * 3. Flagged donors are not eligible.
 * 
 * @param {Object} donor - Mongoose Donor document or plain object
 * @returns {Object} { eligible, nextEligibleDate, daysSinceLastDonation, ruleDays: 90, isVerified, isFlagged, reason }
 */
const checkDonorEligibility = (donor) => {
  if (!donor) {
    throw new Error('Donor record required for eligibility check');
  }

  const now = new Date();
  const isFlagged = Boolean(donor.isFlagged);
  const isVerified = Boolean(donor.isVerified);

  // If flagged, immediately mark as not eligible
  if (isFlagged) {
    return {
      eligible: false,
      nextEligibleDate: null,
      daysSinceLastDonation: null,
      ruleDays: RULE_DAYS,
      isVerified,
      isFlagged: true,
      reason: donor.flagReason
        ? `Account flagged: ${donor.flagReason}`
        : 'Donor account is currently flagged by administration.',
    };
  }

  // Never donated before
  if (!donor.lastDonationDate) {
    return {
      eligible: true,
      nextEligibleDate: now.toISOString(),
      daysSinceLastDonation: null,
      ruleDays: RULE_DAYS,
      isVerified,
      isFlagged: false,
      reason: 'No previous donations on record. Eligible immediately upon verification.',
    };
  }

  const lastDate = new Date(donor.lastDonationDate);
  const diffMs = now.getTime() - lastDate.getTime();
  const daysSinceLastDonation = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const nextDateObj = new Date(lastDate.getTime() + RULE_DAYS * 24 * 60 * 60 * 1000);
  const nextEligibleDate = nextDateObj.toISOString();

  if (daysSinceLastDonation >= RULE_DAYS) {
    return {
      eligible: true,
      nextEligibleDate,
      daysSinceLastDonation,
      ruleDays: RULE_DAYS,
      isVerified,
      isFlagged: false,
      reason: `Completed mandatory ${RULE_DAYS}-day rest interval (${daysSinceLastDonation} days elapsed). Eligible to donate.`,
    };
  }

  const daysRemaining = RULE_DAYS - daysSinceLastDonation;
  return {
    eligible: false,
    nextEligibleDate,
    daysSinceLastDonation,
    ruleDays: RULE_DAYS,
    isVerified,
    isFlagged: false,
    reason: `Must wait 90 days between donations. ${daysRemaining} day(s) remaining until next eligible date.`,
  };
};

module.exports = {
  RULE_DAYS,
  checkDonorEligibility,
};
