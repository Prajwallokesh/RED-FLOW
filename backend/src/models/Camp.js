'use strict';

const mongoose = require('mongoose');

const CampSchema = new mongoose.Schema(
  {
    campId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Camp title is required'],
      trim: true,
    },
    organizer: {
      type: String,
      default: 'RedFlow Youth Movement & NSS',
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Camp venue is required'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Hassan',
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Camp date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Camp timing is required'],
      default: '9:00 AM – 4:30 PM IST',
      trim: true,
    },
    clinicalPartner: {
      type: String,
      default: 'HIMS Blood Bank',
      trim: true,
    },
    targetUnits: {
      type: Number,
      default: 250,
      min: 1,
    },
    description: {
      type: String,
      default: 'Join hands with voluntary donors and college youth to bridge India’s blood deficit.',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98801 23456',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'youth@redflow.org',
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notifyDonors: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Camp', CampSchema);
