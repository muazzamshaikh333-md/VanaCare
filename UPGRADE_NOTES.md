# VanaCare upgrade notes

## Existing foundation preserved
- Kept the existing HTML/CSS/vanilla-JavaScript frontend and Express/Mongoose backend.
- Kept the catalogue seed data and the existing homeopathy, Ayurveda, dental and allopathy catalogue records.
- Replaced the mismatched frontend API paths with routes that exist in the upgraded backend.
- The uploaded archive contained a real `backend/.env`; it is deliberately excluded from this output archive for credential safety. Create a fresh local `.env` from `backend/.env.example`.

## Implemented in this upgrade
- Customer registration/login with bcrypt password hashing and signed bearer sessions.
- Role-aware access checks for customer, admin, pharmacist and delivery roles.
- MongoDB product stock, persistent cart API, address endpoints and customer order history.
- Server-side order totals using database prices, configurable delivery fee/tax and coupon validation.
- Conditional atomic stock reservations with rollback if reservation/order creation fails.
- Prescription PDF/image upload with file size/type validation, private file access, pharmacist review endpoints and dispatch/preparation gating.
- Razorpay test-mode order creation through the Razorpay API and server-side payment signature verification.
- Order status history and role-restricted status transitions; delivery partner updates are limited to assigned orders.
- In-app notifications, operations dashboard and assigned-delivery dashboard.
- Order page refreshes from the server periodically; no client timer invents delivery progress.

## Main API routes
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`
- `GET/PUT /api/cart`
- `GET/POST/DELETE /api/addresses`
- `POST /api/prescriptions`, `GET /api/prescriptions/:id/file`
- `GET /api/pharmacy/prescriptions`, `PATCH /api/pharmacy/prescriptions/:id`
- `POST /api/coupons/validate`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`
- `POST /api/payments/verify`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/assign-delivery`
- `GET /api/delivery/orders`
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`
- `GET /api/pharmacies`, `GET /api/health`

## Required setup
See `backend/README.md` and `backend/.env.example`. Use Razorpay test keys only while testing. Run `npm install`, `npm run seed`, then `npm run dev` inside `backend/`. Serve `frontend/` with Live Server.

## Manual role provisioning
Public registration always creates a customer. A trusted operator must set a user's `role` in MongoDB to `admin`, `pharmacist`, or `delivery`, then that user must sign in again to receive a role-specific session. Never expose role selection on public signup.

## Not yet fully wired / external integration work
- No real pharmacy geo-routing or automated pharmacy selection; orders show that pharmacy assignment is pending until an operator assigns/handles it.
- Delivery partner assignment has a protected API but needs an admin UI control and partner onboarding workflow.
- Real GPS/map tracking, email/SMS/push notifications, and external refund processing are not connected.
- The current customer cart UI retains local responsiveness; the backend cart endpoint is available and changes are synchronized, but initial cross-device cart hydration needs additional UI wiring.
- Coupon validation endpoint exists; the checkout currently submits the coupon code for server validation rather than showing a live discount preview before order creation.
- No automated integration test suite or live MongoDB/Razorpay transaction was run in this environment. JavaScript syntax checks passed; configure your own credentials and perform the test checklist in `backend/README.md`.
