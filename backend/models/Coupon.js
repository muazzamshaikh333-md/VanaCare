const mongoose = require('mongoose');
module.exports = mongoose.model('Coupon', new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent','flat'], required: true },
  value: { type: Number, min: 0, required: true },
  minOrder: { type: Number, default: 0 }, maxDiscount: Number,
  active: { type: Boolean, default: true }, expiresAt: Date
}, { timestamps: true }));
