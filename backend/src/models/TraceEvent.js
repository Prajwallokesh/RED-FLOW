'use strict';

const mongoose = require('mongoose');

const traceEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    unitId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'created',
        'testing',
        'tested',
        'available',
        'requested',
        'issued',
        'expired',
        'rejected',
        'returned',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      default: 'System',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    blockchainTxHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TraceEvent', traceEventSchema);
