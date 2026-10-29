'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Donor = require('../models/Donor');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

/**
 * GUIDE EXPLANATION: Send Urgent Blood Need Notification
 * Question: "How does a Hospital or Admin send an emergency message to a donor from the map?"
 * Answer: When a hospital clicks on a donor on the map and chooses a predefined message,
 * this endpoint validates the donor's ID, looks up their registered user account,
 * and saves a persistent emergency alert in MongoDB.
 */
router.post('/send', auth, role(['hospital', 'admin']), async (req, res, next) => {
  try {
    const { recipientDonorId, bloodGroup, message, title, urgency, senderPhone } = req.body;

    if (!recipientDonorId || !message) {
      return res.status(400).json({
        error: 'recipientDonorId and message are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Locate recipient donor record
    let donor = await Donor.findOne({ donorId: recipientDonorId });
    if (!donor && mongoose.Types.ObjectId.isValid(recipientDonorId)) {
      donor = await Donor.findById(recipientDonorId);
    }
    if (!donor) {
      donor = await Donor.findOne({
        $or: [
          { donorId: recipientDonorId },
          { email: recipientDonorId }
        ]
      });
    }

    if (!donor) {
      return res.status(404).json({
        error: `Donor with ID ${recipientDonorId} not found`,
        code: 'NOT_FOUND',
      });
    }

    // Ensure recipientUserId is populated
    let recipientUserId = donor.userId;
    if (!recipientUserId && donor.email) {
      const u = await User.findOne({ email: donor.email });
      if (u) recipientUserId = u._id;
    }

    const bGroup = bloodGroup || donor.bloodGroup;
    const alertTitle = title || `🚨 URGENT: ${bGroup} Blood Required Immediately`;
    const phone = senderPhone || req.user.phone || '';
    const safeUrgency = ['critical', 'urgent', 'reminder', 'high', 'normal'].includes(urgency) ? urgency : 'urgent';

    const notification = await Notification.create({
      recipientDonorId: donor.donorId,
      recipientUserId: recipientUserId || donor.userId,
      senderName: req.user.name || (req.user.role === 'admin' ? 'RedFlow Central Admin' : 'Emergency Blood Bank'),
      senderRole: req.user.role,
      senderId: req.user.id,
      senderPhone: phone,
      bloodGroup: bGroup,
      urgency: safeUrgency,
      title: alertTitle,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: `Emergency alert successfully delivered to ${donor.name} (${donor.donorId})`,
      notification,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GUIDE EXPLANATION: Fetch Donor Notifications
 * Question: "How does the donor dashboard display urgent messages sent from hospitals?"
 * Answer: The donor dashboard queries this endpoint. It retrieves all alerts addressed
 * to the authenticated donor's User ID or Donor ID, sorted newest first, along with
 * the count of unread messages to display on the badge.
 */
router.get('/my-notifications', auth, role(['donor']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const query = {
      $or: [
        { recipientUserId: req.user.id }
      ]
    };
    if (donor) {
      if (donor.donorId) query.$or.push({ recipientDonorId: donor.donorId });
      query.$or.push({ recipientDonorId: donor._id.toString() });
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      count: notifications.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark a single notification as read
 */
router.put('/:id/read', auth, role(['donor']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const match = { _id: req.params.id };
    if (donor) {
      match.$or = [
        { recipientUserId: req.user.id },
        { recipientDonorId: donor.donorId }
      ];
    } else {
      match.recipientUserId = req.user.id;
    }

    const notification = await Notification.findOneAndUpdate(
      match,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found', code: 'NOT_FOUND' });
    }

    return res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
});

/**
 * Mark all notifications as read for current donor
 */
router.put('/mark-all-read', auth, role(['donor']), async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const query = {
      $or: [
        { recipientUserId: req.user.id }
      ]
    };
    if (donor) {
      if (donor.donorId) query.$or.push({ recipientDonorId: donor.donorId });
      query.$or.push({ recipientDonorId: donor._id.toString() });
    }

    await Notification.updateMany(query, { isRead: true });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
