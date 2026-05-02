# தமிழ் Men's Wear - Hybrid Architecture

A premium, production-ready system for a modern fashion retail business.

## Project Structure

```text
tamil-mens-wear/
├── mobile-app/                # React Native (TypeScript) - Customer App
├── admin-web/                 # React.js (TypeScript) - Admin Dashboard
├── backend/                   # Node.js + Express API
├── shared/                    # Shared constants, types, utilities
├── docs/                      # Documentation & API specs
└── README.md
```

## Tech Stack

- **Mobile**: React Native, Expo, Redux Toolkit, React Navigation
- **Web**: React.js, Vite, TypeScript, Vanilla CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB Atlas, JWT
- **Auth**: Firebase (Google Auth) + Custom JWT
- **Design**: Material Design 3 (Mobile), Premium Analytics (Web)

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Admin Dashboard
```bash
cd admin-web
npm install
npm run dev
```

### 3. Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

## Features

### Customer Mobile App
- User Registration & Login (Google Auth)
- Product Browsing & Search
- Smart Outfit Builder & Digital Wardrobe
- Cart, Wishlist, Checkout & Payments
- Order Tracking & Loyalty Rewards

### Admin Web Dashboard
- Dashboard Analytics & Reports
- Product & Category Management (CRUD)
- Order & Inventory Management
- User & Review Moderation
- Promotions & Loyalty Management
