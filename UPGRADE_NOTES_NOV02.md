# VanaCare UI and workflow update — 2 Nov 2026

## Changes in this update
- Added a premium responsive presentation layer for cart and order history, including empty states, order status badges, progress steps, order details, cancel and reorder actions.
- Added a product details dialog and stock-aware add-to-cart controls.
- Added notification entry point and API connectivity diagnostics.
- Expanded product search to include brand and category text.
- Fixed the Cart Mongoose schema to match the existing Express cart endpoints (`user`, `items.product`, `items.productId`, `items.qty`). The old schema (`userEmail`, `items.id`) did not match those endpoints.
- Added the Post-Surgery Care system tile; no products are fabricated for that system.

## Run locally
1. Configure `backend/.env` from `.env.example` with a valid MongoDB URI and JWT secret.
2. In `backend`: `npm install` then `npm run seed` then `npm run dev`.
3. Confirm `http://localhost:5000/api/health` returns `{ "status": "ok", "service": "VanaCare API" }`.
4. Serve `frontend` using VS Code Live Server. The default API base is `http://localhost:5000/api`; override before loading scripts with `window.VANACARE_API_BASE` if your backend uses another URL.

## Important verification limits
This package has not been tested against your live MongoDB credentials, Razorpay account, or real browser sessions. Existing server-side authorization and cancellation rules remain authoritative. The app must be exercised with test accounts for customer, pharmacist/admin, and delivery roles before deployment. The old Cart collection may contain documents in the legacy shape; back up MongoDB before migrating or clearing that collection.
