import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';
import stockRoutes from './routes/stockRoutes';

export const app = express();

// Parse FRONTEND_URL — supports comma-separated list, trims whitespace/slashes
const extraOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))   // trim spaces & trailing slash
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  ...extraOrigins,
];

console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // exact match
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow ALL vercel.app preview deployments automatically
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/stock-movements', stockRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
