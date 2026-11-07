# VanaCare – Online Medicine Ordering & Home Delivery Platform

## About the Project

VanaCare is an online medicine ordering and home-delivery platform developed to make medicine purchasing easier, faster, and more convenient.

It provides a digital platform where customers can explore different healthcare categories, search for medicines, add products to their cart, place orders, and get medicines delivered to their doorstep.

The platform also supports pharmacy operations, prescription verification, order management, and delivery-related activities.

## Why We Built VanaCare

In traditional medicine purchasing, customers often need to visit multiple medical stores to find the required medicines. This can be time-consuming and inconvenient.

VanaCare aims to simplify this process by bringing medicine browsing, ordering, prescription handling, payment, and delivery management together in one platform.

Our goal is to provide a simple, organized, and user-friendly medicine ordering experience.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend API development |
| MongoDB | Database |
| Mongoose | Database management |
| JWT | User authentication |
| bcryptjs | Password security |
| Razorpay | Payment integration |
| Socket.IO | Real-time communication support |

## Project Structure

```text
VanaCare/
│
├── assets/
│   └── hero-banner.jpeg
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── data.js
│   ├── api.js
│   └── script.js
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── cart.js
│   │   ├── Coupon.js
│   │   ├── Prescription.js
│   │   ├── Pharmacy.js
│   │   ├── DeliveryPartner.js
│   │   └── Notification.js
│   │
│   ├── categoriesData.js
│   ├── productsData.js
│   ├── seed.js
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── CATALOGUE_SETUP.md
├── UPGRADE_NOTES_NOV02.md
└── README.md
```

### Folder Description

- **assets/** – Contains images and visual assets used in the application.
- **frontend/** – Contains the website interface, styling, application logic, and API communication.
- **backend/** – Handles server-side logic, authentication, database operations, and application APIs.
- **backend/models/** – Contains MongoDB models for users, products, categories, orders, carts, prescriptions, and other entities.
- **categoriesData.js** – Contains the medicine category data.
- **productsData.js** – Contains the medicine catalogue data.
- **seed.js** – Used to populate the database with initial catalogue data.
- **server.js** – Main backend server file.
- **db.js** – Database connection-related logic.

## Main Features

- User registration and login.
- Healthcare system-wise medicine browsing.
- Category-wise medicine catalogue.
- Search and filter medicines.
- Medicine details and availability.
- Shopping cart and quantity management.
- Order placement and checkout.
- Online payment integration.
- Prescription upload and pharmacist verification.
- Order history and status management.
- Admin product and category management.
- Pharmacy and delivery-related operations.
- In-app notifications.

## Medicine Categories

VanaCare organizes its catalogue into four major healthcare systems:

1. **Homeopathy** – Category-wise homeopathic product catalogue.
2. **Ayurveda** – Category-wise Ayurvedic product catalogue.
3. **Dental Care** – Products related to dental care.
4. **Post-Surgery Care** – Products organized into recovery-related categories.

The current development catalogue contains 28 categories and 224 demo product entries.

## Working Flow

### 1. User Registration and Login
Customers create an account or log in to access the platform.

### 2. Browse Medicines
Users explore healthcare systems and select the category they need. They can search and filter available products.

### 3. Select Medicines
Users view product information, check availability, select quantities, and add medicines to their cart.

### 4. Cart and Checkout
The selected products are displayed in the cart. Users review their order and proceed to checkout.

### 5. Prescription Verification
For products requiring prescriptions, users upload the required document. An authorized pharmacist reviews it before the order proceeds.

### 6. Payment and Order Placement
Users proceed through the available payment flow. The backend verifies online payment information before treating a payment as successful.

### 7. Order Management
Customers can view their orders and check their current order status.

### 8. Admin and Pharmacy Operations
Administrators manage products, categories, and orders, while pharmacists handle prescription reviews.

### 9. Delivery Process
Delivery-related operations support assigning orders to delivery partners and managing assigned deliveries.

## User Roles

- **Customer:** Browse medicines, manage cart, place orders, and view order history.
- **Admin:** Manage products, categories, and orders.
- **Pharmacist:** Review uploaded prescriptions.
- **Delivery Partner:** Handle assigned delivery operations.

## Project Goal

VanaCare aims to create a convenient digital medicine ordering experience by connecting customers, pharmacies, and delivery operations through one platform.

**VanaCare – Making Medicine Ordering Simpler and More Accessible.**
<<<<<<< HEAD


## DOB and Veterinary additions
- Registration now requires a date of birth; the API validates past dates and calculates age dynamically.
- Profile API includes DOB, calculated age, adult flag and age status. DOB changes require password confirmation via `PATCH /api/auth/profile/dob`.
- Added Allopathy, Physiotherapy, Psychiatry and Veterinary departments while retaining Homeopathy, Ayurveda, Dental Care and Post-Surgery Care.
- Veterinary categories are seeded with demo non-medicinal care accessories only. Add real veterinary medicines only from verified supplier/manufacturer data and require veterinary prescription review where applicable.
- `adult-self-declared` is not identity-verified proof of age. Add jurisdiction-appropriate identity/age assurance before dispensing legally age-restricted products.
=======
>>>>>>> 5ec37430b6339a9f6bfb61718f1d486ee41dcf2d
