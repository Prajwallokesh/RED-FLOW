'use strict';

const express = require('express');
const { ethers } = require('ethers');
const Donor = require('../models/Donor');
const BloodUnit = require('../models/BloodUnit');
const TraceEvent = require('../models/TraceEvent');
const User = require('../models/User');
const auth  = require('../middleware/auth');
const role  = require('../middleware/role');
const { hashDonor } = require('../services/hashService');
const { getCoordsForPincode } = require('../services/pincodeService');
const { verifyDonorOnChain, flagDonorOnChain } = require('../services/blockchainService');
const { checkDonorEligibility, RULE_DAYS } = require('../services/eligibilityService');

const router = express.Router();

// ── POST /api/donors/check-eligibility ─────────────────────────────────────
/**
 * GUIDE EXPLANATION: Donor Rest Interval Verification
 * Question: "How does the system ensure a donor does not donate too frequently?"
 * Answer: In clinical medicine, the body requires approximately 90 days to replenish
 * red blood cells and iron stores. This endpoint computes the exact elapsed days
 * since `donor.lastDonationDate`. If fewer than 90 days have passed, donation is blocked.
 */
router.post('/check-eligibility', auth, role(['donor', 'admin', 'hospital']), async (req, res, next) => {
  try {
    let { donorId } = req.body;

    let donor;
    if (donorId) {
      donor = await Donor.findOne({ donorId });
    } else if (req.user.role === 'donor') {
      donor = await Donor.findOne({ userId: req.user.id });
    }

    if (!donor) {
      return res.status(404).json({
        error: 'Donor not found',
        code: 'NOT_FOUND',
      });
    }

    // Donors can only check their own eligibility
    if (req.user.role === 'donor' && donor.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    }

    const result = checkDonorEligibility(donor);
    return res.status(200).json({
      donorId: donor.donorId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Generate next sequential donorId: DNR001, DNR002, … */
const generateDonorId = async () => {
  const count = await Donor.countDocuments();
  return `DNR${String(count + 1).padStart(3, '0')}`;
};

// ── POST /api/donors/register ─────────────────────────────────────────────
// Donor only. One registration per user account.
router.post('/register', auth, role(['donor']), async (req, res, next) => {
  try {
    const existing = await Donor.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(409).json({ error: 'Donor profile already registered', code: 'ALREADY_REGISTERED' });
    }

    const {
      name, age, gender, bloodGroup, phone, email,
      address, city, district, state, pincode, lastDonationDate,
    } = req.body;

    if (!name || !age || !gender || !bloodGroup || !phone || !email || !address || !city || !pincode) {
      return res.status(400).json({ error: 'All fields are required', code: 'VALIDATION_ERROR' });
    }

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

    if (!EMAIL_REGEX.test((email || '').trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@example.com)', code: 'INVALID_EMAIL' });
    }

    const cleanPhone = (phone || '').trim().replace(/[\s-]/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', code: 'INVALID_PHONE' });
    }

    const donorId = await generateDonorId();

    const pinCount = await Donor.countDocuments({ pincode: pincode.trim() });
    const coords = getCoordsForPincode(pincode.trim(), city.trim(), district, pinCount + 1);

    const donor = await Donor.create({
      userId: req.user.id,
      donorId,
      name: name.trim(),
      age: Number(age),
      gender,
      bloodGroup,
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      city: city.trim(),
      district: (district || 'Hassan').trim(),
      state: (state || 'Karnataka').trim(),
      pincode: pincode.trim(),
      lat: coords.lat,
      lng: coords.lng,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
    });

    await User.findByIdAndUpdate(req.user.id, {
      phone: phone.trim(),
      address: address.trim(),
      district: (district || 'Hassan').trim(),
      state: (state || 'Karnataka').trim(),
      pincode: pincode.trim(),
    });

    return res.status(201).json({ donor });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donors/pending ──────────────────────────────────────────────
// Admin: donors awaiting verification (not verified, not flagged)
router.get('/pending', auth, role(['admin']), async (req, res, next) => {
  try {
    const donors = await Donor.find({ isVerified: false, isFlagged: false })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    return res.status(200).json({ donors, count: donors.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donors ──────────────────────────────────────────────────────
// Admin: list all donors with optional filters
router.get('/', auth, role(['admin']), async (req, res, next) => {
  try {
    const { bloodGroup, pincode, isVerified, isFlagged } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (pincode)    filter.pincode    = pincode;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isFlagged  !== undefined) filter.isFlagged  = isFlagged  === 'true';

    const donors = await Donor.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    return res.status(200).json({ donors, count: donors.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donors/:donorId ─────────────────────────────────────────────
// Donor (own) or Admin
router.get('/:donorId', auth, role(['donor', 'admin', 'hospital']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ donorId: req.params.donorId })
      .populate('userId', 'name email');
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found', code: 'NOT_FOUND' });
    }
    // Donor can only see their own profile
    if (req.user.role === 'donor' && donor.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.status(200).json({ donor });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donors/me/profile ───────────────────────────────────────────
// Donor: get their own profile by userId
router.get('/me/profile', auth, role(['donor']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ error: 'No donor profile found', code: 'NOT_FOUND' });
    }
    return res.status(200).json({ donor });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donors/me/history ───────────────────────────────────────────
/**
 * GUIDE EXPLANATION: Donor Blood Donation Journey & Real-Time Flow
 * Question: "How does the donor page show the blood unit's journey after admin updates?"
 * Answer:
 * 1. Finds all BloodUnit records where `donorId` matches this authenticated donor.
 * 2. Fetches all immutable `TraceEvent` audit logs logged by Admins and Hospitals for those units.
 * 3. Dynamically calculates the 4-Stage lifecycle:
 *    - Stage 1 (Collected): Admin logged initial pouch intake.
 *    - Stage 2 (Lab Tested): Clinical lab entered 5-panel serology test result.
 *    - Stage 3 (In Storage): Unit certified safe and stored in cold chain vault (2-6°C).
 *    - Stage 4 (Transfused): Unit issued to emergency hospital request to save a patient's life.
 * 4. Extracts the latest administrative message and destination hospital for instant donor visibility.
 */
router.get('/me/history', auth, role(['donor']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(200).json({ donations: [], totalDonations: 0, unitsIssued: 0 });
    }

    const units = await BloodUnit.find({ donorId: donor.donorId })
      .sort({ collectionDate: -1 })
      .lean();

    const unitIds = units.map(u => u.unitId);
    const traceEvents = await TraceEvent.find({ unitId: { $in: unitIds } })
      .sort({ timestamp: 1 })
      .lean();

    const donations = units.map(u => {
      const unitTimeline = traceEvents.filter(t => t.unitId === u.unitId);
      const latestTrace = unitTimeline.length > 0 ? unitTimeline[unitTimeline.length - 1] : null;

      // Determine stageIndex:
      // 1: Collected
      // 2: Lab Screening (in progress or safe)
      // 3: Cold Storage Vault Available
      // 4: Transfused / Issued to Hospital
      let stageIndex = 1;
      let stageStatus = 'collected';

      if (u.availabilityStatus === 'rejected' || u.testStatus === 'rejected') {
        stageIndex = -1;
        stageStatus = 'rejected';
      } else if (u.availabilityStatus === 'expired') {
        stageIndex = -2;
        stageStatus = 'expired';
      } else if (u.availabilityStatus === 'issued') {
        stageIndex = 4;
        stageStatus = 'transfused';
      } else if (u.testStatus === 'safe' || u.availabilityStatus === 'available' || u.availabilityStatus === 'requested') {
        stageIndex = 3;
        stageStatus = 'in_storage';
      } else if (u.availabilityStatus === 'testing' || (u.testStatus === 'pending' && unitTimeline.some(t => t.eventType === 'testing'))) {
        stageIndex = 2;
        stageStatus = 'testing';
      } else {
        stageIndex = 1;
        stageStatus = 'collected';
      }

      const issuedEvent = unitTimeline.find(t => t.eventType === 'issued');
      const requestedEvent = unitTimeline.find(t => t.eventType === 'requested');
      const testedEvent = unitTimeline.find(t => t.eventType === 'tested');

      return {
        ...u,
        timeline: unitTimeline,
        stageIndex,
        stageStatus,
        latestAction: latestTrace ? latestTrace.description : 'Blood unit collected and registered into cold chain system.',
        latestActionDate: latestTrace ? latestTrace.timestamp : u.collectionDate,
        hospitalInfo: issuedEvent?.description || requestedEvent?.description || null,
        testedInfo: testedEvent?.description || null,
      };
    });

    const unitsIssued = donations.filter(d => d.availabilityStatus === 'issued').length;

    return res.status(200).json({
      donations,
      totalDonations: donations.length,
      unitsIssued,
      lastDonationDate: donor.lastDonationDate,
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/donors/:donorId/verify ─────────────────────────────────────
// Admin: verify a donor — calls verifyDonor on contract, stores txHash
router.put('/:donorId/verify', auth, role(['admin']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ donorId: req.params.donorId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found', code: 'NOT_FOUND' });
    }
    if (donor.isVerified) {
      return res.status(409).json({ error: 'Donor is already verified', code: 'ALREADY_VERIFIED' });
    }
    if (donor.isFlagged) {
      return res.status(409).json({ error: 'Cannot verify a flagged donor', code: 'DONOR_FLAGGED' });
    }

    // Compute deterministic donor hash
    const chainId = process.env.CHAIN_ID || '5777';
    const donorHash = hashDonor({
      chainId,
      donorId:          donor.donorId,
      bloodGroup:       donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate
        ? donor.lastDonationDate.toISOString().split('T')[0]
        : '',
    });

    // Attempt on-chain verification (gracefully skips if no contract)
    let txHash = '';
    try {
      txHash = (await verifyDonorOnChain(donor.donorId, donorHash)) || '';
    } catch (bcErr) {
      console.error('[Blockchain] verifyDonor error:', bcErr.message);
      // Non-fatal — DB update still proceeds
    }

    donor.isVerified        = true;
    donor.eligibilityStatus = 'verified';
    donor.blockchainTxHash  = txHash;
    await donor.save();

    return res.status(200).json({ donor, txHash });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/donors/:donorId/flag ────────────────────────────────────────
// Admin: strictly flag a donor permanently
// body: { flag: boolean, reason: string }
router.put('/:donorId/flag', auth, role(['admin']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ donorId: req.params.donorId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found', code: 'NOT_FOUND' });
    }

    const { flag, reason = '' } = req.body;
    if (typeof flag !== 'boolean') {
      return res.status(400).json({ error: 'flag must be a boolean', code: 'VALIDATION_ERROR' });
    }

    // STRICT PERMANENT BAN POLICY: Once flagged, an account cannot be unflagged
    if (donor.isFlagged && flag === false) {
      return res.status(403).json({
        error: 'Strict Policy: Flagged donor accounts cannot be unflagged. This account is permanently banned from blood donation.',
        code: 'PERMANENTLY_FLAGGED'
      });
    }

    if (flag && !reason.trim()) {
      return res.status(400).json({ error: 'A specific medical/audit reason is required when flagging a donor.', code: 'VALIDATION_ERROR' });
    }

    // Hash the reason — only cryptographic hash goes on-chain
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason.trim()));

    // Record on-chain flag transaction
    const txHash = await flagDonorOnChain(donor.donorId, flag, reasonHash);

    donor.isFlagged         = true;
    donor.flagReason        = reason.trim();
    donor.eligibilityStatus = 'flagged';
    donor.blockchainTxHash  = txHash || donor.blockchainTxHash;
    await donor.save();

    return res.status(200).json({ donor, txHash });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
