# VanaCare – Prescription Upload & Catalogue Update

## What's updated
- Added a prescription spotlight section on the homepage, directly above “Explore healthcare departments”.
- The “Upload prescription” button opens the existing prescription workflow; users can attach an image in the existing prescription form.
- Expanded the backend demo catalogue so every one of the 65 categories has at least 10 entries (650 entries total).
- Existing category slugs, product IDs, API routes, frontend navigation and backend architecture are retained.

## Catalogue safety note
The added entries are clearly marked as demo catalogue samples. They are not verified medicines, treatment recommendations, or confirmed stock. Before using VanaCare for real-world dispensing, replace/verify all sample listings, regulatory details, prices, stock and prescription flags with an authorized pharmacist and appropriate healthcare professionals.

## Apply the catalogue to MongoDB
From the `backend` directory, configure your own local `.env` using `.env.example`, then run:

```bash
npm install
npm run seed
npm start
```

The seed script upserts categories and products; it does not delete users or orders.

## Frontend
Open `frontend/index.html` with Live Server after starting the backend.
