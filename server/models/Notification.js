const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  message: { 
    type: String, 
    required: true,
    trim: true
  },
  // Type of notification — controls icon shown in Notification Center
  type: {
    type: String,
    enum: ['attendance', 'homework', 'notice', 'result', 'note', 'general'],
    default: 'general'
  },
  // Optional deep-link URL to navigate to when notification is clicked
  link: {
    type: String,
    default: null
  },
  isRead: { 
    type: Boolean, 
    default: false,
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for fast per-user queries sorted by date
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
