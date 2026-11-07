const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
<<<<<<< HEAD
<<<<<<< HEAD
  system: { type: String, required: true, enum: ['allopathy','homeo','ayurveda','dental','surgery','physiotherapy','psychiatry','veterinary'], index: true },
=======
  system: { type: String, required: true, enum: ['homeo','ayurveda','dental','surgery'], index: true },
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
=======
  system: { type: String, required: true, enum: ['allopathy','homeo','ayurveda','dental','surgery','physiotherapy','psychiatry','veterinary'], index: true },
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
  description: { type: String, default: '' }, icon: { type: String, default: '💊' },
  image: { type: String, default: '' }, isActive: { type: Boolean, default: true }
}, { timestamps: true });
categorySchema.index({ system: 1, isActive: 1 });
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
