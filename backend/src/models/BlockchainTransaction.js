'use strict';

const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema(
  {
    txNumber:        { type: Number, default: 1 },
    entityType:      { type: String, enum: ['donor', 'bloodUnit'], required: true },
    entityId:        { type: String, required: true },
    action:          { type: String, required: true },
    description:     { type: String, default: '' },
    txHash:          { type: String, required: true, index: true },
    blockNumber:     { type: Number, default: 0 },
    blockHash:       { type: String, default: '' },
    parentHash:      { type: String, default: '' },
    walletAddress:   { type: String, default: '' },
    contractAddress: { type: String, default: '' },
    gasUsed:         { type: String, default: '0' },
    status:          { type: String, default: 'CONFIRMED' },
    dataHash:        { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);

