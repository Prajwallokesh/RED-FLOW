'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { ethers } = require('ethers');

const User                 = require('./models/User');
const Donor                = require('./models/Donor');
const BloodUnit            = require('./models/BloodUnit');
const EmergencyRequest     = require('./models/EmergencyRequest');
const TraceEvent           = require('./models/TraceEvent');
const BlockchainTransaction = require('./models/BlockchainTransaction');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const keccak = (str) => ethers.keccak256(ethers.toUtf8Bytes(str));

const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const daysFrom = (date, n) => new Date(new Date(date).getTime() + n * 86400000);

const CHAIN_ID = process.env.CHAIN_ID || '1337';
const WALLET   = process.env.ADMIN_WALLET_ADDRESS || '0xA00D124986D984cA438f646903f3A3f485167154';
const CONTRACT = process.env.CONTRACT_ADDRESS     || '0xB3F4a2c1D9E84aF3B5C76e21d0A82F1C9E5B7D24';

// ─── Initial Clinical Seed Data ────────────────────────────────────────────────────────────

const DONOR_DATA = [
  // name, age, gender, bloodGroup, phone, city, district, pincode, lat, lng, donationCount, lastDonationDaysAgo, status
  ['Priya Sharma',      28, 'female', 'O+',  '9876543201', 'Hassan',     'Hassan',             '573201', 13.0071, 76.0993, 8,  90,  'verified'],
  ['Ravi Kumar',        34, 'male',   'A+',  '9876543202', 'Hassan',     'Hassan',             '573201', 13.0090, 76.1010, 12, 120, 'verified'],
  ['Anitha Naidu',      26, 'female', 'B+',  '9876543203', 'Bengaluru',  'Bengaluru',          '560001', 12.9716, 77.5946, 5,  60,  'verified'],
  ['Suresh Gowda',      41, 'male',   'AB+', '9876543204', 'Hassan',     'Hassan',             '573201', 13.0050, 76.0980, 3,  100, 'verified'],
  ['Meena Patel',       30, 'female', 'O-',  '9876543205', 'Mysuru',     'Mysuru',             '570001', 12.2958, 76.6394, 10, 80,  'verified'],
  ['Kiran Reddy',       22, 'male',   'A-',  '9876543206', 'Mangaluru',  'Dakshina Kannada',   '575001', 12.9141, 74.8560, 2,  200, 'verified'],
  ['Deepa Rao',         35, 'female', 'B-',  '9876543207', 'Hubli',      'Dharwad',            '580001', 15.3647, 75.1240, 6,  50,  'verified'],
  ['Arjun Singh',       29, 'male',   'AB-', '9876543208', 'Hassan',     'Hassan',             '573201', 13.0100, 76.1020, 4,  70,  'verified'],
  ['Kavitha Murthy',    45, 'female', 'O+',  '9876543209', 'Arsikere',   'Hassan',             '573103', 13.3150, 76.2570, 1,  400, 'pending'],
  ['Naveen Joshi',      31, 'male',   'A+',  '9876543210', 'Belur',      'Hassan',             '573115', 13.1610, 75.8600, 0,  0,   'pending'],
  ['Sunita Das',        27, 'female', 'B+',  '9876543211', 'Shivamogga', 'Shivamogga',         '577201', 13.9299, 75.5681, 0,  0,   'pending'],
  ['Mohammed Irfan',    38, 'male',   'O+',  '9876543212', 'Bengaluru',  'Bengaluru',          '560002', 12.9600, 77.6010, 0,  0,   'pending'],
  ['Lakshmi Nair',      33, 'female', 'A-',  '9876543213', 'Hassan',     'Hassan',             '573201', 13.0025, 76.0955, 0,  0,   'flagged'],
  ['Prakash Shetty',    50, 'male',   'B+',  '9876543214', 'Mangaluru',  'Dakshina Kannada',   '575002', 12.9200, 74.8650, 0,  0,   'flagged'],
  ['Rekha Iyer',        24, 'female', 'O+',  '9876543215', 'Mysuru',     'Mysuru',             '570002', 12.2880, 76.6310, 0,  0,   'pending'],
];

const HOSPITAL_DATA = [
  ['Hassan General Hospital',    'hassan.hospital@redflow.test',    'Hassan',    'Hassan',    '573201'],
  ['Bengaluru Blood Center',     'bengaluru.hospital@redflow.test', 'Bengaluru', 'Bengaluru', '560001'],
  ['Mysuru Health Institute',    'mysuru.hospital@redflow.test',    'Mysuru',    'Mysuru',    '570001'],
];

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redflow';
  console.log('[Seed] Connecting to:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Step 1: Wipe all collections
  console.log('[Seed] Wiping all collections...');
  await Promise.all([
    User.deleteMany({}),
    Donor.deleteMany({}),
    BloodUnit.deleteMany({}),
    EmergencyRequest.deleteMany({}),
    TraceEvent.deleteMany({}),
    BlockchainTransaction.deleteMany({}),
  ]);
  console.log('[Seed] All collections cleared.');

  const passwordHash     = await bcrypt.hash('smps@123', 10);
  const hospitalPassHash = await bcrypt.hash('Hospital@123', 10);
  const donorPassHash    = await bcrypt.hash('Donor@123', 10);

  // Step 2: Create Admin
  await User.create({
    name: 'SMPS Admin', email: 'smps@redflow.com', passwordHash,
    role: 'admin', phone: '+91 99999 99999', address: 'Central Health HQ',
    district: 'Bengaluru', state: 'Karnataka', pincode: '560001',
  });
  console.log('[Seed] Admin created: smps@redflow.com / smps@123');

  // Step 3: Create Hospital Accounts
  const hospitals = await User.insertMany(
    HOSPITAL_DATA.map(([name, email, city, district, pincode]) => ({
      name, email, passwordHash: hospitalPassHash,
      role: 'hospital', phone: '9845' + Math.floor(100000 + Math.random() * 899999),
      address: name + ' Campus, BM Road', district,
      state: 'Karnataka', pincode,
    }))
  );
  console.log('[Seed] 3 hospital accounts created');

  // Step 4: Create Donor Users + Donor Profiles
  const donorDocs = [];
  let donorCounter = 1;
  let txCounter    = 1;

  for (const [name, age, gender, bloodGroup, phone, city, district, pincode, lat, lng, donationCount, lastDonDays, statusKey] of DONOR_DATA) {
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@redflow.test';

    const user = await User.create({
      name, email, passwordHash: donorPassHash, role: 'donor',
      phone, address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city}`,
      district, state: 'Karnataka', pincode,
    });

    const donorId          = `DON${String(donorCounter++).padStart(4, '0')}`;
    const lastDonationDate = lastDonDays > 0 ? daysAgo(lastDonDays) : null;
    const isVerified       = statusKey === 'verified';
    const isFlagged        = statusKey === 'flagged';
    const donorHash        = keccak(`${CHAIN_ID}|${donorId}|${bloodGroup}|${lastDonationDate ?? ''}`);

    const donor = await Donor.create({
      userId: user._id, donorId, name, age, gender, bloodGroup,
      phone, email, address: user.address, city, district,
      state: 'Karnataka', pincode, lat, lng,
      lastDonationDate, donationCount,
      eligibilityStatus: isVerified ? 'verified' : isFlagged ? 'flagged' : 'pending',
      isVerified, isFlagged,
      flagReason: isFlagged ? 'Medical disqualification: failed recent screening test.' : '',
      blockchainTxHash: isVerified ? donorHash : '',
    });
    donorDocs.push(donor);

    // Blockchain tx for each verified donor
    if (isVerified) {
      await BlockchainTransaction.create({
        txNumber: txCounter++, entityType: 'donor', entityId: donorId,
        action: 'verifyDonor',
        description: `Donor ${donorId} (${name}) verified on the blockchain.`,
        txHash: donorHash, blockNumber: 100 + txCounter,
        walletAddress: WALLET, contractAddress: CONTRACT,
        gasUsed: '42120', status: 'CONFIRMED', dataHash: donorHash,
      });
    }
  }
  console.log(`[Seed] ${donorDocs.length} donors created (8 verified, 4 pending, 2 flagged, 1 pending)`);

  // Step 5: Create Blood Units (from verified donors only)
  const verifiedDonors = donorDocs.filter(d => d.isVerified);

  const UNIT_CONFIGS = [
    // [donorIndex, collectionDaysAgo, availabilityStatus, testStatus]
    [0,  5,  'available', 'safe'],
    [1,  8,  'available', 'safe'],
    [2,  12, 'available', 'safe'],
    [3,  3,  'available', 'safe'],
    [4,  15, 'available', 'safe'],
    [5,  20, 'issued',    'safe'],
    [6,  25, 'issued',    'safe'],
    [7,  18, 'issued',    'safe'],
    [0,  30, 'issued',    'safe'],
    [1,  2,  'testing',   'pending'],
    [2,  1,  'testing',   'pending'],
    [3,  4,  'testing',   'pending'],
    [4,  6,  'collected', 'pending'],
    [5,  7,  'collected', 'pending'],
    [6,  38, 'expired',   'safe'],
  ];

  const bloodUnits = [];
  let unitCounter = 1;

  for (const [dIdx, collDaysAgo, availabilityStatus, testStatus] of UNIT_CONFIGS) {
    const donor          = verifiedDonors[dIdx];
    const unitId         = `BU${String(unitCounter++).padStart(3, '0')}`;
    const collectionDate = daysAgo(collDaysAgo);
    const expiryDate     = daysFrom(collectionDate, 35);
    const unitHash       = keccak(`${CHAIN_ID}|${unitId}|${donor.donorId}|${donor.bloodGroup}|${collectionDate.toISOString()}|${expiryDate.toISOString()}|${testStatus}|${availabilityStatus}`);

    const unit = await BloodUnit.create({
      unitId, donorId: donor.donorId, bloodGroup: donor.bloodGroup,
      collectionDate, expiryDate, testStatus, availabilityStatus,
      storageLocation: `Cold Storage Vault ${(unitCounter % 3) + 1}`,
      blockchainTxHash: unitHash,
    });
    bloodUnits.push(unit);

    // Blockchain tx for collecting this unit
    await BlockchainTransaction.create({
      txNumber: txCounter++, entityType: 'bloodUnit', entityId: unitId,
      action: 'addBloodUnit',
      description: `Blood unit ${unitId} (${donor.bloodGroup}) collected from donor ${donor.donorId}.`,
      txHash: unitHash, blockNumber: 200 + txCounter,
      walletAddress: WALLET, contractAddress: CONTRACT,
      gasUsed: '58450', status: 'CONFIRMED', dataHash: unitHash,
    });

    // TraceEvent history for this unit
    const events = [
      { type: 'created',   desc: `Unit ${unitId} collected from donor ${donor.name}. Blood group: ${donor.bloodGroup}.`, dOff: collDaysAgo },
    ];
    if (['testing', 'available', 'issued', 'expired'].includes(availabilityStatus))
      events.push({ type: 'testing',   desc: `Unit ${unitId} dispatched to clinical lab for 5-panel screening.`,        dOff: collDaysAgo - 1 });
    if (['available', 'issued', 'expired'].includes(availabilityStatus))
      events.push({ type: 'available', desc: `Unit ${unitId} cleared all screening tests. Ready for transfusion.`,       dOff: collDaysAgo - 3 });
    if (availabilityStatus === 'issued')
      events.push({ type: 'issued',    desc: `Unit ${unitId} issued to hospital for patient transfusion.`,               dOff: 2 });
    if (availabilityStatus === 'expired')
      events.push({ type: 'expired',   desc: `Unit ${unitId} exceeded 35-day shelf life. Marked expired by system.`,     dOff: 0 });

    let evtIdx = 1;
    for (const evt of events) {
      await TraceEvent.create({
        eventId: `${unitId}-EVT${String(evtIdx++).padStart(2, '0')}`,
        unitId, eventType: evt.type, description: evt.desc,
        updatedBy: 'RedFlow Admin',
        timestamp: daysAgo(evt.dOff),
        blockchainTxHash: keccak(`${unitId}:${evt.type}:${evt.dOff}`),
      });
    }
  }
  console.log(`[Seed] ${bloodUnits.length} blood units + trace events created`);

  // Step 6: Create Emergency Requests
  const [hassan, bengaluru, mysuru] = hospitals;
  const issuedBplus = bloodUnits.filter(u => u.availabilityStatus === 'issued' && u.bloodGroup === 'B+');

  const matchedDonorSummary = verifiedDonors.slice(0, 3).map(d => ({
    donorId: d.donorId, name: d.name, bloodGroup: d.bloodGroup,
    phone: d.phone, city: d.city, pincode: d.pincode, matchType: 'exact_pincode',
  }));

  await EmergencyRequest.create([
    {
      requestId: 'REQ0001', hospitalId: hassan._id, hospitalName: hassan.name,
      contactNumber: hassan.phone, bloodGroup: 'O+', unitsRequired: 3,
      pincode: hassan.pincode, urgency: 'critical', status: 'open',
      matchedDonors: matchedDonorSummary, allocatedUnits: [],
      notes: 'Trauma ward patient post road accident. Immediate transfusion required.',
      createdAt: daysAgo(8),
    },
    {
      requestId: 'REQ0002', hospitalId: bengaluru._id, hospitalName: bengaluru.name,
      contactNumber: bengaluru.phone, bloodGroup: 'AB-', unitsRequired: 2,
      pincode: bengaluru.pincode, urgency: 'urgent', status: 'matched',
      matchedDonors: matchedDonorSummary, allocatedUnits: [],
      notes: 'Scheduled surgery in 6 hours. Rare AB- type required urgently.',
      createdAt: daysAgo(6),
    },
    {
      requestId: 'REQ0003', hospitalId: mysuru._id, hospitalName: mysuru.name,
      contactNumber: mysuru.phone, bloodGroup: 'B+', unitsRequired: 1,
      pincode: mysuru.pincode, urgency: 'normal', status: 'issued',
      matchedDonors: [], allocatedUnits: issuedBplus.slice(0, 1).map(u => u.unitId),
      notes: 'Elective procedure for cancer patient requiring transfusion support.',
      createdAt: daysAgo(4),
    },
    {
      requestId: 'REQ0004', hospitalId: hassan._id, hospitalName: hassan.name,
      contactNumber: hassan.phone, bloodGroup: 'A+', unitsRequired: 2,
      pincode: hassan.pincode, urgency: 'urgent', status: 'open',
      matchedDonors: matchedDonorSummary, allocatedUnits: [],
      notes: 'Cardiac surgery patient in ICU. Blood type A+ required before 8 AM.',
      createdAt: daysAgo(2),
    },
    {
      requestId: 'REQ0005', hospitalId: bengaluru._id, hospitalName: bengaluru.name,
      contactNumber: bengaluru.phone, bloodGroup: 'O-', unitsRequired: 1,
      pincode: bengaluru.pincode, urgency: 'critical', status: 'closed',
      matchedDonors: [], allocatedUnits: [],
      notes: 'Emergency resolved. Patient stabilized after internal blood source.',
      createdAt: daysAgo(10),
    },
  ]);
  console.log('[Seed] 5 emergency requests created');

  // ─── Final Summary ────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════');
  console.log(' RedFlow Clinical Seed Data — Seed Complete!');
  console.log('════════════════════════════════════════════════════');
  console.log('\n  ADMIN');
  console.log('  smps@redflow.com  /  smps@123\n');
  console.log('  HOSPITALS  (password: Hospital@123)');
  for (const h of hospitals) console.log(`  • ${h.email}`);
  console.log('\n  REGISTERED DONOR LOGINS  (password: Donor@123)');
  const sampleDonors = ['Priya Sharma', 'Ravi Kumar', 'Anitha Naidu', 'Arjun Singh'];
  for (const n of sampleDonors) console.log(`  • ${n.toLowerCase().replace(/\s+/g, '.')}@redflow.test`);
  console.log('\n  DATA SUMMARY');
  console.log('  • Donors       : 15  (8 verified, 4 pending, 2 flagged, 1 new)');
  console.log('  • Blood Units  : 15  (5 available, 4 issued, 3 testing, 2 collected, 1 expired)');
  console.log('  • Requests     : 5   (2 open, 1 matched, 1 issued, 1 closed)');
  console.log(`  • Blockchain Tx: ${txCounter - 1}`);
  console.log('════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
