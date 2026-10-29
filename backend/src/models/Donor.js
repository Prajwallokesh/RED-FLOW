'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — DONOR CLINICAL DATA MODEL & REGULATORY COMPLIANCE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Clinical & Regulatory Purpose:
 * 1. Age Eligibility (18 to 65 years):
 *    In compliance with National Blood Transfusion Council (NBTC) regulations,
 *    only adults between 18 and 65 years of age are legally permitted to donate.
 * 
 * 2. 90-Day Rest Interval:
 *    After whole blood donation, the human body requires ~90 days to completely
 *    replenish red blood cells and ferritin (iron) reserves. The system tracks
 *    `lastDonationDate` to prevent premature re-donation.
 * 
 * 3. Two-Tier Privacy Architecture (On-Chain Hash vs Off-Chain PII):
 *    - Personal Identifiable Information (PII) like name, email, phone, and
 *      medical flag reasons stay encrypted/secured in MongoDB only.
 *    - Only a cryptographic Keccak-256 hash of the verification status is anchored
 *      to the Ethereum blockchain ledger to prove donor integrity without leaking privacy.
 * 
 * 4. Irreversible Safety Flagging:
 *    If an admin or clinical lab flags a donor (e.g., reactive viral marker or high risk),
 *    the donor is permanently blocked from booking or donating to preserve supply safety.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    donorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    age:  { type: Number, required: true, min: 18, max: 65 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    phone:   { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    city:    { type: String, required: true, trim: true },
    district: { type: String, default: 'Hassan', trim: true },
    state:   { type: String, default: 'Karnataka', trim: true },
    pincode: { type: String, required: true, trim: true },
    lat:     { type: Number, default: null },
    lng:     { type: Number, default: null },

    // Date of last successful blood donation for 90-day rest interval enforcement
    lastDonationDate: { type: Date, default: null },

    // Clinical verification workflow: pending -> verified OR flagged
    eligibilityStatus: {
      type: String,
      enum: ['pending', 'verified', 'flagged'],
      default: 'pending',
    },
    isVerified: { type: Boolean, default: false },
    isFlagged:  { type: Boolean, default: false },
    flagReason: { type: String, default: '' }, // Confidential: stays in MongoDB only, never on public ledger

    donationCount:    { type: Number, default: 0 },
    blockchainTxHash: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donor', donorSchema);
