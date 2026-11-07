const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  fileName: String, mimeType: String, storagePath: String,
  status: { type: String, enum: ['pending','approved','rejected','more_info'], default: 'pending' },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String, reviewedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Prescription', schema);
