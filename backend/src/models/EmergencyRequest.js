'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — EMERGENCY REQUISITION & DISPATCH DATA MODEL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Clinical & Operational Purpose:
 * 1. Hospital Requisition Lifecycle:
 *    - `open`: Hospital has broadcast an urgent need for specific blood groups & units.
 *    - `matched`: Central Admin has allocated safe inventory blood pouches or matched nearby donors.
 *    - `issued`: Cold-chain blood units have been physically dispatched to the hospital for transfusion.
 *    - `closed` / `rejected`: Emergency fulfilled or cancelled.
 * 
 * 2. FIFO Inventory Priority (First-In, First-Out):
 *    To prevent blood wastage due to CPDA-1 35-day shelf-life expiration,
 *    the allocation engine matches tested units closest to expiry first.
 * 
 * 3. Fallback Donor Geocoding:
 *    If central blood bank inventory is insufficient, the system scans registered donors
 *    within Karnataka pincode clusters to send urgent map alerts.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'issued', 'rejected', 'closed'],
      default: 'open',
    },
    allocatedUnits: [
      {
        type: String,
        trim: true,
      },
    ],
    matchedDonors: [
      {
        donorId: String,
        name: String,
        bloodGroup: String,
        phone: String,
        city: String,
        pincode: String,
        matchType: String, // 'exact_pincode' | 'nearby_prefix' | 'regional'
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
