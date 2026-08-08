import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Everyone can view products
router.get('/', getProducts);
router.get('/:id', getProduct);

// Only Warehouse and Admin can create/edit products
router.post('/', authorize(['Warehouse', 'Admin']), createProduct);
router.put('/:id', authorize(['Warehouse', 'Admin']), updateProduct);

export default router;
