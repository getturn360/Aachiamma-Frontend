# Aachiamma — Frontend

React + Vite storefront and admin dashboard for **Aachiamma Foods**. Handles product browsing, cart, Razorpay checkout, user accounts, and a full admin panel for catalog, orders, coupons, shipping, and more.

**Production:** [Vercel](https://vercel.com) (SPA) → proxies `/api` to Fly.io backend  
**Pairs with:** [`../server`](../server) Express API

---

## Table of contents

1. [Quick start](#quick-start)
2. [Technology stack](#technology-stack)
3. [Project structure](#project-structure)
4. [Application bootstrap](#application-bootstrap)
5. [Environment variables](#environment-variables)
6. [API layer & authentication](#api-layer--authentication)
7. [Redux store](#redux-store)
8. [Routing](#routing)
9. [Layouts & UI patterns](#layouts--ui-patterns)
10. [Data fetching conventions](#data-fetching-conventions)
11. [Forms](#forms)
12. [Cart & guest checkout](#cart--guest-checkout)
13. [Payment / checkout flow](#payment--checkout-flow)
14. [Styling & UI components](#styling--ui-components)
15. [Browser storage reference](#browser-storage-reference)
16. [Build, sitemap & SEO](#build-sitemap--seo)
17. [Deployment](#deployment)
18. [Troubleshooting](#troubleshooting)

---

## Quick start

### Prerequisites

- **Node.js 18+**
- **Backend API running** — see [`../server/README.md`](../server/README.md)

### Setup

```bash
cd client
npm install
```

Create `.env` in the `client/` directory:

```env
VITE_API_BASE=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

Optional (for sitemap generation during build):

```env
VITE_SITE_URL=https://aachiammafoods.com
SITEMAP_API_BASE=http://localhost:5000
```

### Run

```bash
npm run dev          # Vite dev server (default http://localhost:5173)
npm run dev:clean    # Force dependency re-bundle
npm run build        # Sitemap + production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint
```

The Vite dev server proxies `/api/*` requests to your backend, so the frontend can call relative paths like `/api/shop/products/get` without CORS issues.

---

## Technology stack

| Area | Libraries |
|------|-----------|
| Framework | React 18, Vite 5 |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Styling | Tailwind CSS, CSS variables (shadcn/ui) |
| UI primitives | Radix UI, class-variance-authority |
| API | Axios (`withCredentials: true`) |
| Animations | Framer Motion, GSAP |
| SEO | react-helmet-async |
| Sanitization | DOMPurify |
| Analytics | Google Analytics 4, Vercel Analytics, Vercel Speed Insights |
| Payments | Razorpay Checkout.js (loaded dynamically) |

---

## Project structure

```
client/
├── index.html              # Entry HTML, GA4 + Ahrefs scripts
├── vite.config.js          # Aliases, dev proxy
├── tailwind.config.js      # Theme tokens
├── components.json         # shadcn/ui config
├── vercel.json             # SPA rewrites + API proxy
├── scripts/
│   └── generate-sitemap.mjs
│
└── src/
    ├── main.jsx            # App bootstrap (store, interceptors, providers)
    ├── App.jsx             # Routes, ScrollManager, auth refresh
    ├── index.css           # Tailwind + CSS variables
    │
    ├── api/
    │   └── axios.js        # Axios instance + interceptors
    │
    ├── config/
    │   ├── api.js          # Base URL resolution helpers
    │   ├── routes.js       # Route constants + auth helpers
    │   └── index.js        # Form configs, menus, sort options
    │
    ├── store/
    │   ├── store.js
    │   ├── auth-slice/
    │   ├── common-slice/   # Features, categories, global loader
    │   ├── popup-slice/
    │   ├── admin/          # products-slice, order-slice
    │   └── shop/           # cart, products, order, address, review, search
    │
    ├── pages/
    │   ├── shopping-view/  # Storefront pages
    │   ├── admin-view/     # Admin pages
    │   ├── auth/           # Login, register
    │   ├── not-found/
    │   └── unauth-page/
    │
    ├── components/
    │   ├── shopping-view/  # Header, cart, filters, home sections
    │   ├── admin-view/     # Sidebar, layout, shared admin widgets
    │   ├── common/         # CheckAuth, Loader, SEO, Footer, forms
    │   ├── auth/           # Auth layout
    │   └── ui/             # shadcn-style primitives (button, dialog, …)
    │
    ├── hooks/
    │   └── useAvailableCoupons.js
    │
    ├── lib/
    │   ├── add-to-cart.js      # Unified add-to-cart helper
    │   ├── guest-cart.js       # localStorage guest cart
    │   ├── post-auth-cart.js   # Merge cart after login
    │   ├── coupon-utils.js
    │   ├── safe-arithmetic.js  # Admin coupon expressions
    │   ├── analytics.js
    │   ├── toast.js            # Legacy imperative toast
    │   └── utils.js            # cn() helper
    │
    └── utils/
        └── withGlobalLoading.js
```

**Import alias:** `@/` maps to `src/` (configured in `vite.config.js` and `jsconfig.json`).

---

## Application bootstrap

`main.jsx` initializes in this order:

1. Create Redux store (`store/store.js`)
2. Wire Axios interceptors (`setupApiInterceptors(store)`) — must happen after store creation to avoid circular imports
3. Render provider tree:
   - `HelmetProvider` (SEO)
   - `BrowserRouter`
   - `Provider` (Redux)
   - `ErrorBoundary`
   - `Toaster` (Radix toast)
   - `App`

`App.jsx` responsibilities:
- Dispatch `checkAuth()` on mount to restore session from cookies
- **Proactive token refresh** every 12 minutes while authenticated (`POST /api/auth/refresh`)
- `ScrollManager` — hash anchor scrolling with `prefers-reduced-motion` support
- `ConnectedLoader` on storefront routes (not admin)
- Google Analytics, Vercel Analytics, Speed Insights

Global loader portals render into `#portal-root` in `index.html`.

---

## Environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `VITE_API_BASE` | Vite proxy, `config/api.js`, sitemap | Backend host URL |
| `VITE_API_URL` | Same (alternate name) | Backend host URL |
| `VITE_SITE_URL` | Sitemap script | Canonical site URL (default `https://aachiammafoods.com`) |
| `SITEMAP_HOSTNAME` | Sitemap script | Override hostname |
| `SITEMAP_API_BASE` | Sitemap script | API for fetching product URLs |

**Runtime override (no rebuild):** `window.REACT_APP_API_BASE_URL` — checked by `config/api.js`.

### API URL resolution (`src/config/api.js`)

Priority order:
1. `import.meta.env.VITE_API_BASE` or `VITE_API_URL`
2. `window.REACT_APP_API_BASE_URL`
3. Production fallback: `https://aachiamma-backend.fly.dev`
4. Dev fallback: `""` (empty — uses same-origin `/api` via Vite proxy)

Helpers: `getApiHost()`, `getAxiosBaseURL()`, `normalizeApiPath()`, `apiUrl()`.

### Dev vs production API routing

| Environment | How `/api` reaches backend |
|-------------|---------------------------|
| Local dev | Vite proxy → `VITE_API_BASE` (default `localhost:5000`) |
| Vercel prod | `vercel.json` rewrite → `aachiamma-backend.fly.dev` |
| Direct Fly | Axios `baseURL` set to Fly host |

---

## API layer & authentication

### Axios instance (`src/api/axios.js`)

```js
axios.create({ withCredentials: true })
```

- **No Bearer tokens in localStorage** — auth uses **httpOnly cookies** set by the backend.
- `baseURL` is set per-request via `getAxiosBaseURL()`.

### Request interceptor

- Increments a pending-request counter → dispatches global loader (`setLoading`)
- Skip loader: `config.skipGlobalLoader = true` or header `x-loading-message`

### Response interceptor (401 handling)

1. On 401, queues a token refresh via `POST /api/auth/refresh`
2. On success: updates Redux user, retries original request
3. On failure: dispatches `logoutUser()`
4. Skips refresh for `/api/auth/login` and `/api/auth/refresh`
5. Max 2 refresh attempts per request

### Auth flow

```
App mount → checkAuth() → GET /api/auth/check-auth
                              ↓
                    Sets user + isAuthenticated in Redux

Login → POST /api/auth/login → cookies set by backend
      → mergePendingCartItem() (guest cart + sessionStorage)
      → navigate(getPostLoginPath(user))

Every 12 min (while authed) → POST /api/auth/refresh (background)

Logout → POST /api/auth/logout → clears cookies + Redux state
```

### Route guard (`components/common/check-auth.jsx`)

| Condition | Behavior |
|-----------|----------|
| Admin visits `/` | Redirect → `/admin/dashboard` |
| `/admin/*` unauthenticated | → `/auth/login` with `state.from` |
| `/admin/*` non-admin role | → `/unauth-page` |
| `/auth/*` while logged in | Renders children (login page handles post-merge redirect) |

### Role helpers (`config/routes.js`)

- `isAdminUser(user)` — `admin` or `superadmin`
- `isSuperAdminUser(user)` — superadmin variants
- `getPostLoginPath(user, from)` — admins → dashboard; shoppers → previous page or home

**Always use `ROUTES` constants** from `config/routes.js` instead of hardcoded path strings.

---

## Redux store

Store keys and their slices (`store/store.js`):

| Key | Slice | State | Key async thunks |
|-----|-------|-------|------------------|
| `auth` | `auth-slice` | `user`, `loading`, `isAuthenticated`, `error` | `registerUser`, `loginUser`, `checkAuth`, `logoutAsync` |
| `adminProducts` | `admin/products-slice` | `isLoading`, `productList` | `addNewProduct`, `fetchAllProducts`, `editProduct`, `deleteProduct` |
| `adminOrder` | `admin/order-slice` | `orderList`, `orderDetails`, `invoiceSettings`, pagination | `getAllOrdersForAdmin`, `getOrderDetailsForAdmin`, `updateOrderStatus`, `deleteOrderForAdmin` |
| `shopProducts` | `shop/products-slice` | `isLoading`, `productList`, `productDetails` | `fetchAllFilteredProducts`, `fetchProductDetails` |
| `shopCart` | `shop/cart-slice` | `cartItems`, `isLoading` | `addToCart`, `fetchCartItems`, `deleteCartItem`, `updateCartQuantity` |
| `shopAddress` | `shop/address-slice` | `isLoading`, `addressList` | `addNewAddress`, `fetchAllAddresses`, `editaAddress`, `deleteAddress` |
| `shopOrder` | `shop/order-slice` | `razorpayOrder`, `razorpayKeyId`, `orderId`, `orderList`, `orderDetails`, `isLoading` | `createNewOrder`, `capturePayment`, `getAllOrdersByUserId`, `getOrderDetails` |
| `shopSearch` | `shop/search-slice` | `isLoading`, `searchResults` | `getSearchResults` |
| `shopReview` | `shop/review-slice` | `isLoading`, `reviews`, `error` | `addReview`, `getReviews` |
| `commonFeature` | `common-slice` | `featureImageList`, `categories`, `categoriesLoaded`, loader state | `getFeatureImages`, `addFeatureImage`, `fetchCategories` |
| `popup` | `popup-slice` | `list`, `adminList`, `isLoading` | `fetchPopups`, `fetchAdminPopups` |

**Sync actions worth knowing:**
- `auth.logoutUser`, `auth.setUser`
- `commonFeature.setLoading`, `commonFeature.setLoadingMessage` — drives global loader
- `shopCart.clearGuestCart`, `shopCart.replaceCart`

---

## Routing

Routes are defined in `src/App.jsx`. Path constants live in `src/config/routes.js`.

### Route constants

| Constant | Path |
|----------|------|
| `ROUTES.home` | `/` |
| `ROUTES.listing` | `/listing` |
| `ROUTES.special(type)` | `/special/:type` |
| `ROUTES.product(id)` | `/product/:id` |
| `ROUTES.checkout` | `/checkout` |
| `ROUTES.account` | `/account` |
| `ROUTES.paymentSuccess` | `/payment-success` |
| `ROUTES.about` | `/about` |
| `ROUTES.contact` | `/contact` |
| `ROUTES.faq` | `/faq` |
| `ROUTES.terms` | `/terms` |
| `ROUTES.privacy` | `/privacy` |
| `ROUTES.refunds` | `/refunds` |
| `ROUTES.shipping` | `/shipping` |
| `ROUTES.login` | `/auth/login` |
| `ROUTES.register` | `/auth/register` |
| `ROUTES.adminDashboard` | `/admin/dashboard` |
| `ROUTES.unauth` | `/unauth-page` |

### Storefront (`/` layout — `ShoppingLayout`)

| Path | Page | Description |
|------|------|-------------|
| `/` | `ShoppingHome` | Homepage with featured sections |
| `/listing` | `ShoppingListing` | Products, filters, search, sort |
| `/special/:type` | `SpecialProductsPage` | Curated collections |
| `/product/:id` | `ProductDetailsPage` | Product detail |
| `/checkout` | `ShoppingCheckout` | Cart checkout & Razorpay payment |
| `/account` | `ShoppingAccount` | Profile, addresses, orders |
| `/payment-success` | `PaymentSuccessPage` | Post-payment confirmation |
| `/about`, `/contact`, `/faq` | Policy/info pages | Static content |
| `/terms`, `/privacy`, `/refunds`, `/shipping` | Policy pages | Legal content |

#### `/listing` query parameters

| Param | Example | Purpose |
|-------|---------|---------|
| `category` | `?category=pickles` | Filter by category slug |
| `_` | `?category=snacks&_=1710000000000` | Cache-bust when re-applying filters |

Category slugs: `pickles`, `snacks`, `spices-and-powders`, `kondattam`, `combos` (+ dynamic from API).

Filters can also be restored from `sessionStorage` key `filters` (JSON).

#### `/special/:type` values

| `:type` | Label | Product tag |
|---------|-------|-------------|
| `trending` | Trending | `trending` |
| `best-selling` | Best Selling | `best-selling` |
| `new-arrival` | New Arrival | `new-arrival` |

#### Homepage hash anchors

| Hash | Section |
|------|---------|
| `#best-selling` | Best selling products |
| `#trending` | Trending products |
| `#new-arrival` | New arrivals |

### Authentication (`/auth` layout)

| Path | Page |
|------|------|
| `/auth/login` | `AuthLogin` |
| `/auth/register` | `AuthRegister` |

### Admin (`/admin` layout — requires `admin` or `superadmin`)

| Path | Page | Sidebar |
|------|------|---------|
| `/admin/dashboard` | `AdminDashboard` | Superadmin only |
| `/admin/analytics` | `AdminAnalytics` | Superadmin only |
| `/admin/products` | `AdminProducts` | All admins |
| `/admin/orders` | `AdminOrders` | All admins |
| `/admin/reviews` | `AdminReviews` | All admins |
| `/admin/contact-messages` | `AdminContactMessages` | All admins |
| `/admin/categories` | `AdminCategories` | Superadmin only |
| `/admin/newsletter` | `AdminNewsletter` | Superadmin only |
| `/admin/coupons` | `AdminCoupons` | Superadmin only |
| `/admin/coupons/add` | `AdminAddCoupon` | Superadmin only |
| `/admin/coupons/add/:id` | `AdminAddCoupon` (edit) | Superadmin only |
| `/admin/topbar` | `AdminTopbar` | Superadmin only |
| `/admin/shipping` | `AdminShipping` | Superadmin only |
| `/admin/invoice-control` | `InvoiceControlPage` | All admins |
| `/admin/features` | `AdminFeatures` | **No sidebar link** (direct URL only) |
| `/admin/xl-features` | `AdminXLFeatures` | **No sidebar link** (direct URL only) |

#### Role-based sidebar (`components/admin-view/sidebar.jsx`)

| Role | Visible menu items |
|------|-------------------|
| `admin` | Products, Orders, Reviews, Contact Messages, Invoice Control |
| `superadmin` | Full menu (Dashboard, Analytics, Categories, Newsletter, Coupons, Topbar, Shipping, etc.) |

Backend also enforces role restrictions — `admin` cannot access analytics (`/api/admin/analytics`).

### Fallback routes

| Path | Page |
|------|------|
| `/unauth-page` | `UnauthPage` — non-admin tried to access admin |
| `*` | `NotFound` — 404 |

### Route guard diagram

```
┌─────────────────────────────────────────────────────────────┐
│  CheckAuth (wraps /, /auth, /admin layouts)                 │
├─────────────────────────────────────────────────────────────┤
│  /admin/*     → must be logged in + admin/superadmin        │
│  /auth/*      → redirect away if already logged in          │
│  / (home)     → admins redirected to /admin/dashboard       │
└─────────────────────────────────────────────────────────────┘
```

---

## Layouts & UI patterns

### Shopping layout (`components/shopping-view/layout.jsx`)
- `ShoppingHeader` + `<Outlet />` + `Footer`
- Content offset: `paddingTop: var(--header-height, 80px)`
- Global loader via `ConnectedLoader` in `App.jsx`

### Admin layout (`components/admin-view/layout.jsx`)
- Fixed sidebar + header + scrollable main panel
- Scoped `AdminContentLoader` inside main (not the global storefront loader)
- Brand color sidebar: `#08665F` gradient

### Auth layout (`components/auth/layout.jsx`)
- Split hero (flipping logo animation) + form card `<Outlet />`

### Component organization

| Layer | Location | Purpose |
|-------|----------|---------|
| Pages | `pages/` | Route-level containers |
| Feature UI | `components/shopping-view/`, `components/admin-view/` | Domain-specific components |
| Shared | `components/common/` | Auth guard, forms, loader, SEO, footer |
| Design system | `components/ui/` | shadcn primitives — no business logic |
| Sub-features | `components/shopping-view/home/`, `coupons/` | Page sections |

Some admin routes render components from `components/admin-view/` directly (e.g. `orders.jsx`, `reviews.jsx`) rather than `pages/admin-view/`.

---

## Data fetching conventions

The app uses a **hybrid** approach — not everything goes through Redux:

| Pattern | Where | Example |
|---------|-------|---------|
| Redux thunks on mount | Home, listing, cart, orders | `fetchAllFilteredProducts`, `fetchCartItems` |
| Direct `api.*` calls | Admin dashboard, shipping, coupons, checkout | `api.get("/api/admin/shipping")` |
| Redux + local state | Analytics, newsletter | Parallel `api.get` calls |
| Custom hook | Checkout coupons | `useAvailableCoupons(cartItems)` |

### Global loading

Most `api` calls trigger the global loader. Background requests use:

```js
api.get("/api/...", { skipGlobalLoader: true })
```

Cart operations, auth refresh, and coupon fetches typically skip the loader.

### When to use Redux vs direct API

- **Redux** — data shared across components or needed after navigation (cart, products, auth, orders list)
- **Direct API** — one-off admin page data, form submissions, or data that doesn't need global state

---

## Forms

Declarative form configs live in `src/config/index.js`:
- `loginFormControls`, `registerFormControls`
- `addProductFormElements` (admin product CRUD)
- `addressFormControls` (includes Indian states list)

`CommonForm` (`components/common/form.jsx`) renders fields from config based on `componentType`:

| `componentType` | Renders |
|-----------------|---------|
| `input` | Text/number input |
| `select` | Dropdown (can fetch categories inline) |
| `textarea` | Multi-line text |
| `sections` | Repeatable description sections |
| `variations` | Product variant editor |
| `specList` | Specification key-value pairs |
| `checkboxgroup` | Multi-select checkboxes |

Auth pages use local `useState` + `CommonForm` + thunk `.unwrap()`.

---

## Cart & guest checkout

### Guest cart (`lib/guest-cart.js`)

- Stored in `localStorage` key `guest_cart_v1`
- Supports variant matching (same product + variant = quantity merge)
- Cart slice dual-path: logged-in users hit API; guests use localStorage

### Add to cart (`lib/add-to-cart.js`)

Unified helper: `addProductToCart({ dispatch, user, product, variant, quantity })`

### Post-auth cart merge (`lib/post-auth-cart.js`)

After login/register:
1. Merges `sessionStorage.pendingCartItem` (item added before login redirect)
2. Merges `localStorage` guest cart into server cart
3. Dispatches `CART_UPDATED_EVENT` for UI refresh

### Buy Now

Navigate to checkout with state (bypasses cart):

```js
navigate(ROUTES.checkout, { state: { buyNow: true, items: [...] } })
```

---

## Payment / checkout flow

**Page:** `pages/shopping-view/checkout.jsx`

```
1. Load cart (Redux) OR buy-now items (location.state)
2. Address: saved addresses (logged-in) OR guest_address_v1 (localStorage)
3. Shipping: GET /api/common/shipping → zone-based fee + free threshold
4. Coupons: logged-in only → POST /api/shop/coupons/apply
5. Pay button:
   a. dispatch(createNewOrder) → POST /api/shop/order/create
   b. Backend returns orderId, razorpayOrder, razorpayKeyId
   c. Load Razorpay checkout.js dynamically
   d. Open Razorpay modal
6. On Razorpay success:
   a. dispatch(capturePayment) → POST /api/shop/order/capture
   b. Clear guest cart / refresh server cart
   c. navigate → /payment-success
```

**Guest checkout** is supported (no `userId`). Coupons are disabled for guests. Guest cart is cleared from localStorage on success.

---

## Styling & UI components

### shadcn/ui setup

`components.json` configures shadcn with:
- Style: `default`, base color: `slate`
- CSS variables enabled
- Aliases: `@/components`, `@/lib/utils`

UI primitives in `components/ui/` follow the shadcn pattern: Radix + `class-variance-authority` + `cn()` from `lib/utils.js`.

To add a new primitive, follow [shadcn/ui docs](https://ui.shadcn.com) and match existing JSX conventions (this project uses JS, not TS).

### Brand color

Primary brand: **`#08665F`** — used in buttons, auth gradient, admin sidebar, checkout accents. Overridden in `components/ui/button.jsx`.

### Tailwind

- `tailwind.config.js` — shadcn color tokens, `tailwindcss-animate`
- `index.css` — `@tailwind` layers + `:root` / `.dark` CSS variables
- `darkMode: ["class"]` — dark mode via class toggle (not heavily used)

### Dual toast systems

| System | Used by |
|--------|---------|
| Radix `use-toast` (`components/ui/`) | Most storefront UI |
| `lib/toast.js` (imperative DOM) | Admin dashboard |

### SEO components

- `components/common/SEO.jsx` — page title, meta description, OG tags via react-helmet-async
- `components/shopping-view/ProductSchemaMarkup.jsx` — JSON-LD for product pages

---

## Browser storage reference

| Key | Storage | Purpose |
|-----|---------|---------|
| `guest_cart_v1` | localStorage | Guest shopping cart |
| `guest_address_v1` | localStorage | Guest checkout address |
| `pendingCartItem` | sessionStorage | Item to add after login redirect |
| `aachiamma_pending_coupon_code` | sessionStorage | Coupon preserved across login |
| `filters` | sessionStorage | Listing category filters |
| `popup_seen_this_session` | sessionStorage | Popup dismissal (cleared on logout) |
| `aachiamma_newsletter_email` | localStorage | Footer newsletter prefill |
| `aachiamma_xl_features_draft` | localStorage | XL features admin draft |

**JWT tokens are NOT stored in browser storage** — they live in httpOnly cookies managed by the backend.

---

## Build, sitemap & SEO

### Build pipeline

```
npm run build
  → npm run sitemap (scripts/generate-sitemap.mjs)
  → vite build → dist/
```

### Sitemap script

1. Reads `.env` + `process.env`
2. Writes `public/sitemap.xml` and `public/robots.txt`
3. **Static routes:** `/`, `/listing`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/refunds`, `/shipping`
4. **Dynamic routes:** fetches all products from API → `/product/:id` entries with `lastmod`

Auth, checkout, account, and admin routes are excluded.

### Analytics

| Service | Location |
|---------|----------|
| Google Analytics 4 | `index.html` + `lib/analytics.js` (`G-PGPR23961E`) |
| Ahrefs | `index.html` script tag |
| Vercel Analytics | `App.jsx` |
| Vercel Speed Insights | `App.jsx` |

### Other public assets

- `public/llms.txt` — LLM crawler guidance
- `public/robots.txt` — generated by sitemap script (includes AI bot rules)

---

## Deployment

### Vercel (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://aachiamma-backend.fly.dev/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- All non-API routes → SPA `index.html`
- `/api/*` proxied to Fly.io backend
- With empty `baseURL` in production on Vercel, browser calls same-origin `/api/...`

### Deployment checklist

1. Set `VITE_API_BASE` if not using Vercel rewrites (optional)
2. Set `VITE_SITE_URL` for correct sitemap URLs during build
3. Ensure backend `CORS_ORIGINS` includes your Vercel domain
4. Razorpay live keys must be set on the **backend** (not frontend)

### Local production preview

```bash
npm run build
npm run preview   # serves dist/ on http://localhost:4173
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| API calls fail in dev | Backend not running | Start `server` with `npm run dev` |
| CORS errors | Backend missing frontend origin | Add `http://localhost:5173` to server `CORS_ORIGINS` |
| Auth not persisting | Cookies blocked cross-origin | Use Vite proxy (dev) or Vercel rewrites (prod); ensure `withCredentials: true` |
| Infinite login redirect | Role mismatch | Check user role in DB; admins need `admin` or `superadmin` |
| Razorpay modal doesn't open | Missing keys or script load fail | Check backend Razorpay env vars; check browser console |
| Global loader stuck | Unhandled API error | Check network tab; look for failed requests without error handling |
| Cart empty after login | Merge failed | Check `mergePendingCartItem` flow; inspect `guest_cart_v1` in localStorage |
| Sitemap missing products | API unreachable during build | Set `SITEMAP_API_BASE` in build env on Vercel |
| Admin page 403 | `admin` role lacks permission | Some routes require `superadmin`; check sidebar filtering |

### Useful dev tips

```bash
# Clear Vite cache if HMR acts up
npm run dev:clean

# Check what API base URL resolves to (browser console)
import { getAxiosBaseURL } from '@/config/api'; console.log(getAxiosBaseURL());

# Skip global loader on a request
api.get('/api/...', { skipGlobalLoader: true })
```

---

## Related documentation

- **Backend:** [`../server/README.md`](../server/README.md) — API routes, models, env vars, deployment on Fly.io
- **Route constants:** always import from `@/config/routes` — never hardcode paths
- **Scroll behaviour:** `ScrollManager` in `App.jsx` handles hash anchors and `prefers-reduced-motion`
