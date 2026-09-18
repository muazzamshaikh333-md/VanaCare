const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // production me ise hash karke store karo (bcrypt)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
