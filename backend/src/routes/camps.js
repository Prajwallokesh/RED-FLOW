'use strict';

const express = require('express');
const Camp = require('../models/Camp');
const CampRegistration = require('../models/CampRegistration');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/camps
 * Public / Donors: Fetch all active and upcoming blood donation camps
 * Auto-seeds default GECH Hassan 2026 camp if collection is empty
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.get('/', async (req, res, next) => {
  try {
    let camps = await Camp.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });

    // Seed default camp if empty
    if (camps.length === 0) {
      try {
        const defaultCamp = await Camp.create({
          campId: 'gech-hassan-2026',
          title: 'Government Engineering College, Hassan (GECH)',
          organizer: 'RedFlow Youth Movement & NSS',
          venue: 'GECH Auditorium, Hassan, Karnataka',
          city: 'Hassan',
          date: '9/11/2026 (November 9, 2026)',
          time: '9:00 AM – 4:30 PM IST',
          clinicalPartner: 'HIMS Blood Bank',
          targetUnits: 250,
          description: 'Mega youth blood donation drive in association with HIMS Blood Bank. Earn official voluntary certificates with Ethereum blockchain proof.',
          contactPhone: '+91 98801 23456',
          contactEmail: 'youth@redflow.org',
          status: 'upcoming',
          notifyDonors: false,
        });
        camps = [defaultCamp];
      } catch (seedErr) {
        // If unique index collision, fetch existing
        camps = await Camp.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });
      }
    }

    // Attach live registered donor count to each camp
    const campsWithCounts = await Promise.all(
      camps.map(async (c) => {
        const count = await CampRegistration.countDocuments({ campId: c.campId });
        return {
          ...c.toObject(),
          registeredCount: count,
        };
      })
    );

    return res.status(200).json({ success: true, camps: campsWithCounts });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/camps
 * Admin Only: Publish a new blood donation camp and broadcast alert to donors
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.post('/', auth, role(['admin']), async (req, res, next) => {
  try {
    const {
      title,
      organizer,
      venue,
      city,
      date,
      time,
      clinicalPartner,
      targetUnits,
      description,
      contactPhone,
      contactEmail,
      notifyDonors = true,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Camp title is required', code: 'VALIDATION_ERROR' });
    }
    if (!venue || !venue.trim()) {
      return res.status(400).json({ error: 'Camp venue is required', code: 'VALIDATION_ERROR' });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ error: 'Camp date is required', code: 'VALIDATION_ERROR' });
    }
    if (!time || !time.trim()) {
      return res.status(400).json({ error: 'Camp time is required', code: 'VALIDATION_ERROR' });
    }

    // Slugify title for campId
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    const campId = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const camp = await Camp.create({
      campId,
      title: title.trim(),
      organizer: organizer ? organizer.trim() : 'RedFlow Youth Movement & NSS',
      venue: venue.trim(),
      city: city ? city.trim() : 'Hassan',
      date: date.trim(),
      time: time.trim(),
      clinicalPartner: clinicalPartner ? clinicalPartner.trim() : 'HIMS Blood Bank',
      targetUnits: Number(targetUnits) || 250,
      description: description ? description.trim() : '',
      contactPhone: contactPhone ? contactPhone.trim() : '+91 98801 23456',
      contactEmail: contactEmail ? contactEmail.trim() : 'youth@redflow.org',
      status: 'upcoming',
      createdBy: req.user.id,
      notifyDonors: Boolean(notifyDonors),
    });

    // Auto-broadcast notifications to verified donors if requested
    let broadcastCount = 0;
    if (notifyDonors) {
      try {
        const donors = await Donor.find({ isVerified: true, status: { $ne: 'flagged' } });
        if (donors.length > 0) {
          const notificationsToInsert = donors.map((d) => ({
            recipientDonorId: d.donorId,
            recipientUserId: d.userId,
            senderName: req.user.name || 'RedFlow Central Admin',
            senderRole: 'admin',
            senderId: req.user.id,
            bloodGroup: d.bloodGroup || 'O+',
            urgency: 'high',
            title: `New Blood Camp: ${camp.title}`,
            message: `Official voluntary drive announced at ${camp.venue} on ${camp.date} (${camp.time}). Join hands to save lives!`,
          }));
          await Notification.insertMany(notificationsToInsert);
          broadcastCount = donors.length;
        }
      } catch (notifErr) {
        console.error('[Camps] Auto-notification error:', notifErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Camp successfully published! ${broadcastCount > 0 ? `Alert delivered to ${broadcastCount} verified donors.` : ''}`,
      camp: { ...camp.toObject(), registeredCount: 0 },
      broadcastCount,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PUT /api/camps/:id
 * Admin Only: Update camp details or status
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.put('/:id', auth, role(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const camp = await Camp.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campId: id }].filter(Boolean),
    });

    if (!camp) {
      return res.status(404).json({ error: 'Camp not found', code: 'NOT_FOUND' });
    }

    Object.assign(camp, updateData);
    await camp.save();

    const registeredCount = await CampRegistration.countDocuments({ campId: camp.campId });

    return res.status(200).json({
      success: true,
      message: 'Camp updated successfully',
      camp: { ...camp.toObject(), registeredCount },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DELETE /api/camps/:id
 * Admin Only: Cancel or remove camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.delete('/:id', auth, role(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const camp = await Camp.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campId: id }].filter(Boolean),
    });

    if (!camp) {
      return res.status(404).json({ error: 'Camp not found', code: 'NOT_FOUND' });
    }

    camp.status = 'cancelled';
    await camp.save();

    return res.status(200).json({
      success: true,
      message: 'Camp cancelled successfully',
      campId: camp.campId,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/camps/register
 * Public / Voluntary Donor: Register for upcoming youth blood donation camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, email, bloodGroup, affiliation, campId, donorId, userId } = req.body;

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
    const registrationToken = `CAMP-${serialNum}`;

    const registration = await CampRegistration.create({
      registrationToken,
      campId: targetCampId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      bloodGroup: bloodGroup || 'O+',
      affiliation: affiliation || (donorId ? 'Verified Donor' : 'Voluntary Donor'),
      donorId: donorId || '',
      userId: userId || null,
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
 * Public: Get current registrant count and target for a camp
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.get('/stats', async (req, res, next) => {
  try {
    const campId = req.query.campId || 'gech-hassan-2026';
    const totalCount = await CampRegistration.countDocuments({ campId });
    const camp = await Camp.findOne({ campId });

    return res.status(200).json({
      campId,
      totalCount,
      targetGoal: camp ? camp.targetUnits : 250,
      venue: camp ? camp.venue : 'Government Engineering College, Hassan (GECH)',
      date: camp ? camp.date : '9/11/2026',
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
    const { campId, search, bloodGroup, status } = req.query;

    const filter = {};
    if (campId && campId !== 'ALL') {
      filter.campId = campId;
    }

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
    const countFilter = (campId && campId !== 'ALL') ? { campId } : {};
    const totalCount = await CampRegistration.countDocuments(countFilter);

    // Calculate blood group distribution breakdown
    const allRegistrations = await CampRegistration.find(countFilter);
    const bloodGroupCounts = {};
    let attendedCount = 0;
    let donatedCount = 0;

    allRegistrations.forEach((r) => {
      bloodGroupCounts[r.bloodGroup] = (bloodGroupCounts[r.bloodGroup] || 0) + 1;
      if (r.status === 'attended') attendedCount += 1;
      if (r.status === 'donated') donatedCount += 1;
    });

    const targetCamp = (campId && campId !== 'ALL') ? await Camp.findOne({ campId }) : null;

    return res.status(200).json({
      registrations,
      totalCount,
      attendedCount,
      donatedCount,
      targetGoal: targetCamp ? targetCamp.targetUnits : 250,
      bloodGroupCounts,
      camp: targetCamp,
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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/camps/:id
 * Public: Fetch single camp details by campId or MongoDB _id
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let camp = await Camp.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { campId: id },
      ].filter(Boolean),
    });

    if (!camp) {
      camp = await Camp.findOne({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });
    }

    if (!camp) {
      return res.status(404).json({ error: 'Camp not found', code: 'NOT_FOUND' });
    }

    const registeredCount = await CampRegistration.countDocuments({ campId: camp.campId });
    return res.status(200).json({
      success: true,
      camp: { ...camp.toObject(), registeredCount },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
