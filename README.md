# Aachiamma - Client / Frontend

This is the frontend client for the Aachiamma application, built using React, Vite, and Redux Toolkit. It provides a robust, responsive, and animated user interface for both regular customers (shopping view) and administrators (admin view).

## 🚀 Technology Stack

- **Framework:** React 18 with Vite
- **State Management:** Redux Toolkit (`react-redux`)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS, Styled Components
- **UI Components:** Radix UI primitives
- **Animations:** Framer Motion, GSAP, Tailwind-Animate
- **API Calls:** Axios
- **Icons & Charts:** Lucide React, React Icons, Recharts
- **Forms & Data:** React Hook Form (or standard controlled components), xlsx (for data exports)

## 📂 Project Structure

The source code is primarily located in the `src` directory:

- `components/`: Contains all reusable UI components.
  - `admin-view/`: Components specific to the admin dashboard.
  - `shopping-view/`: Components specific to the customer storefront.
  - `common/`: Shared components like Loaders, CheckAuth, UI elements (buttons, inputs).
  - `auth/`: Layout and components for login/registration pages.
- `pages/`: The main page views rendered by React Router.
  - `admin-view/`: Dashboard, Products, Orders, Features, Categories, Newsletters, etc.
  - `shopping-view/`: Home, Listing, Checkout, Account, Policies, Product Details, etc.
  - `auth/`: Login and Register screens.
- `store/`: Redux setup containing slices for state management (auth, shop, admin data).
- `api/`, `lib/`, `utils/`: Utility functions, API configurations, and helper logic.
- `assets/`: Static assets like images and fonts.

## 🛠️ Features & Architecture

### 1. User Authentication (`/auth/*`)
- Robust authentication layout.
- Protected routes using the `CheckAuth` component, which checks user roles and tokens.
- Automatic redirection based on authentication state and user roles (Admin vs User).

### 2. Admin Dashboard (`/admin/*`)
A comprehensive control panel for site administrators to manage:
- **Products & Orders:** Full CRUD capabilities for inventory and viewing customer orders.
- **Content Management:** Features, XL-Features, Topbar announcements.
- **Marketing & SEO:** Coupons, Newsletters, and Contact Messages.
- **Settings:** Shipping configurations, Invoice Control, Message Templates, and Categories.

### 3. Storefront (`/shop/*` & `/`)
The customer-facing e-commerce interface:
- **Shopping Experience:** Dynamic homepage, product listings, detailed product views, and category filtering.
- **Checkout Flow:** Cart management, address selection, and payment processing integration.
- **User Account:** Order history and account details.
- **Static Pages:** About, Contact, FAQs, Privacy, Terms, Refund, and Shipping policies.

## 💻 Running Locally

### Prerequisites
Ensure Node.js is installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `client` directory (if needed):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *(Note: The actual variable name depends on your Axios setup. Check `src/api` or `src/config` for the exact expected API URL variable).*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will start the Vite server with Hot Module Replacement (HMR).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready files will be generated in the `dist` directory.

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

## 📜 Notes
- This project utilizes modern scroll management inside `App.jsx` to handle proper scrolling behaviors during navigation, catering also to `prefers-reduced-motion`.
- Ensure the backend server is running concurrently for data fetching to work properly.
