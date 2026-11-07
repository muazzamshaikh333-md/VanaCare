# VanaCare – Smart Healthcare & Medicine Delivery Platform

VanaCare is an existing medicine ordering and home-delivery application built with HTML, CSS, JavaScript, Node.js, Express, MongoDB and Mongoose. This upgrade extends the current application while retaining its original catalogue, authentication, DOB/age calculation, healthcare departments, cart, checkout, orders, prescription upload and delivery workflows.

## Existing technology

- Frontend: HTML5, CSS3 and vanilla JavaScript
- Backend: Node.js and Express.js
- Database: MongoDB with Mongoose
- Existing integrations: payment checkout flow and notification APIs
- Authentication: existing signed bearer-token implementation and bcrypt password hashing

## Existing platform features retained

- Customer registration/login and profile DOB management
- 18+ self-declared age calculation (not identity-verified age assurance)
- Eight healthcare departments: Allopathy, Homeopathy, Ayurveda, Dental Care, Post-Surgery Care, Physiotherapy, Psychiatry and Veterinary
- Category/product catalogue, search, cart, checkout and order tracking
- Prescription upload and pharmacist review
- Admin/pharmacy order operations and delivery-partner workflow

## VanaCare 2.0 additions in this upgrade

1. **Healthcare assistant:** floating chat panel, conversation persistence and a clearly labelled Demo Mode when no server-side AI provider is configured. The assistant does not diagnose or prescribe.
2. **Prescription management:** customer prescription history, private owner/role-checked file access, review statuses and pharmacist review history. Existing base64 upload endpoint remains in use.
3. **Medicine reminders:** customer-owned reminder records, clinician-entered instructions/times and completed/skipped logs. The platform does not invent a dosage schedule.
4. **Admin/pharmacy metrics:** MongoDB-backed dashboard endpoints, prescription queue metrics, inventory stock/price update endpoint, coupon administration and admin audit-log viewing.
5. **Veterinary records:** owner-scoped pet profiles, vaccination records and veterinary appointment requests. Human and veterinary records remain separate.
6. **Rewards:** points ledger, redemption, referral association and once-per-order reward references when an order is marked delivered.
7. **Security improvements:** request rate limiting on authentication endpoints, baseline security headers, stricter JWT secret length validation, owner-scoped data access and audit events for selected operations.
8. **Care Hub UI:** customer view for reminders, pet profiles, rewards and prescription history, plus role-aware operations metrics.

## Project structure

```text
VanaCare/
├── assets/
│   └── hero-banner.jpeg
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── data.js
│   ├── api.js
│   └── script.js
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Prescription.js
│   │   ├── MedicineReminder.js
│   │   ├── Pet.js
│   │   ├── VaccinationRecord.js
│   │   ├── VeterinaryAppointment.js
│   │   ├── RewardTransaction.js
│   │   ├── ChatConversation.js
│   │   ├── AuditLog.js
│   │   ├── Coupon.js
│   │   ├── Pharmacy.js
│   │   ├── DeliveryPartner.js
│   │   ├── Notification.js
│   │   └── cart.js
│   ├── uploads/                 # created at runtime; private prescription files
│   ├── categoriesData.js
│   ├── productsData.js
│   ├── seed.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── CATALOGUE_SETUP.md
├── PRESCRIPTION_AND_CATALOGUE_UPDATE.md
├── UPGRADE_NOTES_NOV02.md
└── README.md
```

## Setup

1. Install Node.js and MongoDB.
2. Open `backend/` and run `npm install`.
3. Copy `.env.example` to `.env` and configure `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, payment settings if used, and `FRONTEND_ORIGIN`.
4. Start MongoDB.
5. Run `npm run seed` if you need the supplied catalogue data.
6. Run `npm run dev` in `backend/`.
7. Serve `frontend/` through a local static server (for example, VS Code Live Server) and ensure `VANACARE_API_BASE` points to the backend API if it is not `http://localhost:5000/api`.

### Optional AI integration

Set `AI_API_URL` and `AI_API_KEY` in the backend `.env` only. The backend expects the configured provider endpoint to accept a JSON body containing `message` and `history` and return a `reply` or `message` field. Do not put the key in frontend files. If these values are absent, the assistant explicitly reports Demo Mode.

## New API groups

- `/api/assistant/*` – chat and conversation history
- `/api/reminders/*` – customer medicine reminders and logs
- `/api/pets/*` – pet profiles, vaccination records and appointments
- `/api/veterinary/appointments` – customer's appointment history
- `/api/rewards/*` – points balance, ledger and redemption/referral association
- `/api/admin/dashboard` – admin-only MongoDB metrics
- `/api/pharmacy/dashboard` – admin/pharmacist operational metrics
- `/api/pharmacy/inventory/:id` – role-protected stock/price updates
- `/api/admin/coupons` – admin coupon management
- `/api/admin/audit-logs` – admin-only audit activity
- `/api/prescriptions` – customer's prescription history

## Important implementation notes

- No live AI provider, email OTP service or password-reset email service is bundled. AI therefore defaults to Demo Mode; OTP/password reset must be connected to a trusted email/SMS provider before production.
- Reminder times and instructions are user-entered based on a clinician's directions. This upgrade stores and logs reminders; it does not guarantee background push delivery when the browser is closed.
- Rewards use an idempotent ledger reference for order completion, but a production financial/rewards deployment should use MongoDB transactions on a replica set and formal abuse controls.
- The existing bearer-token implementation is retained for compatibility; it is not a replacement for a full production identity platform, refresh-token rotation, MFA or independent security review.
- Prescription files remain in the backend's private `uploads/` directory and are not exposed as static assets. Production should use encrypted private object storage, malware scanning, retention policies and signed access controls.
- Dashboard metrics are queried from MongoDB. No fixed demo counts are used.
- No live database, payment gateway, email provider or external AI provider credentials were supplied with the project, so end-to-end integration tests against those services could not be run as part of this ZIP update.

## Testing performed for this delivery

- JavaScript syntax checks (`node --check`) for backend server, frontend scripts and all Mongoose model files.
- Static inspection of the original routes, models, frontend event handlers and existing checkout/order flow.

Run `npm run check` from `backend/` before starting the application.
