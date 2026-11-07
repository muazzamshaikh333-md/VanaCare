const mongoose = require('mongoose');
module.exports = mongoose.model('DeliveryPartner', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  available: { type: Boolean, default: true }, vehicle: String
}, { timestamps: true }));
