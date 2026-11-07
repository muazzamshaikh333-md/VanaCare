const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, index: 'text' },
  slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  brand: { type: String, default: 'VanaCare Demo Catalogue' },
  potency: String, dosageInfo: String, packSize: { type: String, default: '1 unit' },
  system: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  price: { type: Number, required: true, min: 0 },
  prescriptionOnly: { type: Boolean, default: false }, prescriptionRequired: { type: Boolean, default: false },
  desc: String, description: String, imageUrl: String,
  stock: { type: Number, default: 0, min: 0 }, stockQuantity: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true }, isActive: { type: Boolean, default: true },
<<<<<<< HEAD
<<<<<<< HEAD
  productType: { type: String, default: 'healthcare-essential' },
  animalType: { type: String, default: '' }, usageInfo: { type: String, default: '' }, minAge: { type: Number, default: 0, min: 0 }
=======
  productType: { type: String, default: 'healthcare-essential' }
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
=======
  productType: { type: String, default: 'healthcare-essential' },
  animalType: { type: String, default: '' }, usageInfo: { type: String, default: '' }, minAge: { type: Number, default: 0, min: 0 }
>>>>>>> e600fa6 (Upgrade VanaCare with advanced healthcare features)
}, { timestamps: true });
productSchema.index({ system: 1, categoryId: 1, active: 1 });
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
