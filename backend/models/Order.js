const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true }, // display id, e.g. VC12345678
  userEmail: { type: String, required: true },
  items: [
    {
      id: String,
      qty: Number,
    },
  ],
  total: Number,
  address: String,
  landmark: String,
  payment: String, // 'cod' | 'online'
  store: {
    name: String,
    distanceKm: Number,
    etaMin: Number,
  },
  etaMin: Number,
  stage: { type: Number, default: 0 }, // 0 placed, 1 packed, 2 out for delivery, 3 delivered
  prescriptionText: String, // optional — raw prescription lines submitted with this order
  placedAt: { type: Number, default: () => Date.now() },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
