'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const { searchDonorsByLocation } = require('../services/donorSearchService');

const router = express.Router();

// ── POST /api/donor-search ──────────────────────────────────────────────────
// Location-based search by blood group and 6-digit pincode
router.post('/', async (req, res, next) => {
  try {
    const { bloodGroup, pincode, radiusKm, maxDistanceKm } = req.body;
    const callerRole = req.user?.role || 'admin';

    const cleanPin = pincode ? String(pincode).trim() : undefined;
    const donors = await searchDonorsByLocation({
      bloodGroup: (!bloodGroup || bloodGroup === 'ANY') ? undefined : bloodGroup,
      pincode: cleanPin,
      callerRole,
      maxDistanceKm: Number(radiusKm || maxDistanceKm) || 500,
      limit: 50,
    });

    return res.status(200).json({
      donors,
      count: donors.length,
      searchCriteria: { bloodGroup: bloodGroup || 'ANY', pincode: cleanPin || 'ALL' },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/donor-search/nearby ───────────────────────────────────────────
// Nearby search by pincode with radius heuristic
router.post('/nearby', async (req, res, next) => {
  try {
    const { pincode, radiusKm, bloodGroup } = req.body;
    const callerRole = req.user?.role || 'admin';

    const donors = await searchDonorsByLocation({
      bloodGroup: (!bloodGroup || bloodGroup === 'ANY') ? undefined : bloodGroup,
      pincode: (pincode || '560001').trim(),
      callerRole,
      maxDistanceKm: Number(radiusKm) || 50,
      limit: 50,
    });

    return res.status(200).json({
      donors,
      count: donors.length,
      pincode,
      radiusKm: radiusKm || 50,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/donor-search/geocode ───────────────────────────────────────────
// Universal Pincode Geocoding Resolver for Hassan and pan-India
router.get('/geocode', async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const { resolvePincodeAsync } = require('../services/pincodeService');
    const result = await resolvePincodeAsync(pincode || '573201');
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
