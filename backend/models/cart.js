const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  items: [
    {
      id: String,
      qty: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
