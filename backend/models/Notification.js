const mongoose = require('mongoose');
module.exports = mongoose.model('Notification', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: String, message: String, readAt: Date, relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true }));
