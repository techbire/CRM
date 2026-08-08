# Mini ERP + CRM Operations Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Deployed](https://img.shields.io/badge/deployed-Vercel-black)

A full-stack ERP + CRM web application built for managing customers, inventory, and sales challans with role-based access control and atomic stock management.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Business Logic & Workflows](#business-logic--workflows)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Deployment](#deployment)
- [Seeding the Database](#seeding-the-database)
- [Default Credentials](#default-credentials)

---

## Overview

This portal is a lightweight ERP + CRM system designed for Indian SMEs to manage their sales pipeline, warehouse inventory, and challan-based dispatch operations. It supports four distinct user roles with fine-grained access control, enforces atomic stock transactions, and maintains historical product snapshots on each challan line item.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel Edge                    │
│  ┌────────────────┐     ┌────────────────────┐   │
│  │  Next.js 16    │     │  Express.js API     │   │
│  │  (frontend/)   │────▶│  (backend/)         │   │
│  │  Port 3000     │     │  Port 5000          │   │
│  └────────────────┘     └────────┬───────────┘   │
└─────────────────────────────────┼───────────────┘
                                  │ Prisma ORM
                                  ▼
                    ┌─────────────────────────┐
                    │    Supabase PostgreSQL   │
                    │  (Hosted on Supabase.io) │
                    └─────────────────────────┘
```

The frontend and backend are deployed as separate **Vercel services** within a monorepo. API traffic is routed via `vercel.json` rewrites: all `/api/backend/*` requests are proxied to the Express service.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) (App Router) | React framework with SSR/SSG |
| [React](https://react.dev/) | UI component library |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight client-side state management |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [Lucide React](https://lucide.dev/) | Icon library |
| Vanilla CSS | Custom design system, no frameworks |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express 5](https://expressjs.com/) | REST API framework |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database client & migrations |
| [PostgreSQL](https://www.postgresql.org/) | Relational database (hosted on Supabase) |
| [JSON Web Tokens](https://jwt.io/) | Stateless authentication |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Password hashing |
| [Zod](https://zod.dev/) | Runtime input validation |

---

## Features

- **JWT Authentication** — Stateless login with 24-hour expiry
- **Role-Based Access Control (RBAC)** — Four roles: Admin, Sales, Warehouse, Accounts
- **Customer Management** — Full CRM lifecycle with follow-up notes and status tracking
- **Product & Inventory** — SKU-based product catalog with stock level monitoring and low-stock alerts
- **Stock Ledger** — Immutable audit trail of every IN/OUT stock movement
- **Sales Challans (Draft → Confirm)** — Two-phase dispatch workflow with atomic stock deduction
- **Insufficient Stock Guard** — Atomic transactions ensure partial state is never committed
- **Historical Snapshots** — Challan line items store product name, SKU, and price at creation time, not linked to live catalog
- **Responsive UI** — Works on desktop and tablet viewports

---

## Project Structure

```
CRM/
├── vercel.json                  # Vercel multi-service routing config
├── .gitignore
│
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── login/           # Login page
│   │   │   ├── customers/       # Customer list, detail, new
│   │   │   ├── products/        # Product list, new
│   │   │   ├── challans/        # Challan list, detail, new
│   │   │   └── stock-movements/ # Stock ledger, add stock
│   │   ├── components/
│   │   │   └── Layout/          # Sidebar & AdminLayout
│   │   ├── store/               # Zustand auth store
│   │   └── utils/
│   │       └── api.ts           # Axios instance with auth interceptors
│   └── package.json
│
└── backend/                     # Express API
    ├── api/
    │   └── index.ts             # Vercel serverless entrypoint
    ├── src/
    │   ├── server.ts            # Local dev HTTP server
    │   ├── app.ts               # Express app & middleware registration
    │   ├── config/
    │   │   └── db.ts            # Prisma client singleton
    │   ├── controllers/         # Route handler logic
    │   │   ├── authController.ts
    │   │   ├── customerController.ts
    │   │   ├── productController.ts
    │   │   ├── challanController.ts
    │   │   └── stockController.ts
    │   ├── middleware/
    │   │   └── auth.ts          # JWT authenticate + role authorize
    │   └── routes/
    │       ├── authRoutes.ts
    │       ├── customerRoutes.ts
    │       ├── productRoutes.ts
    │       ├── challanRoutes.ts
    │       └── stockRoutes.ts
    ├── prisma/
    │   ├── schema.prisma        # Data model definitions
    │   └── seed.ts              # Database seeding script
    ├── dist/                    # Compiled JS output (committed for Vercel)
    ├── tsconfig.json
    └── package.json
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐      ┌──────────────────┐
│    User      │       │   Customer   │      │   FollowUpNote   │
│──────────────│       │──────────────│      │──────────────────│
│ id (PK)      │       │ id (PK)      │◀────▶│ id (PK)          │
│ name         │       │ name         │      │ customer_id (FK) │
│ email        │       │ mobile       │      │ note             │
│ password_hash│       │ email        │      │ created_by       │
│ role         │       │ business_name│      │ created_at       │
│ created_at   │       │ gst_number   │      └──────────────────┘
└──────────────┘       │ customer_type│
                       │ address      │      ┌──────────────┐
                       │ status       │      │   Challan    │
                       │ follow_up_dt │      │──────────────│
                       │ notes        │◀────▶│ id (PK)      │
                       └──────────────┘      │ challan_num  │
                                             │ customer_id  │
┌──────────────┐                             │ status       │
│   Product    │                             │ total_qty    │
│──────────────│      ┌───────────────┐      │ created_by   │
│ id (PK)      │      │ StockMovement │      └──────┬───────┘
│ name         │◀────▶│───────────────│             │
│ sku (unique) │      │ id (PK)       │      ┌──────▼──────────┐
│ category     │      │ product_id(FK)│      │  ChallanItem    │
│ unit_price   │      │ quantity      │      │─────────────────│
│ current_stock│      │ movement_type │◀────▶│ id (PK)         │
│ minimum_stock│      │ reason        │      │ challan_id (FK) │
│ location     │      │ created_by    │      │ product_id (FK) │
└──────────────┘      │ created_at    │      │ name_snapshot   │
                      └───────────────┘      │ sku_snapshot    │
                                             │ price_snapshot  │
                                             │ quantity        │
                                             └─────────────────┘
```

### Model Summary

| Model | Description |
|---|---|
| `User` | System users with role assignment |
| `Customer` | CRM customer records with GST, type, and status |
| `FollowUpNote` | Timestamped notes attached to a customer |
| `Product` | Inventory catalog with SKU, pricing, and stock levels |
| `StockMovement` | Immutable log of every IN/OUT transaction |
| `Challan` | Sales dispatch order (Draft → Confirmed) |
| `ChallanItem` | Line items with frozen product snapshots |

---

## API Reference

All API routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | None | Login and receive JWT |

**Request body:**
```json
{
  "email": "admin@erp.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "name": "Admin User", "role": "Admin" }
}
```

---

### Customers

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/customers` | ✅ | Sales, Accounts |
| `GET` | `/api/customers/:id` | ✅ | Sales, Accounts |
| `POST` | `/api/customers` | ✅ | Sales |
| `PUT` | `/api/customers/:id` | ✅ | Sales |
| `POST` | `/api/customers/:id/followups` | ✅ | Sales |

**Customer object fields:** `name`, `mobile`, `email`, `business_name`, `gst_number`, `customer_type` (Retail/Wholesale/Distributor), `address`, `status` (Lead/Active/Inactive), `follow_up_date`, `notes`

---

### Products

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/products` | ✅ | All |
| `GET` | `/api/products/:id` | ✅ | All |
| `POST` | `/api/products` | ✅ | Warehouse, Admin |
| `PUT` | `/api/products/:id` | ✅ | Warehouse, Admin |

**Product object fields:** `name`, `sku`, `category`, `unit_price`, `minimum_stock`, `location`

---

### Stock Movements

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/stock-movements` | ✅ | All |
| `POST` | `/api/stock-movements` | ✅ | Warehouse, Admin |

**Add stock body:**
```json
{
  "product_id": "uuid",
  "quantity": 50,
  "reason": "Purchase Order #PO-2024-001"
}
```

---

### Challans

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/challans` | ✅ | All |
| `GET` | `/api/challans/:id` | ✅ | All |
| `POST` | `/api/challans` | ✅ | Sales, Admin |
| `POST` | `/api/challans/:id/confirm` | ✅ | Sales, Admin |

**Create challan body:**
```json
{
  "customer_id": "uuid",
  "items": [
    { "product_id": "uuid", "quantity": 10 }
  ]
}
```

**Confirm challan** triggers an atomic Prisma transaction:
- Validates each item has sufficient stock
- Deducts stock from each product
- Creates `OUT` StockMovement records
- Updates challan status to `Confirmed`

On failure (e.g. insufficient stock), **the entire transaction is rolled back** — no partial state is ever committed.

---

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Returns `{ "status": "ok" }` |

---

## Role-Based Access Control

| Permission | Admin | Sales | Warehouse | Accounts |
|---|:---:|:---:|:---:|:---:|
| View customers | ✅ | ✅ | ❌ | ✅ |
| Create / edit customers | ✅ | ✅ | ❌ | ❌ |
| Add follow-up notes | ✅ | ✅ | ❌ | ❌ |
| View products | ✅ | ✅ | ✅ | ✅ |
| Create / edit products | ✅ | ❌ | ✅ | ❌ |
| View stock movements | ✅ | ✅ | ✅ | ✅ |
| Add inward stock | ✅ | ❌ | ✅ | ❌ |
| View challans | ✅ | ✅ | ✅ | ✅ |
| Create draft challan | ✅ | ✅ | ❌ | ❌ |
| Confirm challan | ✅ | ✅ | ❌ | ❌ |

Authorization is enforced on the **backend** via the `authorize(roles[])` middleware. Frontend UI elements are conditionally rendered based on the role stored in the Zustand auth store, but the API is the source of truth.

---

## Business Logic & Workflows

### Challan Lifecycle

```
[Draft Created]
      │
      │  (no stock change)
      ▼
[Draft Challan]
      │
      │  POST /api/challans/:id/confirm
      ▼
[Atomic Transaction begins]
      │
      ├── Fetch challan + items
      ├── For each item:
      │     ├── Check product stock >= item quantity
      │     └── If NOT → throw → ROLLBACK → 400 error
      │
      ├── Deduct stock from each product
      ├── Create StockMovement (OUT) for each item
      └── Update challan status → "Confirmed"
      │
      ▼
[Confirmed Challan]  ✅ Stock decremented
```

### Key Invariants

- **Draft challans never affect stock.** Stock only changes on explicit Confirm.
- **Atomic guarantee.** If any product has insufficient stock, zero changes are written to the database.
- **Snapshot data.** `ChallanItem` stores `product_name_snapshot`, `sku_snapshot`, and `unit_price_snapshot` at time of creation. Editing a product later does not retroactively alter historic challans.
- **Immutable movements.** `StockMovement` records are append-only. No delete or update endpoints exist for them.

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-strong-secret-key-here"
PORT=5000
```

### Frontend (`frontend/.env.local`)

```env
# Points to the deployed backend API. For local dev, leave empty (falls back to localhost:5000)
NEXT_PUBLIC_API_URL=https://your-vercel-deployment.vercel.app/api/backend/api
```

> ⚠️ **Never commit `.env` or `.env.local` files.** They are excluded by `.gitignore`.

---

## Local Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- A PostgreSQL database (or a [Supabase](https://supabase.com) project)

### 1. Clone the repository

```bash
git clone https://github.com/techbire/CRM.git
cd CRM
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
JWT_SECRET="your-local-dev-secret"
PORT=5000
```

Run database migrations and seed:
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Start the backend dev server:
```bash
npm run dev
# Runs on http://localhost:5000
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

The frontend will automatically connect to `http://localhost:5000/api` during local development (env var fallback in `src/utils/api.ts`).

---

## Deployment

This project is deployed as a monorepo on **Vercel** using the multi-service `vercel.json` configuration.

### vercel.json

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "nextjs" },
    "backend": { "root": "backend", "framework": "express", "entrypoint": "dist/api/index.js" }
  },
  "rewrites": [
    { "source": "/api/backend/(.*)?", "destination": { "type": "service", "service": "backend" } },
    { "source": "/(.*)", "destination": { "type": "service", "service": "frontend" } }
  ]
}
```

### Required Vercel Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Service | Value |
|---|---|---|
| `DATABASE_URL` | Backend | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Backend | A strong, random secret string |
| `NEXT_PUBLIC_API_URL` | Frontend | `https://<your-domain>.vercel.app/api/backend/api` |

### Deploying backend changes

Because the entrypoint is the compiled `dist/api/index.js`, you must rebuild before pushing:

```bash
cd backend
npm run build   # compiles TypeScript → dist/
cd ..
git add backend/dist
git commit -m "chore: rebuild backend dist"
git push
```

Vercel will automatically redeploy on push to `main`.

---

## Seeding the Database

The seed script populates the database with:
- Sample users for each role (Admin, Sales, Warehouse, Accounts)
- Sample customers with various types and statuses
- Sample products with initial stock

```bash
cd backend
npx tsx prisma/seed.ts
```

---

## Default Credentials

> ⚠️ Change these immediately in a production environment.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@erp.com` | `password123` |
| Sales | `sales@erp.com` | `password123` |
| Warehouse | `warehouse@erp.com` | `password123` |
| Accounts | `accounts@erp.com` | `password123` |
