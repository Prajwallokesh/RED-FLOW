'use strict';

const mongoose = require('mongoose');

/**
 * GUIDE EXPLANATION: Blood Unit Cold-Chain Model
 * Question: "How does the system track a blood unit and ensure its safety?"
 * Answer:
 * 1. Shelf-Life Management: Whole blood collected with CPDA-1 anticoagulant has
 *    a strictly enforced 35-day viability window. The system automatically computes
 *    `expiryDate = collectionDate + 35 days`.
 * 2. Temperature & Vault Storage: Units are preserved at 2°C - 6°C in monitored cold vaults.
 * 3. 4-Stage Lifecycle:
 *    - 'collected': Intake pouch registered from a verified donor.
 *    - 'testing': Undergoing mandatory 5-panel serology screening.
 *    - 'available': Certified 'safe' and stored in cold chain vault.
 *    - 'requested': Reserved for an authorized hospital emergency requisition.
 *    - 'issued': Transfused to an emergency patient.
 * 4. Blockchain Ledger: Each lifecycle transition anchors a cryptographic hash
 *    into the Ethereum smart contract via `blockchainTxHash`.
 */
const bloodUnitSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    donorId: {
      type: String,
      required: true,
      ref: 'Donor',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    testStatus: {
      type: String,
      enum: ['pending', 'safe', 'rejected'],
      default: 'pending',
    },
    availabilityStatus: {
      type: String,
      enum: ['collected', 'testing', 'available', 'requested', 'issued', 'expired', 'rejected'],
      default: 'collected',
    },
    storageLocation: {
      type: String,
      default: 'Cold Storage Vault 1',
      trim: true,
    },
    qrUrl: {
      type: String,
      default: '',
    },
    blockchainTxHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
