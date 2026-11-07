const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  fileName: String, mimeType: String, storagePath: String,
  status: { type: String, enum: ['pending','under_review','approved','rejected','more_info','expired'], default: 'pending' },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String, reviewedAt: Date,
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  reviewHistory: [{ status: String, note: String, pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }]
}, { timestamps: true });
module.exports = mongoose.model('Prescription', schema);
