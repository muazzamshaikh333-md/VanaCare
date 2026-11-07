const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  system: { type: String, required: true, enum: ['allopathy','homeo','ayurveda','dental','surgery','physiotherapy','psychiatry','veterinary'], index: true },
  description: { type: String, default: '' }, icon: { type: String, default: '💊' },
  image: { type: String, default: '' }, isActive: { type: Boolean, default: true }
}, { timestamps: true });
categorySchema.index({ system: 1, isActive: 1 });
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
