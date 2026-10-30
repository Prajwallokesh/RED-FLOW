'use strict';

const express = require('express');
const EmergencyRequest = require('../models/EmergencyRequest');
const BloodUnit = require('../models/BloodUnit');
const Donor = require('../models/Donor');
const TraceEvent = require('../models/TraceEvent');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { searchDonorsByLocation } = require('../services/donorSearchService');
const { hashBloodUnit } = require('../services/hashService');
const { updateBloodUnitStatusOnChain } = require('../services/blockchainService');

const router = express.Router();

/** Generate sequential requestId: REQ001, REQ002, … */
const generateRequestId = async () => {
  const count = await EmergencyRequest.countDocuments();
  return `REQ${String(count + 1).padStart(3, '0')}`;
};

/** Generate trace event ID */
const generateEventId = async () => {
  const count = await TraceEvent.countDocuments();
  return `TRC${String(count + 1).padStart(4, '0')}`;
};

/** Helper to compute blood unit hash */
const computeUnitHash = (unit) => {
  const chainId = process.env.CHAIN_ID || '1337';
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

// ── POST /api/requests ──────────────────────────────────────────────────────
// Hospital: Submit an emergency blood request
router.post('/', auth, role(['hospital', 'admin']), async (req, res, next) => {
  try {
    const { hospitalName, contactNumber, bloodGroup, unitsRequired, pincode, urgency, notes } = req.body;

    if (!hospitalName || !contactNumber || !bloodGroup || !unitsRequired || !pincode) {
      return res.status(400).json({
        error: 'hospitalName, contactNumber, bloodGroup, unitsRequired, and pincode are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const requestId = await generateRequestId();

    const newRequest = await EmergencyRequest.create({
      requestId,
      hospitalId: req.user.id,
      hospitalName: hospitalName.trim(),
      contactNumber: contactNumber.trim(),
      bloodGroup,
      unitsRequired: parseInt(unitsRequired, 10),
      pincode: pincode.trim(),
      urgency: urgency || 'normal',
      status: 'open',
      notes: notes || '',
      allocatedUnits: [],
      matchedDonors: [],
    });

    return res.status(201).json({
      request: newRequest,
      message: `Emergency request #${requestId} created successfully.`,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/requests ───────────────────────────────────────────────────────
// List requests (Admin sees all; Hospital sees only its own)
router.get('/', auth, role(['admin', 'hospital']), async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'hospital') {
      filter.hospitalId = req.user.id;
    }

    const { status, urgency, bloodGroup } = req.query;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    // Sorting: critical urgency first, open status first, then newest
    const requests = await EmergencyRequest.find(filter)
      .sort({
        urgency: -1, // Custom sorting handled below
        createdAt: -1,
      })
      .lean();

    // Priority ordering
    const urgencyWeight = { critical: 3, urgent: 2, normal: 1 };
    const statusWeight = { open: 4, matched: 3, issued: 2, closed: 1, rejected: 0 };

    requests.sort((a, b) => {
      const uA = urgencyWeight[a.urgency] || 0;
      const uB = urgencyWeight[b.urgency] || 0;
      if (uA !== uB) return uB - uA;

      const sA = statusWeight[a.status] || 0;
      const sB = statusWeight[b.status] || 0;
      if (sA !== sB) return sB - sA;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json({ requests, count: requests.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/requests/:requestId ────────────────────────────────────────────
// Single request details
router.get('/:requestId', auth, role(['admin', 'hospital']), async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    }

    if (req.user.role === 'hospital' && request.hospitalId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    }

    return res.status(200).json({ request });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/requests/:requestId/match ─────────────────────────────────────
/**
 * GUIDE EXPLANATION: FIFO Cold-Chain Blood Unit Allocation & Geo Matching
 * Question: "How does the system decide which blood units to give to a requesting hospital?"
 * Answer:
 * 1. Safe & Non-Expired Filter: Only units certified as `testStatus: 'safe'` and `expiryDate > now` are considered.
 * 2. FIFO Ordering (`sort({ expiryDate: 1 })`): Oldest valid units are allocated first to prevent CPDA-1 35-day spoilage.
 * 3. Atomic State Shift: Blood unit status moves to `'requested'` with an on-chain ledger commitment and trace event.
 * 4. Fallback Nearby Donor Search: If inventory has fewer units than requested, the system automatically finds
 *    nearby registered, verified donors sorted by proximity to the hospital.
 */
router.post('/:requestId/match', auth, role(['admin']), async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    }

    if (['issued', 'closed', 'rejected'].includes(request.status)) {
      return res.status(409).json({
        error: `Cannot match a request in '${request.status}' state`,
        code: 'INVALID_REQUEST_STATE',
      });
    }

    const now = new Date();
    // 1. Strictly find safe, tested, unexpired blood units matching the requested blood group
    const availableUnits = await BloodUnit.find({
      bloodGroup: request.bloodGroup,
      testStatus: 'safe',
      availabilityStatus: 'available',
      expiryDate: { $gt: now },
    }).sort({ expiryDate: 1 }); // FIFO: oldest valid units allocated first

    const needed = request.unitsRequired;

    // Strict Enforcement: Only allocate if matching blood unit exists!
    if (availableUnits.length === 0) {
      // Find nearby registered donors for emergency outreach
      const matchedDonors = await searchDonorsByLocation({
        bloodGroup: request.bloodGroup,
        pincode: request.pincode,
        callerRole: 'admin',
        limit: 10,
      });
      request.matchedDonors = matchedDonors;
      request.allocatedUnits = [];
      request.status = 'open'; // Strictly keep open because NO blood unit was allocated
      await request.save();

      return res.status(409).json({
        error: `Cannot allocate: 0 units of ${request.bloodGroup} available in Cold Vault. Intake & test units first, or contact the ${matchedDonors.length} nearby donors.`,
        code: 'NO_BLOOD_UNITS_AVAILABLE',
        request,
        allocatedCount: 0,
        matchedDonorsCount: matchedDonors.length,
      });
    }

    const allocated = availableUnits.slice(0, needed);
    const allocatedUnitIds = allocated.map((u) => u.unitId);

    // Transition allocated units to 'requested'
    for (const unit of allocated) {
      unit.availabilityStatus = 'requested';
      const updatedHash = computeUnitHash(unit);

      let txHash = '';
      try {
        txHash = (await updateBloodUnitStatusOnChain(unit.unitId, 'requested', updatedHash)) || '';
      } catch (bcErr) {
        console.error('[Blockchain] Match allocation error:', bcErr.message);
      }

      if (txHash) unit.blockchainTxHash = txHash;
      await unit.save();

      // Log trace event
      const eventId = await generateEventId();
      await TraceEvent.create({
        eventId,
        unitId: unit.unitId,
        eventType: 'requested',
        description: `Allocated to Emergency Request #${request.requestId} for ${request.hospitalName}`,
        updatedBy: req.user.id,
        blockchainTxHash: txHash,
      });
    }

    request.allocatedUnits = allocatedUnitIds;

    // 2. If short of required inventory, run location-based donor search (Module 10)
    let matchedDonors = [];
    if (allocated.length < needed) {
      matchedDonors = await searchDonorsByLocation({
        bloodGroup: request.bloodGroup,
        pincode: request.pincode,
        callerRole: 'admin',
        limit: 10,
      });
    }
    request.matchedDonors = matchedDonors;

    // Status is strictly 'matched' because valid blood units were allocated!
    request.status = 'matched';
    await request.save();

    return res.status(200).json({
      request,
      allocatedCount: allocated.length,
      matchedDonorsCount: matchedDonors.length,
      message: `Successfully allocated ${allocated.length} safe unit(s) of ${request.bloodGroup} from Cold Vault to Request #${request.requestId}.${matchedDonors.length > 0 ? ` Found ${matchedDonors.length} backup donors.` : ''}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/requests/:requestId/issue ─────────────────────────────────────
/**
 * GUIDE EXPLANATION: Blood Unit Physical Dispatch & Custody Transfer
 * Question: "What happens when the hospital receives and transfuses the blood unit?"
 * Answer:
 * 1. Checks that allocated units are non-expired.
 * 2. Status transitions irreversibly to `'issued'` on the blockchain ledger.
 * 3. An immutable TraceEvent is minted, updating the donor's personal live donation history.
 * 4. Increments the donor's verified `donationCount` and awards recognition badges.
 */
router.post('/:requestId/issue', auth, role(['admin']), async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    }

    if (request.allocatedUnits.length === 0) {
      return res.status(409).json({
        error: 'No blood units are currently allocated to this request. Run match first.',
        code: 'NO_ALLOCATED_UNITS',
      });
    }

    const issuedUnitIds = [];

    for (const unitId of request.allocatedUnits) {
      const unit = await BloodUnit.findOne({ unitId });
      if (!unit) continue;

      // Do not issue expired or rejected units
      if (unit.expiryDate < new Date() || unit.availabilityStatus === 'expired') {
        continue;
      }

      unit.availabilityStatus = 'issued';
      const updatedHash = computeUnitHash(unit);

      let txHash = '';
      try {
        txHash = (await updateBloodUnitStatusOnChain(unit.unitId, 'issued', updatedHash)) || '';
      } catch (bcErr) {
        console.error('[Blockchain] Issue tx error:', bcErr.message);
      }

      if (txHash) unit.blockchainTxHash = txHash;
      await unit.save();

      // Log trace event
      const eventId = await generateEventId();
      await TraceEvent.create({
        eventId,
        unitId: unit.unitId,
        eventType: 'issued',
        description: `Dispatched & Transfused for ${request.hospitalName} (Request #${request.requestId})`,
        updatedBy: req.user.id,
        blockchainTxHash: txHash,
      });

      // Increment donor donation count (Module 11 Badges)
      const donor = await Donor.findOne({ donorId: unit.donorId });
      if (donor) {
        donor.donationCount = (donor.donationCount || 0) + 1;
        await donor.save();
      }

      issuedUnitIds.push(unitId);
    }

    request.status = 'issued';
    await request.save();

    return res.status(200).json({
      request,
      issuedUnits: issuedUnitIds,
      message: `Successfully issued ${issuedUnitIds.length} blood unit(s) to ${request.hospitalName}.`,
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/requests/:requestId/status ─────────────────────────────────────
// Admin: update status (reject or close)
router.put('/:requestId/status', auth, role(['admin']), async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const request = await EmergencyRequest.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found', code: 'NOT_FOUND' });
    }

    request.status = status;
    if (notes) request.notes = notes;
    await request.save();

    return res.status(200).json({ request });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
