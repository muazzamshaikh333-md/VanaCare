// db.js
// MongoDB connection setup using Mongoose

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI .env file me set nahi hai. .env.example ko copy karke .env banao aur uri daalo.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB se connect ho gaya:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection fail ho gaya:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnect ho gaya');
  });
}

module.exports = connectDB;
