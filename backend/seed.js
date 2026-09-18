// seed.js
// data.js ke PRODUCTS ko MongoDB me daalne ke liye ek baar chalao: npm run seed

require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

// Frontend ke data.js se products yaha copy-paste kiye gaye hain.
// Agar data.js update ho, to ye list bhi update kar dena.
const PRODUCTS = require('./productsData');

async function seed() {
  await connectDB();

  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true });
  }

  console.log(`✅ ${PRODUCTS.length} products seed ho gaye MongoDB me.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed karte waqt error aaya:', err);
  process.exit(1);
});
