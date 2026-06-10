const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');
const { sendFCMNotification } = require('../utils/fcmService');

// Apply protection to all notice routes
router.use(protect);

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private (Admin, Teacher, Student)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');
    res.json({ success: true, notices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching notices' });
  }
});

// @desc    Create a notice + send push notification to all students
// @route   POST /api/notices
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req, res) => {
  const { title, content, type } = req.body;

  if (!title || !content || !type) {
    return res.status(400).json({ success: false, message: 'Please provide all notice details' });
  }

  try {
    const newNotice = await Notice.create({
      title,
      content,
      type,
      createdBy: req.user._id
    });

    // Log admin activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'Notice Creation',
      details: `Published a new ${type}: "${title}"`
    });

    // --- Notify ALL students (in-app + FCM push) ---
    const students = await Student.find({}).select('user fcmTokens');
    const allFCMTokens = [];

    const notifyPromises = students.map(async (stud) => {
      // In-app notification
      await Notification.create({
        user: stud.user,
        title: `📢 New Notice: ${title}`,
        message: `${type} has been published by the school administration. Tap to read the full notice.`,
        type: 'notice',
        link: '/student/dashboard'
      });

      // Collect FCM tokens for push
      if (stud.fcmTokens && stud.fcmTokens.length > 0) {
        allFCMTokens.push(...stud.fcmTokens);
      }
    });

    await Promise.all(notifyPromises);

    // Send single FCM multicast to all student devices
    if (allFCMTokens.length > 0) {
      sendFCMNotification(
        allFCMTokens,
        `📢 ${type}`,
        `${title} — Tap to read the full notice.`,
        { type: 'notice', link: '/student/dashboard' }
      ).catch(err => console.error('[FCM] Notice push error:', err.message));
    }

    res.status(201).json({ success: true, notice: newNotice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating notice' });
  }
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    // Log admin activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'Notice Deletion',
      details: `Deleted notice: "${notice.title}"`
    });

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting notice' });
  }
});

module.exports = router;
