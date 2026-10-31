'use strict';

const express = require('express');
const CampRegistration = require('../models/CampRegistration');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/camps/register
 * Public / Voluntary Donor: Register for upcoming youth blood donation camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, email, bloodGroup, affiliation, campId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required', code: 'VALIDATION_ERROR' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required', code: 'VALIDATION_ERROR' });
    }

    const targetCampId = campId || 'gech-hassan-2026';

    // Check if phone is already registered for this camp
    const existing = await CampRegistration.findOne({
      phone: phone.trim(),
      campId: targetCampId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You are already registered for this camp drive.',
        registration: existing,
        alreadyRegistered: true,
      });
    }

    // Generate unique serial token: count + 101
    const count = await CampRegistration.countDocuments({ campId: targetCampId });
    const serialNum = count + 101;
    const registrationToken = `GECH-CAMP-${serialNum}`;

    const registration = await CampRegistration.create({
      registrationToken,
      campId: targetCampId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      bloodGroup: bloodGroup || 'O+',
      affiliation: affiliation || 'GECH Student / Faculty',
      status: 'registered',
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for the Youth Blood Donor Movement!',
      registration,
      totalCount: count + 1,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/camps/stats
 * Public: Get current registrant count and target for the camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.get('/stats', async (req, res, next) => {
  try {
    const campId = req.query.campId || 'gech-hassan-2026';
    const totalCount = await CampRegistration.countDocuments({ campId });

    return res.status(200).json({
      campId,
      totalCount,
      targetGoal: 250,
      venue: 'Government Engineering College, Hassan (GECH)',
      date: '2026-11-09',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/camps/registrations
 * Admin only: View all registered youth donors for the camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.get('/registrations', auth, role(['admin']), async (req, res, next) => {
  try {
    const { campId = 'gech-hassan-2026', search, bloodGroup, status } = req.query;

    const filter = { campId };

    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodGroup = bloodGroup;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { registrationToken: { $regex: q, $options: 'i' } },
        { affiliation: { $regex: q, $options: 'i' } },
      ];
    }

    const registrations = await CampRegistration.find(filter).sort({ createdAt: -1 });
    const totalCount = await CampRegistration.countDocuments({ campId });

    // Calculate blood group distribution breakdown
    const allRegistrations = await CampRegistration.find({ campId });
    const bloodGroupCounts = {};
    let attendedCount = 0;
    let donatedCount = 0;

    allRegistrations.forEach((r) => {
      bloodGroupCounts[r.bloodGroup] = (bloodGroupCounts[r.bloodGroup] || 0) + 1;
      if (r.status === 'attended') attendedCount += 1;
      if (r.status === 'donated') donatedCount += 1;
    });

    return res.status(200).json({
      registrations,
      totalCount,
      attendedCount,
      donatedCount,
      targetGoal: 250,
      bloodGroupCounts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PUT /api/camps/registrations/:id/status
 * Admin only: Update registration status (attended, donated, deferred)
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.put('/registrations/:id/status', auth, role(['admin']), async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['registered', 'attended', 'donated', 'deferred'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', code: 'VALIDATION_ERROR' });
    }

    const registration = await CampRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found', code: 'NOT_FOUND' });
    }

    registration.status = status;
    if (notes !== undefined) registration.notes = notes;
    await registration.save();

    return res.status(200).json({ success: true, registration });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
