# ShopNow — E-Commerce Platform

A full-stack e-commerce application built with Node.js, React, MongoDB, and Redis.

## Tech Stack

**Backend**
- Node.js + Express.js (REST API)
- MongoDB + Mongoose (database)
- Redis via ioredis (cart persistence, 7-day TTL)
- JWT authentication (Bearer tokens)
- Multer (local image uploads)
- bcryptjs (password hashing)

**Frontend**
- React 18 + TypeScript
- Vite (dev server, port 5173)
- Tailwind CSS (amber design system)
- React Router v6
- Axios with request/response interceptors

**Infrastructure**
- Docker Compose (MongoDB, Redis, backend, frontend)

## Features

- Product catalog with search, category, price, and rating filters
- Paginated product listings and product detail pages
- Image gallery with thumbnail selector
- Customer reviews and star ratings
- Redis-backed shopping cart with quantity controls
- Multi-step checkout (address → review → confirmation)
- Order history with status tracking
- User account management (profile, password, address)
- Admin dashboard (stats, product CRUD, order status management)
- JWT-protected routes with role-based access control

## Ports

| Service   | Port |
|-----------|------|
| Frontend  | 5173 (dev) / 80 (Docker) |
| Backend   | 5000 |
| MongoDB   | 27017 |
| Redis     | 6379 |

## Quick Start (Docker Compose)

```bash
# 1. Clone and enter project
cd "E-Commerce Platform"

# 2. Create backend environment file
cp .env.example backend/.env
# Edit backend/.env and set a strong JWT_SECRET

# 3. Start all services
docker compose up -d

# 4. Seed the database (first run only)
docker exec shopnow_backend node src/utils/seeder.js

# 5. Open the app
open http://localhost
```

## Local Development (without Docker)

**Prerequisites:** Node.js 20+, MongoDB, Redis running locally.

```bash
# Backend
cd backend
cp ../.env.example .env   # edit values if needed
npm install
npm run dev               # starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

## Seed Database

```bash
# Run from the backend directory
node src/utils/seeder.js
```

Seeds 2 users and 12 products across 6 categories.

## Demo Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@example.com    | admin123  |
| User  | john@example.com     | user1234  |

## Environment Variables

Copy `.env.example` to `backend/.env` and set:

| Variable       | Default                          | Description                  |
|----------------|----------------------------------|------------------------------|
| `PORT`         | `5000`                           | Backend server port           |
| `MONGO_URI`    | `mongodb://localhost:27017/shopnow` | MongoDB connection string  |
| `REDIS_HOST`   | `localhost`                      | Redis host                   |
| `REDIS_PORT`   | `6379`                           | Redis port                   |
| `JWT_SECRET`   | —                                | **Required** — secret key for JWT signing |
| `FRONTEND_URL` | `http://localhost:5173`          | CORS allowed origin          |

## API Routes

### Auth
| Method | Path               | Auth     | Description          |
|--------|--------------------|----------|----------------------|
| POST   | /api/auth/register | —        | Register new user    |
| POST   | /api/auth/login    | —        | Login, returns JWT   |
| GET    | /api/auth/me       | User     | Get current user     |
| PUT    | /api/auth/profile  | User     | Update profile       |
| PUT    | /api/auth/password | User     | Change password      |

### Products
| Method | Path                     | Auth  | Description             |
|--------|--------------------------|-------|-------------------------|
| GET    | /api/products            | —     | List products (filtered) |
| GET    | /api/products/categories | —     | Get all categories      |
| GET    | /api/products/:id        | —     | Get single product      |
| POST   | /api/products/:id/reviews | User | Add review              |

### Cart
| Method | Path                     | Auth | Description          |
|--------|--------------------------|------|----------------------|
| GET    | /api/cart                | User | Get cart             |
| POST   | /api/cart                | User | Add item to cart     |
| PUT    | /api/cart/:productId     | User | Update item quantity |
| DELETE | /api/cart/:productId     | User | Remove item          |
| DELETE | /api/cart/clear          | User | Clear cart           |

### Orders
| Method | Path            | Auth | Description           |
|--------|-----------------|------|-----------------------|
| POST   | /api/orders     | User | Place order           |
| GET    | /api/orders     | User | Get my orders         |
| GET    | /api/orders/:id | User | Get single order      |

### Admin
| Method | Path                           | Auth  | Description              |
|--------|--------------------------------|-------|--------------------------|
| GET    | /api/admin/stats               | Admin | Dashboard stats          |
| POST   | /api/admin/products            | Admin | Create product           |
| PUT    | /api/admin/products/:id        | Admin | Update product           |
| DELETE | /api/admin/products/:id        | Admin | Delete product           |
| GET    | /api/admin/orders              | Admin | All orders               |
| PUT    | /api/admin/orders/:id/status   | Admin | Update order status      |

## Project Structure

```
E-Commerce Platform/
├── backend/
│   ├── src/
│   │   ├── config/        # DB and Redis connections
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, upload middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express routers
│   │   └── utils/         # Seeder script
│   ├── uploads/           # Uploaded product images
│   ├── server.js
│   ├── .env               # (create from .env.example)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth and Cart contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # Axios API client
│   │   └── types/         # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```
