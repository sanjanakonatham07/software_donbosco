const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  rollNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: true 
  },
  dob: { 
    type: Date, 
    required: true 
  },
  parentName: { 
    type: String, 
    required: true,
    trim: true
  },
  parentMobile: { 
    type: String, 
    required: true,
    trim: true
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  // FCM device tokens for push notifications — array to support multiple devices (phone + laptop etc.)
  fcmTokens: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Student', studentSchema);
