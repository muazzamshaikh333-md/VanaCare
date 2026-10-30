const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true, index: 'text' },
  potency: String, system: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  prescriptionOnly: { type: Boolean, default: false },
  desc: String, imageUrl: String,
  stock: { type: Number, default: 50, min: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);
