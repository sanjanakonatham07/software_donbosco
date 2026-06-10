const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Setting = require('./models/Setting');

let isConnected = false;
let lastConnectAttempt = 0;
const CONNECT_COOLDOWN = 10000; // 10 seconds cooldown

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState >= 1) {
    return;
  }
  
  const now = Date.now();
  if (!isConnected && (now - lastConnectAttempt < CONNECT_COOLDOWN)) {
    // Under cooldown, skip connection attempt to avoid blocking
    return;
  }

  lastConnectAttempt = now;
  try {
    if (!process.env.MONGODB_URI) {
      console.error("Database connection error: MONGODB_URI environment variable is missing.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // fail fast in 5s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
    
    // Seed default data if database is empty
    await seedDatabase();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    isConnected = false;
  }
};

const seedDatabase = async () => {
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('Seeding initial data into MongoDB...');

    // 1. Seed System Settings
    await Setting.create({ key: 'attendance_notifications', value: 'ON' });
    console.log('✔ Default settings seeded (Attendance Notifications: ON)');

    // Helper for password hashing
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);

    // 2. Create Default Admin User
    const adminUser = await User.create({
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      name: 'System Admin',
      mustChangePassword: false // Admin doesn't need to change password on first login
    });
    console.log('✔ Admin user created: admin / admin123');

    console.log('✔ Database successfully seeded!');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

module.exports = connectDB;
