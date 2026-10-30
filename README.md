# VanaCare -- Medicine Delivery Platform

VanaCare is a medicine ordering and home-delivery web application built
with **HTML, CSS, JavaScript, Node.js, Express.js, MongoDB, and
Mongoose**. It provides a medicine catalogue, customer accounts, cart
and checkout flows, prescription review APIs, order management, and
role-based operations for pharmacy and delivery users.

> This project is intended for development and testing. Use Razorpay
> **test-mode** credentials until the payment flow has been properly
> tested.

## Features

### Customer experience

-   Browse and search the medicine catalogue.
-   Register and log in to a customer account.
-   Add items to a cart and manage quantities.
-   Place orders with server-calculated prices.
-   View order history and order status.
-   Upload prescription files when required.
-   Receive in-app order notifications.

### Pharmacy and administration

-   Protected pharmacy prescription queue.
-   Pharmacist/admin prescription review endpoints.
-   Admin order listing and order status updates.
-   Protected delivery-partner assignment endpoint.
-   Role-based access for customer, admin, pharmacist, and delivery
    accounts.

### Backend and security

-   MongoDB persistence with Mongoose models.
-   Password hashing and signed bearer-token authentication.
-   Server-side order total calculation.
-   Coupon validation endpoint.
-   Conditional stock reservation to reduce overselling.
-   Prescription file type and size validation.
-   Razorpay hosted checkout integration with server-side payment
    signature verification.
-   Authenticated access to prescription files.
-   Delivery status changes are action-driven; the application does not
    invent progress using timers.

## Technology stack

  Layer                Technology
  -------------------- ----------------------------------------------
  Frontend             HTML5, CSS3, Vanilla JavaScript
  Backend              Node.js, Express.js
  Database             MongoDB, Mongoose
  Authentication       bcryptjs and signed bearer sessions
  Payments             Razorpay Checkout (test mode)
  Development server   Nodemon
  Frontend serving     VS Code Live Server or another static server

## Project structure

``` text
vanacare/
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
│   │   ├── Order.js
│   │   ├── cart.js
│   │   ├── Coupon.js
│   │   ├── Prescription.js
│   │   ├── Pharmacy.js
│   │   ├── DeliveryPartner.js
│   │   └── Notification.js
│   ├── .env.example
│   ├── db.js
│   ├── productsData.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
```

## Requirements

-   Node.js 18 or later
-   npm
-   MongoDB local instance or MongoDB Atlas account
-   VS Code (recommended)
-   VS Code Live Server extension (or another static file server)
-   Razorpay test API keys for testing online payments


## Available backend scripts

Run these commands from `backend/`:

  Command           Purpose
  ----------------- -------------------------------------------
  `npm install`     Install dependencies
  `npm run dev`     Start the development server with Nodemon
  `npm start`       Start the server with Node.js
  `npm run seed`    Import catalogue seed data
  `npm run check`   Check `server.js` syntax

## Main API endpoints

All routes use the `/api` prefix.

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  GET                     `/health`                             API health check

  POST                    `/auth/register`                      Register a customer

  POST                    `/auth/login`                         Log in

  GET                     `/auth/me`                            Get current
                                                                authenticated user

  GET                     `/products`                           List products

  GET                     `/products/:id`                       Get product details

  GET, PUT                `/cart`                               Read or update cart

  GET, POST, DELETE       `/addresses`                          Manage saved addresses

  POST                    `/prescriptions`                      Upload a prescription

  GET                     `/prescriptions/:id/file`             Access an authorized
                                                                prescription file

  GET                     `/pharmacy/prescriptions`             List prescription
                                                                reviews
                                                                (pharmacist/admin)

  PATCH                   `/pharmacy/prescriptions/:id`         Review a prescription
                                                                (pharmacist/admin)

  POST                    `/coupons/validate`                   Validate a coupon

  POST                    `/orders`                             Create an order

  GET                     `/orders`                             Get the signed-in
                                                                customer's orders

  GET                     `/orders/:id`                         Get order details

  PATCH                   `/orders/:id/status`                  Update an authorized
                                                                order status

  POST                    `/payments/verify`                    Verify Razorpay payment

  GET                     `/admin/orders`                       List orders
                                                                (admin/pharmacist)

  PATCH                   `/admin/orders/:id/assign-delivery`   Assign a delivery
                                                                partner (admin)

  GET                     `/delivery/orders`                    List assigned
                                                                deliveries

  GET                     `/notifications`                      List notifications

  PATCH                   `/notifications/:id/read`             Mark a notification as
                                                                read

  GET                     `/pharmacies`                         List active pharmacies
  -------------------------------------------------------------------------------------

Authenticated endpoints require a valid bearer token. Role-restricted
endpoints require the appropriate account role.

## User roles

Public registration creates **customer** accounts only.

The supported operational roles are: - `admin` - `pharmacist` -
`delivery`

A trusted project operator must provision these roles directly in
MongoDB. Do not add public role selection to the registration form.
After a role is changed, the user should sign in again to obtain a
session with the updated permissions.

## Payment and prescription safety

-   Configure Razorpay test keys for development.
-   Payment verification is performed by the backend; do not treat a
    frontend success message as proof of payment.
-   Never store card numbers, CVV, UPI PINs, or banking passwords in
    this application.
-   Prescription-required orders must go through an authorized
    pharmacist review before preparation/dispatch.
-   Prescription uploads are limited to PDF, JPG, PNG, or WEBP files up
    to 5 MB in the current backend configuration.
-   Keep `.env` and uploaded prescription files out of source control.

## Current limitations and future work

The current project includes backend foundations for the features below,
but they should not be presented as fully integrated production services
yet:

-   Automated pharmacy geo-routing and automatic pharmacy selection are
    not connected.
-   Delivery assignment has a protected backend endpoint; a complete
    admin assignment interface and partner onboarding workflow still
    need to be wired.
-   Real GPS/map tracking is not connected.
-   Email, SMS, and push notifications are not connected; in-app
    notifications are provided.
-   External refund execution is not connected.
-   The customer cart UI uses local storage for immediate
    responsiveness; full initial cross-device cart hydration needs
    further frontend wiring.
-   Coupon validation is available through the backend, but a live
    discount preview before order creation is not fully wired into
    checkout.
-   Automated integration tests and live MongoDB/Razorpay transactions
    must be run in your own configured environment.

## Troubleshooting

### MongoDB authentication failed

Check: 1. `MONGODB_URI` is set in `backend/.env`. 2. The Atlas database
username and password are correct (these are not necessarily your Atlas
website login credentials). 3. The Atlas IP access list allows your
current network. 4. Special characters in the database password are
URL-encoded. 5. The backend is reading the `.env` file from the
`backend` folder.

### Frontend cannot load orders

1.  Make sure the backend is running.
2.  Open `http://localhost:5000/api/health` and confirm the API
    responds.
3.  Sign in to the frontend; the orders endpoint requires
    authentication.
4.  Open browser Developer Tools → Network and inspect the `/api/orders`
    request and its status code.
5.  Check the backend terminal for the matching error.

### Port 5000 is already in use

Stop the other process using port 5000, or change `PORT` in
`backend/.env` and update the frontend API base URL accordingly.

## Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Make focused changes and test them locally.
4.  Do not commit credentials, `.env`, or private prescription uploads.
5.  Open a pull request describing the changes.

## License

No license has been specified for this repository. Add a license file
before allowing others to reuse, modify, or distribute the project.

------------------------------------------------------------------------

**VanaCare -- Making medicine ordering simpler and more accessible.**
