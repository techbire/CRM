import { Router } from 'express';
import { getStockMovements, addStock } from '../controllers/stockController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Everyone can view stock movements
router.get('/', getStockMovements);

// Only Warehouse and Admin can add stock
router.post('/', authorize(['Warehouse', 'Admin']), addStock);

export default router;
