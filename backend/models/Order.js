const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  total: Number,
  status: { type: String, default: 'placed' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
