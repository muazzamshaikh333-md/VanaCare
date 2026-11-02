const mongoose = require('mongoose');

// One cart per authenticated account. Product references are populated by the API.
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productId: { type: String, trim: true },
    qty: { type: Number, required: true, min: 1, max: 50, default: 1 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
