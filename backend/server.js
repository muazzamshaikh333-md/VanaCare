// server.js
// Express server jo MongoDB se connect hota hai aur products/users/cart/orders API deta hai

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---- Products ----
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Signup ----
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email aur password zaroori hai' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Is email se account pehle se bana hua hai' });

    // Password yaha plain jaa raha hai, model ka pre-save hook ise hash kar dega
    const user = await User.create({ name, email: email.toLowerCase(), phone, password });
    res.json({ email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Login ----
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Galat email ya password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Galat email ya password' });

    res.json({ email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Cart ----
app.get('/api/cart/:email', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userEmail: req.params.email });
    res.json(cart ? cart.items : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cart/:email', async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userEmail: req.params.email },
      { items },
      { upsert: true, new: true }
    );
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Orders ----
app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:email', async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ placedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order ka delivery stage update karna (0 placed -> 3 delivered)
app.patch('/api/orders/:orderCode/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderCode: req.params.orderCode },
      { stage },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order nahi mila' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Start server after DB connects ----
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
  });
});
