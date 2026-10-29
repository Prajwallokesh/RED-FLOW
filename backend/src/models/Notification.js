'use strict';

const mongoose = require('mongoose');

/**
 * GUIDE EXPLANATION: Urgent Donor Notification Model
 * Question: "How does the system store emergency broadcasts sent to donors?"
 * Answer: When a hospital or administrator locates a donor on the map and sends
 * an emergency message, a Notification record is created linking the sender
 * (Hospital/Admin) to the specific recipient donor. It stores the required blood group,
 * urgency level, predefined message, and read/unread status.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipientDonorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ['hospital', 'admin'],
      default: 'hospital',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderPhone: {
      type: String,
      default: '',
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['critical', 'urgent', 'reminder', 'high', 'normal'],
      default: 'urgent',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
