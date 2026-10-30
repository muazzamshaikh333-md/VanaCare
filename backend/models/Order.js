const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productId: String, name: String, potency: String, qty: { type: Number, min: 1 }, unitPrice: Number,
    prescriptionRequired: Boolean }],
  subtotal: Number, deliveryFee: Number, discount: Number, tax: Number, total: Number,
  couponCode: String, address: { type: mongoose.Schema.Types.Mixed, required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: { type: String, enum: ['cod','razorpay'], required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','cancelled','refund_initiated','refunded'], default: 'pending' },
  razorpayOrderId: String, razorpayPaymentId: String,
  status: { type: String, enum: ['placed','confirmed','pharmacy_accepted','prescription_pending','prescription_verified','preparing','packed','picked_up','out_for_delivery','delivered','rejected','cancelled'], default: 'placed' },
  statusHistory: [{ status: String, note: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
  prescriptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
  estimatedDeliveryMinutes: Number
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
