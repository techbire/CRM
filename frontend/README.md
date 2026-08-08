# Mini ERP + CRM Operations Portal

This is the frontend component of the Mini ERP + CRM Operations Portal. It's built with Next.js (App Router), React, Zustand, and styled with vanilla CSS.

## Features

- **Dashboard:** At-a-glance overview of business metrics (total customers, total products, low stock alerts, draft challans).
- **Customer Management:** View, create, and manage customers. Keep track of customer interactions with follow-up notes.
- **Product & Inventory Management:** View and add new products. Add inward stock directly from the UI.
- **Stock Ledger:** Track all `IN` and `OUT` stock movements in a detailed ledger.
- **Sales Challans (Draft to Confirm Flow):** 
  - Create draft challans (no stock deducted).
  - Confirm challans (atomically deducts stock on the backend).
  - Strict validation against insufficient stock.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

Make sure your `.env.local` contains the necessary environment variables for the backend API connection.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend

This frontend requires the corresponding Node.js/Express backend to be running. Navigate to the `../backend` directory and start the server:

```bash
npm run dev
```

Test Credentials:
- Email: `admin@erp.com`
- Password: `password123`
