// server.js
// Basic Express server jo MongoDB se connect hota hai aur products/users/orders API deta hai

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---- Products ----
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ---- Signup ----
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email pehle se registered hai' });

    const user = await User.create({ name, email, password });
    res.json({ email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Login ----
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: 'Galat email ya password' });
  res.json({ email: user.email, name: user.name });
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
  const orders = await Order.find({ userEmail: req.params.email });
  res.json(orders);
});

// ---- Start server after DB connects ----
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
  });
});
