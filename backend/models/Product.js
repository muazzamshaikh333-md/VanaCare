const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  potency: String,
  system: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  prescriptionOnly: { type: Boolean, default: false },
  desc: String,
});

module.exports = mongoose.model('Product', productSchema);
