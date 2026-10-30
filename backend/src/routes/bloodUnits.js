/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — BLOOD UNIT LIFECYCLE & COLD-CHAIN API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Medical & Mathematical Mechanics:
 * 1. State Machine Transitions (`VALID_TRANSITIONS`):
 *    - `collected`: Whole blood drawn into CPDA-1 anticoagulant pouch.
 *    - `testing`: Laboratory conducts 5-panel mandatory infectious screening:
 *       [HIV I & II, Hepatitis B (HBsAg), Hepatitis C (HCV), Syphilis (VDRL), Malaria].
 *    - `available`: Unit tested safe; stored in 2°C to 6°C cold-chain vault.
 *    - `requested`: Matched to an emergency hospital blood requisition.
 *    - `issued`: Transfusion custody transfer completed.
 *    - `rejected` / `expired`: Unit clinically quarantined or exceeded 35-day limit.
 * 
 * 2. Immutable Cryptographic Anchoring:
 *    Every state shift recomputes the unit's Keccak-256 fingerprint and mints
 *    a blockchain transaction hash, preventing unauthorized tampering with blood safety records.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const express = require('express');
const EmergencyRequest = require('../models/EmergencyRequest');
const QRCode = require('qrcode');
const BloodUnit = require('../models/BloodUnit');
const Donor = require('../models/Donor');
const TraceEvent = require('../models/TraceEvent');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { hashBloodUnit } = require('../services/hashService');
const {
  addBloodUnitOnChain,
  updateBloodUnitStatusOnChain,
} = require('../services/blockchainService');
const { checkDonorEligibility } = require('../services/eligibilityService');

const router = express.Router();

const VALID_TRANSITIONS = {
  collected: ['testing', 'rejected'],
  testing:   ['available', 'rejected'],
  available: ['requested', 'issued', 'expired', 'rejected'],
  requested: ['issued', 'available', 'expired', 'rejected'],
  issued:    ['returned'],
  expired:   [],
  rejected:  [],
  returned:  [],
};

/** Generate next sequential unitId: BU001, BU002, … */
const generateUnitId = async () => {
  const count = await BloodUnit.countDocuments();
  return `BU${String(count + 1).padStart(3, '0')}`;
};

/** Generate next trace eventId: TRC001, … */
const generateEventId = async () => {
  const count = await TraceEvent.countDocuments();
  return `TRC${String(count + 1).padStart(4, '0')}`;
};

/** Helper to compute blood unit hash per spec Rule #3 */
const computeUnitHash = (unit) => {
  const chainId = process.env.CHAIN_ID || '5777';
  return hashBloodUnit({
    chainId,
    unitId: unit.unitId,
    donorId: unit.donorId,
    bloodGroup: unit.bloodGroup,
    collectionDate: unit.collectionDate.toISOString().split('T')[0],
    expiryDate: unit.expiryDate.toISOString().split('T')[0],
    testStatus: unit.testStatus,
    availabilityStatus: unit.availabilityStatus,
  });
};

/** Helper to log trace event */
const logTrace = async ({ unitId, eventType, description, updatedBy, txHash }) => {
  try {
    const eventId = await generateEventId();
    return await TraceEvent.create({
      eventId,
      unitId,
      eventType,
      description,
      updatedBy: updatedBy || 'Admin/System',
      blockchainTxHash: txHash || '',
    });
  } catch (err) {
    console.error('[TraceEvent] Failed to log trace:', err.message);
  }
};

// ── POST /api/blood-units ───────────────────────────────────────────────────
// Admin: Collection of new blood unit
router.post('/', auth, role(['admin']), async (req, res, next) => {
  try {
    const { donorId, storageLocation } = req.body;
    let { collectionDate } = req.body;

    if (!donorId) {
      return res.status(400).json({ error: 'donorId is required', code: 'VALIDATION_ERROR' });
    }

    const donor = await Donor.findOne({ donorId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found', code: 'DONOR_NOT_FOUND' });
    }

    // Must be verified
    if (!donor.isVerified) {
      return res.status(409).json({
        error: 'Donor must be verified by admin before collecting blood unit',
        code: 'DONOR_NOT_VERIFIED',
      });
    }

    // Must not be flagged
    if (donor.isFlagged) {
      return res.status(409).json({
        error: `Cannot collect from flagged donor: ${donor.flagReason || 'Account flagged'}`,
        code: 'DONOR_FLAGGED',
      });
    }

    // Must satisfy 90-day rest rule
    const elig = checkDonorEligibility(donor);
    if (!elig.eligible) {
      return res.status(409).json({
        error: `Donor ineligible: ${elig.reason}`,
        code: 'DONOR_INELIGIBLE',
      });
    }

    const colDate = collectionDate ? new Date(collectionDate) : new Date();
    // Expiry date = collectionDate + 35 days
    const expDate = new Date(colDate.getTime() + 35 * 24 * 60 * 60 * 1000);

    const unitId = await generateUnitId();

    // Default to cold storage vault
    const chosenLocation = storageLocation && storageLocation.trim()
      ? (storageLocation.toLowerCase().includes('cold') ? storageLocation.trim() : `${storageLocation.trim()} (Cold Storage Vault)`)
      : 'Cold Storage Vault 1';

    // Generate QR Code pointing to frontend verify URL
    const verifyUrl = `http://localhost:5173/verify/${unitId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
    });

    const newUnit = new BloodUnit({
      unitId,
      donorId: donor.donorId,
      bloodGroup: donor.bloodGroup,
      collectionDate: colDate,
      expiryDate: expDate,
      testStatus: 'pending',
      availabilityStatus: 'collected',
      storageLocation: chosenLocation,
      qrUrl: qrDataUrl,
    });

    // Compute hash and call blockchain
    const unitHash = computeUnitHash(newUnit);
    let txHash = '';
    try {
      txHash = (await addBloodUnitOnChain(unitId, unitHash, 'collected')) || '';
    } catch (bcErr) {
      console.error('[Blockchain] addBloodUnit error:', bcErr.message);
    }

    newUnit.blockchainTxHash = txHash;
    await newUnit.save();

    // Log trace event
    await logTrace({
      unitId,
      eventType: 'created',
      description: `Blood unit ${unitId} (${donor.bloodGroup}) collected from donor ${donor.donorId}`,
      updatedBy: req.user.id,
      txHash,
    });

    // Update donor's lastDonationDate & donationCount
    donor.lastDonationDate = colDate;
    donor.donationCount = (donor.donationCount || 0) + 1;
    await donor.save();

    return res.status(201).json({
      unit: newUnit,
      qrUrl: qrDataUrl,
      txHash,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blood-units ────────────────────────────────────────────────────
// List blood units with optional filters (bloodGroup, testStatus, availabilityStatus)
router.get('/', auth, role(['admin', 'hospital']), async (req, res, next) => {
  try {
    const { bloodGroup, testStatus, availabilityStatus, unitId } = req.query;
    const filter = {};
    if (bloodGroup)         filter.bloodGroup = bloodGroup;
    if (testStatus)         filter.testStatus = testStatus;
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;
    if (unitId)             filter.unitId = new RegExp(unitId, 'i');

    const units = await BloodUnit.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ units, count: units.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blood-units/refresh-expiry ─────────────────────────────────────
// Automatically mark units past their expiry date as 'expired'
router.get('/refresh-expiry', auth, role(['admin']), async (req, res, next) => {
  try {
    const now = new Date();
    const expiredUnits = await BloodUnit.find({
      expiryDate: { $lt: now },
      availabilityStatus: { $nin: ['expired', 'issued', 'rejected', 'returned'] },
    });

    const updated = [];
    for (const unit of expiredUnits) {
      unit.availabilityStatus = 'expired';
      const updatedHash = computeUnitHash(unit);

      let txHash = '';
      try {
        txHash = (await updateBloodUnitStatusOnChain(unit.unitId, 'expired', updatedHash)) || '';
      } catch (bcErr) {
        console.error('[Blockchain] updateBloodUnitStatus (expired) error:', bcErr.message);
      }

      if (txHash) unit.blockchainTxHash = txHash;
      await unit.save();

      await logTrace({
        unitId: unit.unitId,
        eventType: 'expired',
        description: `Blood unit ${unit.unitId} marked expired automatically (past 35-day shelf life)`,
        updatedBy: 'System Cron/Refresh',
        txHash,
      });

      updated.push(unit.unitId);
    }

    return res.status(200).json({
      message: `Refreshed expiry. ${updated.length} unit(s) marked expired.`,
      expiredUnits: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blood-units/:unitId ────────────────────────────────────────────
// Details for a single blood unit
router.get('/:unitId', auth, role(['admin', 'hospital']), async (req, res, next) => {
  try {
    const unit = await BloodUnit.findOne({ unitId: req.params.unitId });
    if (!unit) {
      return res.status(404).json({ error: 'Blood unit not found', code: 'NOT_FOUND' });
    }
    return res.status(200).json({ unit });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/blood-units/:unitId/test-status ────────────────────────────────
// Admin: update laboratory test results
router.put('/:unitId/test-status', auth, role(['admin']), async (req, res, next) => {
  try {
    const { status, notes, screeningDetails } = req.body;
    if (!['safe', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: "test-status must be 'safe' or 'rejected'",
        code: 'VALIDATION_ERROR',
      });
    }

    const unit = await BloodUnit.findOne({ unitId: req.params.unitId });
    if (!unit) {
      return res.status(404).json({ error: 'Blood unit not found', code: 'NOT_FOUND' });
    }

    // Cannot reverse rejected test status
    if (unit.testStatus === 'rejected') {
      return res.status(409).json({
        error: 'Cannot modify test status of an already rejected blood unit',
        code: 'TERMINAL_STATE',
      });
    }

    // Update state machine according to test result
    if (status === 'safe') {
      unit.testStatus = 'safe';
      unit.availabilityStatus = 'available';
      // Ensure unit is in cold storage vault
      if (!unit.storageLocation || !unit.storageLocation.toLowerCase().includes('cold')) {
        unit.storageLocation = unit.storageLocation
          ? `${unit.storageLocation} (Cold Storage Vault)`
          : 'Cold Storage Vault 1';
      }
    } else {
      unit.testStatus = 'rejected';
      unit.availabilityStatus = 'rejected';
    }

    const updatedHash = computeUnitHash(unit);
    let txHash = '';
    try {
      txHash = (await updateBloodUnitStatusOnChain(unit.unitId, unit.availabilityStatus, updatedHash)) || '';
    } catch (bcErr) {
      console.error('[Blockchain] updateBloodUnitStatus error:', bcErr.message);
    }

    if (txHash) unit.blockchainTxHash = txHash;
    await unit.save();

    await logTrace({
      unitId: unit.unitId,
      eventType: status === 'safe' ? 'tested' : 'rejected',
      description: status === 'safe'
        ? (notes || `Lab screening passed (5-panel non-reactive). Unit stored in ${unit.storageLocation} and available.`)
        : (notes || `Lab tests failed: Unit rejected and marked for biohazard disposal.`),
      updatedBy: req.user.id,
      txHash,
    });

    return res.status(200).json({ unit, txHash });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/blood-units/:unitId/availability ───────────────────────────────
// Admin: transition availability status following state machine
router.put('/:unitId/availability', auth, role(['admin']), async (req, res, next) => {
  try {
    const { status, notes, requestId, hospitalName } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required', code: 'VALIDATION_ERROR' });
    }

    const unit = await BloodUnit.findOne({ unitId: req.params.unitId });
    if (!unit) {
      return res.status(404).json({ error: 'Blood unit not found', code: 'NOT_FOUND' });
    }

    const currentStatus = unit.availabilityStatus;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    // Allow terminal rejection from any state
    if (status !== 'rejected' && !allowed.includes(status)) {
      return res.status(409).json({
        error: `Invalid state transition: Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(', ') || 'none (terminal)'}`,
        code: 'INVALID_STATE_TRANSITION',
      });
    }

    // Do not issue expired or rejected units
    if (status === 'issued') {
      if (unit.expiryDate < new Date() || currentStatus === 'expired') {
        return res.status(409).json({
          error: 'Cannot issue an expired blood unit',
          code: 'UNIT_EXPIRED',
        });
      }
      if (unit.testStatus !== 'safe') {
        return res.status(409).json({
          error: 'Cannot issue unit that has not tested safe',
          code: 'UNIT_NOT_TESTED_SAFE',
        });
      }
    }

    // Link to emergency request if provided
    if (requestId) {
      const emergencyReq = await EmergencyRequest.findOne({ requestId });
      if (emergencyReq) {
        if (!emergencyReq.allocatedUnits.includes(unit.unitId)) {
          emergencyReq.allocatedUnits.push(unit.unitId);
        }
        if (status === 'requested') {
          emergencyReq.status = 'matched';
        } else if (status === 'issued') {
          emergencyReq.status = 'issued';
        }
        await emergencyReq.save();
      }
    } else if (status === 'available') {
      // If released back to storage, remove from any request that had it allocated
      await EmergencyRequest.updateMany(
        { allocatedUnits: unit.unitId },
        { $pull: { allocatedUnits: unit.unitId } }
      );
    }

    unit.availabilityStatus = status;
    const updatedHash = computeUnitHash(unit);

    let txHash = '';
    try {
      txHash = (await updateBloodUnitStatusOnChain(unit.unitId, status, updatedHash)) || '';
    } catch (bcErr) {
      console.error('[Blockchain] updateBloodUnitStatus error:', bcErr.message);
    }

    if (txHash) unit.blockchainTxHash = txHash;
    await unit.save();

    // Log trace event
    const traceDesc = notes || (
      status === 'issued'
        ? `Transfused & Dispatched${hospitalName ? ` to ${hospitalName}` : ''}${requestId ? ` (Request #${requestId})` : ''}`
        : status === 'requested'
        ? `Allocated from Cold Storage${hospitalName ? ` to ${hospitalName}` : ''}${requestId ? ` (Request #${requestId})` : ''}`
        : `Unit transitioned from ${currentStatus} to ${status}`
    );

    await logTrace({
      unitId: unit.unitId,
      eventType: status,
      description: traceDesc,
      updatedBy: req.user.id,
      txHash,
    });

    // If unit was issued, increment donor's donation count!
    if (status === 'issued') {
      const donor = await Donor.findOne({ donorId: unit.donorId });
      if (donor) {
        donor.donationCount += 1;
        await donor.save();
      }
    }

    return res.status(200).json({ unit, txHash });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blood-units/:unitId/timeline ───────────────────────────────────
// Module 8: Get chronological traceability timeline
router.get('/:unitId/timeline', async (req, res, next) => {
  try {
    const timeline = await TraceEvent.find({ unitId: req.params.unitId }).sort({ timestamp: 1, createdAt: 1 });
    return res.status(200).json({ timeline, count: timeline.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
