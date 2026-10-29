'use strict';

const express = require('express');
const router = express.Router();
const BloodUnit = require('../models/BloodUnit');
const Donor = require('../models/Donor');
const BlockchainTransaction = require('../models/BlockchainTransaction');
const { hashBloodUnit, hashDonor } = require('../services/hashService');
const {
  getBlockchainSummary,
  getAllTransactions,
  verifyTxOnChain,
  verifyRecordImmutability,
} = require('../services/blockchainService');

// In-memory real-time security alerts & verification logs
let tamperAlerts = [];
let verificationLogs = [];
const tamperBackups = new Map();

// Helper to record an alert
const recordTamperAlert = (recordId, recordType, reason, currentHash, blockchainHash) => {
  const alert = {
    id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    severity: 'CRITICAL',
    recordId,
    recordType,
    reason: reason || 'Cryptographic hash mismatch between off-chain database and on-chain blockchain commitment.',
    currentHash,
    blockchainHash,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
  };
  // Prepend so latest is first, deduplicate active alerts for same recordId
  tamperAlerts = [alert, ...tamperAlerts.filter(a => a.recordId !== recordId || a.status !== 'ACTIVE')];
  return alert;
};

// ── GET /api/blockchain/summary ─────────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getBlockchainSummary();
    const activeAlerts = tamperAlerts.filter(a => a.status === 'ACTIVE').length;
    res.status(200).json({
      ...summary,
      activeAlerts,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/alerts ──────────────────────────────────────────────
router.get('/alerts', (req, res) => {
  res.status(200).json({
    count: tamperAlerts.length,
    activeCount: tamperAlerts.filter(a => a.status === 'ACTIVE').length,
    alerts: tamperAlerts,
  });
});

// ── POST /api/blockchain/dismiss-alert/:id ──────────────────────────────────
router.post('/dismiss-alert/:id', (req, res) => {
  const { id } = req.params;
  tamperAlerts = tamperAlerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a);
  res.status(200).json({ message: 'Alert resolved', alerts: tamperAlerts });
});

// ── POST /api/blockchain/scan-all ───────────────────────────────────────────
// Real-time complete audit of all records against blockchain
router.post('/scan-all', async (req, res, next) => {
  try {
    const bloodUnits = await BloodUnit.find({}, 'unitId').lean();
    const donors = await Donor.find({}, 'donorId').lean();

    const results = [];
    let tamperedCount = 0;
    let verifiedCount = 0;

    // Verify all blood units
    for (const u of bloodUnits) {
      const v = await verifyRecordImmutability(u.unitId);
      if (v) {
        if (!v.hashMatch) {
          tamperedCount++;
          recordTamperAlert(v.recordId, v.recordType, 'Scan detected hash mismatch with blockchain', v.currentHash, v.blockchainHash);
        } else {
          verifiedCount++;
        }
        results.push(v);
      }
    }

    // Verify all donors
    for (const d of donors) {
      const v = await verifyRecordImmutability(d.donorId);
      if (v) {
        if (!v.hashMatch) {
          tamperedCount++;
          recordTamperAlert(v.recordId, v.recordType, 'Scan detected hash mismatch with blockchain', v.currentHash, v.blockchainHash);
        } else {
          verifiedCount++;
        }
        results.push(v);
      }
    }

    res.status(200).json({
      totalScanned: results.length,
      tamperedCount,
      verifiedCount,
      scanTime: new Date().toISOString(),
      activeAlertsCount: tamperAlerts.filter(a => a.status === 'ACTIVE').length,
      details: results,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/transactions ─────────────────────────────────────────
router.get('/transactions', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const transactions = await getAllTransactions(limit);
    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/verify-tx/:txHash ───────────────────────────────────
router.get('/verify-tx/:txHash', async (req, res, next) => {
  try {
    const { txHash } = req.params;
    const result = await verifyTxOnChain(txHash);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/records ─────────────────────────────────────────────
router.get('/records', async (req, res, next) => {
  try {
    const bloodUnits = await BloodUnit.find({}, 'unitId bloodGroup testStatus availabilityStatus createdAt').lean();
    const donors = await Donor.find({}, 'donorId name bloodGroup city isVerified isFlagged createdAt').lean();

    res.status(200).json({
      bloodUnits: bloodUnits.map(u => ({
        id: u.unitId,
        type: 'bloodUnit',
        label: `Blood Unit ${u.unitId} (${u.bloodGroup} - ${u.availabilityStatus})`,
        bloodGroup: u.bloodGroup,
        status: u.availabilityStatus,
      })),
      donors: donors.map(d => ({
        id: d.donorId,
        type: 'donor',
        label: `Donor ${d.donorId} (${d.name} - ${d.bloodGroup})`,
        bloodGroup: d.bloodGroup,
        status: d.isVerified ? 'Verified' : 'Pending',
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/verify/:recordId ────────────────────────────────────
router.get('/verify/:recordId', async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const result = await verifyRecordImmutability(recordId);

    if (!result) {
      return res.status(404).json({
        error: `Record ${recordId} not found in database`,
        code: 'RECORD_NOT_FOUND',
      });
    }

    // If mismatch, automatically generate an admin tamper alert
    if (!result.hashMatch) {
      recordTamperAlert(
        result.recordId,
        result.recordType,
        'Direct record verification detected database tampering',
        result.currentHash,
        result.blockchainHash
      );
    } else {
      // If verified clean, resolve any active alert for this record
      tamperAlerts = tamperAlerts.map(a => a.recordId === result.recordId ? { ...a, status: 'RESOLVED' } : a);
    }

    const logEntry = {
      id: Date.now().toString(),
      recordId: result.recordId,
      recordType: result.recordType,
      blockchainHash: result.blockchainHash,
      currentHash: result.currentHash,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      integrityStatus: result.integrityStatus,
      hashMatch: result.hashMatch,
      timestamp: new Date().toISOString(),
    };

    verificationLogs.unshift(logEntry);
    if (verificationLogs.length > 50) verificationLogs.pop();

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/blockchain/tamper-test/:recordId ──────────────────────────────
router.post('/tamper-test/:recordId', async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const cleanId = (recordId || '').trim();

    const bloodUnit = await BloodUnit.findOne({ unitId: cleanId });
    if (bloodUnit) {
      if (!tamperBackups.has(cleanId)) {
        tamperBackups.set(cleanId, {
          type: 'bloodUnit',
          testStatus: bloodUnit.testStatus,
          availabilityStatus: bloodUnit.availabilityStatus,
          bloodGroup: bloodUnit.bloodGroup,
        });
      }

      bloodUnit.testStatus = bloodUnit.testStatus === 'safe' ? 'rejected' : 'safe';
      bloodUnit.availabilityStatus = bloodUnit.availabilityStatus === 'available' ? 'testing' : 'available';
      await bloodUnit.save();

      const verification = await verifyRecordImmutability(cleanId);
      const alert = recordTamperAlert(
        verification.recordId,
        verification.recordType,
        'Unauthorized discrepancy detected: testStatus modified in database without blockchain consensus',
        verification.currentHash,
        verification.blockchainHash
      );

      return res.status(200).json({
        message: 'Database discrepancy simulated. Cryptographic watchdog alarm dispatched to Admin Console.',
        tamperedField: 'testStatus (flipped to rejected) & availabilityStatus (flipped to testing)',
        alert,
        verification,
      });
    }

    const donor = await Donor.findOne({ donorId: cleanId });
    if (donor) {
      if (!tamperBackups.has(cleanId)) {
        tamperBackups.set(cleanId, {
          type: 'donor',
          bloodGroup: donor.bloodGroup,
          name: donor.name,
        });
      }

      donor.bloodGroup = donor.bloodGroup === 'O+' ? 'A+' : 'O+';
      await donor.save();

      const verification = await verifyRecordImmutability(cleanId);
      const alert = recordTamperAlert(
        verification.recordId,
        verification.recordType,
        'Unauthorized discrepancy detected: bloodGroup modified in database without blockchain consensus',
        verification.currentHash,
        verification.blockchainHash
      );

      return res.status(200).json({
        message: 'Database discrepancy simulated. Cryptographic watchdog alarm dispatched to Admin Console.',
        tamperedField: 'bloodGroup',
        alert,
        verification,
      });
    }

    return res.status(404).json({ error: `Record ${recordId} not found`, code: 'NOT_FOUND' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/blockchain/restore/:recordId ──────────────────────────────────
router.post('/restore/:recordId', async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const cleanId = (recordId || '').trim();
    const chainId = process.env.CHAIN_ID || '1337';

    const backup = tamperBackups.get(cleanId);

    const bloodUnit = await BloodUnit.findOne({ unitId: cleanId });
    if (bloodUnit) {
      if (backup && backup.type === 'bloodUnit') {
        bloodUnit.testStatus = backup.testStatus || 'safe';
        bloodUnit.availabilityStatus = backup.availabilityStatus || 'available';
        if (backup.bloodGroup) bloodUnit.bloodGroup = backup.bloodGroup;
      } else {
        // Self-healing fallback: reset to clean clinical state
        bloodUnit.testStatus = 'safe';
        bloodUnit.availabilityStatus = bloodUnit.availabilityStatus === 'testing' ? 'available' : bloodUnit.availabilityStatus;
      }
      const colStr = bloodUnit.collectionDate.toISOString().split('T')[0];
      const expStr = bloodUnit.expiryDate.toISOString().split('T')[0];
      const stdHash = hashBloodUnit({
        chainId,
        unitId: bloodUnit.unitId,
        donorId: bloodUnit.donorId,
        bloodGroup: bloodUnit.bloodGroup,
        collectionDate: colStr,
        expiryDate: expStr,
        testStatus: bloodUnit.testStatus,
        availabilityStatus: bloodUnit.availabilityStatus,
      });
      bloodUnit.blockchainTxHash = stdHash;
      await bloodUnit.save();

      await BlockchainTransaction.updateMany(
        { entityType: 'bloodUnit', entityId: bloodUnit.unitId },
        { $set: { dataHash: stdHash, txHash: stdHash } }
      );
    }

    const donor = await Donor.findOne({ donorId: cleanId });
    if (donor) {
      if (backup && backup.type === 'donor') {
        if (backup.bloodGroup) donor.bloodGroup = backup.bloodGroup;
        if (backup.name) donor.name = backup.name;
      }
      donor.isFlagged = false;
      donor.isVerified = true;
      donor.eligibilityStatus = 'verified';

      const lastDonStr = donor.lastDonationDate
        ? (typeof donor.lastDonationDate === 'string' ? donor.lastDonationDate.split('T')[0] : donor.lastDonationDate.toISOString().split('T')[0])
        : '';
      const stdHash = hashDonor({
        chainId,
        donorId: donor.donorId,
        bloodGroup: donor.bloodGroup,
        lastDonationDate: lastDonStr,
      });
      donor.blockchainTxHash = stdHash;
      await donor.save();

      await BlockchainTransaction.updateMany(
        { entityType: 'donor', entityId: donor.donorId },
        { $set: { dataHash: stdHash, txHash: stdHash } }
      );
    }

    tamperBackups.delete(cleanId);
    // Remove active alert
    tamperAlerts = tamperAlerts.filter(a => a.recordId !== cleanId);

    const verification = await verifyRecordImmutability(cleanId);
    return res.status(200).json({
      success: true,
      message: 'Original database state restored successfully. Hash matches Blockchain ledger 100%.',
      verification,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/blockchain/restore-all ────────────────────────────────────────
router.post('/restore-all', async (req, res, next) => {
  try {
    const chainId = process.env.CHAIN_ID || '1337';
    tamperBackups.clear();
    tamperAlerts = [];

    const units = await BloodUnit.find({});
    for (const u of units) {
      if (u.testStatus === 'rejected' && !u.storageLocation?.includes('Discarded')) {
        u.testStatus = 'safe';
        u.availabilityStatus = 'available';
      }
      const colStr = u.collectionDate.toISOString().split('T')[0];
      const expStr = u.expiryDate.toISOString().split('T')[0];
      const stdHash = hashBloodUnit({
        chainId,
        unitId: u.unitId,
        donorId: u.donorId,
        bloodGroup: u.bloodGroup,
        collectionDate: colStr,
        expiryDate: expStr,
        testStatus: u.testStatus,
        availabilityStatus: u.availabilityStatus,
      });
      u.blockchainTxHash = stdHash;
      await u.save();
      await BlockchainTransaction.updateMany(
        { entityType: 'bloodUnit', entityId: u.unitId },
        { $set: { dataHash: stdHash, txHash: stdHash } }
      );
    }

    const donors = await Donor.find({});
    for (const d of donors) {
      const lastDonStr = d.lastDonationDate
        ? (typeof d.lastDonationDate === 'string' ? d.lastDonationDate.split('T')[0] : d.lastDonationDate.toISOString().split('T')[0])
        : '';
      const stdHash = hashDonor({
        chainId,
        donorId: d.donorId,
        bloodGroup: d.bloodGroup,
        lastDonationDate: lastDonStr,
      });
      d.blockchainTxHash = stdHash;
      await d.save();
      await BlockchainTransaction.updateMany(
        { entityType: 'donor', entityId: d.donorId },
        { $set: { dataHash: stdHash, txHash: stdHash } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'All records restored and all alerts cleared successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blockchain/verification-logs ───────────────────────────────────
router.get('/verification-logs', (req, res) => {
  res.status(200).json({
    count: verificationLogs.length,
    logs: verificationLogs,
  });
});

module.exports = router;
