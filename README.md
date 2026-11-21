# 🌐 OPEN DATA EXPLORER
### Full-Stack Web Development College Mini Project
**Node.js • Express.js • TypeScript • MongoDB Atlas • Mongoose • React.js • Recharts • Public REST APIs**

---

## 📌 Project Overview & Objective

**Open Data Explorer** is a production-grade full-stack web application designed and built for the **Full Stack Web Development (FSWD)** college laboratory and mini-project syllabus. The application integrates multiple public REST APIs (Demographic, Meteorological, and Financial), processes and normalizes the information through a secure **Node.js/Express TypeScript backend**, persists relational snapshots in **MongoDB Atlas via Mongoose**, and delivers an interactive, high-performance **React TypeScript web application** with data visualizations, comparison engines, and session authentication.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries | Purpose |
|---|---|---|
| **Frontend Website** | React 18, TypeScript, Vite, React Router 6, Recharts, Lucide Icons | Responsive web portal, data visualization charts, interactive comparative engines |
| **Backend REST API** | Node.js, Express.js, TypeScript, Axios, CORS, Dotenv | Controller-Service architecture, centralized error handling, request validation, API aggregation |
| **Database & Cache** | MongoDB Atlas, Mongoose, connect-mongo | Schema validation, compound text indexes, session persistence, automatic TTL caching |
| **Security & Auth** | bcryptjs, Express Sessions, HttpOnly Cookies, RBAC | Password hashing (salt rounds: 10), role-based access control (`user` vs `admin`) |
| **External Public APIs** | REST Countries Dataset, Open-Meteo, Frankfurter | Real-time global demographics, 7-day weather forecasting, live currency exchange |

---

## 🏗️ System Architecture

```
   ┌────────────────────────────────────────────────────────┐
   │               React 18 TypeScript Website              │
   │   (Landing Page, Explorer, Comparator, Dashboard, UI)  │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / REST (withCredentials)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │            Express.js + TypeScript Web Server          │
   │  ┌─────────────────┐  ┌────────────────┐  ┌─────────┐  │
   │  │ Auth Middleware │  │ Error Handling │  │ Routing │  │
   │  └─────────────────┘  └────────────────┘  └─────────┘  │
   └───────┬───────────────────┬────────────────────┬───────┘
           │                   │                    │
           ▼                   ▼                    ▼
   ┌───────────────┐   ┌───────────────┐    ┌───────────────┐
   │   MongoDB     │   │   Open-Meteo  │    │  Frankfurter  │
   │ Atlas/Mongoose│   │  Weather API  │    │  Currency API │
   │ (Cache & User)│   │ (Atmospheric) │    │  (FX Rates)   │
   └───────────────┘   └───────────────┘    └───────────────┘
```

---

## 🧩 Core Project Modules

### 1. 🌍 Country Data Explorer
- Ingests global country records with MongoDB caching to optimize network roundtrips.
- **Search & Filter:** Search by country name, code (CCA2/CCA3), or capital city; filter by continental regions (Africa, Americas, Asia, Europe, Oceania).
- **Sorting & Pagination:** Dynamic sorting by population, alphabetical name, and total area.
- **Side-by-Side Comparator:** Compare any two world nations side-by-side with calculated population ratios, land area deltas, shared borders, and comparative Recharts bar charts.
- **Details Modal:** High-resolution flag, currencies, official name, languages, and direct Google Maps links.

### 2. ☀️ Weather Data Explorer
- Direct integration with **Open-Meteo** (no API keys required).
- City geocoding to resolve global coordinates.
- **Current Conditions:** Temperature (°C), "Feels like" apparent temperature, relative humidity (%), surface pressure (hPa), and wind speed.
- **7-Day Forecast:** Daily min/max temperature projections, precipitation totals (mm), and WMO weather condition icons.
- **24-Hour Trend Chart:** Interactive temperature curve powered by Recharts `AreaChart`.

### 3. 💱 Currency Data Explorer
- Real-time foreign exchange conversions powered by the **Frankfurter API** (European Central Bank reference rates).
- Currency pair converter with instant input validation and swap button.
- Live top global benchmark exchange rate table.
- Automatic logging of currency calculations for authenticated users.

### 4. 🔐 Authentication & Session Security
- User registration and login protected with **bcryptjs** (one-way password hashing).
- Stateful session management stored in MongoDB via **connect-mongo**.
- HttpOnly cookie enforcement (`connect.sid`).
- Role-based authorization (`user` vs `admin`).
- Pre-seeded **1-Click Quick Demo Login** buttons for immediate evaluation.

### 5. 📊 Personal User Dashboard
- Aggregated search metrics across all three data streams.
- Recharts donut breakdown of search behavior (Countries vs Weather vs Currencies).
- Bookmarked favourites manager with one-click deletion and direct navigation.
- Search history audit log with clearing capabilities.

### 6. 🛡️ Admin Governance Console
- Restricted to users with the `admin` role.
- System telemetry: total registered accounts, active users, total queries, and saved items.
- User management table: change user roles, deactivate/activate accounts, and delete users.
- MongoDB Cache Operations: View cache health, inspect TTL, trigger manual cache refreshes, or purge cache.

---

## 🗄️ Database Schemas (MongoDB / Mongoose)

1. **`User`**:
   - `username`: String (required, unique, min: 3, max: 30)
   - `email`: String (required, unique, regex validated)
   - `password`: String (bcrypt hash)
   - `role`: String (`user` | `admin`, default: `user`)
   - `isActive`: Boolean (default: `true`)
   - `timestamps`: `createdAt`, `updatedAt`

2. **`CountryData`** (Cache Collection):
   - `cca2`, `cca3`: String (uppercase, indexed)
   - `name`, `officialName`: String
   - `capital`: [String]
   - `region`, `subregion`: String (indexed)
   - `population`: Number (indexed)
   - `area`: Number
   - `flags`: `{ png, svg, alt }`
   - `currencies`, `languages`: Mixed objects
   - `borders`: [String]
   - `cachedAt`: Date
   - `expiresAt`: Date (TTL index)

3. **`SearchHistory`**:
   - `userId`: ObjectId (ref: `User`, indexed)
   - `query`: String
   - `type`: String (`country` | `weather` | `currency`)
   - `metadata`: Mixed object
   - `createdAt`: Date

4. **`SavedItem`**:
   - `userId`: ObjectId (ref: `User`)
   - `itemType`: String (`country` | `weather` | `currency`)
   - `itemId`: String
   - `title`: String
   - `subtitle`: String
   - `data`: Mixed snapshot
   - `createdAt`: Date
   - *Compound unique index*: `(userId, itemType, itemId)`

5. **`CurrencyHistory`**:
   - `userId`: ObjectId (ref: `User`)
   - `fromCurrency`, `toCurrency`: String
   - `amount`, `result`, `rate`: Number
   - `createdAt`: Date

---

## 🚀 Quick Start & Local Execution Instructions

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Clone or Open Project
```bash
cd d:\uidf\open-data-explorer
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
> **Database Note:** The backend automatically starts with an embedded in-memory MongoDB instance for instant zero-configuration testing. If you wish to connect to your personal **MongoDB Atlas** cluster, simply paste your connection URI into `backend/.env`:
> ```env
> MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/opendata?retryWrites=true&w=majority
> ```

The backend server will run at: **`http://localhost:5000`**

### 3. Start Frontend Website
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

The website will be live in your browser at: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Evaluation Credentials

For rapid demonstration during lab viva or project grading:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@opendata.com` | `Admin@123` | Full Access: Country/Weather/Currency + Admin Console + Cache Refresh + User Management |
| **Student / User** | `user@opendata.com` | `User@123` | Standard Access: Explorer + Personal Dashboard + Favourites + History + Conversions |

*(Both accounts are pre-seeded automatically on first server boot, and 1-Click login buttons are available directly on the `/login` page!)*

---

## 🧪 Testing Instructions

Run the automated 20-endpoint REST API test suite:
```bash
cd backend
npm run test:api
```

Expected output:
```
🧪 Starting Open Data Explorer Automated REST API Test Suite...
  ✅ PASS: GET /health (Server Health Check)
  ✅ PASS: GET /countries (Get paginated countries & cache)
  ✅ PASS: GET /countries/search?q=india (Search Country)
  ✅ PASS: GET /countries/IN (Country Details by CCA2 code)
  ✅ PASS: GET /countries/region/Asia (Filter by Region)
  ✅ PASS: GET /countries/compare?first=IN&second=US (Side-by-side Compare)
  ✅ PASS: GET /weather/search?city=Hyderabad (Search City)
  ✅ PASS: GET /weather/forecast?city=Hyderabad (Weather Forecast)
  ✅ PASS: GET /currency/currencies (List Currencies)
  ✅ PASS: GET /currency/rates?base=USD (Exchange Rates)
  ✅ PASS: GET /currency/convert?from=USD&to=EUR&amount=100 (Convert)
  ✅ PASS: POST /auth/register (User Registration)
  ✅ PASS: POST /auth/login (Admin Login & Session Cookie)
  ✅ PASS: GET /auth/profile (Authenticated Profile)
  ✅ PASS: POST /saved (Save Favourite Item)
  ✅ PASS: GET /saved (Retrieve Favourites)
  ✅ PASS: DELETE /saved/:id (Remove Favourite Item)
  ✅ PASS: GET /admin/stats (Admin Dashboard System Stats)
  ✅ PASS: GET /admin/users (Admin User Management)
  ✅ PASS: POST /auth/logout (Logout)

========================================
📊 TEST RESULTS: 20 PASSED, 0 FAILED
========================================
```

---

## 🎓 Full-Stack Syllabus Viva Voce Preparation (Q&A)

Here are answers to key concepts likely to be asked by examiners:

1. **Q: Why use Express Sessions with `connect-mongo` instead of plain JWT?**
   *A:* JWTs are stateless and difficult to invalidate before expiry without a blacklist. Session-based authentication stored in MongoDB (`connect-mongo`) provides stateful control, allows immediate server-side revocation on logout or account deactivation, and prevents token theft from JavaScript by using `HttpOnly` and `SameSite` cookies.

2. **Q: How does the application implement caching, and why is it important?**
   *A:* The `CountryService` caches external API responses directly in the `CountryData` collection with an `expiresAt` timestamp (TTL). Subsequent queries for countries, regions, and search filters query MongoDB directly using compound indexes rather than issuing redundant external HTTP calls, significantly lowering latency from ~1200ms to <15ms.

3. **Q: How are passwords secured?**
   *A:* Passwords are never stored in plain text. A pre-save Mongoose middleware hook generates a cryptographic salt using `bcryptjs` (10 rounds) and hashes the password before insertion into MongoDB. During authentication, `bcrypt.compare` securely verifies the candidate password against the stored hash.

4. **Q: How does the Side-by-Side comparison calculate its metrics?**
   *A:* The backend controller retrieves both country documents, extracts their numerical populations and land areas, computes the absolute difference and ratio multiplier, tests array inclusion for shared terrestrial borders (`c1.borders.includes(c2.cca3)`), and checks for shared currency codes. The frontend visualizes this with comparative Recharts bar charts.

5. **Q: What role does TypeScript play in full-stack reliability?**
   *A:* TypeScript enforces strict compile-time type safety across both frontend and backend. Interfaces for User models, Weather responses, and Country objects prevent runtime `undefined` errors and ensure consistent API contract adherence.
