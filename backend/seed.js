require('dotenv').config();
const connectDB = require('./db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const categories = require('./categoriesData');
const products = require('./productsData');
async function seed() {
  await connectDB();
  const categoryMap = new Map();
  for (const item of categories) {
    const saved = await Category.findOneAndUpdate({ slug: item.slug }, { $set: item }, { upsert: true, new: true, runValidators: true });
    categoryMap.set(item.slug, saved._id);
  }
  for (const item of products) {
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) throw new Error(`Missing category for product ${item.id}: ${item.category}`);
    await Product.findOneAndUpdate({ id: item.id }, { $set: { ...item, categoryId, category: item.category, stock: item.stockQuantity, active: item.isActive, prescriptionOnly: item.prescriptionRequired } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  }
  console.log(`Seed complete: ${categories.length} categories, ${products.length} demo products. Existing users and orders were not deleted.`);
  process.exit(0);
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
