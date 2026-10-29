'use strict';

const { ethers } = require('ethers');

/**
 * Generates a deterministic keccak256 hash for a donor record.
 * Field order: chainId|donorId|bloodGroup|lastDonationDate
 * NEVER change this order — it must match the frontend lib/hash.js
 */
const hashDonor = ({ chainId, donorId, bloodGroup, lastDonationDate }) => {
  const input = `${chainId}|${donorId}|${bloodGroup}|${lastDonationDate ?? ''}`;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
};

/**
 * Generates a deterministic keccak256 hash for a blood unit record.
 * Field order: chainId|unitId|donorId|bloodGroup|collectionDate|expiryDate|testStatus|availabilityStatus
 */
const hashBloodUnit = ({
  chainId,
  unitId,
  donorId,
  bloodGroup,
  collectionDate,
  expiryDate,
  testStatus,
  availabilityStatus,
}) => {
  const input = `${chainId}|${unitId}|${donorId}|${bloodGroup}|${collectionDate}|${expiryDate}|${testStatus}|${availabilityStatus}`;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
};

module.exports = { hashDonor, hashBloodUnit };
