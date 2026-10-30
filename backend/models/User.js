const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, fullName: String, phone: String,
  line1: { type: String, required: true }, line2: String, city: String,
  state: String, pincode: String, landmark: String, isDefault: { type: Boolean, default: false }
}, { _id: true });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['customer','admin','pharmacist','delivery'], default: 'customer' },
  addresses: [addressSchema]
}, { timestamps: true });
userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.password); };
userSchema.set('toJSON', { transform: (_, ret) => { delete ret.password; delete ret.__v; return ret; } });
module.exports = mongoose.model('User', userSchema);
