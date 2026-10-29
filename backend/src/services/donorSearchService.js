'use strict';

const Donor = require('../models/Donor');
const { checkDonorEligibility } = require('./eligibilityService');

const COMPATIBLE_DONORS = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

const { getCoordsForPincode, calculateHaversineKm } = require('./pincodeService');

/**
 * Searches for donors based on bloodGroup compatibility and geospatial pincode proximity.
 * Shows all active donors matching the given pincode and region.
 */
const searchDonorsByLocation = async ({
  bloodGroup,
  pincode,
  callerRole = 'public',
  maxDistanceKm = 500,
  includeCompatible = true,
  requireReadyOnly = false,
  limit = 50
}) => {
  const filter = {
    isFlagged: false,
  };

  if (requireReadyOnly) {
    filter.isVerified = true;
  }

  if (bloodGroup && bloodGroup !== 'ANY') {
    if (includeCompatible && COMPATIBLE_DONORS[bloodGroup]) {
      filter.bloodGroup = { $in: COMPATIBLE_DONORS[bloodGroup] };
    } else {
      filter.bloodGroup = bloodGroup;
    }
  }

  const rawDonors = await Donor.find(filter).lean();
  const targetPin = (pincode || '').trim();
  const targetCoords = targetPin ? getCoordsForPincode(targetPin, '', '', 0) : null;

  const matchedList = [];
  let donorIndex = 0;

  for (const donor of rawDonors) {
    const elig = checkDonorEligibility(donor);
    if (requireReadyOnly && !elig.eligible) {
      continue;
    }

    donorIndex++;
    const donorPin = (donor.pincode || '').trim();
    // Resolve precise coordinates with organic micro-spread for map plotting
    const donorCoords = (donor.lat && donor.lng)
      ? { lat: donor.lat, lng: donor.lng, city: donor.city }
      : getCoordsForPincode(donorPin, donor.city, donor.district, donorIndex);
    const donorBaseCoords = getCoordsForPincode(donorPin, donor.city, donor.district, 0);

    let distanceKm = 0;
    let matchType = 'all';
    let score = 3;

    if (targetCoords && targetPin) {
      if (donorPin === targetPin) {
        distanceKm = 0;
        score = 1;
        matchType = 'exact_pincode';
      } else {
        distanceKm = calculateHaversineKm(
          targetCoords.lat, targetCoords.lng,
          donorBaseCoords.lat, donorBaseCoords.lng
        );
        if (donorPin.slice(0, 3) === targetPin.slice(0, 3)) {
          score = 2;
          matchType = 'nearby_prefix';
        } else {
          score = 3;
          matchType = 'regional';
        }
      }

      if (maxDistanceKm && distanceKm > maxDistanceKm && donorPin !== targetPin) {
        continue;
      }
    }

    const canSeePhone = ['hospital', 'admin'].includes(callerRole);

    matchedList.push({
      _id: donor._id,
      userId: donor.userId,
      donorId: donor.donorId,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      district: donor.district,
      pincode: donor.pincode,
      lat: donorCoords.lat,
      lng: donorCoords.lng,
      distanceKm,
      isVerified: donor.isVerified,
      isEligible: elig.eligible,
      eligibilityReason: elig.reason,
      daysRemaining: elig.daysRemaining,
      lastDonationDate: donor.lastDonationDate,
      donationCount: donor.donationCount || 0,
      phone: canSeePhone ? donor.phone : undefined,
      matchType,
      _score: score,
    });
  }

  // Sort: Exact pincode match first, then closest distance, then donation count
  matchedList.sort((a, b) => {
    if (a._score !== b._score) return a._score - b._score;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return (b.donationCount || 0) - (a.donationCount || 0);
  });

  return matchedList.slice(0, limit).map(({ _score, ...rest }) => rest);
};

module.exports = {
  searchDonorsByLocation,
  getCoordsForPincode,
  calculateHaversineKm,
};

