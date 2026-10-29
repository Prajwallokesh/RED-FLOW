'use strict';

const express = require('express');
const Donor = require('../models/Donor');
const BloodUnit = require('../models/BloodUnit');
const EmergencyRequest = require('../models/EmergencyRequest');
const BlockchainTransaction = require('../models/BlockchainTransaction');
const TraceEvent = require('../models/TraceEvent');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// ── GET /api/dashboard/admin ────────────────────────────────────────────────
// Real-time aggregate statistics for Admin Dashboard
router.get('/admin', auth, role(['admin']), async (req, res, next) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Donor counts
    const [totalDonors, verifiedDonors, pendingDonors, flaggedDonors] = await Promise.all([
      Donor.countDocuments(),
      Donor.countDocuments({ isVerified: true, isFlagged: false }),
      Donor.countDocuments({ isVerified: false, isFlagged: false }),
      Donor.countDocuments({ isFlagged: true }),
    ]);

    // 2. Blood Unit inventory & breakdown
    const allUnits = await BloodUnit.find().lean();
    let availableCount = 0;
    let expiredCount = 0;
    let nearExpiryCount = 0;
    const byGroup = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };

    for (const u of allUnits) {
      if (u.availabilityStatus === 'available' && u.expiryDate > now) {
        availableCount += 1;
        if (byGroup[u.bloodGroup] !== undefined) {
          byGroup[u.bloodGroup] += 1;
        }
        if (new Date(u.expiryDate) <= in7Days) {
          nearExpiryCount += 1;
        }
      } else if (u.availabilityStatus === 'expired' || u.expiryDate <= now) {
        expiredCount += 1;
      }
    }

    // 3. Emergency Requests
    const [openRequests, criticalRequests, totalRequests] = await Promise.all([
      EmergencyRequest.countDocuments({ status: 'open' }),
      EmergencyRequest.countDocuments({ urgency: 'critical', status: { $in: ['open', 'matched'] } }),
      EmergencyRequest.countDocuments(),
    ]);

    // 4. Recent activity (last 10 donations/transfusions)
    const recentDonations = await TraceEvent.find({ eventType: { $in: ['created', 'issued'] } })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // 5. Recent Blockchain Transactions (last 10 on-chain)
    const recentTransactions = await BlockchainTransaction.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      totalDonors,
      verifiedDonors,
      pendingDonors,
      flaggedDonors,
      availableUnits: {
        total: availableCount,
        byGroup,
      },
      expiredUnits: expiredCount,
      nearExpiry: nearExpiryCount,
      openRequests,
      criticalRequests,
      totalRequests,
      recentDonations,
      recentTransactions,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/hospital ─────────────────────────────────────────────
// Statistics & submitted requests for active Hospital
router.get('/hospital', auth, role(['hospital']), async (req, res, next) => {
  try {
    const hospitalId = req.user.id;

    const [myRequests, openCount, matchedCount, issuedCount] = await Promise.all([
      EmergencyRequest.find({ hospitalId }).sort({ createdAt: -1 }).lean(),
      EmergencyRequest.countDocuments({ hospitalId, status: 'open' }),
      EmergencyRequest.countDocuments({ hospitalId, status: 'matched' }),
      EmergencyRequest.countDocuments({ hospitalId, status: 'issued' }),
    ]);

    return res.status(200).json({
      requests: myRequests,
      counts: {
        total: myRequests.length,
        open: openCount,
        matched: matchedCount,
        issued: issuedCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
