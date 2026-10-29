import { ethers } from 'ethers';

/**
 * Generates the deterministic keccak256 hash for a donor record.
 * Field order: chainId|donorId|bloodGroup|lastDonationDate
 * NEVER change this order.
 */
export const hashDonor = ({ chainId, donorId, bloodGroup, lastDonationDate }) => {
  const input = `${chainId}|${donorId}|${bloodGroup}|${lastDonationDate ?? ''}`;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
};

/**
 * Generates the deterministic keccak256 hash for a blood unit record.
 * Field order: chainId|unitId|donorId|bloodGroup|collectionDate|expiryDate|testStatus|availabilityStatus
 * NEVER change this order.
 */
export const hashBloodUnit = ({
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
