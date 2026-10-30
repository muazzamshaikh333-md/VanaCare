const mongoose = require('mongoose');
module.exports = mongoose.model('Pharmacy', new mongoose.Schema({
  name: { type: String, required: true }, address: String, city: String,
  supportedSystems: [String], active: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));
