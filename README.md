# FastGrab

**Order ahead. Grab & go.**

FastGrab is a multi-vendor platform for pre-ordering from nearby physical stores (supermarkets, grocery shops, other retail) and collecting the order at a chosen pickup time, without waiting in the normal shopping or billing queue.

> FastGrab is **not** a home-delivery service. Customers visit the shop and collect their prepared order.

---

## How it works

1. **Discover**: the customer finds nearby registered stores.
2. **Browse and cart**: they view products, prices and stock, then add items to the cart. Each checkout is for **one shop**.
3. **Schedule**: they pick a pickup date and time slot. Slots respect opening hours, preparation time and slot capacity.
4. **Pay**: they pay a booking deposit, pay in full online, or choose pay-at-store (the policy is still to be decided).
5. **Prepare**: the merchant accepts the order (or offers substitutions), prepares it, and moves it to *Packed*, then *Ready for Pickup*.
6. **Collect**: the customer shows a QR code or order ID, pays any balance, and the merchant marks the order *Picked Up*.

### Order lifecycle

```
Placed → Accepted / Rejected → Preparing → Packed → Ready for Pickup → Picked Up
                                                  ↘ Cancelled / No-show / Refunded
```

## User roles

| Role | Key capabilities |
|------|------------------|
| **Customer** | Auth and profile, saved locations and shops, nearby stores, product search, cart, pickup scheduling, checkout, order timeline, QR/order ID, support |
| **Merchant** | Shop profile, products and inventory, prices and discounts, opening hours, pickup slots and capacity, prep time, order handling, QR verification, monthly sales and commission statements |
| **Admin** | Shop approvals, user management, order/refund/complaint monitoring, commission slab configuration, sponsored placements, platform analytics |

## Business model

The main source of revenue is a **monthly progressive commission** on completed FastGrab sales. There are no subscriptions and no fixed merchant packages.

| Monthly FastGrab sales | Rate (applies only within the band) |
|------------------------|------------------------------|
| First ₹50,000 | 0% |
| Next ₹50,000 | 1% |
| Next ₹1,00,000 | 1.5% |
| Above ₹2,00,000 | 2% |

- The sales counter **resets on the 1st of every month**. Earlier statements are kept.
- Only **eligible completed** orders count. Cancelled orders are excluded and refunds are subtracted.
- Example: ₹2,50,000 in a month gives ₹0 + ₹500 + ₹1,500 + ₹1,000 = **₹3,000** (1.2% effective).

Possible later income: clearly labelled sponsored placements, brand campaigns, and an optional disclosed customer convenience fee.

> These rates are proposed assumptions. Validate them with shop owners, category margins, payment-provider fees and Indian regulatory and tax advice.

## Tech stack (MERN)

| Layer | Tech | Status |
|-------|------|--------|
| Frontend | React 19 + Vite | ✅ set up in [`client/`](client/) |
| Backend | Node.js + Express | ⏳ planned (`server/`) |
| Database | MongoDB (Mongoose) | ⏳ planned |
| Payments | Authorised payment aggregator, verified by server-side webhooks | ⏳ planned |

## Project structure

```
FastGrab/
├── client/              # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js   # dev server on :5173, proxies /api → :5000
│   └── package.json
├── server/              # (planned) Express + MongoDB API
└── README.md
```

## Getting started

**Prerequisites:** Node.js 20.19+ or 22.12+, and npm.

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build for production into `client/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

Requests to `/api/*` from the frontend are proxied to `http://localhost:5000`, which is where the Express server will run.

## Roadmap

**Phase 1: Validate.** Interview 15–20 shop owners and 40–50 customers in one locality.

**Phase 2: Pilot MVP** with 3–5 shops:
- [ ] Auth (customer / merchant / admin roles)
- [ ] Shop registration and admin approval
- [ ] Product catalogue and inventory
- [ ] Nearby store discovery (MongoDB geospatial queries)
- [ ] Cart (single shop) and checkout
- [ ] Pickup slots with capacity limits (no overbooking)
- [ ] Merchant order dashboard and status updates
- [ ] QR / order-ID pickup verification
- [ ] Pay-at-store (online deposit later)

**Phase 3: Measure and improve.** Track completed orders, AOV, repeat rate, prep time, pickup punctuality, cancellations, and the monthly commission statements.

## Key operating rules

- Count only completed orders toward commission, and adjust for refunds.
- Merchants confirm availability before preparing, and can offer substitutions.
- Each pickup slot has a capacity limit to prevent overbooking.
- Show deposit, balance, cancellation and refund rules **before** checkout.
- Verify payments on the server (webhooks). Never trust the browser's success message alone.
- Keep an order-level ledger: amount, deposit, balance, refund, commission, gateway fee, merchant settlement.
