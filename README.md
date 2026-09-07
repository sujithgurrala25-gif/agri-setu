# AgriSetu — Farmer-to-Consumer Direct Marketplace

Smart India Hackathon prototype that cuts unnecessary intermediaries so farmers earn more and buyers pay fairer prices.

**Problem:** Multiple intermediaries reduce farmers' earnings and increase consumer prices.  
**Solution:** A direct marketplace with fair-price recommendations, price transparency, location matching, and farmer aggregation for bulk demand.

---

## 1. Project overview

AgriSetu is a working web application (not a mockup) with four roles:

| Role | Purpose |
| --- | --- |
| Farmer | List produce, see recommended prices, accept orders, track earnings |
| Consumer | Search nearby farms, compare prices, order, track delivery, review |
| Institutional buyer | Place bulk demand; the platform matches multiple farmers |
| Admin | Verify farmers, monitor orders/payments, complaints, risk flags |

The SIH story is always: **farmer lists → buyer orders directly → fewer middlemen → both sides see the math.**

---

## 2. Architecture

```
┌─────────────┐     REST/JSON      ┌──────────────────┐
│ React +     │ ◄────────────────► │ Express API      │
│ Tailwind    │     JWT Bearer     │ (Node.js)        │
└─────────────┘                    └────────┬─────────┘
                                            │
                                   Mongoose │
                                            ▼
                                   ┌──────────────────┐
                                   │ MongoDB          │
                                   └──────────────────┘
```

- **Frontend:** Vite, React 18, React Router, Tailwind CSS, Recharts, Leaflet (OpenStreetMap).
- **Backend:** Express, JWT + bcrypt, modular routes/services.
- **Fair price:** Rule-based engine in `backend/src/services/fairPrice.js` (transparent, demo-safe; no fake ML accuracy claims).
- **Maps:** Leaflet + OSM tiles; distances via Haversine.
- **Payments:** Simulated checkout (no real PSP keys required).
- **Delivery:** Simulated status timeline.

---

## 3. User roles

See dashboards:

- `/app/farmer` — inventory, orders, earnings, price advisor, demand
- `/app/consumer` — marketplace, cart, tracking
- `/app/buyer` — bulk RFQ and aggregation
- `/app/admin` — verification, analytics, complaints

---

## 4. Feature list

Direct listing & checkout · Fair-price band + explanation · Traditional vs direct price split · Multi-farmer bulk matching · Nearby farmers + sort · Demand/supply analytics · Order lifecycle (PENDING → DELIVERED) · Farmer verification badges · Notifications · Reviews · Demo payments · Seeded SIH walkthrough.

---

## 5. Database schema (MongoDB)

Collections: `users`, `farmerprofiles`, `products`, `orders`, `payments`, `deliveries`, `reviews`, `pricehistories`, `marketprices`, `notifications`, `complaints`, `bulkorders`.

Indexes: `users.email` unique · `products` on `name`, `farmer`, geo `location` · `orders` on `farmer`/`buyer`/`status` · `bulkorders` on `status`.

Relationships are referenced `_id`s (User → FarmerProfile, Product → Farmer, Order → items, BulkOrder → allocations).

---

## 6. API structure

Base URL: `http://localhost:5000/api`

| Area | Methods |
| --- | --- |
| `/auth` | `POST /register` `POST /login` `GET /me` |
| `/products` | CRUD, search, nearby, transparency |
| `/orders` | create, list, status, track |
| `/pricing` | recommend, market, history |
| `/analytics` | demand-supply, farmer earnings, admin stats |
| `/bulk` | create RFQ, match, accept allocations |
| `/admin` | users, verify, complaints, flags |
| `/notifications` | list, mark read |
| `/reviews` | create, list by product/farmer |
| `/uploads` | product images |

Open `http://localhost:5000/api/docs` for a live endpoint map.

---

## 7. Folder structure

```
SIH/
  docker-compose.yml
  README.md
  backend/          Express API, models, seed
  frontend/         Vite React app
```

---

## 8. Fair-price methodology (honest)

Not a trained predictor. A **weighted rule engine**:

1. Blend **current mandi/market price** (45%) and **90-day historical average** (35%) with a **season baseline** (20%).
2. Adjust ± for **demand** (search/order intensity) and **supply** (listed kg).
3. Small quantity premium / large-lot discount.
4. Output a **band** (min–max), not a single “predicted” rupee.
5. UI explains each factor in plain language.

Traditional vs direct comparison uses documented typical markup steps (trader → wholesaler → retailer) versus farmer list price + platform/logistics fee.

---

## 9. SIH demo workflow

Demo logins (after `npm run seed`):

| Role | Email | Password |
| --- | --- | --- |
| Farmer (Ramesh, tomatoes) | `ramesh@agrisetu.in` | `Farmer@123` |
| Consumer | `ananya@agrisetu.in` | `Consumer@123` |
| Institutional (FreshMart) | `procurement@freshmart.in` | `Buyer@123` |
| Admin | `admin@agrisetu.in` | `Admin@123` |

Walkthrough:

1. Log in as Ramesh → add **100 kg Tomato @ ₹22/kg**.
2. Open **Fair price** — band **₹24–₹26** with reasons.
3. Log in as Ananya → search Tomato → nearby farmers map/list.
4. Order from Ramesh → pay (demo) → Ramesh **Accepts**.
5. Advance delivery → consumer **Track order**.
6. Farmer **Earnings** + **Price transparency** card.
7. FreshMart bulk **500 kg tomato** → **Match farmers** (A+B+C+D).

---

## Setup

**Prerequisites:** Node.js 18+, MongoDB 6+ (or Docker).

```bash
# MongoDB (optional Docker)
docker compose up -d

# Backend
cd backend
copy .env.example .env    # Windows
npm install
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

If MongoDB is not installed, the API automatically starts an **in-memory database and seeds demo users**. Data lasts until you stop the API.

If MongoDB is already running, set `MONGODB_URI=mongodb://127.0.0.1:27017/agrisetu` in `backend/.env`.
