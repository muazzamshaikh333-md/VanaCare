# VanaCare backend

## Setup
1. Install Node.js 18+ and MongoDB (local or Atlas).
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
4. For online test payments, add Razorpay **test-mode** `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
5. Run `npm run seed` once to import the existing catalogue.
6. Run `npm run dev`. Health check: `http://localhost:5000/api/health`.
7. Serve `frontend/` using VS Code Live Server or another static server. Set `window.VANACARE_API_BASE` before `api.js` if your API is hosted elsewhere.

## Important
- Never commit `.env` or `uploads/`. The project archive intentionally excludes the uploaded `.env`; create your own local file from `.env.example`.
- Online payment uses Razorpay's hosted checkout and server-side HMAC signature verification. Never collect card numbers, CVV, UPI PINs, or bank passwords in VanaCare.
- Prescription files are limited to PDF/JPG/PNG/WEBP and 5 MB, stored in `backend/uploads/`, and served only after authenticated ownership/role checks.
- Prescription-required items remain in `prescription_pending` until an authorized pharmacist reviews the prescription. Pharmacist/admin accounts must be provisioned by a trusted operator by changing the user's `role` in MongoDB; public registration can only create customer accounts.
- Stock is reserved with atomic conditional updates. If reservation/order creation fails, reserved quantities are restored.
- Delivery progress is not advanced by timers. Authorized pharmacy/admin/delivery actions update the status.
- The customer UI currently uses local cart storage for immediate responsiveness; the API also exposes a MongoDB cart endpoint. Cart synchronization runs when cart contents change.
- Real map/GPS tracking, SMS/email/push delivery, refund execution, pharmacy geo-routing, and full address book UX need external services and further UI wiring; do not represent them as active integrations.
