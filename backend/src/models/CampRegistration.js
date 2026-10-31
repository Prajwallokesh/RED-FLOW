'use strict';

const mongoose = require('mongoose');

const CampRegistrationSchema = new mongoose.Schema({
  registrationToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  campId: {
    type: String,
    required: true,
    default: 'gech-hassan-2026',
    index: true,
  },
  campName: {
    type: String,
    default: 'Mega Youth Blood Donor Movement — GECH Hassan',
  },
  campDate: {
    type: String,
    default: '2026-11-09',
  },
  campVenue: {
    type: String,
    default: 'Government Engineering College, Hassan (GECH)',
  },
  name: {
    type: String,
    required: [true, 'Registrant name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Do not know'],
    default: 'O+',
  },
  affiliation: {
    type: String,
    default: 'GECH Student / Faculty',
    trim: true,
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'donated', 'deferred'],
    default: 'registered',
  },
  notes: {
    type: String,
    default: '',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CampRegistration', CampRegistrationSchema);
