# Aachiamma — Frontend

React + Vite storefront and admin dashboard for **Aachiamma Foods**. Uses Redux Toolkit for state, React Router v6 for routing, Tailwind CSS for styling, and Axios for API calls.

## Technology stack

| Area | Libraries |
|------|-----------|
| Framework | React 18, Vite |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Styling | Tailwind CSS, Styled Components |
| UI | Radix UI |
| API | Axios |
| Animations | Framer Motion, GSAP |

## Project structure

```
src/
├── api/              # Axios instance and interceptors
├── components/
│   ├── admin-view/   # Admin dashboard UI
│   ├── shopping-view/# Storefront UI (header, cart, etc.)
│   ├── common/       # Shared components (CheckAuth, Loader, …)
│   └── auth/         # Auth layout
├── config/
│   ├── index.js      # Form configs, menu items, sort options
│   └── routes.js     # Central route constants and auth helpers
├── pages/
│   ├── admin-view/   # Admin pages
│   ├── shopping-view/# Storefront pages
│   └── auth/         # Login & register
└── store/            # Redux slices (auth, shop, …)
```

---

## Routes

All application routes are defined in `src/App.jsx`. Shared path constants live in `src/config/routes.js` — **use `ROUTES` in code instead of hardcoding paths**.

### Route constants (`src/config/routes.js`)

| Constant | Path | Notes |
|----------|------|-------|
| `ROUTES.home` | `/` | Storefront home |
| `ROUTES.listing` | `/listing` | Product listing / search |
| `ROUTES.special(type)` | `/special/:type` | Curated collections |
| `ROUTES.product(id)` | `/product/:id` | Product detail |
| `ROUTES.checkout` | `/checkout` | Checkout |
| `ROUTES.account` | `/account` | User account & orders |
| `ROUTES.paymentSuccess` | `/payment-success` | Post-payment confirmation |
| `ROUTES.about` | `/about` | About page |
| `ROUTES.contact` | `/contact` | Contact form |
| `ROUTES.faq` | `/faq` | FAQs |
| `ROUTES.terms` | `/terms` | Terms of service |
| `ROUTES.privacy` | `/privacy` | Privacy policy |
| `ROUTES.refunds` | `/refunds` | Refund policy |
| `ROUTES.shipping` | `/shipping` | Shipping policy |
| `ROUTES.login` | `/auth/login` | Login |
| `ROUTES.register` | `/auth/register` | Register |
| `ROUTES.adminDashboard` | `/admin/dashboard` | Admin home |
| `ROUTES.unauth` | `/unauth-page` | Unauthorized access |

**Helper functions**

- `isAdminUser(user)` — returns `true` for `admin` or `superadmin` roles.
- `getPostLoginPath(user, from)` — admins → `/admin/dashboard`; shoppers → previous page or `/`.

---

### Storefront (`/` layout)

Wrapped in `ShoppingLayout` + `CheckAuth`. All paths below are relative to the site root.

| Path | Page component | Description |
|------|----------------|-------------|
| `/` | `ShoppingHome` | Homepage with featured sections |
| `/listing` | `ShoppingListing` | All products, filters, search, sort |
| `/special/:type` | `SpecialProductsPage` | Curated product collections |
| `/product/:id` | `ProductDetailsPage` | Single product detail |
| `/checkout` | `ShoppingCheckout` | Cart checkout & payment |
| `/account` | `ShoppingAccount` | Profile, addresses, order history |
| `/payment-success` | `PaymentSuccessPage` | Shown after successful payment |
| `/about` | `AboutInner` | About Aachiamma Foods |
| `/contact` | `ContactPage` | Contact form |
| `/faq` | `FAQsPage` | Frequently asked questions |
| `/terms` | `TermsPage` | Terms of service |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/refunds` | `RefundPolicy` | Refund policy |
| `/shipping` | `ShippingPolicy` | Shipping policy |

#### Query parameters — `/listing`

| Param | Example | Purpose |
|-------|---------|---------|
| `category` | `?category=pickles` | Filter by category slug |
| `_` | `?category=snacks&_=1710000000000` | Cache-bust when re-applying filters on the same page |

Category slugs used in the footer and navigation include: `pickles`, `snacks`, `spices-and-powders`, `kondattam`, `combos`. Additional slugs come from the backend categories API.

Filters can also be restored from `sessionStorage` key `filters` (JSON, e.g. `{ "category": ["pickles"] }`).

#### Dynamic segments — `/special/:type`

| `:type` value | Label | Product tag |
|---------------|-------|-------------|
| `trending` | Trending | `trending` |
| `best-selling` | Best Selling | `best-selling` |
| `new-arrival` | New Arrival | `new-arrival` |

Example: `/special/trending`

#### Dynamic segments — `/product/:id`

`:id` is the MongoDB product `_id` from the API.

Example: `/product/64a1b2c3d4e5f6789012345`

#### Homepage hash anchors

The home page exposes section anchors for in-page scrolling (used by `ScrollManager` in `App.jsx`):

| Hash | Section |
|------|---------|
| `#best-selling` | Best selling products |
| `#trending` | Trending products (if present) |
| `#new-arrival` | New arrivals (if present) |

---

### Authentication (`/auth` layout)

| Path | Page component | Description |
|------|----------------|-------------|
| `/auth/login` | `AuthLogin` | User / admin login |
| `/auth/register` | `AuthRegister` | New account registration |

**Redirects (via `CheckAuth`)**

- Logged-in user visiting `/auth/login` or `/auth/register` → `/` (shopper) or `/admin/dashboard` (admin).
- Unauthenticated user visiting `/admin/*` → `/auth/login` (with `state.from` for return navigation).

---

### Admin (`/admin` layout)

Requires authentication and `admin` or `superadmin` role. Non-admins are sent to `/unauth-page`.

| Path | Page component | Description |
|------|----------------|-------------|
| `/admin/dashboard` | `AdminDashboard` | Overview & stats |
| `/admin/products` | `AdminProducts` | Product CRUD |
| `/admin/orders` | `AdminOrders` | Order management |
| `/admin/features` | `AdminFeatures` | Homepage features |
| `/admin/xl-features` | `AdminXLFeatures` | XL feature blocks |
| `/admin/newsletter` | `AdminNewsletter` | Newsletter subscribers |
| `/admin/topbar` | `AdminTopbar` | Top announcement bar |
| `/admin/reviews` | `AdminReviews` | Product reviews |
| `/admin/categories` | `AdminCategories` | Product categories |
| `/admin/coupons` | `AdminCoupons` | Coupon list |
| `/admin/coupons/add` | `AdminAddCoupon` | Create coupon |
| `/admin/coupons/add/:id` | `AdminAddCoupon` | Edit coupon |
| `/admin/shipping` | `AdminShipping` | Shipping rules |
| `/admin/templates` | `MessageTemplatesPage` | SMS / message templates |
| `/admin/invoice-control` | `InvoiceControlPage` | Invoice settings |
| `/admin/contact-messages` | `AdminContactMessages` | Contact form inbox |

**Admin redirect**

- Logged-in admin visiting `/` → `/admin/dashboard`.

---

### Global / fallback routes

| Path | Page component | Description |
|------|----------------|-------------|
| `/unauth-page` | `UnauthPage` | Shown when a non-admin tries to access admin routes |
| `*` (any other path) | `NotFound` | 404 page |

---

### Route guard summary

```
┌─────────────────────────────────────────────────────────────┐
│  CheckAuth (wraps /, /auth, /admin layouts)                 │
├─────────────────────────────────────────────────────────────┤
│  /admin/*     → must be logged in + admin/superadmin        │
│  /auth/*      → redirect away if already logged in          │
│  / (home)     → admins redirected to /admin/dashboard     │
└─────────────────────────────────────────────────────────────┘
```

---

### Sitemap (public SEO routes)

`npm run sitemap` (runs automatically before `npm run build`) writes `public/sitemap.xml` with these public URLs:

`/`, `/listing`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/refunds`, `/shipping`

Product detail, checkout, account, auth, and admin routes are intentionally excluded.

---

## Running locally

### Prerequisites

- Node.js 18+
- Backend API running (see `Aachiamma-backend`)

### Setup

```bash
npm install
```

Create or edit `.env` in the project root:

```env
VITE_API_BASE=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Generate sitemap, then production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run sitemap` | Regenerate `public/sitemap.xml` and `robots.txt` |
| `npm run lint` | Run ESLint |

---

## Notes

- Scroll behaviour (including hash anchors and `prefers-reduced-motion`) is handled by `ScrollManager` in `App.jsx`.
- Navigation in components should import paths from `@/config/routes` rather than string literals.
- The backend must be running for API calls (products, cart, auth, etc.) to work.
