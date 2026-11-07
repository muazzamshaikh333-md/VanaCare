# VanaCare category catalogue upgrade

This update adds 28 categories across Homeopathy, Ayurveda, Dental Care and Post-Surgery Care, with 8 development placeholder entries per category (224 total). These are clearly marked as demo catalogue placeholders and are not verified medicines or real inventory. Have an authorized pharmacist review all actual products, prescription classifications, prices and claims before enabling sales.

## Apply
1. Back up MongoDB first. The seed script upserts only Category and Product records and does not delete users/orders.
2. Configure `backend/.env` with a valid MongoDB URI and JWT_SECRET.
3. From `backend`, run `npm install`, `npm run seed`, then `npm run dev`.
4. Open the frontend with Live Server. API defaults to `http://localhost:5000/api`; override with `window.VANACARE_API_BASE` before loading `api.js` if needed.

## APIs
- GET `/api/categories` and `/api/categories/system/:system`
- GET `/api/products?category=cardiac` (legacy array response)
- GET `/api/products?category=cardiac&page=1&limit=24&sort=priceLow` (paginated response)
- Admin-only POST/PUT/DELETE `/api/admin/products` endpoints (JWT role `admin`)

Existing Product legacy fields (`id`, `category`, `system`, `price`, `prescriptionOnly`, `desc`, `imageUrl`, `stock`, `active`) remain supported. `categoryId`, `brand`, `slug`, `packSize`, `stockQuantity`, `prescriptionRequired`, `description` and `isActive` are added.
